const router = require('express').Router();
const teacherController = require('../controllers/teacherController');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const upload = require('../utils/fileUpload');
const lectureUpload = require('../utils/lectureUpload');
const { createAssessmentValidation, validate } = require('../middleware/validation');

router.use(protect, authorize('teacher'));

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);

router.get('/dashboard', teacherController.getDashboard);
router.get('/courses', teacherController.getCourses);
router.get('/students/:courseId', teacherController.getCourseStudents);
router.post('/upload-content', upload.single('file'), teacherController.uploadContent);
router.get('/courses/:courseId/lectures', teacherController.getLectures);
router.post('/lectures', lectureUpload.single('file'), teacherController.uploadLecture);
router.get('/lectures/:lectureId/pdf', teacherController.getLecturePDF);
router.delete('/lectures/:lectureId', teacherController.deleteLecture);
router.post('/create-assessment', createAssessmentValidation, validate, teacherController.createAssessment);
router.get('/submissions', teacherController.getSubmissions);
router.put('/grade/:submissionId', teacherController.gradeSubmission);
router.get('/analytics', teacherController.getAnalytics);
router.post('/attendance', teacherController.markAttendance);
router.get('/attendance/:courseId', teacherController.getAttendanceReport);

module.exports = router;
