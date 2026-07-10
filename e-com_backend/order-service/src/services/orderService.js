const { v4: uuidv4 } = require('uuid');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, ORDERS_TABLE } = require('../utils/fileHandler');
const { getCartByUserId, getProductById, clearCart } = require('../utils/cartApi');
const { checkStock, reserveStock, releaseStock } = require('../utils/inventoryApi');
const { getProfile, updateProfile } = require('../utils/userApi');

const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  CANCELLABLE_STATUSES,
  TERMINAL_STATUSES,
} = require('../constants/orderConstants');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getExpiresAt = () => {
  const minutes = parseInt(process.env.ORDER_PAYMENT_TIMEOUT_MINUTES || '15', 10);
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
};

// ─── Create Order ─────────────────────────────────────────────────────────────

const createOrder = async (userId, email, shippingAddress, paymentMethod, token) => {
  // ── Step 1: Fetch and validate cart ────────────────────────────────────────
  const cart = await getCartByUserId(userId);
  if (!cart) throw Object.assign(new Error('Cart not found for this user'), { statusCode: 404 });
  if (!cart.items || cart.items.length === 0)
    throw Object.assign(new Error('Cart is empty'), { statusCode: 400 });

  // ── Step 2: Sync user profile (only if profile is incomplete) ───────────────

const profile = await getProfile(token);

const isProfileIncomplete =
  !profile.fullName ||
  !profile.phone ||
  !profile.address?.address ||
  !profile.address?.city ||
  !profile.address?.state ||
  !profile.address?.pincode;

if (isProfileIncomplete) {
  console.log(`[Order] Updating user profile for ${userId}`);

  await updateProfile(
    {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      address: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      },
    },
    token
  );

  console.log(`[Order] User profile updated successfully`);
}

  // ── Step 2: Validate products and stock availability ───────────────────────
  const stockErrors = [];
  const priceChanges = [];

  const enrichedItems = await Promise.all(
    cart.items.map(async (item) => {
      const product = await getProductById(item.productId);

      if (!product) {
        stockErrors.push(`"${item.name}" is no longer available`);
        return null;
      }

      const stockInfo = await checkStock(item.productId, item.quantity, token);
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

  // ── Step 3: Reserve inventory (with full rollback on any failure) ──────────
  // orderId is generated here so it can be used as the reservation referenceId,
  // making every inventory movement traceable back to this specific order.
  const orderId = uuidv4();
  const reserved = [];

  console.log(`[Order] Reserving inventory | orderId: ${orderId} | userId: ${userId} | items: ${enrichedItems.length} | timestamp: ${new Date().toISOString()}`);

  for (const item of enrichedItems) {
    try {
      await reserveStock(item.productId, item.quantity, orderId);
      reserved.push(item);
      console.log(`[Order] Reserved | orderId: ${orderId} | productId: ${item.productId} | quantity: ${item.quantity}`);
    } catch (err) {
      // Rollback all previously reserved items before aborting
      console.warn(`[Order] Reservation failed for productId: ${item.productId} | orderId: ${orderId} | error: ${err.message} | rolling back ${reserved.length} item(s)`);
      await Promise.allSettled(
        reserved.map((r) => releaseStock(r.productId, r.quantity, orderId))
      );
      throw Object.assign(
        new Error(`Reservation failed for "${item.name}": ${err.message}`),
        { statusCode: 400 }
      );
    }
  }

  // ── Step 4: Build and persist the order ───────────────────────────────────
  const totalAmount = parseFloat(enrichedItems.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));
  const now = new Date().toISOString();

  const order = {
    orderid: orderId,
    userId,
    email,
    items: enrichedItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: PAYMENT_STATUS.PENDING,
    orderStatus: ORDER_STATUS.PENDING_PAYMENT,
    inventoryUpdated: false,
    totalAmount,
    createdAt: now,
    expiresAt: getExpiresAt(),
    ...(priceChanges.length > 0 && { priceUpdated: true, priceChanges }),
  };

  await docClient.send(new PutCommand({ TableName: ORDERS_TABLE, Item: order }));
  await clearCart(cart.cartid);

  console.log(`[Order] Created | orderId: ${orderId} | userId: ${userId} | totalAmount: ${totalAmount} | paymentMethod: ${paymentMethod} | expiresAt: ${order.expiresAt} | timestamp: ${now}`);

  return order;
};

// ─── Read Operations ──────────────────────────────────────────────────────────

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

const hasProcessedEvent = (order, eventKey) => {
  return Array.isArray(order.processedEventIds) && order.processedEventIds.includes(eventKey);
};

const appendProcessedEvent = async (orderid, eventKey) => {
  await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid },
      UpdateExpression: 'SET processedEventIds = list_append(if_not_exists(processedEventIds, :emptyList), :eventIdList)',
      ExpressionAttributeValues: {
        ':emptyList': [],
        ':eventIdList': [eventKey],
      },
      ReturnValues: 'NONE',
    })
  );
};

