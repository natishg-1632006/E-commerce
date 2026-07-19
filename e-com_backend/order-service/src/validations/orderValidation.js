const { body, validationResult } = require('express-validator');

const { ORDER_STATUS } = require('../constants/orderConstants');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Backend validation failed:', errors.array());
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

const createOrderRules = [
  body('email').trim().notEmpty().withMessage('email is required').isEmail().withMessage('email must be a valid email address'),
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
  body("couponCode")
    .optional()
    .isString()
    .trim(),
  handleValidation,

];

const updateStatusRules = [
  body('orderStatus')
    .trim()
    .notEmpty()
    .withMessage('orderStatus is required')
    .isIn(Object.values(ORDER_STATUS))
    .withMessage(`orderStatus must be one of: ${Object.values(ORDER_STATUS).join(', ')}`),
  handleValidation,
];

module.exports = { createOrderRules, updateStatusRules };
