const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const Result = require('../models/Result');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { streamFile } = require('../utils/fileStream');
const path = require('path');

/**
 * GET /api/teacher/dashboard
 */
exports.getDashboard = async (req, res, next) => {
    try {
        const teacherId = req.user._id;

        const courses = await Course.find({ teacher: teacherId });
        const courseIds = courses.map((c) => c._id);

        // Get student count for each course
        const coursesWithStudentCount = await Promise.all(
            courses.map(async (course) => {
                const studentCount = await Enrollment.countDocuments({ course: course._id });
                return {
                    ...course.toObject(),
                    studentCount
                };
            })
        );

        const assessmentIds = await Assessment.find({ createdBy: teacherId }).select('_id');

        const [totalStudents, totalAssessments, recentSubmissions, pendingGrading] = await Promise.all([
            Enrollment.countDocuments({ course: { $in: courseIds } }),
            Assessment.countDocuments({ createdBy: teacherId }),
            Submission.find({ assessment: { $in: assessmentIds } })
                .populate('student', 'firstName lastName')
                .populate('assessment', 'title')
                .sort('-createdAt')
                .limit(5),
            Submission.countDocuments({
                assessment: { $in: assessmentIds },
                status: 'submitted',
            }),
        ]);

        res.json({
            success: true,
            data: {
                stats: {
                    totalCourses: courses.length,
                    totalStudents,
                    totalAssessments,
                    pendingSubmissions: pendingGrading,
                },
                courses: coursesWithStudentCount,
                recentSubmissions,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/teacher/upload-content
 */
exports.uploadContent = async (req, res, next) => {
    try {
        const { title, courseId, chapter, type, videoUrl, description, duration } = req.body;

        const course = await Course.findOne({ _id: courseId, teacher: req.user._id });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found or not assigned to you' });
        }

        const lectureData = {
            title,
            course: courseId,
            chapter,
            type,
            description,
            duration,
            uploadedBy: req.user._id,
        };

        if (type === 'video') {
            lectureData.videoUrl = videoUrl;
        }
        if (req.file) {
            lectureData.fileUrl = `/uploads/${req.file.filename}`;
            lectureData.fileName = req.file.originalname;
        }

        const lecture = await Lecture.create(lectureData);

        // Notify enrolled students
        const enrollments = await Enrollment.find({ course: courseId });
        const notifications = enrollments.map((e) => ({
            user: e.student,
            title: 'New Content Available',
            message: `New ${type} "${title}" added to ${course.name}`,
            type: 'info',
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json({ success: true, data: { lecture } });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/teacher/create-assessment
 */
exports.createAssessment = async (req, res, next) => {
    try {
        const {
            title,
            course: courseId,
            chapter,
            type,
            description,
            instructions,
            totalMarks,
            passingMarks,
            duration,
            difficulty,
            shuffleQuestions,
            maxAttempts,
            questions,
        } = req.body;

        const course = await Course.findOne({ _id: courseId, teacher: req.user._id });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found or not assigned to you' });
        }

        const assessment = await Assessment.create({
            title,
            course: courseId,
            chapter,
            type,
            description,
            instructions,
            totalMarks,
            passingMarks,
            duration,
            difficulty,
            shuffleQuestions,
            maxAttempts: type === 'practice' ? 999 : maxAttempts || 1,
            createdBy: req.user._id,
            isPublished: true,
        });

        // Create questions if provided
        if (questions && questions.length > 0) {
            const questionDocs = questions.map((q, idx) => ({
                ...q,
                assessment: assessment._id,
                order: idx,
            }));
            await Question.insertMany(questionDocs);
        }

        res.status(201).json({ success: true, data: { assessment } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/teacher/submissions
 * Get submissions pending grading
 */
exports.getSubmissions = async (req, res, next) => {
    try {
        const courses = await Course.find({ teacher: req.user._id }).select('_id');
        const courseIds = courses.map(c => c._id);
        const assessmentIds = await Assessment.find({ course: { $in: courseIds } }).distinct('_id');

        const submissions = await Submission.find({
            assessment: { $in: assessmentIds },
            ...(req.query.status && { status: req.query.status }),
        })
            .populate('student', 'firstName lastName email studentId')
            .populate('assessment', 'title course totalMarks')
            .populate('answers.question', 'questionText type marks options')
            .sort('-submittedAt');

        res.json({ success: true, data: { submissions } });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/teacher/grade/:submissionId
 * Grade a submission (for descriptive questions)
 */
exports.gradeSubmission = async (req, res, next) => {
    try {
        const { answers, remarks } = req.body;
        const submission = await Submission.findById(req.params.submissionId);
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        const assessment = await Assessment.findById(submission.assessment);
        if (!assessment || assessment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to grade this submission' });
        }

        // Update answer marks
        let totalObtained = 0;
        submission.answers = submission.answers.map((ans) => {
            const update = answers?.find((a) => a.questionId === ans.question.toString());
            if (update) {
                ans.marksAwarded = update.marksAwarded;
                ans.feedback = update.feedback || '';
                ans.isCorrect = update.marksAwarded > 0;
            }
            totalObtained += ans.marksAwarded || 0;
            return ans;
        });

        submission.totalMarks = totalObtained;
        submission.percentage = Math.round((totalObtained / assessment.totalMarks) * 100);
        submission.status = 'graded';
        await submission.save();

        // Create or update result
        await Result.findOneAndUpdate(
            { student: submission.student, assessment: submission.assessment, submission: submission._id },
            {
                totalMarks: assessment.totalMarks,
                obtainedMarks: totalObtained,
                percentage: submission.percentage,
                isPassed: totalObtained >= assessment.passingMarks,
                remarks,
                gradedBy: req.user._id,
                gradedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        // Notify student
        await Notification.create({
            user: submission.student,
            title: 'Test Graded',
            message: `Your submission for "${assessment.title}" has been graded. Score: ${submission.percentage}%`,
            type: 'result',
        });

        // Notify parent
        const student = await User.findById(submission.student).select('firstName lastName');
        const parent = await User.findOne({ children: submission.student, role: 'parent' });
        if (parent) {
            await Notification.create({
                user: parent._id,
                title: 'Child Test Result',
                message: `${student?.firstName || 'Your child'} ${student?.lastName || ''} scored ${submission.percentage}% on "${assessment.title}"`,
                type: 'result',
            });
        }

        res.json({ success: true, data: { submission } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/teacher/analytics
 */
exports.getAnalytics = async (req, res, next) => {
    try {
        const courses = await Course.find({ teacher: req.user._id });
        const courseIds = courses.map((c) => c._id);

        const [assessments, attendanceRecords] = await Promise.all([
            Assessment.find({ course: { $in: courseIds } }),
            Attendance.find({ course: { $in: courseIds } })
        ]);

        const assessmentIds = assessments.map((a) => a._id);
        const results = await Result.find({ assessment: { $in: assessmentIds } })
            .populate('student', 'firstName lastName studentId')
            .populate('assessment', 'title course chapter');

        // 1. Basic Stats & KPIs
        const totalEnrollments = await Enrollment.countDocuments({ course: { $in: courseIds } });
        const avgAttendance = attendanceRecords.length > 0
            ? Math.round((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100)
            : 0;
        const avgGrade = results.length > 0
            ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
            : 0;
        const passRate = results.length > 0
            ? Math.round((results.filter(r => r.isPassed).length / results.length) * 100)
            : 0;

        // 2. Performance Distribution
        const performanceDistribution = [
            { name: 'Struggling (<40%)', value: results.filter(r => r.percentage < 40).length, color: '#ef4444' },
            { name: 'Average (40-75%)', value: results.filter(r => r.percentage >= 40 && r.percentage <= 75).length, color: '#f59e0b' },
            { name: 'Excelled (>75%)', value: results.filter(r => r.percentage > 75).length, color: '#10b981' }
        ];

        // 3. Student Rankings (Top/Weak)
        const studentScores = {};
        results.forEach((r) => {
            const sid = r.student?._id?.toString();
            if (!sid) return;
            if (!studentScores[sid]) {
                studentScores[sid] = { student: r.student, total: 0, count: 0 };
            }
            studentScores[sid].total += r.percentage;
            studentScores[sid].count += 1;
        });

        const rankings = Object.values(studentScores).map(s => ({
            student: s.student,
            avgPercentage: Math.round(s.total / s.count),
            testsCompleted: s.count
        })).sort((a, b) => b.avgPercentage - a.avgPercentage);

        // 4. Topic/Chapter Performance (Radar Data)
        const chapterScores = {};
        results.forEach(r => {
            const ch = r.assessment?.chapter || 'General';
            if (!chapterScores[ch]) chapterScores[ch] = { total: 0, count: 0 };
            chapterScores[ch].total += r.percentage;
            chapterScores[ch].count += 1;
        });
        const topicPerformance = Object.entries(chapterScores).map(([name, stats]) => ({
            subject: name,
            A: Math.round(stats.total / stats.count),
            fullMark: 100
        })).slice(0, 6);

        // 5. Engagement Trend (Last 14 days)
        const engagementTrend = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const submissionsCount = results.filter(r => r.createdAt.toISOString().split('T')[0] === dateStr).length;
            engagementTrend.push({ name: dateStr.split('-').slice(1).join('/'), active: submissionsCount });
        }

        // 6. AI Insights
        const aiInsights = [];
        if (passRate < 60) aiInsights.push("⚠️ Low Pass Rate: Consider reviewing recent complex topics.");
        if (rankings.filter(r => r.avgPercentage < 40).length > 3) {
            aiInsights.push("💡 Intervention Needed: Multiple students are consistently underperforming.");
        }
        if (passRate > 85) aiInsights.push("✨ Stellar Performance: Most students have mastered the current material.");

        res.json({
            success: true,
            data: {
                kpis: { avgAttendance, avgGrade, passRate, totalEnrollments },
                performanceDistribution,
                topicPerformance,
                engagementTrend,
                topPerformers: rankings.slice(0, 5),
                weakStudents: rankings.filter(r => r.avgPercentage < 40),
                aiInsights
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/teacher/attendance
 */
exports.markAttendance = async (req, res, next) => {
    try {
        const { courseId, date, records } = req.body;
        // records: [{ studentId, status }]

        const course = await Course.findOne({ _id: courseId, teacher: req.user._id });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const ops = records.map((r) => ({
            updateOne: {
                filter: { student: r.studentId, course: courseId, date: attendanceDate },
                update: {
                    $set: {
                        status: r.status,
                        markedBy: req.user._id,
                    },
                },
                upsert: true,
            },
        }));

        await Attendance.bulkWrite(ops);

        // Notify students marked absent
        const absentStudents = records.filter((r) => r.status === 'absent');
        if (absentStudents.length > 0) {
            const studentNotifications = absentStudents.map((r) => ({
                user: r.studentId,
                title: 'Attendance Alert',
                message: `You were marked absent in ${course.name} on ${attendanceDate.toDateString()}`,
                type: 'attendance',
            }));
            await Notification.insertMany(studentNotifications);

            // Notify parents of absent students
            const absentStudentIds = absentStudents.map(r => r.studentId);
            const students = await User.find({ _id: { $in: absentStudentIds } }).select('firstName lastName');
            const parents = await User.find({ children: { $in: absentStudentIds }, role: 'parent' });

            const parentNotifications = [];
            parents.forEach(parent => {
                parent.children.forEach(childId => {
                    if (absentStudentIds.some(id => id.toString() === childId.toString())) {
                        const student = students.find(s => s._id.toString() === childId.toString());
                        parentNotifications.push({
                            user: parent._id,
                            title: 'Child Absence Alert',
                            message: `${student?.firstName || 'Your child'} ${student?.lastName || ''} was marked absent in ${course.name} on ${attendanceDate.toDateString()}`,
                            type: 'attendance',
                        });
                    }
                });
            });

            if (parentNotifications.length > 0) {
                await Notification.insertMany(parentNotifications);
            }
        }

        res.json({ success: true, message: `Attendance marked for ${records.length} students` });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/teacher/attendance/:courseId
 */
exports.getAttendanceReport = async (req, res, next) => {
    try {
        const course = await Course.findOne({ _id: req.params.courseId, teacher: req.user._id });
        if (!course) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this course report' });
        }

        const records = await Attendance.find({ course: req.params.courseId })
            .populate('student', 'firstName lastName studentId')
            .sort('-date');

        res.json({ success: true, data: { records } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/teacher/courses
 */
exports.getCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({ teacher: req.user._id });

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
 * GET /api/teacher/students/:courseId
 */
exports.getCourseStudents = async (req, res, next) => {
    try {
        const course = await Course.findOne({ _id: req.params.courseId, teacher: req.user._id });
        if (!course) {
            return res.status(403).json({ success: false, message: 'Not authorized to view students for this course' });
        }

        const enrollments = await Enrollment.find({ course: req.params.courseId })
            .populate('student', 'firstName lastName email studentId');

        res.json({ success: true, data: { students: enrollments } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/teacher/courses/:courseId/lectures
 */
exports.getLectures = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;

        // Verify the teacher owns this course
        const course = await Course.findOne({ _id: courseId, teacher: req.user._id });
        if (!course) {
            return res.status(403).json({ success: false, message: 'Not authorized to view lectures for this course' });
        }

        const lectures = await Lecture.find({ course: courseId, isActive: true })
            .sort('topic order')
            .populate('uploadedBy', 'firstName lastName');

        // Group by topic
        const grouped = {};
        lectures.forEach((l) => {
            if (!grouped[l.topic]) grouped[l.topic] = [];
            grouped[l.topic].push(l);
        });

        res.json({ success: true, data: { lectures: grouped } });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/teacher/lectures
 */
exports.uploadLecture = async (req, res, next) => {
    try {
        const { title, course: courseId, topic, type, videoUrl, description, duration } = req.body;

        // Verify the teacher owns this course
        const course = await Course.findOne({ _id: courseId, teacher: req.user._id });
        if (!course) {
            return res.status(403).json({ success: false, message: 'Not authorized to upload content to this course' });
        }

        const lectureData = {
            title,
            course: courseId,
            topic,
            type,
            description,
            duration,
            uploadedBy: req.user._id,
        };

        if (type === 'video') {
            lectureData.videoUrl = videoUrl;
        } else if (req.file) {
            // Store relative URL path for web access
            // Convert: C:\...\uploads\lectures\courseId\file.pdf
            // To: /uploads/lectures/courseId/file.pdf
            const relativePath = req.file.path.split('uploads')[1];
            lectureData.fileUrl = '/uploads' + relativePath.replace(/\\/g, '/');
            lectureData.fileName = req.file.originalname;
        }

        const lecture = await Lecture.create(lectureData);

        res.status(201).json({
            success: true,
            message: 'Lecture uploaded successfully',
            data: { lecture },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/teacher/lectures/:lectureId
 */
exports.deleteLecture = async (req, res, next) => {
    try {
        const lecture = await Lecture.findById(req.params.lectureId);

        if (!lecture) {
            return res.status(404).json({ success: false, message: 'Lecture not found' });
        }

        // Verify the teacher owns this lecture OR the course
        const course = await Course.findById(lecture.course);
        const isOwner = lecture.uploadedBy.toString() === req.user._id.toString();
        const isCourseTeacher = course && course.teacher.toString() === req.user._id.toString();

        if (!isOwner && !isCourseTeacher) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this lecture' });
        }

        // Delete physical file if it exists
        if (lecture.fileUrl && lecture.type !== 'video') {
            const fs = require('fs');
            const path = require('path');

            // Convert URL path back to file system path
            // fileUrl format: /uploads/lectures/699.../file.pdf
            const filePath = path.join(__dirname, '..', lecture.fileUrl);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Lecture.findByIdAndDelete(req.params.lectureId);

        res.json({ success: true, message: 'Lecture deleted successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/teacher/lectures/:lectureId/pdf
 */
exports.getLecturePDF = async (req, res, next) => {
    try {
        const lecture = await Lecture.findById(req.params.lectureId);
        if (!lecture) {
            return res.status(404).json({ success: false, message: 'Lecture not found' });
        }

        // Verify the teacher owns this lecture OR the course
        const course = await Course.findById(lecture.course);
        const isOwner = lecture.uploadedBy.toString() === req.user._id.toString();
        const isCourseTeacher = course && course.teacher.toString() === req.user._id.toString();

        if (!isOwner && !isCourseTeacher) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this lecture' });
        }

        if (lecture.type !== 'pdf' || !lecture.fileUrl) {
            return res.status(400).json({ success: false, message: 'No PDF associated with this lecture' });
        }

        const filePath = path.join(__dirname, '..', lecture.fileUrl);
        streamFile(res, filePath, lecture.fileName);
    } catch (error) {
        next(error);
    }
};
