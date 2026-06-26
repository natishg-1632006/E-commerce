const router = require('express').Router();
const controller = require('../controllers/paymentController');
const { createPaymentRules, updateStatusRules } = require('../validations/paymentValidation');

router.post('/create', createPaymentRules, controller.createPayment);
router.get('/order/:orderId', controller.getPaymentByOrder);
router.get('/:id', controller.getPayment);
router.put('/:id/status', updateStatusRules, controller.updatePaymentStatus);

module.exports = router;
