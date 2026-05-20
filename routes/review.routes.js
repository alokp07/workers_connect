const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const ctrl = require('../controllers/review.controller');

const router = Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.post('/', authenticate, requireRole('client'), [
  body('booking_id').notEmpty().withMessage('Booking ID required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  validate,
], asyncHandler(ctrl.createReview));

router.put('/:id/reply', authenticate, requireRole('worker'), [
  body('worker_reply').notEmpty().withMessage('Reply text required'),
  validate,
], asyncHandler(ctrl.replyToReview));

router.get('/my', authenticate, requireRole('worker'), asyncHandler(ctrl.getWorkerReviews));

module.exports = router;
