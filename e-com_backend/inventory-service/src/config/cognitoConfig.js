'use strict';

/**
 * Cognito Configuration Module
 * 
 * Loads and validates Cognito-related environment variables.
 * All values are read from environment - no hardcoding.
 * 
 * Required Environment Variables:
 * - AWS_REGION: AWS region where Cognito User Pool is deployed
 * - COGNITO_USER_POOL_ID: Cognito User Pool ID
 * - COGNITO_CLIENT_ID: Cognito App Client ID
 * 
 * @throws {Error} If any required environment variable is missing
 */

const cognitoConfig = {
  region: process.env.AWS_REGION,
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
};

/**
 * Validate that all required Cognito configuration values are set
 * @throws {Error} If any required config value is missing
 */
const validateCognitoConfig = () => {
  const missingVars = [];

  if (!cognitoConfig.region) {
    missingVars.push('AWS_REGION');
  }

  if (!cognitoConfig.userPoolId) {
    missingVars.push('COGNITO_USER_POOL_ID');
  }

  if (!cognitoConfig.clientId) {
    missingVars.push('COGNITO_CLIENT_ID');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Cognito environment variables: ${missingVars.join(', ')}`
    );
  }
};

/**
 * Get validated Cognito configuration
 * Call this once at application startup
 * @returns {Object} Validated Cognito configuration
 */
const getCognitoConfig = () => {
  validateCognitoConfig();
  return cognitoConfig;
};

module.exports = {
  cognitoConfig,
  validateCognitoConfig,
  getCognitoConfig,
};
