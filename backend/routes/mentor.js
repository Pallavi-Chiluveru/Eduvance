const router = require('express').Router();
const controller = require('../controllers/mentorController');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const upload = require('../utils/fileUpload');

router.use(protect, authorize('mentor'));
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);
router.put('/profile/avatar', upload.single('avatar'), profileController.uploadAvatar);
router.get('/dashboard', controller.getDashboard);
router.get('/students', controller.getStudents);
router.get('/students/:studentId', controller.getStudent);
router.get('/students/:studentId/progress', controller.getStudent);
router.post('/students/:studentId/feedback', controller.addFeedback);
router.get('/students/:studentId/feedback', controller.getFeedback);
router.post('/sessions', controller.createSession);
router.get('/sessions', controller.getSessions);

module.exports = router;
