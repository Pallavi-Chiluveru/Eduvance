const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Course = require('../models/Course');
const Assessment = require('../models/Assessment');
const Result = require('../models/Result');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dlses');
        console.log('Connected to MongoDB');

        // 1. Find or create a instructor
        let instructor = await User.findOne({ role: 'instructor' });
        if (!instructor) {
            instructor = await User.create({
                firstName: 'Demo',
                lastName: 'Instructor',
                studentId: 'T1001',
                email: 'instructor@demo.com',
                password: 'password123', // In a real app, hash this
                role: 'instructor'
            });
            console.log('Created demo instructor');
        }

        // 2. Create Students
        const studentNames = [
            ['Alice', 'Smith', 'S101'], ['Bob', 'Jones', 'S102'], ['Charlie', 'Brown', 'S103'],
            ['David', 'Wilson', 'S104'], ['Eve', 'Davis', 'S105'], ['Frank', 'Miller', 'S106'],
            ['Grace', 'Taylor', 'S107'], ['Hank', 'Anderson', 'S108']
        ];
        const students = [];
        for (const [f, l, id] of studentNames) {
            let s = await User.findOne({ studentId: id });
            if (!s) {
                s = await User.create({ firstName: f, lastName: l, studentId: id, email: `${id.toLowerCase()}@demo.com`, password: 'password123', role: 'student' });
            }
            students.push(s);
        }
        console.log('Students ready');

        // 3. Create Course
        let course = await Course.findOne({ name: 'Data Structures & Algorithms' });
        if (!course) {
            course = await Course.create({
                name: 'Data Structures & Algorithms',
                code: 'DSA101',
                description: 'Core concepts of DSA',
                instructor: instructor._id,
                chapters: ['Introduction', 'Arrays', 'Linked Lists', 'Stacks', 'Trees']
            });
        }
        console.log('Course ready');

        // 4. Enrollments
        for (const s of students) {
            await Enrollment.findOneAndUpdate(
                { student: s._id, course: course._id },
                { status: 'active' },
                { upsert: true }
            );
        }

        // 5. Assessments & Results
        const chapters = ['Arrays', 'Linked Lists', 'Stacks', 'Introduction'];
        for (const ch of chapters) {
            let assessment = await Assessment.findOne({ title: `${ch} Quiz`, course: course._id });
            if (!assessment) {
                assessment = await Assessment.create({
                    title: `${ch} Quiz`,
                    course: course._id,
                    chapter: ch,
                    type: 'topic_test',
                    totalMarks: 50,
                    passingMarks: 20,
                    duration: 30,
                    createdBy: instructor._id,
                    isPublished: true
                });
            }

            // Create Results for students
            for (const s of students) {
                const percentage = Math.floor(Math.random() * 60) + 40; // 40-100
                await Result.findOneAndUpdate(
                    { student: s._id, assessment: assessment._id },
                    {
                        score: (percentage / 100) * 50,
                        totalMarks: 50,
                        percentage,
                        isPassed: percentage >= 40,
                        grade: percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : 'D'
                    },
                    { upsert: true }
                );
            }
        }
        console.log('Assessments and Results seeded');

        // 6. Attendance
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            for (const s of students) {
                const status = Math.random() > 0.1 ? 'present' : 'absent';
                await Attendance.findOneAndUpdate(
                    { student: s._id, course: course._id, date: date.toISOString().split('T')[0] },
                    { status, markedBy: instructor._id },
                    { upsert: true }
                );
            }
        }
        console.log('Attendance seeded');

        console.log('\nSeeding Complete!');
        console.log('Email:', instructor.email);
        console.log('Password: password123');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
