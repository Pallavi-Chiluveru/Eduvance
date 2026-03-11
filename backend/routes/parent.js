const router = require('express').Router();
const parentController = require('../controllers/parentController');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect, authorize('parent'));

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);

router.get('/dashboard', parentController.getDashboard);
router.get('/child/:childId/performance', parentController.getChildPerformance);
router.get('/child/:childId/attendance', parentController.getChildAttendance);
router.get('/child/:childId/activity', parentController.getChildActivity);

// Notification routes
router.get('/notifications', parentController.getNotifications);
router.put('/notifications/:id/read', parentController.markNotificationRead);

module.exports = router;
