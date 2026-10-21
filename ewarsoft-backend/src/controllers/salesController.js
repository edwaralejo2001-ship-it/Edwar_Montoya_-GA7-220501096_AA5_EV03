const service = require('../services/salesService');
const { asyncHandler, sendSuccess } = require('./response');

module.exports = {
  create: asyncHandler(async (req, res) => sendSuccess(res, await service.createSale(req.body), 201, 'Venta registrada.'))
};
