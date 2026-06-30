const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

const docClient = DynamoDBDocumentClient.from(client);

const ORDERS_TABLE = process.env.DYNAMODB_TABLE_NAME;
const CART_TABLE = process.env.CART_TABLE_NAME;
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE_NAME;

module.exports = {
  docClient,
  ORDERS_TABLE,
  CART_TABLE,
  PRODUCTS_TABLE,
};