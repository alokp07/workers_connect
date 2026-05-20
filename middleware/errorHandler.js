const { error } = require('../utils/response');

function errorHandler(err, req, res, _next) {
  console.error(`[Error] ${err.message}`);
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';
  return error(res, message, statusCode);
}

module.exports = { errorHandler };
