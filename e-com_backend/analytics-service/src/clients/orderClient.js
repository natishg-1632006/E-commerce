const { createClient } = require('./apiClient');

const client = createClient(process.env.ORDER_SERVICE_URL);

/**
 * Fetch all orders from Order Service
 * @param {string} token - Cognito access token
 * @param {Object} [params] - Query parameters
 * @returns {Promise<Object>} Orders list and statistics
 */
const getAllOrders = async (token, params = {}) => {
  const queryParams = { limit: 1000, ...params };
  const path = process.env.ORDER_SERVICE_URL?.includes('/api/v1/orders')
    ? '/'
    : '/api/v1/orders';

  const response = await client.get(path, {
    headers: { Authorization: token },
    params: queryParams,
  });
  return response.data.data;
};

/**
 * Check connectivity health to Order Service
 * @returns {Promise<Object>} Status info
 */
const checkHealth = async () => {
  const startTime = Date.now();
  try {
    const rootUrl = process.env.ORDER_SERVICE_URL?.split('/api/v1')[0] || process.env.ORDER_SERVICE_URL;
    const tempClient = createClient(rootUrl);
    await tempClient.get('/api');
    return { status: 'Healthy', responseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { status: 'Unhealthy', error: error.message, responseTimeMs: Date.now() - startTime };
  }
};

module.exports = {
  getAllOrders,
  checkHealth,
};
