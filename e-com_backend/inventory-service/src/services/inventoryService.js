const { v4: uuidv4 } = require('uuid');
const {
  PutCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand,
  QueryCommand
} = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLE_NAME, MOVEMENTS_TABLE } = require('../utils/fileHandler');
const { getProduct } = require('../utils/productApi');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const deriveStatus = (availableStock, lowStockThreshold) => {
  if (availableStock <= 0) return 'Out Of Stock';
  if (availableStock <= lowStockThreshold) return 'Low Stock';
  return 'In Stock';
};

// Movement logging is optional — fails silently if InventoryMovements table doesn't exist
const recordMovement = async (productId, type, quantity, reason, referenceId = '') => {
  if (!MOVEMENTS_TABLE) return null;
  const movement = {
    movementId: uuidv4(),
    productId,
    type,
    quantity,
    reason,
    referenceId,
    createdAt: new Date().toISOString(),
  };
  try {
    await docClient.send(new PutCommand({ TableName: MOVEMENTS_TABLE, Item: movement }));
  } catch (err) {
    console.warn('[Movement Log Skipped]', err.message);
  }
  return movement;
};

// Scan table to find inventory record by productId (not the partition key)
const getInventoryByProductId = async (productId) => {
  console.time("Inventory Query");

  const { Items = [] } = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "ProductIdIndex",
      KeyConditionExpression: "productId = :pid",
      ExpressionAttributeValues: {
        ":pid": productId,
      },
      Limit: 1,
    })
  );

  console.timeEnd("Inventory Query");

  return Items[0] || null;
};

const getProductEventKey = (inventory, eventId, productId) => {
  return `${eventId}:${productId}`;
};

const hasProcessedEvent = (inventory, eventId, productId) => {
  const key = getProductEventKey(inventory, eventId, productId);
  return Array.isArray(inventory.processedEventIds) && inventory.processedEventIds.includes(key);
};

const appendProcessedEvent = async (inventory, eventId, productId) => {
  const key = getProductEventKey(inventory, eventId, productId);
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { Inventoryid: inventory.Inventoryid },
      UpdateExpression: 'SET processedEventIds = list_append(if_not_exists(processedEventIds, :emptyList), :eventIdList)',
      ExpressionAttributeValues: {
        ':emptyList': [],
        ':eventIdList': [key],
      },
      ReturnValues: 'NONE',
    })
  );
};

const processPaymentEvent = async ({ eventType, eventId, message }) => {
  if (!message || !Array.isArray(message.items)) {
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

  for (const item of message.items) {
    const { productId, quantity } = item;
    console.log(`[Inventory] Processing product ${productId}`);

    const inventory = await getInventoryByProductId(productId);
    if (!inventory) {
      const err = new Error(`Inventory not found for product: ${productId}`);
      err.statusCode = 404;
      throw err;
    }

    if (hasProcessedEvent(inventory, idempotencyKey, productId)) {
      console.log('[Inventory] Event already processed');
      continue;
    }

    switch (eventType) {
      case 'PAYMENT_SUCCESS':
        await reduceStock(productId, quantity, idempotencyKey);
        break;
      case 'PAYMENT_FAILED':
        await releaseStock(productId, quantity, idempotencyKey);
        break;
      case 'PAYMENT_REFUNDED':
        await increaseStock(productId, quantity, `Refunded payment ${message.paymentId || idempotencyKey}`);
        break;
      default:
        const err = new Error(`Unsupported payment event type: ${eventType}`);
        err.statusCode = 400;
        throw err;
    }

    await appendProcessedEvent(inventory, idempotencyKey, productId);
    console.log(`[Inventory] Updated product ${productId} | eventType=${eventType}`);
  }

  return { success: true };
};

// ─── Service Functions ────────────────────────────────────────────────────────

const createInventory = async (data) => {
  const product = await getProduct(data.productId);
  if (!product) {
    const err = new Error('Product not found in Product Service');
    err.statusCode = 404;
    throw err;
  }

  // Business Rule 1 — one inventory record per product
  const existing = await getInventoryByProductId(data.productId);
  if (existing) {
    const err = new Error('Inventory record already exists for this product');
    err.statusCode = 409;
    throw err;
  }

  const currentStock = parseInt(data.currentStock);
  const reservedStock = 0;
  const availableStock = currentStock - reservedStock;
  const lowStockThreshold = parseInt(data.lowStockThreshold ?? 10);

  const inventory = {
    Inventoryid: uuidv4(),           // partition key
    productId: data.productId,
    currentStock,
    reservedStock,
    availableStock,
    lowStockThreshold,
    status: deriveStatus(availableStock, lowStockThreshold),
    lastUpdated: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: inventory }));
  await recordMovement(data.productId, 'IN', currentStock, 'Initial Stock');
  return inventory;
};

