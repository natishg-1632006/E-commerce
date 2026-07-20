const service = require('../services/analyticsService');
const { success } = require('../utils/responseHandler');

const getDashboard = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const data = await service.getDashboardData(token);
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getRevenue = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const { period, startDate, endDate } = req.query;
    const data = await service.getRevenueAnalytics(token, period, startDate, endDate);
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const data = await service.getOrderAnalytics(token);
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const data = await service.getProductAnalytics(token);
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const data = await service.getCategoryAnalytics(token);
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getCoupons = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const data = await service.getCouponAnalytics(token);
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getInventory = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const data = await service.getInventoryAnalytics(token);
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const data = await service.getPaymentAnalytics(token);
    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getHealth = async (req, res, next) => {
  try {
    const health = await service.getHealthStatus();
    success(res, health);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getRevenue,
  getOrders,
  getProducts,
  getCategories,
  getCoupons,
  getInventory,
  getPayments,
  getHealth,
};
