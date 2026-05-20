const { validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/errors');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg).join(', ');
    throw new BadRequestError(messages);
  }
  next();
}

module.exports = { validate };
