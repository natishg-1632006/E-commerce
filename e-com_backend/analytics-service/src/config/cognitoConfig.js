'use strict';

/**
 * Cognito Configuration Module
 * 
 * Loads and validates Cognito-related environment variables.
 * All values are read from environment - no hardcoding.
 */

const cognitoConfig = {
  region: process.env.AWS_REGION,
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
};

/**
 * Validate that all required Cognito configuration values are set
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
