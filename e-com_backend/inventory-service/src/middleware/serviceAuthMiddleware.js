'use strict';

const serviceAuthMiddleware = (req, res, next) => {
  const serviceKey = req.headers['x-service-key'];

  if (!serviceKey) {
    return res.status(401).json({
      success: false,
      message: 'Missing service authentication key',
    });
  }

  if (serviceKey !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Invalid service authentication key',
    });
  }

  next();
};

module.exports = serviceAuthMiddleware;