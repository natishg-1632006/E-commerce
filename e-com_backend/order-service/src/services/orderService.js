const { v4: uuidv4 } = require('uuid');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, ORDERS_TABLE } = require('../utils/fileHandler');
const { getCartByUserId, getProductById, getProductsByIds, clearCart } = require('../utils/cartApi');
const { checkStock, reserveStock, reserveStockBatch, releaseStock, restoreStock, checkStockBatch } = require('../utils/inventoryApi');
const { getProfile, updateProfile } = require('../utils/userApi');
const { publishOrderCreated, publishOrderConfirmed, publishOrderCancelled, publishOrderStatusChanged } = require("../utils/orderEventPublisher");

const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  CANCELLABLE_STATUSES,
  TERMINAL_STATUSES,
  STATUS_TRANSITIONS,
} = require('../constants/orderConstants');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getExpiresAt = () => {
  const minutes = parseInt(process.env.ORDER_PAYMENT_TIMEOUT_MINUTES || '15', 10);
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
};

// ─── Create Order ─────────────────────────────────────────────────────────────

const createOrder = async (userId, email, shippingAddress, paymentMethod, token) => {

  console.time("Get Cart");

  const cartPromise = getCartByUserId(userId);

  console.time("Get Profile");

  const profilePromise = getProfile(token);

  const cart = await cartPromise;
  console.timeEnd("Get Cart");

  const profile = await profilePromise;
  console.timeEnd("Get Profile");

  if (!cart) {
    throw Object.assign(
      new Error("Cart not found for this user"),
      { statusCode: 404 }
    );
  }

  if (!cart.items || cart.items.length === 0) {
    throw Object.assign(
      new Error("Cart is empty"),
      { statusCode: 400 }
    );
  }

  const isProfileIncomplete =
    !profile.fullName ||
    !profile.phone ||
    !profile.address?.address ||
    !profile.address?.city ||
    !profile.address?.state ||
    !profile.address?.pincode;

  if (isProfileIncomplete) {
    console.log(`[Order] Updating user profile for ${userId}`);
    console.time("Update Profile");
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
    console.timeEnd("Update Profile");

    console.log(`[Order] User profile updated successfully`);
  }

  // ── Step 2: Validate products and stock availability ───────────────────────
  const stockErrors = [];
  const priceChanges = [];

  // Fetch inventory for all products in ONE API call
  console.time("Batch Product + Inventory");

  // Fetch products and inventory in parallel
  console.time("Batch Products");

  const productPromise = getProductsByIds(
    cart.items.map(item => item.productId)
  );

  console.time("Batch Inventory");

  const inventoryPromise = checkStockBatch(
    cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }))
  );

  const products = await productPromise;
  console.timeEnd("Batch Products");

  const inventoryResults = await inventoryPromise;
  console.timeEnd("Batch Inventory");
  
  const productMap = new Map(
    products.map(product => [
      product.productId,
      product
    ])
  );

  const inventoryMap = new Map(
    inventoryResults.map(item => [
      item.productId,
      item
    ])
  );

  console.timeEnd("Batch Product + Inventory");

  const enrichedItems = await Promise.all(
    cart.items.map(async (item) => {

      // Only Product Service is called individually
      const product = productMap.get(item.productId);

      // Inventory comes from the batch response
      const stockInfo = inventoryMap.get(item.productId);

      if (!product) {
        stockErrors.push(`"${item.name}" is no longer available`);
        return null;
      }

      if (!stockInfo || !stockInfo.exists) {
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
        priceChanges.push({
          name: product.name,
          oldPrice: item.price,
          newPrice: product.price,
        });
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
  // ── Step 3: Reserve inventory ───────────────────────────────

  const orderId = uuidv4();

  console.time("Reserve Inventory");

  console.log(
    `[Order] Reserving inventory | orderId: ${orderId} | userId: ${userId} | items: ${enrichedItems.length}`
  );

  try {

    await reserveStockBatch(
      orderId,
      enrichedItems
    );

    console.log(
      `[Order] Reserved ${enrichedItems.length} product(s)`
    );

  } catch (err) {

    throw Object.assign(
      new Error(
        `Inventory reservation failed: ${err.message}`
      ),
      {
        statusCode: 400,
      }
    );

  }

  console.timeEnd("Reserve Inventory");

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
    statusHistory: [
      {
        status: ORDER_STATUS.PENDING_PAYMENT,
        timestamp: now,
      },
    ],
    ...(priceChanges.length > 0 && { priceUpdated: true, priceChanges }),
  };
  console.log("===== ORDER =====");
  console.log(JSON.stringify(order, null, 2));
  await docClient.send(
    new PutCommand({
      TableName: ORDERS_TABLE,
      Item: order,
    })
  );
  console.log("Order saved successfully");

  // Publish event
  try {
    console.time("Publish SNS");
    await publishOrderCreated(order);
    console.timeEnd("Publish SNS");
    console.log(
      `[Order] ORDER_CREATED published for ${order.orderid}`
    );
  } catch (err) {
    console.error(
      "[Order] Failed to publish ORDER_CREATED",
      err
    );

    // Do not fail order creation if SNS publish fails
  }
  console.time("Clear Cart");
  await clearCart(cart.cartid);
  console.timeEnd("Clear Cart");
  console.log(
    `[Order] Created | orderId: ${orderId} | userId: ${userId}`
  );

  return order;
};

// ─── Read Operations ──────────────────────────────────────────────────────────

const getAllOrders = async (params = {}) => {
  const { Items = [] } = await docClient.send(new ScanCommand({ TableName: ORDERS_TABLE }));
  
  let filtered = [...Items];
  
  // 1. Search filter: search matches orderid, email, shippingAddress.fullName, shippingAddress.phone, customerInfo.fullName, customerInfo.email
  if (params.search) {
    const searchVal = String(params.search).toLowerCase().trim();
    filtered = filtered.filter(o => {
      const orderIdMatch = o.orderid && String(o.orderid).toLowerCase().includes(searchVal);
      const emailMatch = o.email && String(o.email).toLowerCase().includes(searchVal);
      const customerEmailMatch = o.customerInfo && o.customerInfo.email && String(o.customerInfo.email).toLowerCase().includes(searchVal);
      const fullNameMatch = o.shippingAddress && o.shippingAddress.fullName && String(o.shippingAddress.fullName).toLowerCase().includes(searchVal);
      const phoneMatch = o.shippingAddress && o.shippingAddress.phone && String(o.shippingAddress.phone).includes(searchVal);
      const customerPhoneMatch = o.customerInfo && o.customerInfo.phone && String(o.customerInfo.phone).includes(searchVal);
      
      return orderIdMatch || emailMatch || customerEmailMatch || fullNameMatch || phoneMatch || customerPhoneMatch;
    });
  }
  
  // 2. Order status filter
  if (params.orderStatus) {
    const statusVal = String(params.orderStatus).toUpperCase();
    filtered = filtered.filter(o => {
      const st = String(o.orderStatus || o.status || '').toUpperCase();
      return st === statusVal;
    });
  }
  
  // 3. Payment status filter
  if (params.paymentStatus) {
    const statusVal = String(params.paymentStatus).toUpperCase();
    filtered = filtered.filter(o => {
      const pst = String(o.paymentStatus || '').toUpperCase();
      return pst === statusVal;
    });
  }
  
  // 4. Payment method filter
  if (params.paymentMethod) {
    const methodVal = String(params.paymentMethod).toUpperCase();
    filtered = filtered.filter(o => {
      const pm = String(o.paymentMethod || '').toUpperCase();
      return pm === methodVal;
    });
  }
  
  // 5. Date Range (startDate & endDate)
  if (params.startDate) {
    const start = new Date(params.startDate);
    filtered = filtered.filter(o => o.createdAt && new Date(o.createdAt) >= start);
  }
  if (params.endDate) {
    const end = new Date(params.endDate);
    filtered = filtered.filter(o => o.createdAt && new Date(o.createdAt) <= end);
  }
  
  // 6. Min & Max amount
  if (params.minAmount !== undefined && params.minAmount !== '') {
    const min = Number(params.minAmount);
    filtered = filtered.filter(o => Number(o.totalAmount || 0) >= min);
  }
  if (params.maxAmount !== undefined && params.maxAmount !== '') {
    const max = Number(params.maxAmount);
    filtered = filtered.filter(o => Number(o.totalAmount || 0) <= max);
  }
  
  // 7. Sort
  const sortVal = params.sort ? String(params.sort).toLowerCase() : 'newest';
  if (sortVal === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortVal === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortVal === 'highestamount') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    filtered.sort((a, b) => Number(b.totalAmount || 0) - Number(a.totalAmount || 0));
  } else if (sortVal === 'lowestamount') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    filtered.sort((a, b) => Number(a.totalAmount || 0) - Number(b.totalAmount || 0));
  }
  
  // 8. Pagination
  const total = filtered.length;
  let page = Number(params.page || 1);
  let limit = Number(params.limit || 10);
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const data = filtered.slice(startIndex, startIndex + limit);
  const todayStr = new Date().toISOString().split('T')[0];

  // Compute global statistics across all orders
  const todaysPaid = Items.filter(o => (o.createdAt || '').startsWith(todayStr)).length;
  const processingOrdersCount = Items.filter(o => String(o.orderStatus || '').toUpperCase() === 'PROCESSING').length;
  const packedOrdersCount = Items.filter(o => String(o.orderStatus || '').toUpperCase() === 'PACKED').length;
  const shippedOrdersCount = Items.filter(o => String(o.orderStatus || '').toUpperCase() === 'SHIPPED').length;
  const outForDeliveryOrdersCount = Items.filter(o => {
    const ost = String(o.orderStatus || '').toUpperCase();
    return ost === 'OUT_FOR_DELIVERY' || ost === 'OUT FOR DELIVERY';
  }).length;
  const deliveredOrdersCount = Items.filter(o => String(o.orderStatus || '').toUpperCase() === 'DELIVERED').length;
  const completedOrdersCount = Items.filter(o => String(o.orderStatus || '').toUpperCase() === 'COMPLETED').length;
  const cancelledOrdersCount = Items.filter(o => {
    const ost = String(o.orderStatus || '').toUpperCase();
    return ost === 'CANCELLED' || ost === 'CANCELED' || ost === 'PAYMENT_FAILED' || ost === 'PAYMENT FAILED';
  }).length;
  const pendingOrdersCount = Items.filter(o => {
    const ost = String(o.orderStatus || '').toUpperCase();
    const pst = String(o.paymentStatus || '').toUpperCase();
    return ost === 'PENDING_PAYMENT' || ost === 'PENDING PAYMENT' || (pst === 'PENDING' && String(o.paymentMethod || '').toUpperCase() !== 'COD');
  }).length;
  const revenueVal = Items
    .filter(o => String(o.paymentStatus || '').toUpperCase() === 'PAID')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const statistics = {
    totalOrders: Items.length,
    todaysOrders: todaysPaid,
    pending: pendingOrdersCount,
    processing: processingOrdersCount,
    packed: packedOrdersCount,
    shipped: shippedOrdersCount,
    outForDelivery: outForDeliveryOrdersCount,
    delivered: deliveredOrdersCount + completedOrdersCount,
    cancelled: cancelledOrdersCount,
    revenue: revenueVal
  };
  
  return {
    data,
    statistics,
    meta: {
      page,
      limit,
      total,
      totalPages: totalPages || 1
    }
  };
};

