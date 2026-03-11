const router = require('express').Router();
const adminController = require('../controllers/adminController');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { createCourseValidation, validate, mongoIdParam } = require('../middleware/validation');

router.use(protect, authorize('admin'));

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', mongoIdParam, validate, adminController.updateUser);
router.delete('/users/:id', mongoIdParam, validate, adminController.deleteUser);
router.put('/users/:id/reset-password', mongoIdParam, validate, adminController.resetPassword);
router.post('/users/bulk-import', adminController.bulkImportUsers);
router.get('/courses', adminController.getCourses);
router.post('/courses', createCourseValidation, validate, adminController.createCourse);
router.put('/courses/:id', mongoIdParam, validate, adminController.updateCourse);
router.post('/enroll', adminController.enrollStudent);
router.get('/analytics', adminController.getSystemAnalytics);

module.exports = router;
