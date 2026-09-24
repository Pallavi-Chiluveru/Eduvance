const User = require('../models/User');
const MentorAssignment = require('../models/MentorAssignment');
const MentorFeedback = require('../models/MentorFeedback');
const MentoringSession = require('../models/MentoringSession');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');
const Activity = require('../models/Activity');
const Reward = require('../models/Reward');
const Notification = require('../models/Notification');

const assigned = async (mentor, student) => MentorAssignment.findOne({ mentor, student, status: 'active' });

async function learnerData(studentId, mentorId) {
    const [student, enrollments, submissions, activities, rewards, feedback] = await Promise.all([
        User.findOne({ _id: studentId, role: 'student', isActive: true }).select('firstName lastName email avatar studentId grade section lastActivityDate learningStreak'),
        Enrollment.find({ student: studentId, status: { $ne: 'dropped' } }).populate('course', 'name code thumbnail modules chapters').sort('-updatedAt'),
        Submission.find({ student: studentId }).populate({ path: 'assessment', select: 'title course assessmentType type totalMarks', populate: { path: 'course', select: 'name code' } }).sort('-submittedAt'),
        Activity.find({ student: studentId }).sort('-date').limit(30),
        Reward.find({ student: studentId }).sort('-earnedAt').limit(20),
        MentorFeedback.find({ student: studentId, mentor: mentorId }).populate('mentor', 'firstName lastName').populate('course', 'name code').sort('-createdAt'),
    ]);
    if (!student) return null;
    const completed = enrollments.filter(item => item.progress >= 100).length;
    const averageProgress = enrollments.length ? Math.round(enrollments.reduce((sum, item) => sum + item.progress, 0) / enrollments.length) : 0;
    const graded = submissions.filter(item => item.status === 'graded');
    const averageScore = graded.length ? Math.round(graded.reduce((sum, item) => sum + item.percentage, 0) / graded.length) : 0;
    return { student, enrollments, submissions, activities, rewards, feedback, summary: { courses: enrollments.length, completed, averageProgress, averageScore, pendingTasks: submissions.filter(item => item.status === 'submitted').length } };
}

exports.getDashboard = async (req, res, next) => {
    try {
        const assignments = await MentorAssignment.find({ mentor: req.user._id, status: 'active' }).select('student');
        const studentIds = assignments.map(item => item.student);
        const [activeLearners, enrollments, pendingFeedback, mentoringSessions] = await Promise.all([
            User.countDocuments({ _id: { $in: studentIds }, isActive: true, lastActivityDate: { $gte: new Date(Date.now() - 14 * 86400000) } }),
            Enrollment.countDocuments({ student: { $in: studentIds }, status: 'active', progress: { $lt: 100 } }),
            Submission.countDocuments({ student: { $in: studentIds }, status: 'graded', updatedAt: { $gte: new Date(Date.now() - 14 * 86400000) } }),
            MentoringSession.countDocuments({ mentor: req.user._id }),
        ]);
        res.json({ success: true, data: { stats: { assignedLearners: studentIds.length, activeLearners, coursesInProgress: enrollments, pendingFeedback, mentoringSessions } } });
    } catch (error) { next(error); }
};

exports.getStudents = async (req, res, next) => {
    try {
        const assignments = await MentorAssignment.find({ mentor: req.user._id, status: 'active' }).populate('student', 'firstName lastName email avatar studentId grade lastActivityDate').sort('-assignedAt');
        const learners = await Promise.all(assignments.filter(item => item.student).map(async item => {
            const data = await learnerData(item.student._id, req.user._id);
            return { assignmentId: item._id, assignedAt: item.assignedAt, ...data };
        }));
        res.json({ success: true, data: { learners } });
    } catch (error) { next(error); }
};

exports.getStudent = async (req, res, next) => {
    try {
        if (!await assigned(req.user._id, req.params.studentId)) return res.status(403).json({ success: false, message: 'This learner is not assigned to you' });
        const learner = await learnerData(req.params.studentId, req.user._id);
        if (!learner) return res.status(404).json({ success: false, message: 'Student not found' });
        res.json({ success: true, data: { learner } });
    } catch (error) { next(error); }
};

exports.addFeedback = async (req, res, next) => {
    try {
        if (!await assigned(req.user._id, req.params.studentId)) return res.status(403).json({ success: false, message: 'This learner is not assigned to you' });
        const { courseId, moduleId, feedback, followUp } = req.body;
        if (!feedback?.trim()) return res.status(400).json({ success: false, message: 'Feedback is required' });
        const record = await MentorFeedback.create({ mentor: req.user._id, student: req.params.studentId, course: courseId || undefined, moduleId, feedback: feedback.trim(), followUp: followUp?.trim() || '' });
        await Notification.create({ user: req.params.studentId, title: 'Mentor feedback received', message: feedback.trim().slice(0, 240), type: 'info', link: '/student/mentor-feedback' });
        res.status(201).json({ success: true, data: { feedback: record } });
    } catch (error) { next(error); }
};

exports.getFeedback = async (req, res, next) => {
    try {
        if (!await assigned(req.user._id, req.params.studentId)) return res.status(403).json({ success: false, message: 'This learner is not assigned to you' });
        const feedback = await MentorFeedback.find({ mentor: req.user._id, student: req.params.studentId }).populate('course', 'name code').sort('-createdAt');
        res.json({ success: true, data: { feedback } });
    } catch (error) { next(error); }
};

exports.createSession = async (req, res, next) => {
    try {
        const { studentId, date, topic, notes, feedback, followUp } = req.body;
        if (!await assigned(req.user._id, studentId)) return res.status(403).json({ success: false, message: 'This learner is not assigned to you' });
        if (!date || !topic?.trim() || !notes?.trim()) return res.status(400).json({ success: false, message: 'Student, date, topic and notes are required' });
        const session = await MentoringSession.create({ mentor: req.user._id, student: studentId, date, topic: topic.trim(), notes: notes.trim(), feedback: feedback?.trim() || '', followUp: followUp?.trim() || '' });
        res.status(201).json({ success: true, data: { session } });
    } catch (error) { next(error); }
};

exports.getSessions = async (req, res, next) => {
    try {
        const sessions = await MentoringSession.find({ mentor: req.user._id }).populate('student', 'firstName lastName email avatar').sort('-date');
        res.json({ success: true, data: { sessions } });
    } catch (error) { next(error); }
};
