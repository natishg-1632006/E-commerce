const axios = require('axios');

const INVENTORY_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:5005';

/**
 * Reduce stock after successful payment.
 * Calls PATCH /api/inventory/reduce-stock for each order item.
 *
 * Business Rule — stock is deducted only after payment is confirmed.
 *
 * SNS/SQS migration note:
 * When migrating to event-driven architecture, this direct HTTP call will be
 * replaced by publishing a PAYMENT_SUCCESS event to SNS. The Inventory Service
 * will consume the event from its SQS queue and call reduceStock itself.
 */
const reduceStock = async (productId, quantity, referenceId) => {
  const { data } = await axios.patch(`${INVENTORY_URL}/api/inventory/reduce-stock`, {
    productId,
    quantity,
    referenceId,
  });
  return data?.data || null;
};

/**
 * Release reserved stock when payment fails or is refunded.
 * Calls POST /api/inventory/release for each order item.
 *
 * Business Rule — release reserved stock if payment fails or order is cancelled.
 * This call is best-effort — failures are logged but do not block the payment
 * status update from completing.
 *
 * SNS/SQS migration note:
 * When migrating to event-driven architecture, this will be replaced by
 * publishing a PAYMENT_FAILED event to SNS.
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
    console.warn(`[Payment] Inventory release failed | productId: ${productId} | quantity: ${quantity} | referenceId: ${referenceId} | error: ${err.message}`);
    return null;
  }
};

module.exports = { reduceStock, releaseStock };
