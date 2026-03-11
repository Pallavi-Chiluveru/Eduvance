const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');

/**
 * GET /api/admin/dashboard
 */
exports.getDashboard = async (req, res, next) => {
    try {
        const [
            totalStudents,
            totalTeachers,
            totalParents,
            totalAdmins,
            totalCourses,
            totalAssessments,
            activeUsers,
        ] = await Promise.all([
            User.countDocuments({ role: 'student', isActive: true }),
            User.countDocuments({ role: 'teacher', isActive: true }),
            User.countDocuments({ role: 'parent', isActive: true }),
            User.countDocuments({ role: 'admin', isActive: true }),
            Course.countDocuments({ isActive: true }),
            Assessment.countDocuments({ isActive: true }),
            User.countDocuments({
                isActive: true,
                lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            }),
        ]);

        const recentUsers = await User.find()
            .sort('-createdAt')
            .limit(5)
            .select('firstName lastName email role createdAt');

        res.json({
            success: true,
            data: {
                stats: {
                    totalStudents,
                    totalTeachers,
                    totalParents,
                    totalAdmins,
                    totalUsers: totalStudents + totalTeachers + totalParents + totalAdmins,
                    totalCourses,
                    totalAssessments,
                    activeUsersLast7Days: activeUsers,
                },
                recentUsers,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/users
 */
exports.getUsers = async (req, res, next) => {
    try {
        const { role, search, page = 1, limit = 20, status } = req.query;

        const filter = {};
        if (role) filter.role = role;
        if (status === 'active') filter.isActive = true;
        if (status === 'inactive') filter.isActive = false;
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/users
 */
exports.createUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role, phone, studentId, grade, section, children } = req.body;

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role,
            phone,
            studentId,
            grade,
            section,
            children,
        });

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/users/:id
 */
exports.updateUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, role, phone, isActive, grade, section, department, children } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName, email, role, phone, isActive, grade, section, department, children },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: { user } });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/admin/users/:id (soft delete)
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true, isActive: false },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User deactivated (soft deleted)' });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/users/:id/reset-password
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.params.id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/users/bulk-import
 * Accepts JSON array of users
 */
exports.bulkImportUsers = async (req, res, next) => {
    try {
        const { users } = req.body;
        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ success: false, message: 'Provide an array of users' });
        }

        const results = { created: 0, errors: [] };

        for (const userData of users) {
            try {
                await User.create(userData);
                results.created += 1;
            } catch (err) {
                results.errors.push({ email: userData.email, error: err.message });
            }
        }

        res.json({ success: true, data: results });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/courses
 */
exports.getCourses = async (req, res, next) => {
    try {
        const courses = await Course.find()
            .populate('teacher', 'firstName lastName email');

        const courseData = await Promise.all(
            courses.map(async (c) => {
                const studentCount = await Enrollment.countDocuments({ course: c._id });
                return { ...c.toObject(), studentCount };
            })
        );

        res.json({ success: true, data: { courses: courseData } });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/courses
 */
exports.createCourse = async (req, res, next) => {
    try {
        const { name, code, description, category, teacher, chapters } = req.body;

        const course = await Course.create({
            name,
            code,
            description,
            category,
            teacher,
            chapters,
        });

        res.status(201).json({ success: true, data: { course } });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/courses/:id
 */
exports.updateCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, data: { course } });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/enroll
 */
exports.enrollStudent = async (req, res, next) => {
    try {
        const { studentId, courseId } = req.body;
        const enrollment = await Enrollment.create({ student: studentId, course: courseId });
        res.status(201).json({ success: true, data: { enrollment } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/analytics
 */
exports.getSystemAnalytics = async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [
            usersByRole,
            newUsersLast30,
            totalSubmissions,
            avgScores,
        ] = await Promise.all([
            User.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$role', count: { $sum: 1 } } },
            ]),
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Submission.countDocuments(),
            Result.aggregate([
                { $group: { _id: null, avgPercentage: { $avg: '$percentage' } } },
            ]),
        ]);

        res.json({
            success: true,
            data: {
                usersByRole: usersByRole.reduce((acc, u) => ({ ...acc, [u._id]: u.count }), {}),
                newUsersLast30Days: newUsersLast30,
                totalSubmissions,
                platformAvgScore: avgScores[0]?.avgPercentage ? Math.round(avgScores[0].avgPercentage) : 0,
            },
        });
    } catch (error) {
        next(error);
    }
};
