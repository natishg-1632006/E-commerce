const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

const profileUpdateRules = [
  body('fullName').optional({ nullable: true }).trim().notEmpty().withMessage('fullName cannot be empty').isString().withMessage('fullName must be a string'),
  body('phone').optional({ nullable: true }).trim().notEmpty().withMessage('phone cannot be empty').isString().withMessage('phone must be a string'),
  body('address').optional({ nullable: true }).isObject().withMessage('address must be an object'),
  body('address.fullName').optional({ nullable: true }).trim().notEmpty().withMessage('address.fullName cannot be empty').isString().withMessage('address.fullName must be a string'),
  body('address.phone').optional({ nullable: true }).trim().notEmpty().withMessage('address.phone cannot be empty').isString().withMessage('address.phone must be a string'),
  body('address.address').optional({ nullable: true }).trim().notEmpty().withMessage('address.address cannot be empty').isString().withMessage('address.address must be a string'),
  body('address.city').optional({ nullable: true }).trim().notEmpty().withMessage('address.city cannot be empty').isString().withMessage('address.city must be a string'),
  body('address.state').optional({ nullable: true }).trim().notEmpty().withMessage('address.state cannot be empty').isString().withMessage('address.state must be a string'),
  body('address.pincode').optional({ nullable: true }).trim().notEmpty().withMessage('address.pincode cannot be empty').isString().withMessage('address.pincode must be a string'),
  body('status').optional({ nullable: true }).trim().isIn(['Active', 'Inactive', 'Blocked', 'Suspended']).withMessage('status must be Active, Inactive, Blocked, or Suspended'),
  handleValidation,
];

module.exports = { profileUpdateRules };
