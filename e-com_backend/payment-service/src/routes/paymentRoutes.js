const router = require('express').Router();
const controller = require('../controllers/paymentController');
const {
  createPaymentRules,
  updateStatusRules,
} = require('../validations/paymentValidation');

const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Customer - Create Payment
router.post(
  '/create',
  authMiddleware,
  authorize('Customer'),
  createPaymentRules,
  controller.createPayment
);

// Customer & Admin - Get Payment by Order
router.get(
  '/order/:orderId',
  authMiddleware,
  authorize('Customer', 'Admin'),
  controller.getPaymentByOrder
);

// Customer & Admin - Get Payment by Payment ID
router.get(
  '/:id',
  authMiddleware,
  authorize('Customer', 'Admin'),
  controller.getPayment
);

// Admin - Update Payment Status
router.put(
  '/:id/status',
  authMiddleware,
  authorize('Admin'),
  updateStatusRules,
  controller.updatePaymentStatus
);

// Admin - Get All Payments
router.get(
  '/',
  authMiddleware,
  authorize('Admin'),
  controller.getAllPayments
);

module.exports = router;