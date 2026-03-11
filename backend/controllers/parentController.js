const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

/**
 * GET /api/parent/dashboard
 */
exports.getDashboard = async (req, res, next) => {
    try {
        const parent = await User.findById(req.user._id).populate(
            'children',
            'firstName lastName email studentId avatar'
        );

        if (!parent.children || parent.children.length === 0) {
            return res.json({
                success: true,
                data: { children: [], message: 'No children linked to your account' },
            });
        }

        // Get notifications for parent
        const notifications = await Notification.find({ user: req.user._id, isRead: false })
            .sort('-createdAt')
            .limit(5);

        // Get summary for each child
        const childrenData = await Promise.all(
            parent.children.map(async (child) => {
                const [enrollmentCount, results, attendanceRecords] = await Promise.all([
                    Enrollment.countDocuments({ student: child._id }),
                    Result.find({ student: child._id }),
                    Attendance.find({ student: child._id }),
                ]);

                const avgScore =
                    results.length > 0
                        ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
                        : 0;

                const presentCount = attendanceRecords.filter(
                    (a) => a.status === 'present' || a.status === 'late'
                ).length;
                const attendancePercent =
                    attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 100;

                return {
                    child,
                    stats: {
                        totalCourses: enrollmentCount,
                        totalTests: results.length,
                        avgScore,
                        attendancePercent,
                    },
                };
            })
        );

        res.json({
            success: true,
            data: {
                children: childrenData,
                unreadNotifications: notifications.length,
                recentNotifications: notifications,
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/parent/child/:childId/performance
 */
exports.getChildPerformance = async (req, res, next) => {
    try {
        const parent = await User.findById(req.user._id);
        if (!parent.children.includes(req.params.childId)) {
            return res.status(403).json({ success: false, message: 'Not your child' });
        }

        const childId = req.params.childId;
        const child = await User.findById(childId).select('firstName lastName email studentId');

        const results = await Result.find({ student: childId })
            .populate({
                path: 'assessment',
                select: 'title course type',
                populate: { path: 'course', select: 'name code' },
            })
            .sort('-createdAt');

        // Subject-wise analysis
        const subjectWise = {};
        results.forEach((r) => {
            const courseName = r.assessment?.course?.name || 'Unknown';
            if (!subjectWise[courseName]) {
                subjectWise[courseName] = { total: 0, count: 0, scores: [] };
            }
            subjectWise[courseName].total += r.percentage;
            subjectWise[courseName].count += 1;
            subjectWise[courseName].scores.push({
                score: r.percentage,
                date: r.createdAt,
                test: r.assessment?.title,
            });
        });

        const subjectAnalysis = Object.entries(subjectWise).map(([subject, data]) => ({
            subject,
            avgScore: Math.round(data.total / data.count),
            testCount: data.count,
            scores: data.scores,
        }));

        // Class averages for comparison
        const classResults = await Result.find({});
        const classAvg =
            classResults.length > 0
                ? Math.round(classResults.reduce((s, r) => s + r.percentage, 0) / classResults.length)
                : 0;

        const overallAvg =
            results.length > 0
                ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
                : 0;

        res.json({
            success: true,
            data: {
                child,
                results,
                subjectAnalysis,
                overallAvg,
                classAvg,
                totalTests: results.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/parent/child/:childId/attendance
 */
exports.getChildAttendance = async (req, res, next) => {
    try {
        const parent = await User.findById(req.user._id);
        if (!parent.children.includes(req.params.childId)) {
            return res.status(403).json({ success: false, message: 'Not your child' });
        }

        const records = await Attendance.find({ student: req.params.childId })
            .populate('course', 'name code')
            .sort('-date')
            .limit(60);

        const summary = {};
        records.forEach((r) => {
            const cn = r.course?.name || 'Unknown';
            if (!summary[cn]) summary[cn] = { present: 0, absent: 0, late: 0, total: 0 };
            summary[cn][r.status] = (summary[cn][r.status] || 0) + 1;
            summary[cn].total += 1;
        });

        const totalPresent = records.filter((r) => r.status === 'present' || r.status === 'late').length;
        const overallPercent = records.length > 0 ? Math.round((totalPresent / records.length) * 100) : 100;

        res.json({
            success: true,
            data: {
                records: records.slice(0, 30),
                subjectSummary: Object.entries(summary).map(([subject, data]) => ({
                    subject,
                    ...data,
                    percentage: Math.round(((data.present + (data.late || 0)) / data.total) * 100),
                })),
                overallPercent,
                lowAttendanceAlert: overallPercent < 75,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/parent/child/:childId/activity
 */
exports.getChildActivity = async (req, res, next) => {
    try {
        const parent = await User.findById(req.user._id);
        if (!parent.children.includes(req.params.childId)) {
            return res.status(403).json({ success: false, message: 'Not your child' });
        }

        const submissions = await Submission.find({ student: req.params.childId })
            .populate('assessment', 'title course')
            .sort('-submittedAt')
            .limit(10);

        res.json({ success: true, data: { recentActivity: submissions } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/parent/notifications
 */
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort('-createdAt')
            .limit(50);

        res.json({ success: true, data: { notifications } });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/parent/notifications/:id/read
 */
exports.markNotificationRead = async (req, res, next) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true, readAt: new Date() }
        );
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        next(error);
    }
};

