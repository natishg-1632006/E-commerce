'use strict';

/**
 * Cognito JWT Verifier Module
 * 
 * Handles verification of AWS Cognito Access Tokens using aws-jwt-verify.
 * This module is Express-independent and can be used in any JavaScript context.
 * 
 * Responsibilities:
 * - Verify JWT signature against Cognito public keys
 * - Validate User Pool ID
 * - Validate Client ID (audience)
 * - Validate token expiration
 * - Return decoded payload with user claims
 * - Throw specific errors for different failure scenarios
 * 
 * @requires aws-jwt-verify
 */

let CognitoJwtVerifier;

/**
 * Initialize the JWT verifier lazily to handle import errors gracefully
 */
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

/**
 * Create and cache Cognito JWT Verifier instance
 * Singleton pattern to avoid creating multiple verifier instances
 * 
 * @param {Object} config - Cognito configuration
 * @param {string} config.region - AWS region
 * @param {string} config.userPoolId - Cognito User Pool ID
 * @param {string} config.clientId - Cognito Client ID
 * @returns {Object} Configured JWT Verifier instance
 */
const createVerifier = (config) => {
  const CognitoVerifierClass = initializeVerifier();

  return CognitoJwtVerifier.create({
    userPoolId: config.userPoolId,
    tokenUse: 'access',
    scope: undefined, // Accept any scope in access token
    clientId: config.clientId,
    region: config.region,
  });
};

/**
 * Cache for verifier instances (one per unique config)
 */
let verifierInstance = null;
let currentConfig = null;

/**
 * Get or create a JWT verifier instance
 * Caches the verifier to avoid recreating it on every request
 * 
 * @param {Object} config - Cognito configuration
 * @returns {Object} JWT Verifier instance
 */
const getVerifier = (config) => {
  // If config hasn't changed, return cached verifier
  if (
    verifierInstance &&
    currentConfig &&
    currentConfig.userPoolId === config.userPoolId &&
    currentConfig.clientId === config.clientId &&
    currentConfig.region === config.region
  ) {
    return verifierInstance;
  }

  // Create new verifier with new config
  currentConfig = config;
  verifierInstance = createVerifier(config);
  return verifierInstance;
};

/**
 * Verify a Cognito Access Token
 * 
 * @param {string} token - JWT Access Token from Authorization header
 * @param {Object} config - Cognito configuration
 * @returns {Promise<Object>} Decoded token payload containing user claims
 * 
 * @throws {Error} If token is invalid, expired, or verification fails
 * 
 * Decoded payload typically contains:
 * - sub: Unique user identifier (UUID)
 * - email: User email address
 * - email_verified: Boolean indicating email verification status
 * - username: Cognito username
 * - cognito:groups: Array of groups the user belongs to
 * - aud: Audience (Client ID)
 * - event_id: Event ID
 * - token_use: Should be 'access'
 * - auth_time: Token creation timestamp
 * - exp: Token expiration timestamp
 * - iat: Token issued at timestamp
 * - jti: JWT ID (unique token identifier)
 */
const verifyAccessToken = async (token, config) => {
  try {
    const verifier = getVerifier(config);
    const payload = await verifier.verify(token);
    return payload;
  } catch (error) {
    // Handle specific jwt-verify error types
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

    // Generic verification error
    const verificationError = new Error('Token verification failed');
    verificationError.code = 'VERIFICATION_FAILED';
    verificationError.statusCode = 401;
    verificationError.originalError = error;
    throw verificationError;
  }
};

/**
 * Extract token from Authorization header
 * Expected format: "Bearer <token>"
 * 
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null if invalid format
 */
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