const processProductCreatedEvent = async ({ message }) => {
  if (!message || !message.productId) {
    const err = new Error("Invalid product event payload");
    err.statusCode = 400;
    throw err;
  }

  console.log(
    `[Inventory] Creating inventory for product ${message.productId}`
  );

  // Check if inventory already exists
  const existing = await getInventoryByProductId(message.productId);

  if (existing) {
    console.log(
      `[Inventory] Inventory already exists for ${message.productId}`
    );

    return {
      skipped: true,
    };
  }

  const inventory = {
    Inventoryid: uuidv4(),

    productId: message.productId,

    currentStock: 0,
    reservedStock: 0,
    availableStock: 0,

    lowStockThreshold: 10,

    status: "Out Of Stock",

    lastUpdated: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: inventory,
    })
  );

  console.log(
    `[Inventory] Inventory created automatically for ${message.productId}`
  );

  return inventory;
};

const getAllInventory = async () => {
  const { Items = [] } = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
  return Items;
};

const updateInventory = async (productId, data) => {
  const existing = await getInventoryByProductId(productId);
  if (!existing) return null;

  const lowStockThreshold = data.lowStockThreshold !== undefined
    ? parseInt(data.lowStockThreshold)
    : existing.lowStockThreshold;

  const status = deriveStatus(existing.availableStock, lowStockThreshold);

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { Inventoryid: existing.Inventoryid },
      UpdateExpression: 'SET lowStockThreshold = :t, #status = :s, lastUpdated = :u',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':t': lowStockThreshold,
        ':s': status,
        ':u': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })
  );
  return Attributes;
};

const increaseStock = async (productId, quantity, reason) => {
  const inventory = await getInventoryByProductId(productId);
  if (!inventory) {
    const err = new Error('Inventory not found');
    err.statusCode = 404;
    throw err;
  }

  const newCurrent = inventory.currentStock + quantity;
  const newAvailable = newCurrent - inventory.reservedStock;

  const status = deriveStatus(newAvailable, inventory.lowStockThreshold);

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { Inventoryid: inventory.Inventoryid },
      UpdateExpression: 'SET currentStock = :c, availableStock = :a, #status = :s, lastUpdated = :u',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':c': newCurrent,
        ':a': newAvailable,
        ':s': status,
        ':u': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  await recordMovement(productId, 'IN', quantity, reason);
  return Attributes;
};

const decreaseStock = async (productId, quantity, reason) => {
  const inventory = await getInventoryByProductId(productId);
  if (!inventory) {
    const err = new Error('Inventory not found');
    err.statusCode = 404;
    throw err;
  }

  // Business Rule 3 — stock cannot go negative
  if (inventory.currentStock - quantity < 0) {
    const err = new Error('Insufficient stock — cannot go negative');
    err.statusCode = 400;
    throw err;
  }

  const newCurrent = inventory.currentStock - quantity;
  const newAvailable = newCurrent - inventory.reservedStock;
  const status = deriveStatus(newAvailable, inventory.lowStockThreshold);

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { Inventoryid: inventory.Inventoryid },
      UpdateExpression: 'SET currentStock = :c, availableStock = :a, #status = :s, lastUpdated = :u',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':c': newCurrent,
        ':a': newAvailable,
        ':s': status,
        ':u': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  await recordMovement(productId, 'OUT', quantity, reason);
  return Attributes;
};

