/**
 * cleanProductStock.js
 *
 * One-time migration script.
 * Scans every item in the Products DynamoDB table and removes
 * the stale `stock` attribute that existed before the Inventory Service was introduced.
 *
 * Run once:  node src/utils/cleanProductStock.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME; // Products

const run = async () => {
  console.log(`Scanning table: ${TABLE_NAME} for stale stock attributes...\n`);

  const { Items = [] } = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));

  // Filter only items that still have a stock attribute
  const dirty = Items.filter((item) => item.stock !== undefined);

  if (dirty.length === 0) {
    console.log('No stale stock attributes found. Products table is clean.');
    return;
  }

  console.log(`Found ${dirty.length} product(s) with stale stock attribute. Removing...\n`);

  for (const item of dirty) {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { productId: item.productId },
        // REMOVE deletes the attribute from the DynamoDB item entirely
        UpdateExpression: 'REMOVE #stock',
        ExpressionAttributeNames: { '#stock': 'stock' },
      })
    );
    console.log(`[CLEANED] productId: ${item.productId} | name: ${item.name} | removed stock: ${item.stock}`);
  }

  console.log(`\nDone. ${dirty.length} product(s) cleaned.`);
  console.log('The Products table now contains zero stock attributes.');
};

run().catch((err) => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
