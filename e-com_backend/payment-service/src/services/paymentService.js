const { v4: uuidv4 } = require('uuid');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, PAYMENTS_TABLE } = require('../utils/fileHandler');
const { getOrderById } = require('../utils/orderApi');
const { PAYMENT_STATUS, ORDER_STATUS } = require('../constants/paymentConstants');
const { publishPaymentEvent } = require('./snsService');

const publishOrderEvent = async (eventType, payment) => {
  const order = await getOrderById(payment.orderId);
  await publishPaymentEvent(eventType, payment, order);
};

// Payment service now publishes events to SNS instead of calling Order/Inventory directly.
// The publish helper is in `snsService.js` and will throw on failure, but this service
// treats publish failures as non-fatal notifications.

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
    transactionId:
      paymentMethod === 'COD'
        ? `COD-${uuidv4().split('-')[0].toUpperCase()}`
        : `DEV-TXN-${uuidv4().split('-')[0].toUpperCase()}`,
    status: PAYMENT_STATUS.PAID,
    createdAt: now,
  };

  await docClient.send(new PutCommand({ TableName: PAYMENTS_TABLE, Item: payment }));
  console.log(`[Payment] Created | paymentId: ${payment.paymentid} | orderId: ${orderId} | userId: ${userId} | method: ${paymentMethod} | amount: ${payment.amount} | timestamp: ${now}`);
  // Development Mode
  // Every payment is treated as successful immediately.

  await docClient.send(
    new UpdateCommand({
      TableName: PAYMENTS_TABLE,
      Key: { paymentid: payment.paymentid },
      UpdateExpression: 'SET #status = :status, updatedAt = :at',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': PAYMENT_STATUS.PAID,
        ':at': new Date().toISOString(),
      },
    })
  );

  payment.status = PAYMENT_STATUS.PAID;

  console.log(
    `[Payment] Payment confirmed | paymentId: ${payment.paymentid} | orderId: ${orderId} | paymentMethod: ${paymentMethod}`
  );

  try {
    console.log('[SNS] Publishing PAYMENT_SUCCESS');

    await publishOrderEvent('PAYMENT_SUCCESS', payment);

    console.log('[SNS] PAYMENT_SUCCESS published successfully');
  } catch (err) {
    console.error('[SNS] Publish failed:', err);
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
    const txnId =
      transactionId ||
      payment.transactionId ||
      `DEV-TXN-${uuidv4().split('-')[0].toUpperCase()}`;

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
    try {
      console.log('[Payment] Payment Updated');
      console.log('[SNS] Publishing PAYMENT_SUCCESS');
      await publishOrderEvent('PAYMENT_SUCCESS', Attributes);
    } catch (err) {
      console.error('[SNS] Publish failed', err);
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
    try {
      console.log('[Payment] Payment Updated');
      console.log('[SNS] Publishing PAYMENT_FAILED');
      await publishOrderEvent('PAYMENT_FAILED', Attributes);
    } catch (err) {
      console.error('[SNS] Publish failed', err);
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
    try {
      console.log('[Payment] Payment Updated');
      console.log('[SNS] Publishing PAYMENT_REFUNDED');
      await publishOrderEvent('PAYMENT_REFUNDED', Attributes);
    } catch (err) {
      console.error('[SNS] Publish failed', err);
    }

    return Attributes;
  }
};

const getAllPayments = async () => {
  const { Items = [] } = await docClient.send(
    new ScanCommand({ TableName: PAYMENTS_TABLE })
  );
  return Items;
};

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentByOrderId,
  updatePaymentStatus,
  getAllPayments,
};
