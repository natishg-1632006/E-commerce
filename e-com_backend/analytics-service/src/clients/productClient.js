const { createClient } = require('./apiClient');

const client = createClient(process.env.PRODUCT_SERVICE_URL);

/**
 * Fetch all products from Product Service
 * @param {string} token - Cognito access token
 * @returns {Promise<Array>} List of products
 */
const getAllProducts = async (token) => {
  const path = process.env.PRODUCT_SERVICE_URL?.includes('/api/v1/products')
    ? '/'
    : '/api/v1/products';

  const response = await client.get(path, {
    headers: { Authorization: token },
    params: { limit: 1000 },
  });
  return response.data.data?.products || response.data.data || [];
};

/**
 * Check connectivity health to Product Service
 * @returns {Promise<Object>} Status info
 */
const checkHealth = async () => {
  const startTime = Date.now();
  try {
    const rootUrl = process.env.PRODUCT_SERVICE_URL?.split('/api/v1')[0] || process.env.PRODUCT_SERVICE_URL;
    const tempClient = createClient(rootUrl);
    await tempClient.get('/api');
    return { status: 'Healthy', responseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { status: 'Unhealthy', error: error.message, responseTimeMs: Date.now() - startTime };
  }
};

module.exports = {
  getAllProducts,
  checkHealth,
};
