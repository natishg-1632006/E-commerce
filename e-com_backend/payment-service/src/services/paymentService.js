const { v4: uuidv4 } = require('uuid');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, PAYMENTS_TABLE } = require('../utils/fileHandler');
const { getOrderById, updateOrderPaymentStatus, markInventoryUpdated } = require('../utils/orderApi');
const { reduceStock, releaseStock } = require('../utils/inventoryApi');
const { PAYMENT_STATUS, ORDER_STATUS } = require('../constants/paymentConstants');

// ─── Post-payment communication layer ────────────────────────────────────────
//
// These two functions are the SNS/SQS migration seam.
//
// TODAY  — they call Inventory Service and Order Service directly over HTTP.
// FUTURE — replace the bodies of these two functions with a single SNS publish.
//          Nothing else in this file needs to change.
//
// notifyPaymentSuccess: called after payment is confirmed as PAID.
// notifyPaymentFailed:  called after payment is confirmed as FAILED or REFUNDED.

const notifyPaymentSuccess = async (order, paymentId) => {
  // Step 1 — Update order status
  await updateOrderPaymentStatus(order.orderid, PAYMENT_STATUS.PAID, ORDER_STATUS.PROCESSING);
  console.log(`[Payment] Order updated | orderId: ${order.orderid} | paymentStatus: ${PAYMENT_STATUS.PAID} | orderStatus: ${ORDER_STATUS.PROCESSING}`);

  // Step 2 — Reduce inventory (idempotent — guarded by inventoryUpdated flag)
  await reduceInventoryOnce(order, paymentId);
};

const notifyPaymentFailed = async (order, paymentId, newOrderStatus) => {
  // Step 1 — Release reserved inventory (best-effort)
  if (order.items && order.items.length > 0) {
    const results = await Promise.allSettled(
      order.items.map((item) => releaseStock(item.productId, item.quantity, order.orderid))
    );
    results.forEach((r, idx) => {
      if (r.status === 'rejected') {
        console.error(`[Payment] Release failed | orderId: ${order.orderid} | productId: ${order.items[idx].productId} | error: ${r.reason?.message}`);
      }
    });
  }

  // Step 2 — Update order status
  await updateOrderPaymentStatus(order.orderid, PAYMENT_STATUS.FAILED, newOrderStatus);
  console.log(`[Payment] Order updated | orderId: ${order.orderid} | paymentStatus: ${PAYMENT_STATUS.FAILED} | orderStatus: ${newOrderStatus}`);
};

// ─── Inventory reduction (idempotency guard) ──────────────────────────────────

/**
 * Reduce inventory for every item in the order — exactly once.
 *
 * The inventoryUpdated flag on the order record is the idempotency key.
 * If it is already true, this function returns immediately without touching
 * inventory. This prevents duplicate stock reduction on retries or replays.
 */
const reduceInventoryOnce = async (order, paymentId) => {
  if (order.inventoryUpdated) {
    console.log(`[Payment] Inventory already updated — skipping | orderId: ${order.orderid} | paymentId: ${paymentId}`);
    return false;
  }

  console.log(`[Payment] Reducing inventory | orderId: ${order.orderid} | paymentId: ${paymentId} | items: ${order.items.length} | timestamp: ${new Date().toISOString()}`);

  const results = await Promise.allSettled(
    order.items.map((item) => reduceStock(item.productId, item.quantity, order.orderid))
  );

  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    const reasons = failed.map((f) => f.reason?.message).join(' | ');
    console.error(`[Payment] Inventory reduction failed | orderId: ${order.orderid} | paymentId: ${paymentId} | errors: ${reasons}`);
    // Payment remains PAID — inventory failure is reported so it can be retried.
    // Do NOT throw here — the payment was successful and must not be rolled back.
    throw Object.assign(
      new Error(`Inventory update failed after payment: ${reasons}`),
      { statusCode: 500 }
    );
  }

  // Persist the idempotency flag immediately after all reductions succeed
  await markInventoryUpdated(order.orderid);
  console.log(`[Payment] Inventory updated | orderId: ${order.orderid} | paymentId: ${paymentId} | inventoryUpdated: true | timestamp: ${new Date().toISOString()}`);
  return true;
};

// ─── Service functions ────────────────────────────────────────────────────────

const createPayment = async (orderId, userId, paymentMethod) => {
  const order = await getOrderById(orderId);
  if (!order)
    throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  if (order.userId !== userId)
    throw Object.assign(new Error('Unauthorized: userId does not match order'), { statusCode: 403 });
  if (order.orderStatus === ORDER_STATUS.CANCELLED || order.orderStatus === ORDER_STATUS.EXPIRED)
    throw Object.assign(new Error(`Cannot create payment for a ${order.orderStatus.toLowerCase()} order`), { statusCode: 400 });
  if (order.paymentStatus === PAYMENT_STATUS.PAID)
    throw Object.assign(new Error('Order is already paid'), { statusCode: 400 });

  const isCOD = paymentMethod === 'COD';
  const now = new Date().toISOString();

  const payment = {
    paymentid: uuidv4(),
    orderId,
    userId,
    amount: order.totalAmount,
    paymentMethod,
    transactionId: isCOD ? `COD-${uuidv4().split('-')[0].toUpperCase()}` : null,
    status: PAYMENT_STATUS.PENDING,
    createdAt: now,
  };

  await docClient.send(new PutCommand({ TableName: PAYMENTS_TABLE, Item: payment }));
  console.log(`[Payment] Created | paymentId: ${payment.paymentid} | orderId: ${orderId} | userId: ${userId} | method: ${paymentMethod} | amount: ${payment.amount} | timestamp: ${now}`);

  if (isCOD) {
    // COD is confirmed immediately — no payment gateway involved.
    // Treat as PAID synchronously.
    await notifyPaymentSuccess(order, payment.paymentid);

    // Update payment record to PAID
    await docClient.send(
      new UpdateCommand({
        TableName: PAYMENTS_TABLE,
        Key: { paymentid: payment.paymentid },
        UpdateExpression: 'SET #status = :status, updatedAt = :at',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': PAYMENT_STATUS.PAID,
          ':at': new Date().toISOString(),
        },
      })
    );
    payment.status = PAYMENT_STATUS.PAID;
    console.log(`[Payment] COD confirmed | paymentId: ${payment.paymentid} | orderId: ${orderId} | timestamp: ${new Date().toISOString()}`);
  }

  return payment;
};

