const service = require('../services/cartService');
const { success, error } = require('../utils/responseHandler');

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.sub; // Get the userId from the authenticated user's information
    const cart = await service.getCart(userId);
    if (!cart) return error(res, 'Cart not found', 404);
    success(res, cart);
  } catch (err) {
    next(err);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.sub; // Get the userId from the authenticated user's information
    const cart = await service.addToCart(userId, productId, quantity);
    success(res, cart, 201);
  } catch (err) {
    next(err);
  }
};

const updateQuantity = async (req, res, next) => {
  try {
    const {productId, quantity } = req.body;
    const userId = req.user.sub; // Get the userId from the authenticated user's information
    const cart = await service.updateQuantity(userId, productId, quantity);
    success(res, cart);
  } catch (err) {
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.sub; // Get the userId from the authenticated user's information
    const cart = await service.removeItem(userId, productId);
    success(res, cart);
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.sub; // Get the userId from the authenticated user's information
    const result = await service.clearCart(userId);
    success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateQuantity, removeItem, clearCart };
