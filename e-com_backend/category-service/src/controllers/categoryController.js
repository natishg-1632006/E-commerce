const service = require('../services/categoryService');
const { success } = require('../utils/responseHandler');
const { error } = require("../utils/responseHandler");

const createCategory = async (req, res, next) => {
    try {
        const category = await service.createCategory(req.body);
        success(res,
            {
                categoryId: category.categoryId,
                message: 'Category created successfully',
            },201);

    } catch (err) {
        next(err);
    }
};

const getCategories = async (req, res, next) => {
  try {
    const { categories, meta } = await service.getAllCategories(req.query);

    success(res, categories, 200, meta);
  } catch (err) {
    next(err);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await service.getCategoryById(req.params.id);

    if (!category)
      return error(res, "Category not found", 404);

    success(res, category);
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {

    const category = await service.updateCategory(
      req.params.id,
      req.body
    );

    if (!category)
      return error(res, "Category not found", 404);

    success(res, category);

  } catch (err) {
    next(err);
  }
};

module.exports = {createCategory, getCategories, getCategory, updateCategory};