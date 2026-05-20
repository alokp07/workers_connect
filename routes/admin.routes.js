const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const ctrl = require('../controllers/admin.controller');

const router = Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

const adminAuth = [authenticate, requireRole('admin')];

router.get('/stats', ...adminAuth, asyncHandler(ctrl.getStats));
router.get('/approvals', ...adminAuth, asyncHandler(ctrl.getApprovals));
router.put('/approvals/:id', ...adminAuth, asyncHandler(ctrl.updateApproval));
router.get('/users', ...adminAuth, asyncHandler(ctrl.getUsers));
router.put('/users/:id/block', ...adminAuth, asyncHandler(ctrl.toggleBlockUser));
router.get('/bookings', ...adminAuth, asyncHandler(ctrl.getAllBookings));
router.get('/reviews', ...adminAuth, asyncHandler(ctrl.getAllReviews));
router.delete('/reviews/:id', ...adminAuth, asyncHandler(ctrl.deleteReview));
router.get('/activity-log', ...adminAuth, asyncHandler(ctrl.getActivityLog));

module.exports = router;
