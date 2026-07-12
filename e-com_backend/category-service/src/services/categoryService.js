const { v4: uuidv4 } = require('uuid');

const {
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const {
  docClient,
  TABLE_NAME,
} = require('../utils/fileHandler');

const createCategory = async (data) => {

  const category = {

    categoryId: uuidv4(),

    name: data.name,

    description: data.description || '',

    image: data.image || {},

    featured: data.featured || false,

    status: data.status || 'ACTIVE',

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),

  };

  await docClient.send(

    new PutCommand({

      TableName: TABLE_NAME,

      Item: category,

    })

  );

  return category;

};

module.exports = {

    createCategory,

};