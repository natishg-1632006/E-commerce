const router = require('express').Router();
const controller = require('../controllers/cartController');
const { addToCartRules, updateCartRules } = require('../validations/cartValidation');

router.post('/add', addToCartRules, controller.addToCart);
router.put('/update', updateCartRules, controller.updateQuantity);
router.delete('/remove/:userId/:productId', controller.removeItem);
router.delete('/clear/:userId', controller.clearCart);
router.get('/:userId', controller.getCart);

module.exports = router;
