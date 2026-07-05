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

/**
 * Reserve stock for a single product during order creation.
 * Calls POST /api/inventory/reserve — internal, service-to-service only.
 */
const reserveStock = async (productId, quantity, referenceId) => {
  const { data } = await axios.post(`${INVENTORY_URL}/api/inventory/reserve`, {
    productId,
    quantity,
    referenceId,
  });
  return data?.data || null;
};

/**
 * Release reserved stock — called on reservation rollback if a later item fails.
 * Calls POST /api/inventory/release — internal, service-to-service only.
 */
const releaseStock = async (productId, quantity, referenceId) => {
  try {
    const { data } = await axios.post(`${INVENTORY_URL}/api/inventory/release`, {
      productId,
      quantity,
      referenceId,
    });
    return data?.data || null;
  } catch (err) {
    console.warn(`[Inventory Release Failed] Product: ${productId} | Error: ${err.message}`);
    return null;
  }
};

module.exports = { checkStock, reserveStock, releaseStock };
