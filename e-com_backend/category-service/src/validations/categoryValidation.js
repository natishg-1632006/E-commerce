const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};

const createRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required'),

  body('description')
    .optional()
    .trim(),

  body('image')
    .optional()
    .isObject()
    .withMessage('Image must be an object'),

  body('featured')
    .optional()
    .isBoolean()
    .withMessage('featured must be true or false'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Invalid status'),

  handleValidation,
];

const updateRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty(),

  body('description')
    .optional()
    .trim(),

  body('image')
    .optional()
    .isObject(),

  body('featured')
    .optional()
    .isBoolean(),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE']),

  handleValidation,
];

module.exports = {
  createRules,
  updateRules,
};