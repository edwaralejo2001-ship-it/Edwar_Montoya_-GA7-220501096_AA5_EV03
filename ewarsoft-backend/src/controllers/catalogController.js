const service = require('../services/catalogService');
const { asyncHandler, sendSuccess } = require('./response');

module.exports = {
  createCategory: asyncHandler(async (req, res) => sendSuccess(res, await service.createCategory(req.body), 201, 'Categoría registrada.')),
  listCategories: asyncHandler(async (req, res) => sendSuccess(res, await service.listCategories())),
  createSupplier: asyncHandler(async (req, res) => sendSuccess(res, await service.createSupplier(req.body), 201, 'Proveedor registrado.')),
  listSuppliers: asyncHandler(async (req, res) => sendSuccess(res, await service.listSuppliers()))
};
