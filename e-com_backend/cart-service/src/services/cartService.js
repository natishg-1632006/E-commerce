const { v4: uuidv4 } = require('uuid');
const { PutCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLE_NAME } = require('../utils/fileHandler');
const { getProductById } = require('../utils/productApi');

const getCart = async (userId) => {
  const { Items = [] } = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#userId = :userId',
      ExpressionAttributeNames: { '#userId': 'userId' },
      ExpressionAttributeValues: { ':userId': userId },
    })
  );
  return Items.length === 0 ? null : Items[0];
};

const addToCart = async (userId, productId, quantity) => {
  const product = await getProductById(productId);
  if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  if (product.stock < quantity)
    throw Object.assign(new Error(`Insufficient stock. Available: ${product.stock}`), { statusCode: 400 });

  let cart = await getCart(userId);
  if (!cart) cart = { cartid: uuidv4(), userId, items: [], totalAmount: 0 };

  const existingIndex = cart.items.findIndex((i) => i.productId === productId);

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
    cart.items[existingIndex].subtotal = parseFloat(
      (cart.items[existingIndex].price * cart.items[existingIndex].quantity).toFixed(2)
    );
  } else {
    cart.items.push({
      productId,
      name: product.name,
      price: product.price,
      quantity,
      subtotal: parseFloat((product.price * quantity).toFixed(2)),
    });
  }

  cart.totalAmount = parseFloat(cart.items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: cart }));
  return cart;
};

const updateQuantity = async (userId, productId, quantity) => {
  const cart = await getCart(userId);
  if (!cart) throw Object.assign(new Error('Cart not found'), { statusCode: 404 });

  const index = cart.items.findIndex((i) => i.productId === productId);
  if (index === -1) throw Object.assign(new Error('Item not found in cart'), { statusCode: 404 });

  const product = await getProductById(productId);
  if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  if (product.stock < quantity)
    throw Object.assign(new Error(`Insufficient stock. Available: ${product.stock}`), { statusCode: 400 });

  cart.items[index].quantity = quantity;
  cart.items[index].subtotal = parseFloat((cart.items[index].price * quantity).toFixed(2));
  cart.totalAmount = parseFloat(cart.items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: cart }));
  return cart;
};

const removeItem = async (userId, productId) => {
  const cart = await getCart(userId);
  if (!cart) throw Object.assign(new Error('Cart not found'), { statusCode: 404 });

  const index = cart.items.findIndex((i) => i.productId === productId);
  if (index === -1) throw Object.assign(new Error('Item not found in cart'), { statusCode: 404 });

  cart.items.splice(index, 1);
  cart.totalAmount = parseFloat(cart.items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: cart }));
  return cart;
};

const clearCart = async (userId) => {
  const cart = await getCart(userId);
  if (!cart) throw Object.assign(new Error('Cart not found'), { statusCode: 404 });
  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { cartid: cart.cartid } }));
  return { message: 'Cart cleared successfully' };
};

module.exports = { getCart, addToCart, updateQuantity, removeItem, clearCart };
