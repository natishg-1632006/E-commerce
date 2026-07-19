const axios = require("axios");

const COUPON_SERVICE_URL = process.env.COUPON_SERVICE_URL;

/**
 * Validate coupon with Coupon Service
 * @param {string} couponCode
 * @param {number} cartTotal
 * @returns {Object}
 */
const validateCoupon = async (couponCode, cartTotal) => {
  try {

    console.log("===== REQUEST TO COUPON SERVICE =====");
    console.log({
      couponCode,
      cartTotal,
    });

    const response = await axios.post(
      `${COUPON_SERVICE_URL}/validate`,
      {
        couponCode,
        cartTotal,
      },
      {
        timeout: 5000,
      }
    );

    return response.data.data;

  } catch (error) {

    console.error("===== COUPON ERROR =====");
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);

    if (error.response) {
      throw new Error(
        error.response.data.message || "Coupon validation failed"
      );
    }

    throw new Error("Coupon Service unavailable");
  }
};

module.exports = {
  validateCoupon,
};