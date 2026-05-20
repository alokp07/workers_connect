const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const ctrl = require('../controllers/booking.controller');

const router = Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.post('/', authenticate, requireRole('client'), [
  body('worker_id').notEmpty().withMessage('Worker ID required'),
  body('description').notEmpty().withMessage('Description required'),
  validate,
], asyncHandler(ctrl.createBooking));

router.get('/', authenticate, asyncHandler(ctrl.getBookings));
router.put('/:id/accept', authenticate, requireRole('worker'), asyncHandler(ctrl.acceptBooking));
router.put('/:id/decline', authenticate, requireRole('worker'), asyncHandler(ctrl.declineBooking));
router.put('/:id/complete', authenticate, requireRole('worker'), asyncHandler(ctrl.completeBooking));
router.put('/:id/cancel', authenticate, requireRole('client'), asyncHandler(ctrl.cancelBooking));

module.exports = router;