const getOrderById = async (orderid) => {
  const { Item } = await docClient.send(new GetCommand({ TableName: ORDERS_TABLE, Key: { orderid } }));
  return Item || null;
};

const getOrdersByUser = async (userId) => {
  const { Items = [] } = await docClient.send(
    new QueryCommand({
      TableName: ORDERS_TABLE,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
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
      UpdateExpression:
        `
        SET
        paymentStatus = :payment,
        orderStatus = :order,
        updatedAt = :at,
        statusHistory =
        list_append(
        if_not_exists(statusHistory,:emptyHistory),
        :history
        ),
        processedEventIds =
        list_append(
        if_not_exists(processedEventIds,:emptyList),
        :eventIdList
        )`,
      ExpressionAttributeValues: {
        ':payment': paymentStatus,
        ':order': orderStatus,
        ':at': now,
        ':emptyList': [],
        ':eventIdList': [idempotencyKey],
        ":emptyHistory": [],
        ":history": [
          {
            status: orderStatus,
            timestamp: now,
          },
        ],
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  if (eventType === "PAYMENT_SUCCESS") {
    try {
      await publishOrderConfirmed(Attributes);

      console.log(
        `[Order] ORDER_CONFIRMED published for ${Attributes.orderid}`
      );
    } catch (err) {
      console.error(
        "[Order] Failed to publish ORDER_CONFIRMED",
        err
      );
    }
  }

  console.log(`[Order] Updated | orderId: ${message.orderId} | paymentStatus=${paymentStatus} | orderStatus=${orderStatus}`);
  return Attributes;
};

// ─── Status Update ────────────────────────────────────────────────────────────

const updateOrderStatus = async (orderid, orderStatus) => {
  const existing = await getOrderById(orderid);
  if (!existing) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  if (TERMINAL_STATUSES.includes(existing.orderStatus)) {
    throw Object.assign(
      new Error(`Cannot update terminal order: ${existing.orderStatus}`),
      { statusCode: 400 }
    );
  }

  const allowed =
    STATUS_TRANSITIONS[existing.orderStatus] || [];

  if (!allowed.includes(orderStatus)) {
    throw Object.assign(
      new Error(
        `Invalid transition from ${existing.orderStatus} to ${orderStatus}`
      ),
      { statusCode: 400 }
    );
  }

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid },
      UpdateExpression:
        `
        SET
        orderStatus = :status,
        updatedAt = :at,
        statusHistory =
        list_append(
        if_not_exists(statusHistory, :empty),
        :newHistory
        )`,
      ExpressionAttributeValues: {
        ":status": orderStatus,
        ":at": new Date().toISOString(),

        ":empty": [],

        ":newHistory": [
          {
            status: orderStatus,
            timestamp: new Date().toISOString(),
          },
        ],
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  console.log(`[Order] Status updated | orderId: ${orderid} | from: ${existing.orderStatus} | to: ${orderStatus} | timestamp: ${Attributes.updatedAt}`);

  try {

    switch (orderStatus) {

      case ORDER_STATUS.PROCESSING:

        await publishOrderStatusChanged(
          Attributes,
          "ORDER_PROCESSING"
        );

        break;

      case ORDER_STATUS.PACKED:

        await publishOrderStatusChanged(
          Attributes,
          "ORDER_PACKED"
        );

        break;

      case ORDER_STATUS.SHIPPED:

        await publishOrderStatusChanged(
          Attributes,
          "ORDER_SHIPPED"
        );

        break;

      case ORDER_STATUS.OUT_FOR_DELIVERY:

        await publishOrderStatusChanged(
          Attributes,
          "ORDER_OUT_FOR_DELIVERY"
        );

        break;

      case ORDER_STATUS.DELIVERED:

        await publishOrderStatusChanged(
          Attributes,
          "ORDER_DELIVERED"
        );

        break;

      case ORDER_STATUS.COMPLETED:

        await publishOrderStatusChanged(
          Attributes,
          "ORDER_COMPLETED"
        );

        break;

      default:
        break;
    }

  } catch (err) {

    console.error(
      `[Order] Failed to publish ${orderStatus}`,
      err
    );

  }
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

    // Order not paid yet
    if (existing.orderStatus === ORDER_STATUS.PENDING_PAYMENT) {

      console.log(
        `[Order] Releasing reserved stock | orderId: ${orderid}`
      );

      await Promise.all(
        existing.items.map((item) =>
          releaseStock(item.productId, item.quantity, orderid)
        )
      );

    }

    // Payment completed
    else if (existing.orderStatus === ORDER_STATUS.PROCESSING) {

      console.log(
        `[Order] Restoring inventory | orderId: ${orderid}`
      );

      await Promise.all(
        existing.items.map((item) =>
          restoreStock(item.productId, item.quantity, orderid)
        )
      );

    }

  }
  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid },
      UpdateExpression: 'SET orderStatus = :status, paymentStatus = :payment, updatedAt = :at',
      ExpressionAttributeValues: {
        ':status': ORDER_STATUS.CANCELLED,
        ':payment': PAYMENT_STATUS.REFUNDED,
        ':at': now,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  try {
    await publishOrderCancelled(Attributes);

    console.log(
      `[Order] ORDER_CANCELLED published for ${Attributes.orderid}`
    );
  } catch (err) {
    console.error(
      "[Order] Failed to publish ORDER_CANCELLED",
      err
    );
  }

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