const processPaymentEvent = async ({ eventType, eventId, message }) => {
  if (!message || typeof message.orderId !== 'string') {
    const err = new Error('Invalid payment event payload');
    err.statusCode = 400;
    throw err;
  }

  const idempotencyKey = eventId || message.paymentId;
  if (!idempotencyKey) {
    const err = new Error('Missing eventId or paymentId for idempotency');
    err.statusCode = 400;
    throw err;
  }

  const order = await getOrderById(message.orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (hasProcessedEvent(order, idempotencyKey)) {
    console.log('[Order] Event already processed');
    return { skipped: true };
  }

  const now = new Date().toISOString();
  let paymentStatus;
  let orderStatus;

  switch (eventType) {
    case 'PAYMENT_SUCCESS':
      paymentStatus = PAYMENT_STATUS.PAID;
      orderStatus = ORDER_STATUS.PROCESSING;
      break;
    case 'PAYMENT_FAILED':
      paymentStatus = PAYMENT_STATUS.FAILED;
      orderStatus = ORDER_STATUS.PAYMENT_FAILED;
      break;
    case 'PAYMENT_REFUNDED':
      paymentStatus = PAYMENT_STATUS.REFUNDED;
      orderStatus = ORDER_STATUS.CANCELLED;
      break;
    default:
      const err = new Error(`Unsupported payment event type: ${eventType}`);
      err.statusCode = 400;
      throw err;
  }

  console.log('[Order] Updating order', { orderId: message.orderId, eventType });

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid: message.orderId },
      UpdateExpression: 'SET paymentStatus = :payment, orderStatus = :order, updatedAt = :at, processedEventIds = list_append(if_not_exists(processedEventIds, :emptyList), :eventIdList)',
      ExpressionAttributeValues: {
        ':payment': paymentStatus,
        ':order': orderStatus,
        ':at': now,
        ':emptyList': [],
        ':eventIdList': [idempotencyKey],
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  console.log(`[Order] Updated | orderId: ${message.orderId} | paymentStatus=${paymentStatus} | orderStatus=${orderStatus}`);
  return Attributes;
};

// ─── Status Update ────────────────────────────────────────────────────────────

const updateOrderStatus = async (orderid, orderStatus) => {
  const existing = await getOrderById(orderid);
  if (!existing) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  if (TERMINAL_STATUSES.includes(existing.orderStatus))
    throw Object.assign(
      new Error(`Cannot update order with terminal status: ${existing.orderStatus}`),
      { statusCode: 400 }
    );

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid },
      UpdateExpression: 'SET orderStatus = :status, updatedAt = :at',
      ExpressionAttributeValues: {
        ':status': orderStatus,
        ':at': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  console.log(`[Order] Status updated | orderId: ${orderid} | from: ${existing.orderStatus} | to: ${orderStatus} | timestamp: ${Attributes.updatedAt}`);
  return Attributes;
};

// ─── Cancel Order ─────────────────────────────────────────────────────────────

const cancelOrder = async (orderid) => {
  const existing = await getOrderById(orderid);
  if (!existing) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  if (!CANCELLABLE_STATUSES.includes(existing.orderStatus))
    throw Object.assign(
      new Error(`Cannot cancel order with status: ${existing.orderStatus}`),
      { statusCode: 400 }
    );

  const now = new Date().toISOString();

  // Release reserved inventory before marking the order cancelled.
  // This is critical — without this, stock stays locked forever.
  if (existing.items && existing.items.length > 0) {
    console.log(`[Order] Releasing reserved stock on cancel | orderId: ${orderid} | userId: ${existing.userId} | items: ${existing.items.length} | timestamp: ${now}`);
    await Promise.allSettled(
      existing.items.map((item) => releaseStock(item.productId, item.quantity, orderid))
    );
  }

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid },
      UpdateExpression: 'SET orderStatus = :status, paymentStatus = :payment, updatedAt = :at',
      ExpressionAttributeValues: {
        ':status': ORDER_STATUS.CANCELLED,
        ':payment': PAYMENT_STATUS.FAILED,
        ':at': now,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  console.log(`[Order] Cancelled | orderId: ${orderid} | userId: ${existing.userId} | timestamp: ${now}`);
  return Attributes;
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  cancelOrder,
  processPaymentEvent,
};
