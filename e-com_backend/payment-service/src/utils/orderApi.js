const { GetCommand } = require('@aws-sdk/lib-dynamodb');
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

// Note (event-driven architecture): Payment Service no longer writes to the
// Orders table. Order status transitions (paymentStatus/orderStatus) are now
// owned exclusively by the Order Service, which applies them by consuming
// PAYMENT_SUCCESS / PAYMENT_FAILED / PAYMENT_REFUNDED events off its own SQS
// queue. getOrderById is retained here only as a read-only lookup, used to
// enrich the SNS event payload (userId, items) before publishing.

module.exports = { getOrderById };
