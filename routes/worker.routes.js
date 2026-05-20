const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const ctrl = require('../controllers/worker.controller');

const router = Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.get('/', asyncHandler(ctrl.getWorkers));
router.get('/profile/me', authenticate, requireRole('worker'), asyncHandler(ctrl.getMyProfile));
router.put('/profile/me', authenticate, requireRole('worker'), asyncHandler(ctrl.updateMyProfile));
router.get('/approval-status', authenticate, requireRole('worker'), asyncHandler(ctrl.getApprovalStatus));
router.get('/:id', asyncHandler(ctrl.getWorkerById));

module.exports = router;
