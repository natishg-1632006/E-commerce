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
const serviceAuthMiddleware = require('../middleware/serviceAuthMiddleware');

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

router.post(
  "/batch-check",
  serviceAuthMiddleware,
  ctrl.checkStockAvailabilityBatch
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
  "/increase",
  serviceAuthMiddleware,
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

router.post(
  "/restore",
  serviceAuthMiddleware,
  ctrl.restoreStock
);

// =======================================================
// Internal APIs (Order Service / Payment Service)
// =======================================================

// DO NOT protect these with Cognito.
// These are called by backend services.

router.post(
  '/reserve',
  serviceAuthMiddleware,
  reserveRules,
  ctrl.reserveStock
);

router.post(
  '/release',
  serviceAuthMiddleware,
  reserveRules,
  ctrl.releaseStock
);

router.patch(
  '/reduce-stock',
  serviceAuthMiddleware,
  reduceStockRules,
  ctrl.reduceStock
);

module.exports = router;