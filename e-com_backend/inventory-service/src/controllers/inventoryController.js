const service = require('../services/inventoryService');
const { success, error } = require('../utils/responseHandler');

const createInventory = async (req, res, next) => {
  try {
    const inventory = await service.createInventory(req.body);
    success(res, inventory, 201);
  } catch (err) {
    next(err);
  }
};

const getAllInventory = async (req, res, next) => {
  try {
    const items = await service.getAllInventory();
    success(res, items);
  } catch (err) {
    next(err);
  }
};

const getInventoryByProductId = async (req, res, next) => {
  try {
    const inventory = await service.getInventoryByProductId(req.params.productId);
    if (!inventory) return error(res, 'Inventory not found', 404);
    success(res, inventory);
  } catch (err) {
    next(err);
  }
};

const updateInventory = async (req, res, next) => {
  try {
    const inventory = await service.updateInventory(req.params.productId, req.body);
    if (!inventory) return error(res, 'Inventory not found', 404);
    success(res, inventory);
  } catch (err) {
    next(err);
  }
};

const deleteInventory = async (req, res, next) => {
  try {
    const inventory = await service.deleteInventory(req.params.productId);
    if (!inventory) return error(res, 'Inventory not found', 404);
    success(res, { message: 'Inventory deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const increaseStock = async (req, res, next) => {
  try {
    const { productId, quantity, reason } = req.body;
    const inventory = await service.increaseStock(productId, parseInt(quantity), reason);
    success(res, inventory);
  } catch (err) {
    next(err);
  }
};

const decreaseStock = async (req, res, next) => {
  try {
    const { productId, quantity, reason } = req.body;
    const inventory = await service.decreaseStock(productId, parseInt(quantity), reason);
    success(res, inventory);
  } catch (err) {
    next(err);
  }
};

const reserveStock = async (req, res, next) => {
  try {
    const { productId, quantity, referenceId } = req.body;
    const inventory = await service.reserveStock(productId, parseInt(quantity), referenceId);
    success(res, inventory);
  } catch (err) {
    next(err);
  }
};

const releaseStock = async (req, res, next) => {
  try {
    const { productId, quantity, referenceId } = req.body;
    const inventory = await service.releaseStock(productId, parseInt(quantity), referenceId);
    success(res, inventory);
  } catch (err) {
    next(err);
  }
};

const checkStockAvailability = async (req, res, next) => {
  try {
    const result = await service.checkStockAvailability(
      req.params.productId,
      req.query.quantity
    );
    success(res, result);
  } catch (err) {
    next(err);
  }
};

const reduceStock = async (req, res, next) => {
  try {
    const { productId, quantity, referenceId } = req.body;
    console.log(`[DEBUG][InventoryController] reduceStock called | productId: ${productId} | quantity: ${quantity} | referenceId: ${referenceId}`);
    const result = await service.reduceStock(productId, parseInt(quantity), referenceId);
    console.log(`[DEBUG][InventoryController] reduceStock result | currentStock: ${result.currentStock} | reservedStock: ${result.reservedStock} | availableStock: ${result.availableStock} | soldQuantity: ${result.soldQuantity}`);
    success(res, {
      productId: result.productId,
      previousStock: result.previousStock,
      currentStock: result.currentStock,
      availableStock: result.availableStock,
    }, 200);
  } catch (err) {
    next(err);
  }
};

const getLowStockProducts = async (req, res, next) => {
  try {
    const items = await service.getLowStockProducts();
    success(res, items);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInventory,
  getAllInventory,
  getInventoryByProductId,
  updateInventory,
  deleteInventory,
  increaseStock,
  decreaseStock,
  reserveStock,
  releaseStock,
  checkStockAvailability,
  getLowStockProducts,
  reduceStock,
};
