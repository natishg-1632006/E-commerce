'use strict';

/**
 * Authentication Middleware for Cognito Access Tokens
 * 
 * Responsibilities:
 * 1. Extract Authorization header from request
 * 2. Extract Bearer token from header
 * 3. Verify token using cognitoVerifier
 * 4. Attach decoded user claims to req.user
 * 5. Return 401 Unauthorized if any step fails
 * 
 * Does NOT contain business logic - purely authentication concern.
 * Does NOT modify request data - only attaches user context.
 */

const { verifyAccessToken, extractTokenFromHeader } = require('../utils/cognitoVerifier');
const { getCognitoConfig } = require('../config/cognitoConfig');

/**
 * Express middleware for Cognito authentication
 * 
 * Usage in routes:
 *   router.get('/protected', authMiddleware, controller.handler);
 * 
 * Flow:
 * 1. Check Authorization header exists
 * 2. Extract token from "Bearer <token>" format
 * 3. Verify token signature and claims with AWS Cognito
 * 4. Attach decoded payload to req.user
 * 5. Call next() to continue to controller
 * 
 * If any step fails, returns 401 with error message (never exposes token data)
 * 
 * req.user after successful verification contains:
 * {
 *   sub: 'user-id-uuid',
 *   email: 'user@example.com',
 *   email_verified: true,
 *   username: 'username',
 *   'cognito:groups': ['group1', 'group2'],
 *   aud: 'client-id',
 *   event_id: 'event-uuid',
 *   token_use: 'access',
 *   auth_time: 1234567890,
 *   exp: 1234571490,
 *   iat: 1234567890,
 *   jti: 'token-id'
 * }
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is missing',
      });
    }

    // 2. Extract token from "Bearer <token>" format
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Authorization header format. Expected: Bearer <token>',
      });
    }

    // 3. Get Cognito configuration
    const cognitoConfig = getCognitoConfig();

    // 4. Verify token with AWS Cognito
    const decodedPayload = await verifyAccessToken(token, cognitoConfig);

    // 5. Attach decoded user claims to request object
    // Controllers can now access authenticated user information via req.user
    req.user = decodedPayload;

    // 6. Continue to next middleware/controller
    next();
  } catch (error) {
    // Error codes from cognitoVerifier or other errors
    const statusCode = error.statusCode || 401;
    const message = error.message || 'Unauthorized';

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

module.exports = authMiddleware;
