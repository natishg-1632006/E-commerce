const service = require('../services/notificationService');
const { success, error } = require('../utils/responseHandler');

const sendTestNotification = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const result = await service.sendNotification(payload);
    success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const healthCheck = async (req, res, next) => {
  try {
    success(res, { service: 'notification-service', status: 'healthy' });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendTestNotification, healthCheck };
