function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function error(res, message = 'Error', statusCode = 500) {
  return res.status(statusCode).json({ success: false, message, data: null });
}

function paginated(res, data, total, page, limit) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
}

module.exports = { success, error, paginated };
