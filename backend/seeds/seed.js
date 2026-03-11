require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Lecture = require('../models/Lecture');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const Attendance = require('../models/Attendance');
const Flashcard = require('../models/Flashcard');
const Reward = require('../models/Reward');
const Notification = require('../models/Notification');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // ─── Clear existing data ───
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Course.deleteMany({}),
            Enrollment.deleteMany({}),
            Lecture.deleteMany({}),
            Assessment.deleteMany({}),
            Question.deleteMany({}),
            Attendance.deleteMany({}),
            Flashcard.deleteMany({}),
            Reward.deleteMany({}),
            Notification.deleteMany({}),
        ]);

        // ─── Create Users ───
        console.log('👥 Creating users...');
        const hashedPassword = await bcrypt.hash('demo123', 12);

        const students = await User.insertMany([
            { firstName: 'Rahul', lastName: 'Sharma', email: 'student@demo.com', password: hashedPassword, role: 'student', studentId: 'STU001', grade: '3rd Year', section: 'A' },
            { firstName: 'Priya', lastName: 'Patel', email: 'priya@demo.com', password: hashedPassword, role: 'student', studentId: 'STU002', grade: '3rd Year', section: 'A' },
            { firstName: 'Arjun', lastName: 'Kumar', email: 'arjun@demo.com', password: hashedPassword, role: 'student', studentId: 'STU003', grade: '3rd Year', section: 'B' },
            { firstName: 'Sneha', lastName: 'Reddy', email: 'sneha@demo.com', password: hashedPassword, role: 'student', studentId: 'STU004', grade: '2nd Year', section: 'A' },
            { firstName: 'Vikram', lastName: 'Singh', email: 'vikram@demo.com', password: hashedPassword, role: 'student', studentId: 'STU005', grade: '2nd Year', section: 'B' },
        ]);

        const teachers = await User.insertMany([
            { firstName: 'Dr. Anand', lastName: 'Verma', email: 'teacher@demo.com', password: hashedPassword, role: 'teacher', department: 'Computer Science', specialization: 'Operating Systems' },
            { firstName: 'Prof. Meera', lastName: 'Iyer', email: 'meera@demo.com', password: hashedPassword, role: 'teacher', department: 'Computer Science', specialization: 'Data Structures' },
        ]);

        const parents = await User.insertMany([
            { firstName: 'Suresh', lastName: 'Sharma', email: 'parent@demo.com', password: hashedPassword, role: 'parent', children: [students[0]._id, students[3]._id] },
            { firstName: 'Lakshmi', lastName: 'Patel', email: 'lakshmi@demo.com', password: hashedPassword, role: 'parent', children: [students[1]._id] },
        ]);

        const admins = await User.insertMany([
            { firstName: 'Admin', lastName: 'User', email: 'admin@demo.com', password: hashedPassword, role: 'admin' },
        ]);

        // ─── Create Courses ───
        console.log('📚 Creating courses...');
        const courses = await Course.insertMany([
            { name: 'Operating Systems', code: 'OS101', description: 'Study of OS concepts including process management, memory management, and file systems', category: 'Computer Science', teacher: teachers[0]._id, chapters: [{ title: 'Process Management', order: 1 }, { title: 'Memory Management', order: 2 }, { title: 'File Systems', order: 3 }, { title: 'Deadlocks', order: 4 }] },
            { name: 'Database Management Systems', code: 'DBMS201', description: 'Fundamentals of database design, SQL, normalization, and transaction management', category: 'Computer Science', teacher: teachers[0]._id, chapters: [{ title: 'ER Modeling', order: 1 }, { title: 'Normalization', order: 2 }, { title: 'SQL Queries', order: 3 }, { title: 'Transaction Management', order: 4 }] },
            { name: 'Computer Networks', code: 'CN301', description: 'Network protocols, OSI model, routing, and network security', category: 'Computer Science', teacher: teachers[1]._id, chapters: [{ title: 'OSI Model', order: 1 }, { title: 'TCP/IP', order: 2 }, { title: 'Routing Algorithms', order: 3 }] },
            { name: 'Computer Organization & Architecture', code: 'COA401', description: 'CPU design, instruction sets, memory hierarchy, and I/O systems', category: 'Computer Science', teacher: teachers[1]._id, chapters: [{ title: 'CPU Design', order: 1 }, { title: 'Memory Hierarchy', order: 2 }, { title: 'I/O Systems', order: 3 }] },
            { name: 'Java Programming', code: 'JAVA501', description: 'Core Java, OOP, collections, multithreading, and Java EE basics', category: 'Programming', teacher: teachers[0]._id, chapters: [{ title: 'OOP Concepts', order: 1 }, { title: 'Collections Framework', order: 2 }, { title: 'Multithreading', order: 3 }] },
            { name: 'Python Programming', code: 'PY601', description: 'Python fundamentals, data structures, libraries, and scripting', category: 'Programming', teacher: teachers[1]._id, chapters: [{ title: 'Python Basics', order: 1 }, { title: 'Data Structures', order: 2 }, { title: 'Libraries & Frameworks', order: 3 }] },
            { name: 'Data Structures & Algorithms', code: 'DSA701', description: 'Arrays, linked lists, trees, graphs, sorting, and dynamic programming', category: 'Computer Science', teacher: teachers[1]._id, chapters: [{ title: 'Arrays & Linked Lists', order: 1 }, { title: 'Trees & Graphs', order: 2 }, { title: 'Sorting & Searching', order: 3 }, { title: 'Dynamic Programming', order: 4 }] },
            { name: 'Big Data Analytics', code: 'BD801', description: 'Hadoop, Spark, MapReduce, and big data processing techniques', category: 'Data Science', teacher: teachers[0]._id, chapters: [{ title: 'Hadoop Ecosystem', order: 1 }, { title: 'MapReduce', order: 2 }, { title: 'Apache Spark', order: 3 }] },
            { name: 'Aptitude & Reasoning', code: 'APT901', description: 'Quantitative aptitude, logical reasoning, and verbal ability', category: 'Aptitude', teacher: teachers[0]._id, chapters: [{ title: 'Quantitative Aptitude', order: 1 }, { title: 'Logical Reasoning', order: 2 }, { title: 'Verbal Ability', order: 3 }] },
            { name: 'Frontend Development', code: 'FE1001', description: 'HTML, CSS, JavaScript, React, and modern frontend practices', category: 'Web Development', teacher: teachers[1]._id, chapters: [{ title: 'HTML & CSS', order: 1 }, { title: 'JavaScript ES6+', order: 2 }, { title: 'React Fundamentals', order: 3 }] },
            { name: 'Backend Development', code: 'BE1101', description: 'Node.js, Express, REST APIs, databases, and server architecture', category: 'Web Development', teacher: teachers[0]._id, chapters: [{ title: 'Node.js Basics', order: 1 }, { title: 'Express.js', order: 2 }, { title: 'REST API Design', order: 3 }] },
        ]);

        // ─── Enrollments ───
        console.log('📝 Creating enrollments...');
        const enrollmentData = [];
        // Enroll first 3 students in first 6 courses
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 6; j++) {
                enrollmentData.push({
                    student: students[i]._id,
                    course: courses[j]._id,
                    progress: Math.floor(Math.random() * 80) + 10,
                });
            }
        }
        // Enroll remaining students in fewer courses
        for (let i = 3; i < 5; i++) {
            for (let j = 0; j < 4; j++) {
                enrollmentData.push({
                    student: students[i]._id,
                    course: courses[j]._id,
                    progress: Math.floor(Math.random() * 60) + 5,
                });
            }
        }
        await Enrollment.insertMany(enrollmentData);

        await Enrollment.insertMany(enrollmentData);

        // ─── Assessments + Questions ───
        console.log('📋 Creating assessments & questions...');
        for (const course of courses.slice(0, 4)) {
            // Practice test
            const practice = await Assessment.create({
                title: `${course.name} - Practice Test`,
                course: course._id,
                type: 'practice',
                description: `Practice test for ${course.name}`,
                totalMarks: 20,
                passingMarks: 8,
                duration: 30,
                difficulty: 'easy',
                maxAttempts: 999,
                createdBy: course.teacher,
                isPublished: true,
            });

            // Chapter test
            const chapterTest = await Assessment.create({
                title: `${course.name} - Chapter 1 Test`,
                course: course._id,
                chapter: course.chapters[0]?.title,
                type: 'chapter_test',
                description: `Chapter test on ${course.chapters[0]?.title}`,
                totalMarks: 30,
                passingMarks: 12,
                duration: 45,
                difficulty: 'medium',
                maxAttempts: 2,
                createdBy: course.teacher,
                isPublished: true,
            });

            // Final assessment
            const final = await Assessment.create({
                title: `${course.name} - Final Assessment`,
                course: course._id,
                type: 'final',
                description: `Comprehensive final assessment for ${course.name}`,
                totalMarks: 50,
                passingMarks: 20,
                duration: 90,
                difficulty: 'hard',
                maxAttempts: 1,
                createdBy: course.teacher,
                isPublished: true,
            });

            // Add MCQ questions to each
            for (const assessment of [practice, chapterTest, final]) {
                const qCount = assessment.type === 'practice' ? 4 : assessment.type === 'chapter_test' ? 6 : 10;
                const questions = [];
                for (let i = 0; i < qCount; i++) {
                    questions.push({
                        assessment: assessment._id,
                        type: 'mcq',
                        questionText: `${course.name} Question ${i + 1}: Which of the following is correct?`,
                        options: [
                            { text: 'Option A', isCorrect: i % 4 === 0 },
                            { text: 'Option B', isCorrect: i % 4 === 1 },
                            { text: 'Option C', isCorrect: i % 4 === 2 },
                            { text: 'Option D', isCorrect: i % 4 === 3 },
                        ],
                        marks: assessment.totalMarks / qCount,
                        difficulty: ['easy', 'medium', 'hard'][i % 3],
                        explanation: `The correct answer demonstrates a key concept in ${course.name}.`,
                        order: i,
                    });
                }
                // Add 1 descriptive question for chapter and final tests
                if (assessment.type !== 'practice') {
                    questions.push({
                        assessment: assessment._id,
                        type: 'descriptive',
                        questionText: `Explain the main concepts of ${course.chapters[0]?.title || course.name} in detail.`,
                        modelAnswer: `A comprehensive answer should cover the key principles, examples, and applications of the topic.`,
                        marks: 5,
                        maxWords: 300,
                        difficulty: 'medium',
                        order: qCount,
                    });
                }
                await Question.insertMany(questions);
            }
        }

        // ─── Attendance (30 days for first 3 students) ───
        console.log('📊 Creating attendance records...');
        const attendanceData = [];
        for (let day = 0; day < 30; day++) {
            const date = new Date();
            date.setDate(date.getDate() - day);
            date.setHours(0, 0, 0, 0);

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const rand = Math.random();
                    attendanceData.push({
                        student: students[i]._id,
                        course: courses[j]._id,
                        date,
                        status: rand > 0.15 ? 'present' : rand > 0.05 ? 'late' : 'absent',
                        markedBy: courses[j].teacher,
                    });
                }
            }
        }
        await Attendance.insertMany(attendanceData);

        // ─── Flashcards ───
        console.log('🃏 Creating flashcards...');
        const flashcardData = [
            { student: students[0]._id, course: courses[0]._id, chapter: 'Process Management', front: 'What is a process?', back: 'A process is a program in execution. It includes the program code, current activity, stack, data section, and heap.' },
            { student: students[0]._id, course: courses[0]._id, chapter: 'Process Management', front: 'What is a thread?', back: 'A thread is the smallest unit of execution within a process. Multiple threads share the same address space.' },
            { student: students[0]._id, course: courses[1]._id, chapter: 'Normalization', front: 'What is 3NF?', back: 'Third Normal Form: A table is in 3NF if it is in 2NF and no non-key attribute is transitively dependent on the primary key.' },
            { student: students[0]._id, course: courses[6]._id, chapter: 'Arrays & Linked Lists', front: 'Time complexity of array access?', back: 'O(1) — constant time, since arrays provide direct index-based access.' },
            { student: students[1]._id, course: courses[0]._id, chapter: 'Memory Management', front: 'What is virtual memory?', back: 'Virtual memory is a memory management technique that creates an illusion of a very large main memory by using disk space as an extension of RAM.' },
        ];
        await Flashcard.insertMany(flashcardData);

        // ─── Rewards ───
        console.log('🏆 Creating rewards...');
        await Reward.insertMany([
            { student: students[0]._id, type: 'badge', title: 'First Login', badge: 'first_login', points: 10 },
            { student: students[0]._id, type: 'points', title: 'Course Progress', description: 'Made great progress in OS', points: 25, course: courses[0]._id },
            { student: students[0]._id, type: 'badge', title: 'Explorer', badge: 'explorer', description: 'Enrolled in 5+ courses', points: 50 },
            { student: students[1]._id, type: 'badge', title: 'First Login', badge: 'first_login', points: 10 },
            { student: students[1]._id, type: 'points', title: 'Quick Learner', description: 'Completed first chapter', points: 20 },
            { student: students[2]._id, type: 'badge', title: 'First Login', badge: 'first_login', points: 10 },
        ]);

        // ─── Notifications ───
        console.log('🔔 Creating notifications...');
        await Notification.insertMany([
            { user: students[0]._id, title: 'Welcome to DLSES!', message: 'Start your learning journey by exploring available courses.', type: 'info' },
            { user: students[0]._id, title: 'New Assessment Available', message: 'OS Practice Test is now available. Good luck!', type: 'assignment' },
            { user: students[0]._id, title: 'Attendance Alert', message: 'Your attendance in DBMS has dropped below 80%.', type: 'warning' },
            { user: students[1]._id, title: 'Welcome to DLSES!', message: 'Start your learning journey by exploring courses.', type: 'info' },
            { user: teachers[0]._id, title: 'New Students Enrolled', message: '3 new students enrolled in Operating Systems.', type: 'info' },
            { user: parents[0]._id, title: 'Weekly Report', message: "Your child Rahul's weekly performance report is ready.", type: 'info' },
        ]);

        // ─── Done ───
        console.log('\n✅ Database seeded successfully!\n');
        console.log('══════════════════════════════════════════════════');
        console.log('📋 Demo Accounts (password: demo123)');
        console.log('══════════════════════════════════════════════════');
        console.log('Student:  student@demo.com');
        console.log('Student:  priya@demo.com');
        console.log('Teacher:  teacher@demo.com');
        console.log('Teacher:  meera@demo.com');
        console.log('Parent:   parent@demo.com');
        console.log('Admin:    admin@demo.com');
        console.log('══════════════════════════════════════════════════');
        console.log(`\n📊 Created: ${students.length} students, ${teachers.length} teachers, ${parents.length} parents, ${admins.length} admin`);
        console.log(`📚 Courses: ${courses.length}`);
        console.log(`📝 Enrollments: ${enrollmentData.length}`);
        console.log(`🎥 Lectures: ${lectureData.length}`);
        console.log(`📊 Attendance: ${attendanceData.length} records`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seed();
