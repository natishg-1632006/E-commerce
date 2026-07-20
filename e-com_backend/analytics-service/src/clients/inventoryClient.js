const { createClient } = require('./apiClient');

const client = createClient(process.env.INVENTORY_SERVICE_URL);

/**
 * Fetch all inventory records from Inventory Service
 * @param {string} token - Cognito access token
 * @returns {Promise<Array>} List of inventory records
 */
const getAllInventory = async (token) => {
  const path = process.env.INVENTORY_SERVICE_URL?.includes('/api/v1/inventory')
    ? '/'
    : '/api/v1/inventory';

  const response = await client.get(path, {
    headers: { Authorization: token },
  });
  return response.data.data || [];
};

/**
 * Fetch low stock products from Inventory Service
 * @param {string} token - Cognito access token
 * @returns {Promise<Array>} List of low stock products
 */
const getLowStockProducts = async (token) => {
  const path = process.env.INVENTORY_SERVICE_URL?.includes('/api/v1/inventory')
    ? '/low-stock'
    : '/api/v1/inventory/low-stock';

  const response = await client.get(path, {
    headers: { Authorization: token },
  });
  return response.data.data || [];
};

/**
 * Check connectivity health to Inventory Service
 * @returns {Promise<Object>} Status info
 */
const checkHealth = async () => {
  const startTime = Date.now();
  try {
    const rootUrl = process.env.INVENTORY_SERVICE_URL?.split('/api/v1')[0] || process.env.INVENTORY_SERVICE_URL;
    const tempClient = createClient(rootUrl);
    await tempClient.get('/api');
    return { status: 'Healthy', responseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { status: 'Unhealthy', error: error.message, responseTimeMs: Date.now() - startTime };
  }
};

module.exports = {
  getAllInventory,
  getLowStockProducts,
  checkHealth,
};
