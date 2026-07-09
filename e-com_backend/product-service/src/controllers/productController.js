const service = require('../services/productService');
const { success, error } = require('../utils/responseHandler');

const getProducts = async (req, res, next) => {
  try {
    console.log(req.user);
    const { products, meta } = await service.getAllProducts(req.query);
    success(res, products, 200, meta);
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await service.getProductById(req.params.id);
    if (!product) return error(res, 'Product not found', 404);
    success(res, product);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await service.createProduct(req.body);
    success(res, { productId: product.productId, message: 'Product created successfully' }, 201);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await service.updateProduct(req.params.id, req.body);
    if (!product) return error(res, 'Product not found', 404);
    success(res, product);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await service.deleteProduct(req.params.id);
    if (!product) return error(res, 'Product not found', 404);
    success(res, { message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
