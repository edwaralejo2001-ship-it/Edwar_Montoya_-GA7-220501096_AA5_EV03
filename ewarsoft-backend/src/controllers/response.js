function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function sendSuccess(res, data, status = 200, message = 'Operación realizada correctamente.') {
  return res.status(status).json({ success: true, message, data });
}

module.exports = { asyncHandler, sendSuccess };
