const router = require('express').Router();
const controller = require('../controllers/orderController');
const { createOrderRules, updateStatusRules } = require('../validations/orderValidation');

router.post('/', createOrderRules, controller.createOrder);
router.get('/', controller.getAllOrders);
router.get('/user/:userId', controller.getOrdersByUser);
router.get('/:id', controller.getOrderById);
router.put('/:id/status', updateStatusRules, controller.updateOrderStatus);
router.put('/:id/cancel', controller.cancelOrder);

module.exports = router;
