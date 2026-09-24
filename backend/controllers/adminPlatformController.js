const User = require('../models/User');
const Course = require('../models/Course');
const CourseReview = require('../models/CourseReview');
const MentorAssignment = require('../models/MentorAssignment');
const MentorFeedback = require('../models/MentorFeedback');
const MentoringSession = require('../models/MentoringSession');
const Category = require('../models/Category');
const Policy = require('../models/Policy');
const Notification = require('../models/Notification');

const roleList = role => async (_req, res, next) => {
    try {
        const users = await User.find({ role }).select('firstName lastName email phone avatar isActive createdAt lastLogin').sort('-createdAt');
        const enriched = await Promise.all(users.map(async user => {
            if (role === 'reviewer') return { ...user.toObject(), activityCount: await CourseReview.countDocuments({ reviewer: user._id }) };
            const [assignedStudents, feedbackCount, sessionCount] = await Promise.all([MentorAssignment.countDocuments({ mentor: user._id, status: 'active' }), MentorFeedback.countDocuments({ mentor: user._id }), MentoringSession.countDocuments({ mentor: user._id })]);
            return { ...user.toObject(), assignedStudents, feedbackCount, sessionCount };
        }));
        res.json({ success: true, data: { users: enriched } });
    } catch (error) { next(error); }
};

const createRole = role => async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;
        if (!firstName?.trim() || !email?.trim() || !password || password.length < 6) return res.status(400).json({ success: false, message: 'First name, valid email and password of at least 6 characters are required' });
        const user = await User.create({ firstName: firstName.trim(), lastName: lastName?.trim() || '', email, password, phone, role });
        res.status(201).json({ success: true, data: { user } });
    } catch (error) { if (error.code === 11000) return res.status(409).json({ success: false, message: 'Email already exists' }); next(error); }
};

const updateRole = role => async (req, res, next) => {
    try {
        const allowed = ['firstName', 'lastName', 'email', 'phone', 'isActive'];
        const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
        const user = await User.findOneAndUpdate({ _id: req.params.id, role }, update, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ success: false, message: `${role} not found` });
        res.json({ success: true, data: { user } });
    } catch (error) { next(error); }
};

exports.listReviewers = roleList('reviewer');
exports.createReviewer = createRole('reviewer');
exports.getReviewerActivity = async (req, res, next) => {
    try {
        const reviewer = await User.findOne({ _id: req.params.id, role: 'reviewer' }).select('firstName lastName email isActive createdAt lastLogin');
        if (!reviewer) return res.status(404).json({ success: false, message: 'Reviewer not found' });
        const reviews = await CourseReview.find({ reviewer: reviewer._id }).populate('course', 'name code status').populate('instructor', 'firstName lastName email').sort('-createdAt');
        res.json({ success: true, data: { reviewer, reviews } });
    } catch (error) { next(error); }
};
exports.updateReviewer = updateRole('reviewer');
exports.listMentors = roleList('mentor');
exports.createMentor = createRole('mentor');
exports.updateMentor = updateRole('mentor');

exports.getMentorAssignments = async (req, res, next) => {
    try {
        const mentor = await User.findOne({ _id: req.params.mentorId, role: 'mentor' }).select('firstName lastName email');
        if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });
        const assignments = await MentorAssignment.find({ mentor: mentor._id, status: 'active' }).populate('student', 'firstName lastName email studentId grade avatar').sort('-assignedAt');
        res.json({ success: true, data: { mentor, assignments } });
    } catch (error) { next(error); }
};

