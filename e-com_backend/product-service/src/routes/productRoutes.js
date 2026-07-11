const router = require('express').Router();

const controller = require('../controllers/productController');
const { createRules, updateRules } = require('../validations/productValidation');

const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Public Routes (No Login Required)
router.get(
  '/',
  authMiddleware,
  authorize('Admin', 'Customer'),
  controller.getProducts
);

router.get(
  '/:id',
  authMiddleware,
  authorize('Admin', 'Customer'),
  controller.getProduct
);

router.get(
  '/search',
  authMiddleware,
  authorize('Admin', 'Customer'),
  controller.getProducts
);

// Admin Only Routes
router.post(
  '/upload-url',
  authMiddleware,
  authorize('Admin'),
  controller.generateUploadUrl
);

router.post(
  '/',
  authMiddleware,
  authorize('Admin'),
  createRules,
  controller.createProduct
);

router.put(
  '/:id',
  authMiddleware,
  authorize('Admin'),
  updateRules,
  controller.updateProduct
);

router.delete(
  '/:id',
  authMiddleware,
  authorize('Admin'),
  controller.deleteProduct
);

// router.delete(
//   '/:id/image',
//   authMiddleware,
//   authorize('Admin'),
//   controller.deleteProductImage
// );

router.post(
  '/upload-urls',
  authMiddleware,
  authorize('Admin'),
  controller.generateUploadUrls
);

module.exports = router;