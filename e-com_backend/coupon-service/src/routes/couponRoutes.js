const router = require("express").Router();

const couponController = require("../controllers/couponController");

const {
  createCouponValidation,
  updateCouponValidation,
  couponCodeValidation,
  validateCouponValidation,
} = require("../validations/couponValidation");

const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

/*
|--------------------------------------------------------------------------
| Coupon Routes
|--------------------------------------------------------------------------
*/

// Health Check Endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: process.env.SERVICE_NAME,
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

// Create Coupon
router.post(
  "/",
  authMiddleware,
  authorize("Admin"),
  createCouponValidation,
  couponController.createCoupon
);

// Get All Coupons
router.get(
  "/",
  authMiddleware,
  authorize("Admin", "Customer"),
  couponController.getAllCoupons
);

// Internal Route (Used by Order Service)
router.post(
  "/validate",
  validateCouponValidation,
  couponController.validateCoupon
);

// Get Coupon By Code
router.get(
  "/:couponCode",
  authMiddleware,
  authorize("Admin", "Customer"),
  couponCodeValidation,
  couponController.getCouponByCode
);

// Update Coupon
router.put(
  "/:couponCode",
  authMiddleware,
  authorize("Admin"),
  updateCouponValidation,
  couponController.updateCoupon
);

// Delete Coupon
router.delete(
  "/:couponCode",
  authMiddleware,
  authorize("Admin"),
  couponCodeValidation,
  couponController.deleteCoupon
);

module.exports = router;