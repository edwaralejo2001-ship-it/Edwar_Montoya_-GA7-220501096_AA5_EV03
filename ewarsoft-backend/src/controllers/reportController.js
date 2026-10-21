const service = require('../services/reportService');
const { asyncHandler, sendSuccess } = require('./response');

module.exports = {
  inventory: asyncHandler(async (req, res) => sendSuccess(res, await service.getInventory())),
  lowStock: asyncHandler(async (req, res) => sendSuccess(res, await service.getLowStock(req.body))),
  sales: asyncHandler(async (req, res) => sendSuccess(res, await service.getSales(req.body)))
};
