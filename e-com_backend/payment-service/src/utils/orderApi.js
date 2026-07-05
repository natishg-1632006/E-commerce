const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, ORDERS_TABLE } = require('./fileHandler');

/**
 * Fetch a single order by its primary key.
 */
const getOrderById = async (orderid) => {
  const { Item } = await docClient.send(
    new GetCommand({ TableName: ORDERS_TABLE, Key: { orderid } })
  );
  return Item || null;
};

/**
 * Update both paymentStatus and orderStatus on an order in a single write.
 * Called by the Payment Service after payment success, failure, or refund.
 *
 * SNS/SQS migration note:
 * When migrating to event-driven architecture, replace this direct DynamoDB
 * write with an event publish. The Order Service will consume the event from
 * its SQS queue and perform this update itself.
 */
const updateOrderPaymentStatus = async (orderid, paymentStatus, orderStatus) => {
  await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid },
      UpdateExpression: 'SET paymentStatus = :payment, orderStatus = :status, updatedAt = :at',
      ExpressionAttributeValues: {
        ':payment': paymentStatus,
        ':status': orderStatus,
        ':at': new Date().toISOString(),
      },
    })
  );
};

/**
 * Flip inventoryUpdated = true after stock has been successfully reduced.
 * Persisted immediately after all reduceStock calls succeed so the flag is
 * in place before any retry or duplicate trigger can run again.
 *
 * This is the idempotency guard — if inventoryUpdated is already true,
 * reduceInventoryOnce() will skip all stock reduction calls.
 */
const markInventoryUpdated = async (orderid) => {
  await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid },
      UpdateExpression: 'SET inventoryUpdated = :flag, updatedAt = :at',
      ExpressionAttributeValues: {
        ':flag': true,
        ':at': new Date().toISOString(),
      },
    })
  );
};

module.exports = { getOrderById, updateOrderPaymentStatus, markInventoryUpdated };
