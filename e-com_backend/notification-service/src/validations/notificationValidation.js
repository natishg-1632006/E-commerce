const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

const sendRules = [
  body('eventType').optional().trim().notEmpty().withMessage('eventType is required'),
  body('paymentId').optional().trim().notEmpty().withMessage('paymentId is required'),
  body('orderId').optional().trim().notEmpty().withMessage('orderId is required'),
  body('userId').optional().trim().notEmpty().withMessage('userId is required'),
  body('paymentStatus').optional().trim().notEmpty().withMessage('paymentStatus is required'),
  body('paymentMethod').optional().trim().notEmpty().withMessage('paymentMethod is required'),
  body('amount').optional().notEmpty().withMessage('amount is required'),
  body('items').optional().isArray().withMessage('items must be an array'),
  body('timestamp').optional().trim().notEmpty().withMessage('timestamp is required'),
  handleValidation,
];

module.exports = { sendRules };
