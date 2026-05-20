const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const ctrl = require('../controllers/category.controller');

const router = Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.get('/', asyncHandler(ctrl.getCategories));
router.get('/all', authenticate, requireRole('admin'), asyncHandler(ctrl.getAllCategories));

router.post('/', authenticate, requireRole('admin'), [
  body('name').notEmpty().withMessage('Category name required'),
  validate,
], asyncHandler(ctrl.createCategory));

router.put('/:id', authenticate, requireRole('admin'), asyncHandler(ctrl.updateCategory));
router.delete('/:id', authenticate, requireRole('admin'), asyncHandler(ctrl.deleteCategory));

module.exports = router;
