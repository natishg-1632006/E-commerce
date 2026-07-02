const { v4: uuidv4 } = require('uuid');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, ORDERS_TABLE } = require('../utils/fileHandler');
const { getCartByUserId, getProductById, clearCart } = require('../utils/cartApi');
const { checkStock } = require('../utils/inventoryApi');

const createOrder = async (userId, email, shippingAddress, paymentMethod) => {
  const cart = await getCartByUserId(userId);
  if (!cart) throw Object.assign(new Error('Cart not found for this user'), { statusCode: 404 });
  if (!cart.items || cart.items.length === 0)
    throw Object.assign(new Error('Cart is empty'), { statusCode: 400 });

  const stockErrors = [];
  const priceChanges = [];

  const enrichedItems = await Promise.all(
    cart.items.map(async (item) => {
      const product = await getProductById(item.productId);

      if (!product) {
        stockErrors.push(`"${item.name}" is no longer available`);
        return null;
      }

      // Stock availability check via Inventory Service (SRP — not Products table)
      const stockInfo = await checkStock(item.productId, item.quantity);
      if (!stockInfo) {
        stockErrors.push(`No inventory record found for "${product.name}"`);
        return null;
      }
      if (!stockInfo.isAvailable) {
        stockErrors.push(
          `"${product.name}" has only ${stockInfo.availableStock} unit(s) left but ${item.quantity} requested`
        );
        return null;
      }

      if (product.price !== item.price) {
        priceChanges.push({ name: product.name, oldPrice: item.price, newPrice: product.price });
      }

      return {
        productId: item.productId,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        quantity: item.quantity,
        subtotal: parseFloat((product.price * item.quantity).toFixed(2)),
      };
    })
  );

  if (stockErrors.length > 0)
    throw Object.assign(
      new Error(`Stock validation failed: ${stockErrors.join(' | ')}`),
      { statusCode: 400 }
    );

  const totalAmount = parseFloat(enrichedItems.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));

  const order = {
    orderid: uuidv4(),
    userId,
    email,
    items: enrichedItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    inventoryUpdated: false,
    totalAmount,
    createdAt: new Date().toISOString(),
    ...(priceChanges.length > 0 && { priceUpdated: true, priceChanges }),
  };

  await docClient.send(new PutCommand({ TableName: ORDERS_TABLE, Item: order }));
  await clearCart(cart.cartid);

  // Stock is NOT deducted here — it is deducted only after payment is confirmed
  // Payment Service calls PATCH /api/inventory/reduce-stock after successful payment

  return order;
};

const getAllOrders = async () => {
  const { Items = [] } = await docClient.send(new ScanCommand({ TableName: ORDERS_TABLE }));
  return Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getOrderById = async (orderid) => {
  const { Item } = await docClient.send(new GetCommand({ TableName: ORDERS_TABLE, Key: { orderid } }));
  return Item || null;
};

const getOrdersByUser = async (userId) => {
  const { Items = [] } = await docClient.send(
    new ScanCommand({
      TableName: ORDERS_TABLE,
      FilterExpression: '#userId = :userId',
      ExpressionAttributeNames: { '#userId': 'userId' },
      ExpressionAttributeValues: { ':userId': userId },
    })
  );
  return Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const updateOrderStatus = async (orderid, orderStatus) => {
  const existing = await getOrderById(orderid);
  if (!existing) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  if (existing.orderStatus === 'Cancelled')
    throw Object.assign(new Error('Cannot update a cancelled order'), { statusCode: 400 });

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid },
      UpdateExpression: 'SET orderStatus = :status',
      ExpressionAttributeValues: { ':status': orderStatus },
      ReturnValues: 'ALL_NEW',
    })
  );
  return Attributes;
};

const cancelOrder = async (orderid) => {
  const existing = await getOrderById(orderid);
  if (!existing) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  if (['Shipped', 'Delivered'].includes(existing.orderStatus))
    throw Object.assign(new Error(`Cannot cancel order with status: ${existing.orderStatus}`), { statusCode: 400 });
  if (existing.orderStatus === 'Cancelled')
    throw Object.assign(new Error('Order is already cancelled'), { statusCode: 400 });

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid },
      UpdateExpression: 'SET orderStatus = :status, paymentStatus = :payment',
      ExpressionAttributeValues: { ':status': 'Cancelled', ':payment': 'Cancelled' },
      ReturnValues: 'ALL_NEW',
    })
  );

  // No stock restore needed here — stock was never deducted at order creation
  // If payment was already Paid, Payment Service handles the stock restore on refund

  return Attributes;
};

module.exports = { createOrder, getAllOrders, getOrderById, getOrdersByUser, updateOrderStatus, cancelOrder };
