const service = require('../services/userService');
const { success, error } = require('../utils/responseHandler');

const getProfile = async (req, res, next) => {
  try {
    console.time("Controller");

    console.time("Service");
    const profile = await service.getProfile(req.user.sub);
    console.timeEnd("Service");

    console.timeEnd("Controller");

    success(res, profile);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await service.updateProfile(req.user.sub, req.body);
    success(res, profile);
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await service.getAllUsers();
    success(res, users);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await service.getUserById(req.params.userId);
    if (!user) return error(res, 'User not found', 404);
    success(res, user);
  } catch (err) {
    next(err);
  }
};

const updateUserByIdAdmin = async (req, res, next) => {
  try {
    const profile = await service.updateProfile(req.params.userId, req.body);
    success(res, profile);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserByIdAdmin,
};
