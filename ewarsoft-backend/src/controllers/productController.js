const service = require('../services/productService');
const { asyncHandler, sendSuccess } = require('./response');

module.exports = {
  create: asyncHandler(async (req, res) => sendSuccess(res, await service.createProduct(req.body), 201, 'Producto registrado.')),
  list: asyncHandler(async (req, res) => sendSuccess(res, await service.listProducts(req.body))),
  get: asyncHandler(async (req, res) => sendSuccess(res, await service.getProductById(req.body))),
  update: asyncHandler(async (req, res) => sendSuccess(res, await service.updateProduct(req.body), 200, 'Producto actualizado.')),
  deactivate: asyncHandler(async (req, res) => sendSuccess(res, await service.deactivateProduct(req.body), 200, 'Producto desactivado.'))
};
