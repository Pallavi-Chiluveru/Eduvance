const router = require('express').Router();
const teachingController = require('../controllers/instructorTeachingController');
const verificationController = require('../controllers/instructorController');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const requireApprovedInstructor = require('../middleware/approvedInstructor');
const upload = require('../utils/fileUpload');
const lectureUpload = require('../utils/lectureUpload');
const proofUpload = require('../utils/instructorProofUpload');
const { createAssessmentValidation, validate } = require('../middleware/validation');

router.use(protect, authorize('instructor'));

router.get('/verification', verificationController.status);
router.post('/verification/send-code', verificationController.sendCode);
router.post('/verification/verify-code', verificationController.verifyCode);
router.put('/verification', verificationController.requireEditable, proofUpload.fields([{ name: 'resume', maxCount: 1 }, { name: 'proof', maxCount: 1 }]), verificationController.updateApplication);
router.post('/verification/submit', verificationController.submit);
router.get('/verification/documents/:kind', verificationController.document);

router.use(requireApprovedInstructor);

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);
router.put('/profile/avatar', upload.single('avatar'), profileController.uploadAvatar);

router.get('/dashboard', teachingController.getDashboard);
router.get('/categories', teachingController.getCategories);
router.get('/courses', teachingController.getCourses);
router.post('/courses', teachingController.createCourse);
router.get('/courses/:courseId', teachingController.getCourse);
router.put('/courses/:courseId', teachingController.updateCourse);
router.post('/courses/:courseId/thumbnail', upload.single('thumbnail'), teachingController.uploadCourseThumbnail);
router.post('/courses/:courseId/submit-review', teachingController.submitCourseReview);
router.post('/courses/:courseId/resubmit', teachingController.submitCourseReview);
router.get('/courses/:courseId/reviews', teachingController.getCourseReviews);
router.get('/students/:courseId', teachingController.getCourseStudents);
router.post('/upload-content', upload.single('file'), teachingController.uploadContent);
router.get('/courses/:courseId/lectures', teachingController.getLectures);
router.post('/lectures', lectureUpload.single('file'), teachingController.uploadLecture);
router.get('/lectures/:lectureId/pdf', teachingController.getLecturePDF);
router.delete('/lectures/:lectureId', teachingController.deleteLecture);
router.post('/create-assessment', createAssessmentValidation, validate, teachingController.createAssessment);
router.get('/submissions', teachingController.getSubmissions);
router.put('/grade/:submissionId', teachingController.gradeSubmission);
router.get('/analytics', teachingController.getAnalytics);
router.post('/attendance', teachingController.markAttendance);
router.get('/attendance/:courseId', teachingController.getAttendanceReport);

module.exports = router;
