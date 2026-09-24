const router = require('express').Router();
const adminController = require('../controllers/adminController');
const instructorAdminController = require('../controllers/instructorAdminController');
const platformController = require('../controllers/adminPlatformController');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { createCourseValidation, validate, mongoIdParam } = require('../middleware/validation');
const upload = require('../utils/fileUpload');

router.use(protect, authorize('admin'));

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);
router.put('/profile/avatar', upload.single('avatar'), profileController.uploadAvatar);

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
router.patch('/courses/:id/review', mongoIdParam, validate, adminController.reviewCourse);
router.post('/enroll', adminController.enrollStudent);
router.get('/analytics', adminController.getSystemAnalytics);

router.get('/reviewers', platformController.listReviewers);
router.post('/reviewers', platformController.createReviewer);
router.put('/reviewers/:id', platformController.updateReviewer);
router.get('/reviewers/:id/activity', platformController.getReviewerActivity);
router.get('/mentors', platformController.listMentors);
router.post('/mentors', platformController.createMentor);
router.put('/mentors/:id', platformController.updateMentor);
router.get('/mentors/:mentorId/students', platformController.getMentorAssignments);
router.post('/mentors/:mentorId/students/:studentId', platformController.assignStudent);
router.delete('/mentors/:mentorId/students/:studentId', platformController.removeStudent);
router.get('/categories', platformController.listCategories);
router.post('/categories', platformController.createCategory);
router.put('/categories/:id', platformController.updateCategory);
router.delete('/categories/:id', platformController.deleteCategory);
router.get('/policies', platformController.listPolicies);
router.post('/policies', platformController.createPolicy);
router.put('/policies/:id', platformController.updatePolicy);
router.get('/course-reviews', platformController.courseReviewOverview);

router.get('/instructors', instructorAdminController.list);
router.get('/instructors/:id', instructorAdminController.get);
router.patch('/instructors/:id/review', instructorAdminController.review);
router.get('/instructors/:id/documents/:kind', instructorAdminController.document);

module.exports = router;
