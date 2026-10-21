const service = require('../services/inventoryService');
const { asyncHandler, sendSuccess } = require('./response');

module.exports = {
  entry: asyncHandler(async (req, res) => sendSuccess(res, await service.registerMovement(req.body, 'ENTRY'), 201, 'Entrada de inventario registrada.')),
  exit: asyncHandler(async (req, res) => sendSuccess(res, await service.registerMovement(req.body, 'EXIT'), 201, 'Salida de inventario registrada.'))
};
