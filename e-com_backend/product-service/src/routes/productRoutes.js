const router = require('express').Router();
const controller = require('../controllers/productController');
const { createRules, updateRules } = require('../validations/productValidation');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/search', controller.getProducts);
router.get('/',authMiddleware,controller.getProducts);
router.get('/:id', controller.getProduct);
router.post('/', createRules, controller.createProduct);
router.put('/:id', updateRules, controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;