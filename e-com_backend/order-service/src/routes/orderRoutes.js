const router = require('express').Router();
const controller = require('../controllers/orderController');
const { createOrderRules, updateStatusRules } = require('../validations/orderValidation');

const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Customer creates an order
router.post(
  '/',
  authMiddleware,
  authorize('Customer'),
  createOrderRules,
  controller.createOrder
);

// Internal API (Scheduler/EventBridge/Lambda)
// No authentication for now
router.post(
  '/expire-pending',
  controller.expirePending
);

// Admin - Get all orders
router.get(
  '/',
  authMiddleware,
  authorize('Admin'),
  controller.getAllOrders
);

// Customer - Get own orders
// Admin - Can also access if needed
router.get(
  '/user/:userId',
  authMiddleware,
  authorize('Customer', 'Admin'),
  controller.getOrdersByUser
);

// Customer/Admin - Get single order
router.get(
  '/:id',
  authMiddleware,
  authorize('Customer', 'Admin'),
  controller.getOrderById
);

// Admin only - Update order status
router.put(
  '/:id/status',
  authMiddleware,
  authorize('Admin'),
  updateStatusRules,
  controller.updateOrderStatus
);

// Customer - Cancel own order
router.put(
  '/:id/cancel',
  authMiddleware,
  authorize('Customer'),
  controller.cancelOrder
);

module.exports = router;