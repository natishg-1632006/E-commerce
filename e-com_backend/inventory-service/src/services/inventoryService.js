const { v4: uuidv4 } = require('uuid');
const {
  PutCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand,
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
  const { Items = [] } = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'productId = :pid',
      ExpressionAttributeValues: { ':pid': productId },
    })
  );
  return Items[0] || null;
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

  // Prevent negative stock
  if (inventory.currentStock - quantity < 0) {
    const err = new Error(`Insufficient stock for product: ${productId}. Available: ${inventory.currentStock}, Requested: ${quantity}`);
    err.statusCode = 400;
    throw err;
  }

  const previousStock = inventory.currentStock;
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

  await recordMovement(productId, 'OUT', quantity, 'Order confirmed - stock deducted', referenceId);

  console.log(
    `[Inventory Updated] Product: ${productId} | Previous: ${previousStock} | Purchased: ${quantity} | Current: ${newCurrent} | Updated At: ${Attributes.lastUpdated}`
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
  getLowStockProducts,
  deleteInventory,
};
