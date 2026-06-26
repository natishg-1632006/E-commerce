const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, ORDERS_TABLE } = require('./fileHandler');

const getOrderById = async (orderid) => {
  const { Item } = await docClient.send(
    new GetCommand({ TableName: ORDERS_TABLE, Key: { orderid } })
  );
  return Item || null;
};

const updateOrderPaymentStatus = async (orderid, paymentStatus, orderStatus) => {
  await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid },
      UpdateExpression: 'SET paymentStatus = :payment, orderStatus = :status',
      ExpressionAttributeValues: { ':payment': paymentStatus, ':status': orderStatus },
    })
  );
};

// Flip inventoryUpdated = true after stock has been successfully reduced.
// Called immediately after all reduceStock calls succeed so the flag is
// persisted before any retry or duplicate trigger can run again.
const markInventoryUpdated = async (orderid) => {
  await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid },
      UpdateExpression: 'SET inventoryUpdated = :flag',
      ExpressionAttributeValues: { ':flag': true },
    })
  );
};

module.exports = { getOrderById, updateOrderPaymentStatus, markInventoryUpdated };