exports.assignStudent = async (req, res, next) => {
    try {
        const [mentor, student] = await Promise.all([User.findOne({ _id: req.params.mentorId, role: 'mentor', isActive: true }), User.findOne({ _id: req.params.studentId, role: 'student', isActive: true })]);
        if (!mentor || !student) return res.status(404).json({ success: false, message: 'Active mentor or student not found' });
        const assignment = await MentorAssignment.findOneAndUpdate({ mentor: mentor._id, student: student._id }, { assignedBy: req.user._id, assignedAt: new Date(), status: 'active', $unset: { removedAt: 1 } }, { new: true, upsert: true, runValidators: true });
        await Promise.all([
            Notification.create({ user: mentor._id, title: 'Student assigned', message: `${student.firstName} ${student.lastName} has been assigned to you.`, type: 'info', link: `/mentor/learners/${student._id}` }),
            Notification.create({ user: student._id, title: 'New mentor assigned', message: `${mentor.firstName} ${mentor.lastName} is now your mentor.`, type: 'info', link: '/student/mentor-feedback' }),
        ]);
        res.status(201).json({ success: true, data: { assignment } });
    } catch (error) { next(error); }
};

exports.removeStudent = async (req, res, next) => {
    try {
        const assignment = await MentorAssignment.findOneAndUpdate({ mentor: req.params.mentorId, student: req.params.studentId, status: 'active' }, { status: 'inactive', removedAt: new Date() }, { new: true });
        if (!assignment) return res.status(404).json({ success: false, message: 'Active assignment not found' });
        await Notification.create({ user: assignment.mentor, title: 'Student assignment removed', message: 'A learner assignment has been removed by the platform administrator.', type: 'warning' });
        res.json({ success: true, data: { assignment } });
    } catch (error) { next(error); }
};

exports.listCategories = async (_req, res, next) => { try { const categories = await Category.find().sort('name'); const data = await Promise.all(categories.map(async category => ({ ...category.toObject(), courseCount: await Course.countDocuments({ category: category.name }) }))); res.json({ success: true, data: { categories: data } }); } catch (error) { next(error); } };
exports.createCategory = async (req, res, next) => { try { const category = await Category.create({ name: req.body.name, description: req.body.description }); res.status(201).json({ success: true, data: { category } }); } catch (error) { if (error.code === 11000) return res.status(409).json({ success: false, message: 'Category already exists' }); next(error); } };
exports.updateCategory = async (req, res, next) => { try { const category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name, description: req.body.description, isActive: req.body.isActive }, { new: true, runValidators: true }); if (!category) return res.status(404).json({ success: false, message: 'Category not found' }); res.json({ success: true, data: { category } }); } catch (error) { next(error); } };
exports.deleteCategory = async (req, res, next) => { try { const category = await Category.findById(req.params.id); if (!category) return res.status(404).json({ success: false, message: 'Category not found' }); if (await Course.exists({ category: category.name })) return res.status(409).json({ success: false, message: 'Category is used by courses; deactivate it instead' }); await category.deleteOne(); res.json({ success: true, message: 'Category deleted' }); } catch (error) { next(error); } };

exports.listPolicies = async (_req, res, next) => { try { res.json({ success: true, data: { policies: await Policy.find().populate('updatedBy', 'firstName lastName').sort('-updatedAt') } }); } catch (error) { next(error); } };
exports.createPolicy = async (req, res, next) => { try { const policy = await Policy.create({ ...req.body, createdBy: req.user._id, updatedBy: req.user._id, publishedAt: req.body.status === 'published' ? new Date() : undefined }); res.status(201).json({ success: true, data: { policy } }); } catch (error) { next(error); } };
exports.updatePolicy = async (req, res, next) => { try { const update = { ...req.body, updatedBy: req.user._id }; if (req.body.status === 'published') update.publishedAt = new Date(); const policy = await Policy.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }); if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' }); res.json({ success: true, data: { policy } }); } catch (error) { next(error); } };

exports.courseReviewOverview = async (_req, res, next) => { try { const courses = await Course.find({ status: { $in: ['draft', 'submitted', 'pending_review', 'under_review', 'changes_requested', 'approved', 'rejected', 'published'] } }).populate('instructor', 'firstName lastName email').populate('reviewedBy', 'firstName lastName').sort('-updatedAt'); res.json({ success: true, data: { courses } }); } catch (error) { next(error); } };
