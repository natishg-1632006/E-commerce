const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

const createRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('specifications').optional().isObject().withMessage('Specifications must be an object'),
  body('stock').not().exists().withMessage('stock is not allowed — use Inventory Service'),
  handleValidation,
];

const updateRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('brand').optional().trim().notEmpty().withMessage('Brand cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('specifications').optional().isObject().withMessage('Specifications must be an object'),
  body('stock').not().exists().withMessage('stock is not allowed — use Inventory Service'),
  body('currentStock').not().exists().withMessage('currentStock is not allowed — use Inventory Service'),
  body('availableStock').not().exists().withMessage('availableStock is not allowed — use Inventory Service'),
  body('reservedStock').not().exists().withMessage('reservedStock is not allowed — use Inventory Service'),
  body('quantity').not().exists().withMessage('quantity is not allowed — use Inventory Service'),
  handleValidation,
];

module.exports = { createRules, updateRules };
