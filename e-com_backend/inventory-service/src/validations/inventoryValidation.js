const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

// POST /api/inventory
const createRules = [
  body('productId').trim().notEmpty().withMessage('productId is required'),
  body('currentStock').isInt({ min: 0 }).withMessage('currentStock must be a non-negative integer'),
  body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('lowStockThreshold must be a non-negative integer'),
  handleValidation,
];

// PUT /api/inventory/:productId
const updateRules = [
  body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('lowStockThreshold must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['In Stock', 'Low Stock', 'Out Of Stock'])
    .withMessage('status must be In Stock, Low Stock, or Out Of Stock'),
  handleValidation,
];

// POST /api/inventory/increase  &  /decrease
const stockAdjustRules = [
  body('productId').trim().notEmpty().withMessage('productId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('reason').trim().notEmpty().withMessage('reason is required'),
  handleValidation,
];

// POST /api/inventory/reserve  &  /release
const reserveRules = [
  body('productId').trim().notEmpty().withMessage('productId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('referenceId').trim().notEmpty().withMessage('referenceId is required'),
  handleValidation,
];

// PATCH /api/inventory/reduce-stock  — called by Payment Service after successful payment
const reduceStockRules = [
  body('productId').trim().notEmpty().withMessage('productId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('referenceId').optional().trim(),
  handleValidation,
];

module.exports = { createRules, updateRules, stockAdjustRules, reserveRules, reduceStockRules };