const reserveStock = async (productId, quantity, referenceId) => {
  const inventory = await getInventoryByProductId(productId);
  if (!inventory) {
    const err = new Error('Inventory not found');
    err.statusCode = 404;
    throw err;
  }

  // Business Rule 3 & 4
  if (inventory.availableStock < quantity) {
    const err = new Error('Insufficient available stock to reserve');
    err.statusCode = 400;
    throw err;
  }

  const newReserved = inventory.reservedStock + quantity;
  const newAvailable = inventory.currentStock - newReserved;
  const status = deriveStatus(newAvailable, inventory.lowStockThreshold);

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { Inventoryid: inventory.Inventoryid },
      UpdateExpression: 'SET reservedStock = :r, availableStock = :a, #status = :s, lastUpdated = :u',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':r': newReserved,
        ':a': newAvailable,
        ':s': status,
        ':u': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  await recordMovement(productId, 'RESERVE', quantity, 'Stock reserved for order', referenceId);
  return Attributes;
};

const releaseStock = async (productId, quantity, referenceId) => {
  const inventory = await getInventoryByProductId(productId);
  if (!inventory) {
    const err = new Error('Inventory not found');
    err.statusCode = 404;
    throw err;
  }

  // Business Rule 5
  if (inventory.reservedStock < quantity) {
    const err = new Error('Release quantity exceeds currently reserved stock');
    err.statusCode = 400;
    throw err;
  }

  const newReserved = inventory.reservedStock - quantity;
  const newAvailable = inventory.currentStock - newReserved;
  const status = deriveStatus(newAvailable, inventory.lowStockThreshold);

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { Inventoryid: inventory.Inventoryid },
      UpdateExpression: 'SET reservedStock = :r, availableStock = :a, #status = :s, lastUpdated = :u',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':r': newReserved,
        ':a': newAvailable,
        ':s': status,
        ':u': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  await recordMovement(productId, 'RELEASE', quantity, 'Reserved stock released', referenceId);
  return Attributes;
};

const checkStockAvailability = async (productId, quantity = 1) => {
  const inventory = await getInventoryByProductId(productId);
  if (!inventory) {
    const err = new Error('Inventory not found');
    err.statusCode = 404;
    throw err;
  }
  const qty = parseInt(quantity);
  return {
    productId,
    requestedQuantity: qty,
    availableStock: inventory.availableStock,
    isAvailable: inventory.availableStock >= qty,
    status: inventory.status,
  };
};

const checkStockAvailabilityBatch = async (items) => {

  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("items array is required");
    err.statusCode = 400;
    throw err;
  }

  const results = await Promise.all(

    items.map(async ({ productId, quantity }) => {

      const inventory =
        await getInventoryByProductId(productId);

      if (!inventory) {

        return {
          productId,
          exists: false,
          isAvailable: false,
        };

      }

      const qty = Number(quantity);

      return {

        productId,

        exists: true,

        requestedQuantity: qty,

        availableStock:
          inventory.availableStock,

        isAvailable:
          inventory.availableStock >= qty,

        status:
          inventory.status,

      };

    })

  );

  return results;

};

const getLowStockProducts = async () => {
  const { Items = [] } = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#status IN (:low, :out)',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':low': 'Low Stock',
        ':out': 'Out Of Stock',
      },
    })
  );
  return Items;
};

/**
 * Reduce currentStock after a confirmed order/payment.
 * Called exclusively by Payment Service after successful payment.
 * Business Rule 6 — reduce current stock only after payment is successful.
 */
