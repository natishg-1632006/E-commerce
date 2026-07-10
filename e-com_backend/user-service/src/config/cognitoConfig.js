'use strict';

const cognitoConfig = {
  region: process.env.AWS_REGION,
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
};

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
    throw new Error(`Missing required Cognito environment variables: ${missingVars.join(', ')}`);
  }
};

const getCognitoConfig = () => {
  validateCognitoConfig();
  return cognitoConfig;
};

module.exports = {
  cognitoConfig,
  validateCognitoConfig,
  getCognitoConfig,
};
