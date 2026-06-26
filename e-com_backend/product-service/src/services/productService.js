const { v4: uuidv4 } = require('uuid');
const {
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLE_NAME } = require('../utils/fileHandler');

const getAllProducts = async (query) => {
  const { q, category, brand, minPrice, maxPrice, sortBy, order, page, limit } = query;

  const expressions = [];
  const attrNames = {};
  const attrValues = {};

  if (category) {
    expressions.push('#category = :category');
    attrNames['#category'] = 'category';
    attrValues[':category'] = category;
  }
  if (brand) {
    expressions.push('#brand = :brand');
    attrNames['#brand'] = 'brand';
    attrValues[':brand'] = brand;
  }
  if (minPrice) {
    expressions.push('#price >= :minPrice');
    attrNames['#price'] = 'price';
    attrValues[':minPrice'] = parseFloat(minPrice);
  }
  if (maxPrice) {
    expressions.push('#price <= :maxPrice');
    attrNames['#price'] = 'price';
    attrValues[':maxPrice'] = parseFloat(maxPrice);
  }

  const params = {
    TableName: TABLE_NAME,
    ...(expressions.length && {
      FilterExpression: expressions.join(' AND '),
      ExpressionAttributeNames: attrNames,
      ExpressionAttributeValues: attrValues,
    }),
  };

  const { Items = [] } = await docClient.send(new ScanCommand(params));

  let products = Items;

  if (q) {
    const term = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  }

  if (sortBy) {
    const dir = order === 'desc' ? -1 : 1;
    products.sort((a, b) => {
      if (typeof a[sortBy] === 'string') return a[sortBy].localeCompare(b[sortBy]) * dir;
      return (a[sortBy] - b[sortBy]) * dir;
    });
  }

  const total = products.length;
  const currentPage = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const start = (currentPage - 1) * pageSize;
  const paginated = products.slice(start, start + pageSize);

  return {
    products: paginated,
    meta: { total, page: currentPage, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
  };
};

const getProductById = async (id) => {
  const { Item } = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { productId: id } }));
  return Item || null;
};

const createProduct = async (data) => {
  const product = {
    productId: uuidv4(),
    name: data.name,
    description: data.description,
    brand: data.brand,
    category: data.category,
    price: parseFloat(data.price),
    images: data.images || [],
    specifications: data.specifications || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: product }));
  return product;
};

const updateProduct = async (id, data) => {
  const existing = await getProductById(id);
  if (!existing) return null;

  const immutable = ['productId', 'createdAt'];
  const stockFields = ['stock', 'currentStock', 'availableStock', 'reservedStock', 'quantity'];
  [...immutable, ...stockFields].forEach((key) => delete data[key]);

  if (data.price !== undefined) data.price = parseFloat(data.price);

  data.updatedAt = new Date().toISOString();

  const fields = Object.keys(data);
  const updateExpr = 'SET ' + fields.map((k) => `#${k} = :${k}`).join(', ');
  const attrNames = Object.fromEntries(fields.map((k) => [`#${k}`, k]));
  const attrValues = Object.fromEntries(fields.map((k) => [`:${k}`, data[k]]));

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { productId: id },
      UpdateExpression: updateExpr,
      ExpressionAttributeNames: attrNames,
      ExpressionAttributeValues: attrValues,
      ReturnValues: 'ALL_NEW',
    })
  );
  return Attributes;
};

const deleteProduct = async (id) => {
  const existing = await getProductById(id);
  if (!existing) return null;
  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { productId: id } }));
  return existing;
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
