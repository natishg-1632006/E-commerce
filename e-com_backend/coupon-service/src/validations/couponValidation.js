const { body, param } = require("express-validator");

// Create Coupon Validation
const createCouponValidation = [
  body("couponCode")
    .trim()
    .notEmpty()
    .withMessage("Coupon code is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Coupon code must be between 3 and 30 characters"),

  body("couponName")
    .trim()
    .notEmpty()
    .withMessage("Coupon name is required"),

  body("description")
    .optional()
    .trim(),

  body("discountType")
    .notEmpty()
    .withMessage("Discount type is required")
    .isIn(["FIXED", "PERCENTAGE"])
    .withMessage("Discount type must be FIXED or PERCENTAGE"),

  body("discountValue")
    .isFloat({ gt: 0 })
    .withMessage("Discount value must be greater than 0"),

  body("minimumOrderAmount")
    .isFloat({ min: 0 })
    .withMessage("Minimum order amount must be 0 or greater"),

  body("expiryDate")
    .notEmpty()
    .withMessage("Expiry date is required")
    .isISO8601()
    .withMessage("Expiry date must be a valid date"),

  body("scope")
    .optional()
    .isIn(["ALL", "PRODUCT", "CATEGORY"])
    .withMessage("Scope must be ALL, PRODUCT or CATEGORY"),

  body("applicableProducts")
    .optional()
    .isArray()
    .withMessage("Applicable products must be an array"),

  body("applicableCategories")
    .optional()
    .isArray()
    .withMessage("Applicable categories must be an array"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false")
];

// Update Coupon Validation
const updateCouponValidation = [
  param("couponCode")
    .trim()
    .notEmpty()
    .withMessage("Coupon code is required"),

  body("couponName")
    .optional()
    .trim(),

  body("description")
    .optional()
    .trim(),

  body("discountType")
    .optional()
    .isIn(["FIXED", "PERCENTAGE"])
    .withMessage("Discount type must be FIXED or PERCENTAGE"),

  body("discountValue")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Discount value must be greater than 0"),

  body("minimumOrderAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum order amount must be 0 or greater"),

  body("expiryDate")
    .optional()
    .isISO8601()
    .withMessage("Expiry date must be a valid date"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false")
];

// Coupon Code Validation
const couponCodeValidation = [
  param("couponCode")
    .trim()
    .notEmpty()
    .withMessage("Coupon code is required")
];

// Validate Coupon API
const validateCouponValidation = [
  body("couponCode")
    .trim()
    .notEmpty()
    .withMessage("Coupon code is required"),

  body("cartTotal")
    .isFloat({ gt: 0 })
    .withMessage("Cart total must be greater than 0"),

  body("items")
    .optional()
    .isArray()
    .withMessage("Items must be an array"),
];

module.exports = {
  createCouponValidation,
  updateCouponValidation,
  couponCodeValidation,
  validateCouponValidation
};