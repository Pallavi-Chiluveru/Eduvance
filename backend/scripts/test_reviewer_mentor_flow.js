require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const CourseReview = require('../models/CourseReview');
const Assessment = require('../models/Assessment');
const MentorAssignment = require('../models/MentorAssignment');
const MentorFeedback = require('../models/MentorFeedback');
const MentoringSession = require('../models/MentoringSession');
const Notification = require('../models/Notification');
const { createAdmin } = require('./createAdmin');

const ids = { users: [], courses: [] };
const password = crypto.randomBytes(24).toString('hex');
const email = role => `role-flow-${role}-${crypto.randomUUID()}@example.invalid`;

async function session(address) {
    const csrfResponse = await fetch('http://localhost:5000/api/auth/csrf-token');
    const csrfBody = await csrfResponse.json();
    const headers = { 'Content-Type': 'application/json', Cookie: csrfResponse.headers.get('set-cookie').split(';')[0], 'X-CSRF-Token': csrfBody.data.csrfToken };
    const login = await fetch('http://localhost:5000/api/auth/login', { method: 'POST', headers, body: JSON.stringify({ email: address, password }) });
    const body = await login.json(); assert.equal(login.status, 200, body.message);
    headers.Authorization = `Bearer ${body.data.accessToken}`;
    return async (url, method = 'GET', data) => {
        const response = await fetch(`http://localhost:5000/api${url}`, { method, headers, ...(data && { body: JSON.stringify(data) }) });
        const json = await response.json(); return { status: response.status, body: json };
    };
}

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminEmail = email('admin');
        const adminResult = await createAdmin({ ADMIN_NAME: 'Role Flow Admin', ADMIN_EMAIL: adminEmail, ADMIN_PASSWORD: password });
        ids.users.push(adminResult.user._id);
        const instructor = await User.create({ firstName: 'Flow Instructor', email: email('instructor'), password, role: 'instructor', instructorVerification: { emailVerified: true, status: 'approved' } });
        const student = await User.create({ firstName: 'Assigned Student', email: email('student'), password, role: 'student' });
        const otherStudent = await User.create({ firstName: 'Private Student', email: email('other'), password, role: 'student' });
        ids.users.push(instructor._id, student._id, otherStudent._id);
        const admin = await session(adminEmail);
        const reviewerEmail = email('reviewer'), mentorEmail = email('mentor');
        const reviewerCreate = await admin('/admin/reviewers', 'POST', { firstName: 'Flow Reviewer', email: reviewerEmail, password });
        const mentorCreate = await admin('/admin/mentors', 'POST', { firstName: 'Flow Mentor', email: mentorEmail, password });
        assert.equal(reviewerCreate.status, 201); assert.equal(mentorCreate.status, 201);
        const reviewerId = reviewerCreate.body.data.user._id, mentorId = mentorCreate.body.data.user._id;
        ids.users.push(reviewerId, mentorId);
        const [reviewer, mentor, learner, instructorApi] = await Promise.all([session(reviewerEmail), session(mentorEmail), session(student.email), session(instructor.email)]);
        assert.equal((await learner('/reviewer/dashboard')).status, 403);
        assert.equal((await learner('/mentor/dashboard')).status, 403);
        assert.equal((await reviewer('/admin/dashboard')).status, 403);
        assert.equal((await reviewer('/admin/users')).status, 403);
        assert.equal((await reviewer('/admin/instructors')).status, 403);
        assert.equal((await reviewer('/admin/instructors//documents/resume')).status, 403);
        assert.equal((await learner('/auth/register', 'POST', { fullName: 'Public Reviewer Probe', email: email('public-reviewer'), password, role: 'reviewer' })).status, 400);
        assert.equal((await mentor('/reviewer/dashboard')).status, 403);
        assert.equal((await instructorApi('/admin/dashboard')).status, 403);
        console.log('Cross-role authorization boundaries: PASS');

        const courseCode = `RF-${crypto.randomBytes(3).toString('hex')}`.toUpperCase();
        const created = await instructorApi('/instructor/courses', 'POST', { name: 'Role Flow Course', code: courseCode, description: 'A complete course used for role workflow verification.', fullDescription: 'A complete and detailed course used to verify reviewer and mentor workflows.', language: 'English', durationHours: 5, category: 'Testing', difficulty: 'beginner', prerequisites: '', learningOutcomes: ['Understand the complete review lifecycle.'] });
        assert.equal(created.status, 201, created.body.message);
        const courseId = created.body.data.course._id; ids.courses.push(courseId);
        assert.equal((await reviewer(`/instructor/courses/${courseId}`, 'PUT', { name: 'Unauthorized edit' })).status, 403);
        const content = await instructorApi(`/instructor/courses/${courseId}`, 'PUT', { modules: [{ title: 'Module One', order: 1, lessons: [{ title: 'Lesson One', order: 1 }] }] }); assert.equal(content.status, 200);
        const assessment = await instructorApi('/instructor/create-assessment', 'POST', { title: 'Final Review Assignment', course: courseId, topic: 'Module One', type: 'final', assessmentType: 'assignment', description: 'Demonstrate the course outcomes.', instructions: 'Provide a detailed written response.', totalMarks: 10, passingMarks: 5, duration: 30, difficulty: 'medium' }); assert.equal(assessment.status, 201, assessment.body.message);
        const submitted = await instructorApi(`/instructor/courses/${courseId}/submit-review`, 'POST', {}); assert.equal(submitted.status, 200);
        assert.equal((await instructorApi(`/instructor/courses/${courseId}/submit-review`, 'POST', {})).status, 409);
        const pending = await reviewer('/reviewer/courses/pending'); assert.equal(pending.status, 200); assert.ok(pending.body.data.courses.some(item => item._id === courseId));
        assert.equal((await instructorApi(`/reviewer/courses/${courseId}/review`, 'POST', { decision: 'approved' })).status, 403);
        const preview = await reviewer(`/reviewer/courses/${courseId}`); assert.equal(preview.status, 200); assert.equal(preview.body.data.assessments.length, 1); assert.equal(preview.body.data.assessments[0].assessmentType, 'assignment');
        const changes = await reviewer(`/reviewer/courses/${courseId}/review`, 'POST', { decision: 'changes_requested', comments: 'Add a stronger final assessment.' }); assert.equal(changes.status, 200);
        const courseFeedback = await instructorApi(`/instructor/courses/${courseId}/reviews`); assert.equal(courseFeedback.status, 200); assert.equal(courseFeedback.body.data.reviews.length, 1); assert.equal(courseFeedback.body.data.reviews[0].decision, 'changes_requested');
        const edited = await instructorApi(`/instructor/courses/${courseId}`, 'PUT', { fullDescription: 'A revised and complete course with a stronger final assessment and detailed learning workflow.' }); assert.equal(edited.status, 200);
        const resubmitted = await instructorApi(`/instructor/courses/${courseId}/resubmit`, 'POST', {}); assert.equal(resubmitted.status, 200);
        assert.equal((await reviewer(`/reviewer/courses/${courseId}`)).status, 200);
        const approval = await reviewer(`/reviewer/courses/${courseId}/review`, 'POST', { decision: 'approved', comments: 'Requirements satisfied.' }); assert.equal(approval.status, 200);
        assert.equal(await CourseReview.countDocuments({ course: courseId }), 2);
        const publishedCourse = await Course.findById(courseId); assert.equal(publishedCourse.status, 'published'); assert.equal(publishedCourse.isActive, true);
        const availableCourses = await learner('/student/courses/available'); assert.equal(availableCourses.status, 200); assert.ok(availableCourses.body.data.courses.some(item => item._id === courseId));
        const activity = await admin(`/admin/reviewers/${reviewerId}/activity`); assert.equal(activity.status, 200); assert.equal(activity.body.data.reviews.length, 2);
        console.log('Complete Instructor submit, Reviewer changes, edit/resubmit, approval and immutable Admin-visible history: PASS');

        assert.equal((await mentor(`/mentor/students/${otherStudent._id}`)).status, 403);
        assert.equal((await admin(`/admin/mentors/${mentorId}/students/${student._id}`, 'POST', {})).status, 201);
        assert.equal((await mentor(`/mentor/students/${student._id}`)).status, 200);
        const feedback = await mentor(`/mentor/students/${student._id}/feedback`, 'POST', { feedback: 'Strong progress.', followUp: 'Complete the next module.' }); assert.equal(feedback.status, 201);
        const sessionRecord = await mentor('/mentor/sessions', 'POST', { studentId: student._id, date: new Date().toISOString(), topic: 'Progress review', notes: 'Reviewed current course progress.', followUp: 'Prepare questions.' }); assert.equal(sessionRecord.status, 201);
        const studentFeedback = await learner('/student/mentor-feedback'); assert.equal(studentFeedback.status, 200); assert.equal(studentFeedback.body.data.feedback.length, 1);
        assert.equal((await admin(`/admin/mentors/${mentorId}/students/${student._id}`, 'DELETE')).status, 200);
        assert.equal((await mentor(`/mentor/students/${student._id}`)).status, 403);
        console.log('Mentor assignment isolation, feedback, sessions and removal: PASS');
    } finally {
        await Promise.all([
            CourseReview.deleteMany({ course: { $in: ids.courses } }),
            Assessment.deleteMany({ course: { $in: ids.courses } }),
            MentorAssignment.deleteMany({ mentor: { $in: ids.users } }),
            MentorFeedback.deleteMany({ mentor: { $in: ids.users } }),
            MentoringSession.deleteMany({ mentor: { $in: ids.users } }),
            Notification.deleteMany({ user: { $in: ids.users } }),
        ]);
        await Course.deleteMany({ _id: { $in: ids.courses } });
        await User.deleteMany({ _id: { $in: ids.users } });
        await mongoose.disconnect();
        console.log('Reviewer/Mentor regression fixtures removed');
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
