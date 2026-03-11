require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

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
            { firstName: 'Prof. Meera', lastName: 'Iyer', email: 'meera@demo.com', password: hashedPassword, role: 'teacher', department: 'Computer Science', specialization: 'Computer Architecture' },
            { firstName: 'Dr. Rajesh', lastName: 'Kumar', email: 'rajesh@demo.com', password: hashedPassword, role: 'teacher', department: 'Computer Science', specialization: 'Database Systems' },
        ]);

        const parents = await User.insertMany([
            { firstName: 'Amit', lastName: 'Shah', email: 'parent@demo.com', password: hashedPassword, role: 'parent', children: [students[0]._id, students[1]._id] },
            { firstName: 'Sunita', lastName: 'Reddy', email: 'sunita@demo.com', password: hashedPassword, role: 'parent', children: [students[2]._id, students[3]._id] },
        ]);

        const admins = await User.insertMany([
            { firstName: 'System', lastName: 'Admin', email: 'admin@demo.com', password: hashedPassword, role: 'admin' },
        ]);

        // ─── Create Courses ───
        console.log('📚 Creating courses...');
        const courses = await Course.insertMany([
            {
                name: 'Operating Systems',
                code: 'CS301',
                description: 'Fundamentals of operating system design, process management, memory management, and file systems.',
                category: 'Computer Science',
                teacher: teachers[0]._id,
                topics: [
                    { title: 'Introduction to OS', order: 1 },
                    { title: 'Process Management', order: 2 },
                    { title: 'CPU Scheduling', order: 3 },
                    { title: 'Process Synchronization', order: 4 },
                    { title: 'Deadlocks', order: 5 },
                    { title: 'Memory Management', order: 6 },
                    { title: 'File Systems', order: 7 },
                    { title: 'Storage Management', order: 8 },
                ],
                isActive: true,
            },
            {
                name: 'Computer Organization & Architecture',
                code: 'CS302',
                description: 'Digital logic, computer arithmetic, processor design, memory organization, and instruction set architecture.',
                category: 'Computer Science',
                teacher: teachers[1]._id,
                topics: [
                    { title: 'Digital Logic & Number Systems', order: 1 },
                    { title: 'Computer Arithmetic', order: 2 },
                    { title: 'Processor Organization', order: 3 },
                    { title: 'Memory Hierarchy', order: 4 },
                    { title: 'Instruction Set Architecture', order: 5 },
                ],
                isActive: true,
            },
            {
                name: 'Database Management Systems',
                code: 'CS303',
                description: 'Database design, SQL, normalization, transaction management, and query processing.',
                category: 'Computer Science',
                teacher: teachers[2]._id,
                topics: [
                    { title: 'Introduction to Databases', order: 1 },
                    { title: 'Relational Model', order: 2 },
                    { title: 'SQL Fundamentals', order: 3 },
                    { title: 'Database Design', order: 4 },
                    { title: 'Transaction Management', order: 5 },
                ],
                isActive: true,
            },
            {
                name: 'Java Programming',
                code: 'CS304',
                description: 'Object-oriented programming with Java, covering core concepts, collections, multithreading, and exception handling.',
                category: 'Programming',
                teacher: teachers[0]._id,
                topics: [
                    { title: 'Java Basics & Syntax', order: 1 },
                    { title: 'Object-Oriented Programming', order: 2 },
                    { title: 'Collections Framework', order: 3 },
                    { title: 'Exception Handling', order: 4 },
                    { title: 'Multithreading & Concurrency', order: 5 },
                ],
                isActive: true,
            },
            {
                name: 'Python Programming',
                code: 'CS305',
                description: 'Python fundamentals, data structures, file handling, libraries, and practical applications.',
                category: 'Programming',
                teacher: teachers[1]._id,
                topics: [
                    { title: 'Python Basics & Data Types', order: 1 },
                    { title: 'Control Flow & Functions', order: 2 },
                    { title: 'Data Structures in Python', order: 3 },
                    { title: 'File Handling & Modules', order: 4 },
                    { title: 'Libraries & Frameworks', order: 5 },
                ],
                isActive: true,
            },
            {
                name: 'Data Structures & Algorithms',
                code: 'CS306',
                description: 'Comprehensive study of data structures, algorithms, complexity analysis, and problem-solving techniques.',
                category: 'Computer Science',
                teacher: teachers[2]._id,
                topics: [
                    { title: 'Arrays & Linked Lists', order: 1 },
                    { title: 'Stacks, Queues & Trees', order: 2 },
                    { title: 'Graphs & Hashing', order: 3 },
                    { title: 'Sorting & Searching Algorithms', order: 4 },
                    { title: 'Dynamic Programming & Greedy Algorithms', order: 5 },
                ],
                isActive: true,
            },
            {
                name: 'C Programming',
                code: 'CS307',
                description: 'Foundation of programming with C language, covering syntax, pointers, memory management, and file operations.',
                category: 'Programming',
                teacher: teachers[0]._id,
                topics: [
                    { title: 'C Basics & Data Types', order: 1 },
                    { title: 'Control Structures & Functions', order: 2 },
                    { title: 'Arrays & Strings', order: 3 },
                    { title: 'Pointers & Memory Management', order: 4 },
                    { title: 'File Handling & Structures', order: 5 },
                ],
                isActive: true,
            },
            {
                name: 'Aptitude & Reasoning',
                code: 'APT101',
                description: 'Quantitative aptitude, logical reasoning, verbal ability, and analytical skills for competitive exams and placements.',
                category: 'Aptitude',
                teacher: teachers[1]._id,
                topics: [
                    { title: 'Quantitative Aptitude', order: 1 },
                    { title: 'Logical Reasoning', order: 2 },
                    { title: 'Verbal Ability', order: 3 },
                    { title: 'Data Interpretation', order: 4 },
                    { title: 'Analytical & Problem Solving', order: 5 },
                ],
                isActive: true,
            }, {
                name: 'Artificial Intelligence',
                code: 'AI101',
                description: 'Artificial Intelligence fundamentals, covering core concepts, applications, and recent advancements.',
                category: 'AI',
                teacher: teachers[1]._id,
                topics: [
                    { title: 'Introduction to AI', order: 1 },
                    { title: 'Machine Learning', order: 2 },
                    { title: 'Deep Learning', order: 3 },
                    { title: 'Natural Language Processing', order: 4 },
                    { title: 'Computer Vision', order: 5 },
                ],
                isActive: true,
            },
        ]);

        // ─── Enroll students in courses ───
        console.log('📝 Creating enrollments...');
        const enrollments = [];
        for (const student of students) {
            for (const course of courses) {
                enrollments.push({
                    student: student._id,
                    course: course._id,
                    enrolledAt: new Date(),
                    progress: Math.floor(Math.random() * 100),
                });
            }
        }
        await Enrollment.insertMany(enrollments);

        // ─── Create OS Lectures from CSV ───
        console.log('🎥 Seeding Operating Systems lectures from CSV...');
        const osCsvPath = path.join(__dirname, '..', '..', 'csvfiles', 'OS.csv');
        if (fs.existsSync(osCsvPath)) {
            const osCourseDoc = courses.find(c => c.code === 'CS301');
            const csvContent = fs.readFileSync(osCsvPath, 'utf8');
            const csvLines = csvContent.split('\n');
            const osLectures = [];

            for (let i = 1; i < csvLines.length; i++) {
                const line = csvLines[i].trim();
                if (!line) continue;
                const parts = line.split(',');
                if (parts.length < 3) continue;

                const pos = parseInt(parts[0]);
                const title = parts[1].replace(/"/g, '');
                const url = parts[2];

                let topic = 'Introduction to OS';
                if (pos >= 16 && pos <= 35) topic = 'Process Management';
                else if (pos >= 36 && pos <= 55) topic = 'CPU Scheduling';
                else if (pos >= 56 && pos <= 71) topic = 'Process Synchronization';
                else if (pos === 72) topic = 'Deadlocks';
                else if (pos >= 73 && pos <= 74) topic = 'Memory Management';
                else if (pos >= 75 && pos <= 76) topic = 'File Systems';
                else if (pos === 77) topic = 'Storage Management';

                osLectures.push({
                    title,
                    course: osCourseDoc._id,
                    topic,
                    type: 'video',
                    videoUrl: url,
                    description: title,
                    duration: '10:00',
                    uploadedBy: teachers[0]._id,
                    order: pos,
                });
            }
            await Lecture.insertMany(osLectures);
            console.log(`✅ Seeded ${osLectures.length} OS lectures.`);
        } else {
            console.warn('⚠️ OS CSV file not found, skipping lecture seed.');
        }

        // ─── Create Assessments with specific COA questions ───
        console.log('📝 Creating assessments with specific questions...');

        const coaCourse = courses.find(c => c.code === 'CS302');
        const osCourse = courses.find(c => c.code === 'CS301');
        const dbmsCourse = courses.find(c => c.code === 'CS303');

        // COA Assessments
        const coaPractice = await Assessment.create({
            title: 'COA - Practice Quiz',
            course: coaCourse._id,
            topic: 'Digital Logic & Number Systems',
            type: 'practice',
            description: 'Practice quiz on digital logic fundamentals',
            totalMarks: 20,
            passingMarks: 8,
            duration: 30,
            difficulty: 'easy',
            maxAttempts: 999,
            createdBy: teachers[1]._id,
            isPublished: true,
        });

        const coaChapterTest = await Assessment.create({
            title: 'COA - Chapter Test: Computer Arithmetic',
            course: coaCourse._id,
            topic: 'Computer Arithmetic',
            type: 'topic_test',
            description: 'Test on binary arithmetic, complements, and ALU operations',
            totalMarks: 30,
            passingMarks: 12,
            duration: 45,
            difficulty: 'medium',
            maxAttempts: 2,
            createdBy: teachers[1]._id,
            isPublished: true,
        });

        const coaFinal = await Assessment.create({
            title: 'COA - Final Assessment',
            course: coaCourse._id,
            type: 'final',
            description: 'Comprehensive final exam covering all COA topics',
            totalMarks: 50,
            passingMarks: 20,
            duration: 90,
            difficulty: 'hard',
            maxAttempts: 1,
            createdBy: teachers[1]._id,
            isPublished: true,
        });

        // Specific COA Questions
        const coaQuestions = [
            // Digital Logic Questions
            {
                assessment: coaPractice._id,
                type: 'mcq',
                questionText: 'What is the binary representation of the decimal number 13?',
                options: [
                    { text: '1101', isCorrect: false },
                    { text: '1100', isCorrect: false },
                    { text: '1110', isCorrect: false },
                    { text: '1101', isCorrect: true },
                ],
                marks: 5,
                difficulty: 'easy',
                explanation: '13 in decimal = 8 + 4 + 1 = 1101 in binary (8+4+1)',
                order: 1,
            },
            {
                assessment: coaPractice._id,
                type: 'mcq',
                questionText: 'Which logic gate implements the Boolean expression A + B (OR operation)?',
                options: [
                    { text: 'AND gate', isCorrect: false },
                    { text: 'OR gate', isCorrect: true },
                    { text: 'NOT gate', isCorrect: false },
                    { text: 'XOR gate', isCorrect: false },
                ],
                marks: 5,
                difficulty: 'easy',
                explanation: 'OR gate implements A + B. AND gate implements A·B, NOT implements A\'.',
                order: 2,
            },
            {
                assessment: coaPractice._id,
                type: 'mcq',
                questionText: 'What is the purpose of a multiplexer in digital circuits?',
                options: [
                    { text: 'To perform arithmetic operations', isCorrect: false },
                    { text: 'To select one of many input signals', isCorrect: true },
                    { text: 'To store data', isCorrect: false },
                    { text: 'To generate clock signals', isCorrect: false },
                ],
                marks: 5,
                difficulty: 'medium',
                explanation: 'A multiplexer (MUX) selects one of many input lines and directs it to a single output line.',
                order: 3,
            },
            {
                assessment: coaPractice._id,
                type: 'mcq',
                questionText: 'How many input combinations are possible for a 4-to-1 multiplexer?',
                options: [
                    { text: '4', isCorrect: false },
                    { text: '8', isCorrect: false },
                    { text: '16', isCorrect: true },
                    { text: '32', isCorrect: false },
                ],
                marks: 5,
                difficulty: 'medium',
                explanation: 'A 4-to-1 MUX has 4 input lines, so 2^4 = 16 possible input combinations.',
                order: 4,
            },

            // Computer Arithmetic Questions
            {
                assessment: coaChapterTest._id,
                type: 'mcq',
                questionText: 'What is the 2\'s complement of the binary number 1010?',
                options: [
                    { text: '0101', isCorrect: false },
                    { text: '0110', isCorrect: true },
                    { text: '1011', isCorrect: false },
                    { text: '1101', isCorrect: false },
                ],
                marks: 5,
                difficulty: 'medium',
                explanation: '2\'s complement: invert bits and add 1. 1010 inverted = 0101, +1 = 0110.',
                order: 1,
            },
            {
                assessment: coaChapterTest._id,
                type: 'mcq',
                questionText: 'In a floating-point representation, what does the mantissa represent?',
                options: [
                    { text: 'The exponent of the number', isCorrect: false },
                    { text: 'The fractional part of the number', isCorrect: true },
                    { text: 'The sign of the number', isCorrect: false },
                    { text: 'The entire number', isCorrect: false },
                ],
                marks: 5,
                difficulty: 'hard',
                explanation: 'In IEEE floating-point, mantissa represents the fractional (significand) part of the number.',
                order: 2,
            },
            {
                assessment: coaChapterTest._id,
                type: 'descriptive',
                questionText: 'Explain the difference between a ripple carry adder and a carry look-ahead adder. Include their advantages and disadvantages.',
                modelAnswer: 'A ripple carry adder generates carry signals that ripple through each stage, causing delay. A carry look-ahead adder computes carry signals in advance, reducing delay. CLA is faster but more complex. Ripple adder is simpler but slower for large numbers.',
                marks: 10,
                maxWords: 200,
                difficulty: 'hard',
                order: 6,
            },

            // Final Assessment Questions
            {
                assessment: coaFinal._id,
                type: 'mcq',
                questionText: 'What is the primary advantage of a Harvard architecture over von Neumann architecture?',
                options: [
                    { text: 'Faster execution speed', isCorrect: true },
                    { text: 'Better memory utilization', isCorrect: false },
                    { text: 'Simpler instruction set', isCorrect: false },
                    { text: 'Lower power consumption', isCorrect: false },
                ],
                marks: 5,
                difficulty: 'medium',
                explanation: 'Harvard architecture has separate instruction and data memories, allowing parallel access and faster execution.',
                order: 1,
            },
            {
                assessment: coaFinal._id,
                type: 'mcq',
                questionText: 'In pipelining, what is a pipeline hazard?',
                options: [
                    { text: 'When pipeline stages are idle', isCorrect: false },
                    { text: 'When instructions interfere with each other', isCorrect: true },
                    { text: 'When pipeline clock speed increases', isCorrect: false },
                    { text: 'When pipeline overflows', isCorrect: false },
                ],
                marks: 5,
                difficulty: 'hard',
                explanation: 'Pipeline hazards occur when instructions in pipeline depend on each other\'s results.',
                order: 2,
            },
            {
                assessment: coaFinal._id,
                type: 'descriptive',
                questionText: 'Design a 4-bit arithmetic logic unit (ALU) that can perform addition, subtraction, AND, OR, and NOT operations. Explain the control signals required.',
                modelAnswer: 'A 4-bit ALU requires: 1) Two 4-bit inputs (A and B), 2) 4-bit function select lines, 3) Control signals to select operation (ADD, SUB, AND, OR, NOT), 4) 4-bit output, 5) Carry-in and Carry-out flags. The function select determines which operation is performed on the inputs.',
                marks: 10,
                maxWords: 300,
                difficulty: 'hard',
                order: 10,
            },
        ];

        await Question.insertMany(coaQuestions);

        // ─── Flashcards ───
        console.log('🃏 Creating flashcards...');
        const flashcards = [];
        const coaFlashcards = [
            { student: students[0]._id, course: coaCourse._id, topic: 'Digital Logic', front: 'What is Boolean algebra?', back: 'Mathematical system for logical operations using variables and operators' },
            { student: students[0]._id, course: coaCourse._id, topic: 'Computer Arithmetic', front: 'What is signed magnitude representation?', back: 'Uses sign bit with magnitude, range: -(2^(n-1)-1) to +(2^(n-1)-1' },
            { student: students[0]._id, course: coaCourse._id, topic: 'Processor Organization', front: 'What is a register file?', back: 'Small, fast storage for CPU registers and temporary data' },
            { student: students[0]._id, course: coaCourse._id, topic: 'Memory Hierarchy', front: 'Cache hit vs miss?', back: 'Hit: data found in cache (fast), Miss: data not in cache (slow memory access)' },
        ];

        flashcards.push(...coaFlashcards);
        await Flashcard.insertMany(flashcards);

        // ─── Rewards ───
        console.log('🏆 Creating rewards...');
        const rewards = [];
        for (const student of students) {
            rewards.push(
                { student: student._id, type: 'points', title: 'Course Enrollment', points: 50, reason: 'Course enrollment', course: courses[0]._id },
                { student: student._id, type: 'points', title: 'First Assessment', points: 25, reason: 'First assessment completion', course: courses[0]._id },
                { student: student._id, type: 'badge', title: 'Quick Learner', badge: 'quick_learner', points: 0, reason: 'Quick Learner', course: courses[0]._id },
                { student: student._id, type: 'points', title: 'Perfect Score', points: 100, reason: 'Perfect score', course: courses[1]._id },
                { student: student._id, type: 'badge', title: 'COA Expert', badge: 'coa_expert', points: 0, reason: 'COA Expert', course: courses[1]._id },
            );
        }
        await Reward.insertMany(rewards);

        // ─── Notifications ───
        console.log('🔔 Creating notifications...');
        const notifications = [];
        for (const student of students) {
            notifications.push(
                { user: student._id, title: 'Welcome to DLSES!', message: 'Start exploring courses and assessments', type: 'info' },
                { user: student._id, title: 'New Assessment Available', message: 'COA Practice Quiz is now available', type: 'success' },
                { user: student._id, title: 'Study Reminder', message: 'Review your flashcards for better retention', type: 'warning' },
            );
        }
        await Notification.insertMany(notifications);

        console.log('🎉 Seeding completed successfully!');
        console.log(`📊 Created ${students.length} students, ${teachers.length} teachers, ${parents.length} parents, ${admins.length} admins`);
        console.log(`📚 Created ${courses.length} courses`);
        console.log(`📝 Created assessments with specific COA questions`);
        console.log(`🃏 Created ${flashcards.length} flashcards`);
        console.log(`🏆 Created ${rewards.length} rewards`);
        console.log(`🔔 Created ${notifications.length} notifications`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seed();
