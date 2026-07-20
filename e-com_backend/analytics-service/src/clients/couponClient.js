const { createClient } = require('./apiClient');

const client = createClient(process.env.COUPON_SERVICE_URL);

/**
 * Fetch all coupons from Coupon Service
 * @param {string} token - Cognito access token
 * @returns {Promise<Array>} List of coupons
 */
const getAllCoupons = async (token) => {
  const path = process.env.COUPON_SERVICE_URL.includes('/api/v1/coupons') 
    ? '/' 
    : '/api/v1/coupons';

  const response = await client.get(path, {
    headers: { Authorization: token },
  });
  return response.data.data || [];
};

/**
 * Check connectivity health to Coupon Service
 * Supports local, containerized, and API Gateway path proxy environments.
 * @returns {Promise<Object>} Status info
 */
const checkHealth = async () => {
  const startTime = Date.now();

  // 1. Try hitting /health via client path
  try {
    await client.get('/health');
    return { status: 'Healthy', responseTimeMs: Date.now() - startTime };
  } catch (err1) {
    // 2. Try hitting /api via client path
    try {
      await client.get('/api');
      return { status: 'Healthy', responseTimeMs: Date.now() - startTime };
    } catch (err2) {
      // 3. Try hitting root domain /api or /health
      try {
        const rootUrl = process.env.COUPON_SERVICE_URL.split('/api/v1')[0];
        const tempClient = createClient(rootUrl);
        await tempClient.get('/api');
        return { status: 'Healthy', responseTimeMs: Date.now() - startTime };
      } catch (err3) {
        return { 
          status: 'Unhealthy', 
          error: err1.message || err2.message || err3.message, 
          responseTimeMs: Date.now() - startTime 
        };
      }
    }
  }
};

module.exports = {
  getAllCoupons,
  checkHealth,
};
