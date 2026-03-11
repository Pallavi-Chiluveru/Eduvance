const router = require('express').Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation, validate } = require('../middleware/validation');
const { generateCsrfToken } = require('../middleware/csrf');

// CSRF token endpoint (must be fetched before any POST/PUT/PATCH/DELETE)
router.get('/csrf-token', generateCsrfToken);

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
