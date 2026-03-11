const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const Flashcard = require('../models/Flashcard');
const Reward = require('../models/Reward');
const Notification = require('../models/Notification');
const ChatMessage = require('../models/ChatMessage');
const Activity = require('../models/Activity'); // Added
const User = require('../models/User'); // Added
const { getResponse } = require('../utils/chatbot');
const { streamFile } = require('../utils/fileStream');
const path = require('path');

/**
 * Helper: Update Student Daily Activity & Streak
 */
const updateDailyActivity = async (studentId, type, detail = '') => {
    try {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

        // 1. Update or Create Daily Activity Record
        let activity = await Activity.findOne({ student: studentId, dateString });
        if (!activity) {
            activity = await Activity.create({
                student: studentId,
                date: today,
                dateString,
                activities: [{ type, detail }]
            });
        } else {
            activity.activities.push({ type, detail });
            activity.points += 1;
            await activity.save();
        }

        // 2. Update Student Streak
        const user = await User.findById(studentId);
        if (user) {
            const lastActivity = user.lastActivityDate;
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            if (!lastActivity) {
                user.learningStreak = 1;
            } else {
                const last = new Date(lastActivity);
                last.setHours(0, 0, 0, 0);

                const diffTime = Math.abs(now - last);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    // Consecutive day
                    user.learningStreak += 1;
                } else if (diffDays > 1) {
                    // Missed days, reset streak
                    user.learningStreak = 1;
                }
                // If diffDays === 0, already active today, no change to streak
            }

            if (user.learningStreak > user.bestStreak) {
                user.bestStreak = user.learningStreak;
            }
            user.lastActivityDate = today;
            await user.save();
        }
    } catch (err) {
        console.error('Error updating daily activity:', err);
    }
};


/**
 * GET /api/student/dashboard
 */
