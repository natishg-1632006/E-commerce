const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

const addToCartRules = [
  body('productId').trim().notEmpty().withMessage('productId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1'),
  handleValidation,
];

const updateCartRules = [
  body('productId').trim().notEmpty().withMessage('productId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1'),
  handleValidation,
];

module.exports = { addToCartRules, updateCartRules };
