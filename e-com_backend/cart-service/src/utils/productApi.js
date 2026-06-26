const { GetCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, PRODUCTS_TABLE } = require('./fileHandler');

const getProductById = async (productId) => {
  const { Item } = await docClient.send(
    new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { productId },
    })
  );
  return Item || null;
};

module.exports = { getProductById };
