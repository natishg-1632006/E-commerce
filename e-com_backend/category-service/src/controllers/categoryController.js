const service = require('../services/categoryService');

const { success } = require('../utils/responseHandler');

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

module.exports = {createCategory,};