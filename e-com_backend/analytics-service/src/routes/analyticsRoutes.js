const router = require('express').Router();
const controller = require('../controllers/analyticsController');

const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Public Health Check Endpoint
router.get('/health', controller.getHealth);

// Admin-Only Analytics Endpoints
router.get('/dashboard', authMiddleware, authorize('Admin'), controller.getDashboard);
router.get('/revenue', authMiddleware, authorize('Admin'), controller.getRevenue);
router.get('/orders', authMiddleware, authorize('Admin'), controller.getOrders);
router.get('/products', authMiddleware, authorize('Admin'), controller.getProducts);
router.get('/categories', authMiddleware, authorize('Admin'), controller.getCategories);
router.get('/coupons', authMiddleware, authorize('Admin'), controller.getCoupons);
router.get('/inventory', authMiddleware, authorize('Admin'), controller.getInventory);
router.get('/payments', authMiddleware, authorize('Admin'), controller.getPayments);

module.exports = router;
