const { verifyAccessToken, extractTokenFromHeader } = require('../utils/cognitoVerifier');
const { getCognitoConfig } = require('../config/cognitoConfig');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is missing',
      });
    }
    console.time("JWT Verify");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Authorization header format. Expected: Bearer <token>',
      });
    }

    const cognitoConfig = getCognitoConfig();
    const decodedPayload = await verifyAccessToken(token, cognitoConfig);
     console.timeEnd("JWT Verify");
    req.user = decodedPayload;
    next();
  } catch (error) {
    const statusCode = error.statusCode || 401;
    const message = error.message || 'Unauthorized';

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

module.exports = authMiddleware;
