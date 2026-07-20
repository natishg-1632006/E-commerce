const { createClient } = require('./apiClient');

const client = createClient(process.env.CATEGORY_SERVICE_URL);

/**
 * Fetch all categories from Category Service
 * @param {string} token - Cognito access token
 * @returns {Promise<Array>} List of categories
 */
const getAllCategories = async (token) => {
  // In development, CATEGORY_SERVICE_URL might be http://localhost:5006
  // Check if categories are fetched directly from the base path or sub-route
  const path = process.env.CATEGORY_SERVICE_URL.includes('/api/v1/categories') 
    ? '/' 
    : '/api/v1/categories';
  
  const response = await client.get(path, {
    headers: { Authorization: token },
  });
  return response.data.data || [];
};

/**
 * Check connectivity health to Category Service
 * @returns {Promise<Object>} Status info
 */
const checkHealth = async () => {
  const startTime = Date.now();
  try {
    // If base URL has internal/etc paths, we can check health at the domain root
    const rootUrl = process.env.CATEGORY_SERVICE_URL.split('/api/v1')[0];
    const tempClient = createClient(rootUrl);
    await tempClient.get('/api');
    return { status: 'Healthy', responseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { status: 'Unhealthy', error: error.message, responseTimeMs: Date.now() - startTime };
  }
};

module.exports = {
  getAllCategories,
  checkHealth,
};
