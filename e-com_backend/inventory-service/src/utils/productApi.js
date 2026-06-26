const axios = require('axios');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5001';

/**
 * Fetches a product from Product Service.
 * Returns the product object or null if not found.
 * Throws on network / unexpected errors.
 */
const getProduct = async (productId) => {
  try {
    const { data } = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
    return data?.data || null;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw new Error(`Product Service unreachable: ${err.message}`);
  }
};

module.exports = { getProduct };
