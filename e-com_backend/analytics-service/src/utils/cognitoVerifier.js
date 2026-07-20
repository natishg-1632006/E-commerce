'use strict';

/**
 * Cognito JWT Verifier Module
 * 
 * Handles verification of AWS Cognito Access Tokens using aws-jwt-verify.
 */

let CognitoJwtVerifier;

const initializeVerifier = () => {
  if (!CognitoJwtVerifier) {
    try {
      CognitoJwtVerifier = require('aws-jwt-verify').CognitoJwtVerifier;
    } catch (error) {
      throw new Error(
        'aws-jwt-verify package not found. Install it with: npm install aws-jwt-verify'
      );
    }
  }
  return CognitoJwtVerifier;
};

const createVerifier = (config) => {
  const CognitoVerifierClass = initializeVerifier();

  return CognitoVerifierClass.create({
    userPoolId: config.userPoolId,
    tokenUse: 'access',
    scope: undefined,
    clientId: config.clientId,
    region: config.region,
  });
};

let verifierInstance = null;
let currentConfig = null;

const getVerifier = (config) => {
  if (
    verifierInstance &&
    currentConfig &&
    currentConfig.userPoolId === config.userPoolId &&
    currentConfig.clientId === config.clientId &&
    currentConfig.region === config.region
  ) {
    return verifierInstance;
  }

  currentConfig = config;
  verifierInstance = createVerifier(config);
  return verifierInstance;
};

const verifyAccessToken = async (token, config) => {
  try {
    const verifier = getVerifier(config);
    const payload = await verifier.verify(token);
    return payload;
  } catch (error) {
    if (error.message.includes('expired')) {
      const tokenExpiredError = new Error('Access token has expired');
      tokenExpiredError.code = 'TOKEN_EXPIRED';
      tokenExpiredError.statusCode = 401;
      throw tokenExpiredError;
    }

    if (error.message.includes('invalid') || error.message.includes('malformed')) {
      const invalidTokenError = new Error('Invalid access token');
      invalidTokenError.code = 'INVALID_TOKEN';
      invalidTokenError.statusCode = 401;
      throw invalidTokenError;
    }

    if (error.message.includes('not found') || error.message.includes('Failed to fetch')) {
      const verificationError = new Error('Token verification failed - invalid issuer or user pool');
      verificationError.code = 'VERIFICATION_FAILED';
      verificationError.statusCode = 401;
      throw verificationError;
    }

    const verificationError = new Error('Token verification failed');
    verificationError.code = 'VERIFICATION_FAILED';
    verificationError.statusCode = 401;
    verificationError.originalError = error;
    throw verificationError;
  }
};

const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
};

module.exports = {
  verifyAccessToken,
  extractTokenFromHeader,
  getVerifier,
  createVerifier,
};
