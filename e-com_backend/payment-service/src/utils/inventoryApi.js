const axios = require('axios');

const INVENTORY_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:5005';

/**
 * Reduce stock after successful payment.
 * Calls PATCH /api/inventory/reduce-stock for each order item.
 * Business Rule 6 — stock is deducted only after payment is confirmed.
 */
const reduceStock = async (productId, quantity, referenceId) => {
  console.log(`[DEBUG][InventoryApi] PATCH reduce-stock | productId: ${productId} | quantity: ${quantity} | referenceId: ${referenceId} | url: ${INVENTORY_URL}/api/inventory/reduce-stock`);
  const { data } = await axios.patch(`${INVENTORY_URL}/api/inventory/reduce-stock`, {
    productId,
    quantity,
    referenceId,
  });
  console.log(`[DEBUG][InventoryApi] reduce-stock response | productId: ${productId} | response: ${JSON.stringify(data)}`);
  return data?.data || null;
};

/**
 * Release reserved stock when payment fails or is refunded.
 * Calls POST /api/inventory/release for each order item.
 * Business Rule 5 — release reserved stock if order is cancelled.
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
    // Log but don't throw — release is best-effort on failure/refund
    console.warn(`[Inventory Release Failed] Product: ${productId} | Error: ${err.message}`);
    return null;
  }
};

module.exports = { reduceStock, releaseStock };