const reduceStock = async (productId, quantity, referenceId = '') => {
  const inventory = await getInventoryByProductId(productId);
  if (!inventory) {
    const err = new Error('Inventory not found for product: ' + productId);
    err.statusCode = 404;
    throw err;
  }

  if (inventory.currentStock - quantity < 0) {
    const err = new Error(`Insufficient stock for product: ${productId}. Available: ${inventory.currentStock}, Requested: ${quantity}`);
    err.statusCode = 400;
    throw err;
  }

  const previousStock = inventory.currentStock;
  const newCurrent = inventory.currentStock - quantity;                    // 30 - 1 = 29
  const newReserved = Math.max(0, inventory.reservedStock - quantity);      //  1 - 1 =  0
  const newAvailable = newCurrent - newReserved;                             // 29 - 0 = 29
  const newStatus = deriveStatus(newAvailable, inventory.lowStockThreshold);

  console.log(`[DEBUG][InventoryService] reduceStock | productId: ${productId} | BEFORE: currentStock=${inventory.currentStock} reservedStock=${inventory.reservedStock} availableStock=${inventory.availableStock}`);
  console.log(`[DEBUG][InventoryService] reduceStock | WRITING: currentStock=${newCurrent} reservedStock=${newReserved} availableStock=${newAvailable} status=${newStatus}`);

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { Inventoryid: inventory.Inventoryid },
      UpdateExpression:
        'SET currentStock = :c, reservedStock = :r, availableStock = :a, #status = :s, lastUpdated = :u, soldQuantity = if_not_exists(soldQuantity, :zero) + :qty',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':c': newCurrent,
        ':r': newReserved,
        ':a': newAvailable,
        ':s': newStatus,
        ':u': new Date().toISOString(),
        ':zero': 0,
        ':qty': quantity,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  await recordMovement(productId, 'OUT', quantity, 'Order confirmed - stock deducted', referenceId);

  console.log(
    `[Inventory Updated] Product: ${productId} | Previous: ${previousStock} | Purchased: ${quantity} | Current: ${newCurrent} | Reserved: ${newReserved} | Available: ${newAvailable} | SoldQuantity: ${(inventory.soldQuantity || 0) + quantity} | Updated At: ${Attributes.lastUpdated}`
  );

  return { ...Attributes, previousStock };
};

const deleteInventory = async (productId) => {
  const existing = await getInventoryByProductId(productId);
  if (!existing) return null;
  await docClient.send(
    new DeleteCommand({ TableName: TABLE_NAME, Key: { Inventoryid: existing.Inventoryid } })
  );
  return existing;
};

const processProductDeletedEvent = async ({ message }) => {

  if (!message.productId) {
    throw new Error("Missing productId");
  }

  const inventory = await getInventoryByProductId(
    message.productId
  );

  if (!inventory) {

    console.log(
      `[Inventory] Inventory already removed`
    );

    return {
      skipped: true,
    };
  }

  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        Inventoryid: inventory.Inventoryid,
      },
    })
  );

  console.log(
    `[Inventory] Deleted inventory for ${message.productId}`
  );

  return {
    success: true,
  };
};

const restoreStock = async (productId, quantity, orderId) => {

  const inventory = await getInventoryByProductId(productId);

  if (!inventory) {
    const err = new Error("Inventory not found");
    err.statusCode = 404;
    throw err;
  }

  const newCurrent = inventory.currentStock + quantity;

  const newAvailable = newCurrent - inventory.reservedStock;

  const newSold = Math.max(
    0,
    (inventory.soldQuantity || 0) - quantity
  );

  const status = deriveStatus(
    newAvailable,
    inventory.lowStockThreshold
  );

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        Inventoryid: inventory.Inventoryid,
      },
      UpdateExpression: `
        SET currentStock = :c,
            availableStock = :a,
            soldQuantity = :sold,
            #status = :s,
            lastUpdated = :u
      `,
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":c": newCurrent,
        ":a": newAvailable,
        ":sold": newSold,
        ":s": status,
        ":u": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );

  await recordMovement(
    productId,
    "IN",
    quantity,
    "ORDER_CANCELLED",
    orderId
  );

  console.log(
    `[Inventory] Stock Restored | Product=${productId} Current=${newCurrent} Available=${newAvailable} Sold=${newSold}`
  );

  return Attributes;
};

module.exports = {
  createInventory,
  getAllInventory,
  getInventoryByProductId,
  updateInventory,
  increaseStock,
  decreaseStock,
  reserveStock,
  releaseStock,
  reduceStock,
  checkStockAvailability,
  checkStockAvailabilityBatch,
  getLowStockProducts,
  deleteInventory,
  processPaymentEvent,
  processProductCreatedEvent,
  processProductDeletedEvent,
  restoreStock
};
