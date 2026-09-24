const Course = require('../models/Course');
const CourseReview = require('../models/CourseReview');
const Lecture = require('../models/Lecture');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const Notification = require('../models/Notification');

const reviewableStatuses = ['submitted', 'pending_review', 'under_review'];

exports.getDashboard = async (req, res, next) => {
    try {
        const [pendingReviews, underReview, approvedCourses, changesRequested, rejectedCourses] = await Promise.all([
            Course.countDocuments({ status: { $in: ['submitted', 'pending_review'] } }),
            Course.countDocuments({ status: 'under_review', reviewedBy: req.user._id }),
            CourseReview.countDocuments({ reviewer: req.user._id, decision: 'approved' }),
            CourseReview.countDocuments({ reviewer: req.user._id, decision: 'changes_requested' }),
            CourseReview.countDocuments({ reviewer: req.user._id, decision: 'rejected' }),
        ]);
        const recent = await CourseReview.find({ reviewer: req.user._id }).populate('course', 'name code').populate('instructor', 'firstName lastName').sort('-createdAt').limit(5);
        res.json({ success: true, data: { stats: { pendingReviews, underReview, approvedCourses, changesRequested, rejectedCourses }, recent } });
    } catch (error) { next(error); }
};

exports.getPendingCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({ $or: [{ status: { $in: ['submitted', 'pending_review'] } }, { status: 'under_review', reviewedBy: req.user._id }] })
            .populate('instructor', 'firstName lastName email').sort('submittedAt updatedAt');
        res.json({ success: true, data: { courses } });
    } catch (error) { next(error); }
};

exports.getCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId).populate('instructor', 'firstName lastName email department specialization');
        if (!course || !reviewableStatuses.includes(course.status)) return res.status(404).json({ success: false, message: 'Reviewable course not found' });
        if (course.status === 'under_review' && course.reviewedBy?.toString() !== req.user._id.toString()) return res.status(409).json({ success: false, message: 'This course is currently being reviewed by another reviewer' });
        if (['submitted', 'pending_review'].includes(course.status)) { course.status = 'under_review'; course.reviewedBy = req.user._id; await course.save(); }
        const [lectures, assessments, reviews] = await Promise.all([
            Lecture.find({ course: course._id }).select('-filePath').sort('order createdAt'),
            Assessment.find({ course: course._id }).select('-__v').sort('createdAt'),
            CourseReview.find({ course: course._id }).populate('reviewer', 'firstName lastName').sort('submissionNumber createdAt'),
        ]);
        const questions = await Question.find({ assessment: { $in: assessments.map(item => item._id) } }).sort('order createdAt');
        res.json({ success: true, data: { course, lectures, assessments: assessments.map(assessment => ({ ...assessment.toObject(), questions: questions.filter(question => question.assessment.toString() === assessment._id.toString()) })), reviews } });
    } catch (error) { next(error); }
};

exports.reviewCourse = async (req, res, next) => {
    try {
        const { decision, comments = '' } = req.body;
        if (!['approved', 'changes_requested', 'rejected'].includes(decision)) return res.status(400).json({ success: false, message: 'Invalid review decision' });
        if (decision !== 'approved' && !comments.trim()) return res.status(400).json({ success: false, message: 'Comments are required for changes or rejection' });
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        if (!reviewableStatuses.includes(course.status)) return res.status(409).json({ success: false, message: `A ${course.status} course cannot be reviewed` });
        if (course.status === 'under_review' && course.reviewedBy?.toString() !== req.user._id.toString()) return res.status(409).json({ success: false, message: 'This course is currently being reviewed by another reviewer' });
        const submissionNumber = await CourseReview.countDocuments({ course: course._id }) + 1;
        const review = await CourseReview.create({ course: course._id, reviewer: req.user._id, instructor: course.instructor, submissionNumber, decision, comments: comments.trim(), submittedAt: course.submittedAt || course.updatedAt });
        course.status = decision === 'approved' ? 'published' : decision;
        if (decision === 'approved') course.isActive = true;
        course.reviewMessage = comments.trim();
        course.reviewedBy = req.user._id;
        course.reviewedAt = new Date();
        await course.save();
        await Notification.create({ user: course.instructor, title: decision === 'approved' ? 'Course approved' : decision === 'changes_requested' ? 'Course changes requested' : 'Course rejected', message: decision === 'approved' ? `Your course "${course.name}" was approved and published.` : comments.trim(), type: decision === 'approved' ? 'success' : 'warning', link: `/instructor/courses/${course._id}/reviews` });
        res.json({ success: true, data: { review, course }, message: 'Review recorded successfully' });
    } catch (error) { next(error); }
};

exports.getHistory = async (req, res, next) => {
    try {
        const reviews = await CourseReview.find({ reviewer: req.user._id }).populate('course', 'name code status').populate('instructor', 'firstName lastName email').sort('-createdAt');
        res.json({ success: true, data: { reviews } });
    } catch (error) { next(error); }
};
