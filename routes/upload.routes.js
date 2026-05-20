const { Router } = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/upload.controller');

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  },
});

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.post('/avatar', authenticate, upload.single('avatar'), asyncHandler(ctrl.uploadAvatar));

module.exports = router;