exports.getDashboard = async (req, res, next) => {
    try {
        const studentId = req.user._id;

        const [enrollments, submissions, attendanceRecords, rewards, notifications, assessments] = await Promise.all([
            Enrollment.find({ student: studentId }).populate('course', 'name code'),
            Submission.find({ student: studentId }),
            Attendance.find({ student: studentId }).sort('-date'),
            Reward.find({ student: studentId }),
            Notification.find({ user: studentId, isRead: false }).sort('-createdAt').limit(5),
            Assessment.find({ isPublished: true, isActive: true }).populate('course', 'name'),
        ]);

        // Calculate stats
        const totalCourses = enrollments.length;
        const totalTests = submissions.length;
        const avgScore =
            submissions.length > 0
                ? Math.round(submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length)
                : 0;

        const presentCount = attendanceRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
        const attendancePercent =
            attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 100;

        const totalPoints = rewards.reduce((sum, r) => sum + r.points, 0);

        // New stats
        // Completed courses (progress = 100%)
        const completedCourses = enrollments.filter(e => e.progress >= 100).length;

        // Assessments logic
        const enrolledCourseIds = enrollments.map(e => e.course._id.toString());
        const attemptedAssessmentIds = submissions.map(s => s.assessment.toString());

        // Pending assignments (Practice assessments not yet attempted)
        const pendingAssignments = assessments.filter(a =>
            a.type === 'practice' &&
            enrolledCourseIds.includes(a.course._id.toString()) &&
            !attemptedAssessmentIds.includes(a._id.toString())
        ).length;

        // Upcoming tests (Tests not yet attempted)
        const upcomingTests = assessments.filter(a =>
            (a.type === 'topic_test' || a.type === 'final') &&
            enrolledCourseIds.includes(a.course._id.toString()) &&
            !attemptedAssessmentIds.includes(a._id.toString())
        ).length;

        // Current streak (consecutive days with activity)
        let currentStreak = 0;
        if (attendanceRecords.length > 0 || submissions.length > 0) {
            const activityDates = new Set();
            attendanceRecords.forEach(a => {
                const dateStr = new Date(a.date).toDateString();
                activityDates.add(dateStr);
            });
            submissions.forEach(s => {
                const dateStr = new Date(s.submittedAt).toDateString();
                activityDates.add(dateStr);
            });

            const sortedDates = Array.from(activityDates)
                .map(d => new Date(d))
                .sort((a, b) => b - a);

            let streak = 0;
            let expectedDate = new Date();
            expectedDate.setHours(0, 0, 0, 0);

            for (const activityDate of sortedDates) {
                const actDate = new Date(activityDate);
                actDate.setHours(0, 0, 0, 0);

                if (actDate.getTime() === expectedDate.getTime()) {
                    streak++;
                    expectedDate.setDate(expectedDate.getDate() - 1);
                } else if (actDate.getTime() < expectedDate.getTime()) {
                    break;
                }
            }
            currentStreak = streak;
        }

        res.json({
            success: true,
            data: {
                stats: {
                    totalCourses,
                    totalTests,
                    avgScore,
                    attendancePercent,
                    totalPoints,
                    unreadNotifications: notifications.length,
                    completedCourses,
                    pendingAssignments,
                    upcomingTests,
                    currentStreak,
                },
                recentCourses: enrollments,
                recentNotifications: notifications,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student/courses
 */
exports.getCourses = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate('course', 'name code description category chapters thumbnail teacher')
            .populate({
                path: 'course',
                populate: { path: 'teacher', select: 'firstName lastName' },
            });

        res.json({ success: true, data: { enrollments } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student/courses/available
 */
exports.getAvailableCourses = async (req, res, next) => {
    try {
        const enrolled = await Enrollment.find({ student: req.user._id }).select('course');
        const enrolledIds = enrolled.map((e) => e.course);

        const courses = await Course.find({ _id: { $nin: enrolledIds }, isActive: true })
            .populate('teacher', 'firstName lastName');

        res.json({ success: true, data: { courses } });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/student/enroll/:courseId
 */
exports.enrollCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const existing = await Enrollment.findOne({ student: req.user._id, course: course._id });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Already enrolled in this course' });
        }

        const enrollment = await Enrollment.create({
            student: req.user._id,
            course: course._id,
        });

        res.status(201).json({ success: true, data: { enrollment } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student/lectures/:courseId
 */
exports.getLectures = async (req, res, next) => {
    try {
        const lectures = await Lecture.find({ course: req.params.courseId, isActive: true })
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
 * POST /api/student/view-lecture/:id
 */
exports.viewLecture = async (req, res, next) => {
    try {
        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) {
            return res.status(404).json({ success: false, message: 'Lecture not found' });
        }

        // Track activity
        await updateDailyActivity(req.user._id, 'lecture_view', `Watched lecture: ${lecture.title}`);

        res.json({ success: true, message: 'Lecture view recorded' });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student/lectures/:lectureId/pdf
 */
exports.getLecturePDF = async (req, res, next) => {
    try {
        const lecture = await Lecture.findById(req.params.lectureId);
        if (!lecture) {
            return res.status(404).json({ success: false, message: 'Lecture not found' });
        }

        // Verify the student is enrolled in the course
        const enrollment = await Enrollment.findOne({ student: req.user._id, course: lecture.course });
        if (!enrollment) {
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

/**
 * GET /api/student/assessments
 */
exports.getAssessments = async (req, res, next) => {
    try {
        const enrolled = await Enrollment.find({ student: req.user._id }).select('course');
        const courseIds = enrolled.map((e) => e.course);

        const { type } = req.query;
        const filter = {
            course: { $in: courseIds },
            isPublished: true,
            isActive: true,
        };

        if (type) {
            if (type.includes(',')) {
                filter.type = { $in: type.split(',').map((t) => t.trim()) };
            } else {
                filter.type = type;
            }
        }

        const assessments = await Assessment.find(filter)
            .populate('course', 'name code')
            .sort('-createdAt');

        // Get submission counts for each assessment
        const submissions = await Submission.find({ student: req.user._id }).sort('-createdAt');
        const submissionMap = {};
        const statsMap = {};

        submissions.forEach((s) => {
            const aid = s.assessment.toString();
            // Count attempts
            submissionMap[aid] = (submissionMap[aid] || 0) + 1;
            // Store latest stats (since we sorted by -createdAt, the first one encountered is the latest)
            if (statsMap[aid] === undefined) {
                statsMap[aid] = {
                    percentage: s.percentage,
                    id: s._id,
                    obtained: s.totalMarks,
                    // If we have access to assessment possible marks here it's better, 
                    // but we'll use a's totalMarks during mapping.
                };
            }
        });

        const data = assessments.map((a) => ({
            ...a.toObject(),
            attempts: submissionMap[a._id.toString()] || 0,
            latestScore: statsMap[a._id.toString()]?.percentage,
            latestSubmissionId: statsMap[a._id.toString()]?.id,
            obtainedMarks: statsMap[a._id.toString()]?.obtained,
        }));

        res.json({ success: true, data: { assessments: data } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student/assessments/:id/questions
 */
exports.getAssessmentQuestions = async (req, res, next) => {
    try {
        const assessment = await Assessment.findById(req.params.id).populate('course', 'name');
        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        let questions = await Question.find({ assessment: assessment._id }).sort('order');

        // Hide correct answers for MCQ during test
        questions = questions.map((q) => {
            const qObj = q.toObject();
            if (qObj.type === 'mcq') {
                qObj.options = qObj.options.map((o) => ({ text: o.text, _id: o._id }));
            }
            delete qObj.modelAnswer;
            delete qObj.explanation;
            return qObj;
        });

        if (assessment.shuffleQuestions) {
            questions.sort(() => Math.random() - 0.5);
        }

        res.json({
            success: true,
            data: {
                assessment,
                questions,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/student/submit-test
 */
exports.submitTest = async (req, res, next) => {
    try {
        const { assessmentId, answers, timeTaken } = req.body;

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        // Check attempt limit
        const prevAttempts = await Submission.countDocuments({
            student: req.user._id,
            assessment: assessmentId,
        });
        if (prevAttempts >= assessment.maxAttempts) {
            return res.status(400).json({ success: false, message: 'Maximum attempts reached' });
        }

        // Fetch questions for auto-grading MCQs
        const questions = await Question.find({ assessment: assessmentId });
        const questionMap = {};
        questions.forEach((q) => {
            questionMap[q._id.toString()] = q;
        });

        let totalObtained = 0;
        const gradedAnswers = answers.map((ans) => {
            const q = questionMap[ans.question];
            if (!q) return { ...ans, marksAwarded: 0, isCorrect: false };

            if (q.type === 'mcq') {
                const isCorrect = q.options[ans.selectedOption]?.isCorrect || false;
                const marks = isCorrect ? q.marks : 0;
                totalObtained += marks;
                return {
                    question: ans.question,
                    selectedOption: ans.selectedOption,
                    marksAwarded: marks,
                    isCorrect,
                    feedback: isCorrect ? 'Correct!' : `Correct answer: ${q.options.find((o) => o.isCorrect)?.text}`,
                };
            }

            // Descriptive: pending manual grading
            return {
                question: ans.question,
                answerText: ans.answerText,
                marksAwarded: 0,
                isCorrect: null,
                feedback: 'Pending manual grading',
            };
        });

        const percentage = Math.round((totalObtained / assessment.totalMarks) * 100);

        const hasDescriptive = questions.some((q) => q.type === 'descriptive');

        const submission = await Submission.create({
            student: req.user._id,
            assessment: assessmentId,
            answers: gradedAnswers,
            totalMarks: totalObtained,
            percentage,
            status: hasDescriptive ? 'submitted' : 'graded',
            timeTaken,
            attemptNumber: prevAttempts + 1,
        });

        // Create result if fully graded (all MCQ)
        if (!hasDescriptive) {
            await Result.create({
                student: req.user._id,
                assessment: assessmentId,
                submission: submission._id,
                totalMarks: assessment.totalMarks,
                obtainedMarks: totalObtained,
                percentage,
                isPassed: totalObtained >= assessment.passingMarks,
            });
        }

        // --- NEW: Track Activity & Streak ---
        await updateDailyActivity(req.user._id, 'quiz_submit', `Submitted quiz: ${assessment.title}`);

        // Award points
        if (percentage >= 80) {
            await Reward.create({
                student: req.user._id,
                type: 'points',
                title: 'High Score!',
                description: `Scored ${percentage}% on ${assessment.title}`,
                points: percentage >= 90 ? 50 : 30,
                course: assessment.course,
            });
        }

        res.json({
            success: true,
            data: {
                submission,
                totalObtained,
                totalMarks: assessment.totalMarks,
                percentage,
                isPassed: totalObtained >= assessment.passingMarks,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student/submissions/:id/review
 */
exports.getSubmissionReview = async (req, res, next) => {
    try {
        const submission = await Submission.findOne({
            _id: req.params.id,
            student: req.user._id,
        }).populate('assessment', 'title type totalMarks passingMarks');

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        const questions = await Question.find({ assessment: submission.assessment._id }).sort('order');
        const questionMap = {};
        questions.forEach((q) => {
            questionMap[q._id.toString()] = q;
        });

        const reviewData = submission.answers.map((ans) => {
            const q = questionMap[ans.question.toString()];
            return {
                ...ans.toObject(),
                questionId: {
                    questionText: q?.questionText,
                    options: q?.options,
                    type: q?.type,
                    explanation: q?.explanation,
                },
            };
        });

        res.json({
            success: true,
            data: {
                submission: {
                    ...submission.toObject(),
                    answers: reviewData,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student/performance
 */
exports.getPerformance = async (req, res, next) => {
    try {
        let results = await Result.find({ student: req.user._id })
            .populate({
                path: 'assessment',
                select: 'title course type',
                populate: { path: 'course', select: 'name code' },
            })
            .sort('-createdAt');

        // Filter out results where the assessment might have been deleted (orphaned results)
        results = results.filter((r) => r.assessment);

        // Subject-wise aggregation
        const subjectWise = {};
        results.forEach((r) => {
            const courseName = r.assessment?.course?.name || 'Unknown';
            if (!subjectWise[courseName]) {
                subjectWise[courseName] = { scores: [], total: 0, count: 0 };
            }
            subjectWise[courseName].scores.push(r.percentage);
            subjectWise[courseName].total += r.percentage;
            subjectWise[courseName].count += 1;
        });

        const subjectAnalysis = Object.entries(subjectWise).map(([subject, data]) => ({
            subject,
            avgScore: Math.round(data.total / data.count),
            testCount: data.count,
            scores: data.scores,
        }));

        // Strengths (avg >= 70) and weaknesses (avg < 50)
        const strengths = subjectAnalysis.filter((s) => s.avgScore >= 70).map((s) => s.subject);
        const weaknesses = subjectAnalysis.filter((s) => s.avgScore < 50).map((s) => s.subject);

        res.json({
            success: true,
            data: {
                results,
                subjectAnalysis,
                strengths,
                weaknesses,
                totalTests: results.length,
                overallAvg:
                    results.length > 0
                        ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
                        : 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student/attendance
 */
exports.getAttendance = async (req, res, next) => {
    try {
        const records = await Attendance.find({ student: req.user._id })
            .populate('course', 'name code')
            .sort('-date');

        // Subject-wise summary
        const summary = {};
        records.forEach((r) => {
            const courseName = r.course?.name || 'Unknown';
            if (!summary[courseName]) {
                summary[courseName] = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
            }
            summary[courseName][r.status] += 1;
            summary[courseName].total += 1;
        });

        const subjectAttendance = Object.entries(summary).map(([subject, data]) => ({
            subject,
            ...data,
            percentage: Math.round(((data.present + data.late) / data.total) * 100),
        }));

        const totalPresent = records.filter((r) => r.status === 'present' || r.status === 'late').length;
        const overallPercentage = records.length > 0 ? Math.round((totalPresent / records.length) * 100) : 100;

        res.json({
            success: true,
            data: {
                records: records.slice(0, 30), // Last 30 records
                subjectAttendance,
                overallPercentage,
                lowAttendanceAlert: overallPercentage < 75,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student/flashcards
 */
exports.getFlashcards = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        const filter = { student: req.user._id };
        if (courseId) filter.course = courseId;

        const flashcards = await Flashcard.find(filter)
            .populate('course', 'name code')
            .sort('nextReview');

        const dueCards = flashcards.filter((f) => new Date(f.nextReview) <= new Date());

        res.json({
            success: true,
            data: {
                flashcards,
                dueCount: dueCards.length,
                totalCount: flashcards.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/student/flashcards
 */
exports.createFlashcard = async (req, res, next) => {
    try {
        const { course, chapter, front, back } = req.body;
        const flashcard = await Flashcard.create({
            student: req.user._id,
            course,
            chapter,
            front,
            back,
        });
        res.status(201).json({ success: true, data: { flashcard } });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/student/flashcards/:id/review
 * Update spaced repetition after review
 */
exports.reviewFlashcard = async (req, res, next) => {
    try {
        const { quality } = req.body; // 1-5 (changed from difficulty to match frontend)
        const card = await Flashcard.findOne({ _id: req.params.id, student: req.user._id });
        if (!card) {
            return res.status(404).json({ success: false, message: 'Flashcard not found' });
        }

        // SM-2 algorithm simplified
        const d = Math.max(1, Math.min(5, quality)); // Use quality instead of difficulty
        let ef = card.easeFactor + (0.1 - (5 - d) * (0.08 + (5 - d) * 0.02));
        ef = Math.max(1.3, ef);

        let interval;
        if (card.reviewCount === 0) interval = 1;
        else if (card.reviewCount === 1) interval = 6;
        else interval = Math.round(card.interval * ef);

        card.easeFactor = ef;
        card.interval = interval;
        card.reviewCount += 1;
        card.difficulty = d;
        card.nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

        await card.save();
        res.json({ success: true, data: { flashcard: card } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student/rewards
 */
exports.getRewards = async (req, res, next) => {
    try {
        const rewards = await Reward.find({ student: req.user._id })
            .populate('course', 'name')
            .sort('-earnedAt');

        const totalPoints = rewards.reduce((sum, r) => sum + r.points, 0);
        const badges = rewards.filter((r) => r.type === 'badge');

        res.json({
            success: true,
            data: { rewards, totalPoints, badges, badgeCount: badges.length },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/student/chat
 */
exports.chat = async (req, res, next) => {
    try {
        const { message } = req.body;
        const { response, category, isAI } = await getResponse(message); // Now async for AI

        const chatMsg = await ChatMessage.create({
            user: req.user._id,
            message,
            response,
            category,
            isAI,
        });

        res.json({
            success: true,
            data: {
                reply: response,
                chatMessage: chatMsg,
                isAI
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student/chat/history
 */
exports.getChatHistory = async (req, res, next) => {
    try {
        const messages = await ChatMessage.find({ user: req.user._id })
            .sort('-createdAt')
            .limit(50);

        res.json({ success: true, data: { messages: messages.reverse() } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/student/notifications
 */
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort('-createdAt')
            .limit(20);

        res.json({ success: true, data: { notifications } });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/student/notifications/:id/read
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

/**
 * GET /api/student/learning-journey
 */
exports.getLearningJourney = async (req, res, next) => {
    try {
        const activities = await Activity.find({ student: req.user._id }).sort('date');
        const user = await User.findById(req.user._id).select('learningStreak bestStreak lastActivityDate');

        res.json({
            success: true,
            data: {
                activities,
                streak: {
                    current: user.learningStreak,
                    best: user.bestStreak,
                    lastActive: user.lastActivityDate
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
