const router = require('express').Router();
const ctrl = require('../controllers/inventoryController');
const {
  createRules,
  updateRules,
  stockAdjustRules,
  reserveRules,
  reduceStockRules,
} = require('../validations/inventoryValidation');

const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// =======================================================
// Customer & Admin
// =======================================================

// Check product stock before adding to cart / placing order
router.get(
  '/check/:productId',
  authMiddleware,
  authorize('Customer', 'Admin'),
  ctrl.checkStockAvailability
);

// =======================================================
// Admin Only
// =======================================================

// Dashboard
router.get(
  '/low-stock',
  authMiddleware,
  authorize('Admin'),
  ctrl.getLowStockProducts
);

// Inventory CRUD
router.post(
  '/',
  authMiddleware,
  authorize('Admin'),
  createRules,
  ctrl.createInventory
);

router.get(
  '/',
  authMiddleware,
  authorize('Admin'),
  ctrl.getAllInventory
);

router.get(
  '/:productId',
  authMiddleware,
  authorize('Admin'),
  ctrl.getInventoryByProductId
);

router.put(
  '/:productId',
  authMiddleware,
  authorize('Admin'),
  updateRules,
  ctrl.updateInventory
);

router.delete(
  '/:productId',
  authMiddleware,
  authorize('Admin'),
  ctrl.deleteInventory
);

// Stock Management
router.post(
  '/increase',
  authMiddleware,
  authorize('Admin'),
  stockAdjustRules,
  ctrl.increaseStock
);

router.post(
  '/decrease',
  authMiddleware,
  authorize('Admin'),
  stockAdjustRules,
  ctrl.decreaseStock
);

// =======================================================
// Internal APIs (Order Service / Payment Service)
// =======================================================

// DO NOT protect these with Cognito.
// These are called by backend services.

router.post(
  '/reserve',
  reserveRules,
  ctrl.reserveStock
);

router.post(
  '/release',
  reserveRules,
  ctrl.releaseStock
);

router.patch(
  '/reduce-stock',
  reduceStockRules,
  ctrl.reduceStock
);

module.exports = router;