const getPaymentById = async (paymentid) => {
  const { Item } = await docClient.send(
    new GetCommand({ TableName: PAYMENTS_TABLE, Key: { paymentid } })
  );
  return Item || null;
};

const getPaymentByOrderId = async (orderId) => {
  const { Items = [] } = await docClient.send(
    new ScanCommand({
      TableName: PAYMENTS_TABLE,
      FilterExpression: 'orderId = :orderId',
      ExpressionAttributeValues: { ':orderId': orderId },
    })
  );
  return Items[0] || null;
};

const updatePaymentStatus = async (paymentid, status, transactionId) => {
  const payment = await getPaymentById(paymentid);
  if (!payment)
    throw Object.assign(new Error('Payment not found'), { statusCode: 404 });
  if (payment.status === status)
    throw Object.assign(new Error(`Payment is already ${status}`), { statusCode: 400 });
  if (payment.status === PAYMENT_STATUS.REFUNDED)
    throw Object.assign(new Error('Cannot update a refunded payment'), { statusCode: 400 });
  if (payment.status === PAYMENT_STATUS.PAID && status !== PAYMENT_STATUS.REFUNDED)
    throw Object.assign(new Error('A paid payment can only be moved to REFUNDED'), { statusCode: 400 });

  // Always fetch the latest order so inventoryUpdated flag is fresh
  const order = await getOrderById(payment.orderId);
  const now = new Date().toISOString();

  // ── PAID ──────────────────────────────────────────────────────────────────
  if (status === PAYMENT_STATUS.PAID) {
    if (!transactionId && payment.paymentMethod !== 'COD')
      throw Object.assign(
        new Error('transactionId is required for Card/UPI/NetBanking payment'),
        { statusCode: 400 }
      );

    const txnId = transactionId || payment.transactionId;

    // Update payment record first — payment is confirmed regardless of what
    // happens downstream. If inventory update fails, the payment stays PAID
    // and the failure is surfaced so it can be retried.
    const { Attributes } = await docClient.send(
      new UpdateCommand({
        TableName: PAYMENTS_TABLE,
        Key: { paymentid },
        UpdateExpression: 'SET #status = :status, transactionId = :txn, updatedAt = :at',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': PAYMENT_STATUS.PAID,
          ':txn': txnId,
          ':at': now,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    console.log(`[Payment] Paid | paymentId: ${paymentid} | orderId: ${payment.orderId} | userId: ${payment.userId} | amount: ${payment.amount} | transactionId: ${txnId} | timestamp: ${now}`);

    if (order) {
      await notifyPaymentSuccess(order, paymentid);
    }

    return Attributes;
  }

  // ── FAILED ────────────────────────────────────────────────────────────────
  if (status === PAYMENT_STATUS.FAILED) {
    const { Attributes } = await docClient.send(
      new UpdateCommand({
        TableName: PAYMENTS_TABLE,
        Key: { paymentid },
        UpdateExpression: 'SET #status = :status, updatedAt = :at',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': PAYMENT_STATUS.FAILED,
          ':at': now,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    console.log(`[Payment] Failed | paymentId: ${paymentid} | orderId: ${payment.orderId} | userId: ${payment.userId} | timestamp: ${now}`);

    if (order) {
      await notifyPaymentFailed(order, paymentid, 'PAYMENT_FAILED');
    }

    return Attributes;
  }

  // ── REFUNDED ──────────────────────────────────────────────────────────────
  if (status === PAYMENT_STATUS.REFUNDED) {
    if (payment.status !== PAYMENT_STATUS.PAID)
      throw Object.assign(new Error('Only PAID payments can be refunded'), { statusCode: 400 });

    const { Attributes } = await docClient.send(
      new UpdateCommand({
        TableName: PAYMENTS_TABLE,
        Key: { paymentid },
        UpdateExpression: 'SET #status = :status, updatedAt = :at',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': PAYMENT_STATUS.REFUNDED,
          ':at': now,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    console.log(`[Payment] Refunded | paymentId: ${paymentid} | orderId: ${payment.orderId} | userId: ${payment.userId} | timestamp: ${now}`);

    if (order) {
      await notifyPaymentFailed(order, paymentid, ORDER_STATUS.CANCELLED);
    }

    return Attributes;
  }
};

module.exports = { createPayment, getPaymentById, getPaymentByOrderId, updatePaymentStatus };
