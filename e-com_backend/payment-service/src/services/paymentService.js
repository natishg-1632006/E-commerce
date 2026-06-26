const { v4: uuidv4 } = require('uuid');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, PAYMENTS_TABLE } = require('../utils/fileHandler');
const { getOrderById, updateOrderPaymentStatus, markInventoryUpdated } = require('../utils/orderApi');
const { reduceStock, releaseStock } = require('../utils/inventoryApi');

// ─── Shared helper ────────────────────────────────────────────────────────────

/**
 * Reduce inventory stock for every item in the order — exactly once.
 * Guards against duplicate calls using the order.inventoryUpdated flag.
 * Returns true if stock was reduced, false if it was already done.
 */
const reduceInventoryOnce = async (order) => {
  if (order.inventoryUpdated) {
    console.log(`[Inventory Skip] OrderId: ${order.orderid} — inventory already updated. Skipping.`);
    return false;
  }

  const stockResults = await Promise.allSettled(
    order.items.map((item) => reduceStock(item.productId, item.quantity, order.orderid))
  );

  const failed = stockResults.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    const reasons = failed.map((f) => f.reason?.message).join(' | ');
    console.error(`[Inventory Update Failed] OrderId: ${order.orderid} | Errors: ${reasons}`);
    throw Object.assign(
      new Error(`Inventory update failed: ${reasons}`),
      { statusCode: 500 }
    );
  }

  // Persist the flag immediately — prevents any retry or duplicate trigger
  await markInventoryUpdated(order.orderid);
  console.log(`[Inventory Updated] OrderId: ${order.orderid} — inventoryUpdated set to true.`);
  return true;
};

// ─── Service functions ────────────────────────────────────────────────────────

const createPayment = async (orderId, userId, paymentMethod) => {
  const order = await getOrderById(orderId);
  if (!order)
    throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  if (order.userId !== userId)
    throw Object.assign(new Error('Unauthorized: userId does not match order'), { statusCode: 403 });
  if (order.orderStatus === 'Cancelled')
    throw Object.assign(new Error('Cannot create payment for a cancelled order'), { statusCode: 400 });
  if (order.paymentStatus === 'Paid')
    throw Object.assign(new Error('Order is already paid'), { statusCode: 400 });

  const isCOD = paymentMethod === 'COD';

  const payment = {
    paymentid: uuidv4(),
    orderId,
    userId,
    amount: order.totalAmount,
    paymentMethod,
    transactionId: isCOD ? `COD-${uuidv4().split('-')[0].toUpperCase()}` : null,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({ TableName: PAYMENTS_TABLE, Item: payment }));

  if (isCOD) {
    // COD: confirmed immediately — reduce inventory once, guarded by the flag
    await updateOrderPaymentStatus(orderId, 'Pending', 'Confirmed');
    await reduceInventoryOnce(order);
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
  if (payment.status === 'Refunded')
    throw Object.assign(new Error('Cannot update a refunded payment'), { statusCode: 400 });

  // Always fetch the latest order so inventoryUpdated flag is fresh
  const order = await getOrderById(payment.orderId);

  if (status === 'Paid') {
    if (!transactionId && payment.paymentMethod !== 'COD')
      throw Object.assign(new Error('transactionId is required for Card/UPI/NetBanking payment'), { statusCode: 400 });

    if (order) {
      // Mark order Confirmed
      await updateOrderPaymentStatus(payment.orderId, 'Paid', 'Confirmed');

      // Reduce inventory — guarded by inventoryUpdated flag, deduplicates COD double-calls
      await reduceInventoryOnce(order);
    }
  }

  // Payment Failed — release any reserved stock (best-effort)
  if (status === 'Failed') {
    if (order) {
      await Promise.all(
        order.items.map((item) => releaseStock(item.productId, item.quantity, payment.orderId))
      );
      await updateOrderPaymentStatus(payment.orderId, 'Failed', order.orderStatus);
    }
  }

  // Refund — release stock and cancel order
  if (status === 'Refunded') {
    if (payment.status !== 'Paid')
      throw Object.assign(new Error('Only Paid payments can be refunded'), { statusCode: 400 });
    if (order) {
      await Promise.all(
        order.items.map((item) => releaseStock(item.productId, item.quantity, payment.orderId))
      );
      await updateOrderPaymentStatus(payment.orderId, 'Refunded', 'Cancelled');
    }
  }

  const txnId = transactionId || payment.transactionId;

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: PAYMENTS_TABLE,
      Key: { paymentid },
      UpdateExpression: 'SET #status = :status, transactionId = :txn, updatedAt = :at',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': status,
        ':txn': txnId,
        ':at': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  return Attributes;
};

module.exports = { createPayment, getPaymentById, getPaymentByOrderId, updatePaymentStatus };
