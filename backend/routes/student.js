const router = require('express').Router();
const studentController = require('../controllers/studentController');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All student routes require authentication + student role
router.use(protect, authorize('student'));

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);

router.get('/dashboard', studentController.getDashboard);
router.get('/courses', studentController.getCourses);
router.get('/courses/available', studentController.getAvailableCourses);
router.post('/enroll/:courseId', studentController.enrollCourse);
router.get('/courses/:courseId/lectures', studentController.getLectures);
router.get('/lectures/:lectureId/pdf', studentController.getLecturePDF);
router.post('/view-lecture/:id', studentController.viewLecture);
router.get('/assessments', studentController.getAssessments);
router.get('/assessments/:id/questions', studentController.getAssessmentQuestions);
router.post('/submit-test', studentController.submitTest);
router.get('/submissions/:id/review', studentController.getSubmissionReview);
router.get('/performance', studentController.getPerformance);
router.get('/learning-journey', studentController.getLearningJourney);
router.get('/attendance', studentController.getAttendance);
router.get('/flashcards', studentController.getFlashcards);
router.post('/flashcards', studentController.createFlashcard);
router.put('/flashcards/:id/review', studentController.reviewFlashcard);
router.get('/rewards', studentController.getRewards);
router.post('/chat', studentController.chat);
router.get('/chat/history', studentController.getChatHistory);
router.get('/notifications', studentController.getNotifications);
router.put('/notifications/:id/read', studentController.markNotificationRead);

module.exports = router;
