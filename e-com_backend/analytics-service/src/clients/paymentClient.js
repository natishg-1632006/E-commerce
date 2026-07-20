const { createClient } = require('./apiClient');

const client = createClient(process.env.PAYMENT_SERVICE_URL);

/**
 * Fetch all payments from Payment Service
 * @param {string} token - Cognito access token
 * @returns {Promise<Array>} List of payments
 */
const getAllPayments = async (token) => {
  const path = process.env.PAYMENT_SERVICE_URL?.includes('/api/v1/payment')
    ? '/'
    : '/api/v1/payment';

  const response = await client.get(path, {
    headers: { Authorization: token },
  });
  return response.data.data || [];
};

/**
 * Check connectivity health to Payment Service
 * @returns {Promise<Object>} Status info
 */
const checkHealth = async () => {
  const startTime = Date.now();
  try {
    const rootUrl = process.env.PAYMENT_SERVICE_URL?.split('/api/v1')[0] || process.env.PAYMENT_SERVICE_URL;
    const tempClient = createClient(rootUrl);
    await tempClient.get('/api');
    return { status: 'Healthy', responseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { status: 'Unhealthy', error: error.message, responseTimeMs: Date.now() - startTime };
  }
};

module.exports = {
  getAllPayments,
  checkHealth,
};
