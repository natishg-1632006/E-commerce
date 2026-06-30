const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
const MOVEMENTS_TABLE = process.env.DYNAMODB_MOVEMENTS_TABLE_NAME;

module.exports = {
  docClient,
  TABLE_NAME,
  MOVEMENTS_TABLE,
};