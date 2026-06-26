const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, errors: errors.array() });
  next();
};

const createOrderRules = [
  body('userId').trim().notEmpty().withMessage('userId is required'),
  body('shippingAddress.fullName').trim().notEmpty().withMessage('fullName is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('phone is required'),
  body('shippingAddress.address').trim().notEmpty().withMessage('address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('city is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('state is required'),
  body('shippingAddress.pincode').trim().notEmpty().withMessage('pincode is required'),
  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('paymentMethod is required')
    .isIn(['COD', 'Card', 'UPI', 'NetBanking'])
    .withMessage('paymentMethod must be COD, Card, UPI or NetBanking'),
  handleValidation,
];

const updateStatusRules = [
  body('orderStatus')
    .trim()
    .notEmpty()
    .withMessage('orderStatus is required')
    .isIn(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'])
    .withMessage('Invalid orderStatus value'),
  handleValidation,
];

module.exports = { createOrderRules, updateStatusRules };
