const axios = require('axios');

const INVENTORY_URL =
  process.env.INVENTORY_SERVICE_URL || 'http://localhost:5005';

/**
 * Check available stock
 * Customer -> Order Service -> Inventory Service
 * Uses Cognito JWT
 */
const checkStock = async (productId, quantity, token) => {
  try {
    const { data } = await axios.get(
      `${INVENTORY_URL}/api/v1/inventory/check/${productId}?quantity=${quantity}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return data?.data || null;
  } catch (err) {
    if (err.response?.status === 404) return null;

    throw new Error(
      `Inventory Service unreachable: ${
        err.response?.data?.message || err.message
      }`
    );
  }
};

const checkStockBatch = async (items) => {
  try {

    const { data } = await axios.post(
      `${INVENTORY_URL}/api/v1/inventory/batch-check`,
      {
        items,
      },
      {
        headers: {
          "x-service-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    return data.data || [];

  } catch (err) {

    throw new Error(
      `Inventory Batch API Error: ${
        err.response?.data?.message || err.message
      }`
    );

  }
};

/**
 * Reserve Stock
 * Internal API
 * Uses x-service-key
 */
const reserveStock = async (productId, quantity, referenceId) => {
  const { data } = await axios.post(
    `${INVENTORY_URL}/api/v1/inventory/reserve`,
    {
      productId,
      quantity,
      referenceId,
    },
    {
      headers: {
        'x-service-key': process.env.INTERNAL_SERVICE_KEY,
      },
    }
  );

  return data?.data || null;
};

const reserveStockBatch = async (orderId, items) => {

  const { data } = await axios.post(
    `${INVENTORY_URL}/api/v1/inventory/reserve-batch`,
    {
      orderId,
      items,
    },
    {
      headers: {
        "x-service-key": process.env.INTERNAL_SERVICE_KEY,
      },
    }
  );

  return data.data;
};

/**
 * Release Stock
 * Internal API
 * Uses x-service-key
 */
const releaseStock = async (productId, quantity, referenceId) => {
  try {
    const { data } = await axios.post(
      `${INVENTORY_URL}/api/v1/inventory/release`,
      {
        productId,
        quantity,
        referenceId,
      },
      {
        headers: {
          'x-service-key': process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    return data?.data || null;
  } catch (err) {
    console.warn(
      `[Inventory Release Failed] Product: ${productId} | Error: ${
        err.response?.data?.message || err.message
      }`
    );

    return null;
  }
};

const increaseStock = async (productId, quantity, referenceId) => {
  const { data } = await axios.post(
    `${INVENTORY_URL}/api/v1/inventory/increase`,
    {
      productId,
      quantity,
      reason: `ORDER_CANCELLED:${referenceId}`,
    },
    {
      headers: {
        "x-service-key": process.env.INTERNAL_SERVICE_KEY,
      },
    }
  );

  return data.data;
};

const restoreStock = async (productId, quantity, orderId) => {
  const { data } = await axios.post(
    `${INVENTORY_URL}/api/v1/inventory/restore`,
    {
      productId,
      quantity,
      orderId,
    },
    {
      headers: {
        "x-service-key": process.env.INTERNAL_SERVICE_KEY,
      },
    }
  );

  return data.data;
};

module.exports = {
  checkStock,
  checkStockBatch,
  reserveStock,
  reserveStockBatch,
  releaseStock,
  increaseStock,
  restoreStock
};