const { GetCommand, BatchGetCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, CART_TABLE, PRODUCTS_TABLE } = require('./fileHandler');

const getCartByUserId = async (userId) => {
  const { Items = [] } = await docClient.send(
    new ScanCommand({
      TableName: CART_TABLE,
      FilterExpression: '#userId = :userId',
      ExpressionAttributeNames: { '#userId': 'userId' },
      ExpressionAttributeValues: { ':userId': userId },
    })
  );
  return Items.length === 0 ? null : Items[0];
};

const getProductById = async (productId) => {
  const { Item } = await docClient.send(
    new GetCommand({ TableName: PRODUCTS_TABLE, Key: { productId } })
  );
  return Item || null;
};

const getProductsByIds = async (productIds) => {

  const { Responses } = await docClient.send(
    new BatchGetCommand({
      RequestItems: {
        [PRODUCTS_TABLE]: {
          Keys: productIds.map((productId) => ({
            productId,
          })),
        },
      },
    })
  );

  return Responses?.[PRODUCTS_TABLE] || [];
};

const clearCart = async (cartid) => {
  await docClient.send(
    new DeleteCommand({ TableName: CART_TABLE, Key: { cartid } })
  );
};

module.exports = { getCartByUserId, getProductById, getProductsByIds, clearCart };
