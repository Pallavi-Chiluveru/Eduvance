const router = require('express').Router();
const controller = require('../controllers/reviewerController');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const upload = require('../utils/fileUpload');

router.use(protect, authorize('reviewer'));
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);
router.put('/profile/avatar', upload.single('avatar'), profileController.uploadAvatar);
router.get('/dashboard', controller.getDashboard);
router.get('/courses/pending', controller.getPendingCourses);
router.get('/courses/:courseId', controller.getCourse);
router.post('/courses/:courseId/review', controller.reviewCourse);
router.get('/reviews/history', controller.getHistory);

module.exports = router;
