const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { UnauthorizedError } = require('../utils/errors');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

module.exports = { authenticate };
