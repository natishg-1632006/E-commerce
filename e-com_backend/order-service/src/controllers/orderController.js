const service = require('../services/orderService');
const { expirePendingOrders } = require('../services/orderExpirationService');
const { success, error } = require('../utils/responseHandler');
const { getProfile, updateProfile } = require('../utils/userApi');

const createOrder = async (req, res, next) => {
  try {
    const { email, shippingAddress, paymentMethod, couponCode } = req.body;

    const userId = req.user.sub;
    const token = req.headers.authorization;

    const order = await service.createOrder(
      userId,
      email,
      shippingAddress,
      paymentMethod,
      token,
      couponCode
    );

    success(res, order, 201);
  } catch (err) {
    next(err);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { data, statistics, meta } = await service.getAllOrders(req.query);
    return res.status(200).json({
      success: true,
      data,
      statistics,
      meta
    });
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await service.getOrderById(req.params.id);
    if (!order) return error(res, 'Order not found', 404);
    success(res, order);
  } catch (err) {
    next(err);
  }
};

const getOrdersByUser = async (req, res, next) => {
  try {
    const orders = await service.getOrdersByUser(req.params.userId);
    success(res, orders, 200, { total: orders.length });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await service.updateOrderStatus(req.params.id, req.body.orderStatus);
    success(res, order);
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await service.cancelOrder(req.params.id);
    success(res, order);
  } catch (err) {
    next(err);
  }
};

const downloadInvoice = async (req, res, next) => {
  try {
    const order = await service.getOrderById(req.params.id);
    if (!order) return error(res, 'Order not found', 404);

    // Ownership check: only admin or the user who placed it can download
    const userGroups = req.user["cognito:groups"] || [];
    const isAdmin = userGroups.includes('Admin');
    if (!isAdmin && order.userId !== req.user.sub) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${req.params.id}.pdf`);

    await service.generateInvoicePdf(order, res);
  } catch (err) {
    next(err);
  }
};

const expirePending = async (req, res, next) => {
  try {
    const result = await expirePendingOrders();
    success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getAllOrders, getOrderById, getOrdersByUser, updateOrderStatus, cancelOrder, downloadInvoice, expirePending };
