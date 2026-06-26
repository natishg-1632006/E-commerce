const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, errors: errors.array() });
  next();
};

const createPaymentRules = [
  body('orderId').trim().notEmpty().withMessage('orderId is required'),
  body('userId').trim().notEmpty().withMessage('userId is required'),
  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('paymentMethod is required')
    .isIn(['COD', 'Card', 'UPI', 'NetBanking'])
    .withMessage('paymentMethod must be COD, Card, UPI or NetBanking'),
  handleValidation,
];

const updateStatusRules = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('status is required')
    .isIn(['Paid', 'Failed', 'Refunded'])
    .withMessage('status must be Paid, Failed or Refunded'),
  handleValidation,
];

module.exports = { createPaymentRules, updateStatusRules };
