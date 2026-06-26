const axios = require('axios');

const INVENTORY_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:5005';

/**
 * Check available stock for a single product via Inventory Service.
 * Used during order creation to validate stock before confirming.
 */
const checkStock = async (productId, quantity) => {
  try {
    const { data } = await axios.get(
      `${INVENTORY_URL}/api/inventory/check/${productId}?quantity=${quantity}`
    );
    return data?.data || null;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw new Error(`Inventory Service unreachable: ${err.message}`);
  }
};

module.exports = { checkStock };
