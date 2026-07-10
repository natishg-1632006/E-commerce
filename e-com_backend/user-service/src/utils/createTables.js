require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const tableExists = async (tableName) => {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') return false;
    throw err;
  }
};

const createUsersTable = async () => {
  const tableName = process.env.DYNAMODB_TABLE_NAME || 'users';

  if (await tableExists(tableName)) {
    console.log(`[SKIP] Table "${tableName}" already exists.`);
    return;
  }

  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
      BillingMode: 'PAY_PER_REQUEST',
    })
  );
  console.log(`[CREATED] Table "${tableName}" created successfully.`);
};

const run = async () => {
  console.log('Setting up DynamoDB tables for user-service...\n');
  await createUsersTable();
  console.log('\nDone.');
};

run().catch((err) => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
