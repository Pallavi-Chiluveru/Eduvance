require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Assessment = require('./models/Assessment');
const Submission = require('./models/Submission');

const demonstrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const student = await User.findOne({ email: 'student@demo.com' });
        if (!student) {
            console.error('Student not found');
            process.exit(1);
        }
        console.log(`Found student: ${student.firstName} ${student.lastName} (${student.email})`);

        const enrollments = await Enrollment.find({ student: student._id }).populate('course');
        if (enrollments.length === 0) {
            console.error('No enrollments found for student');
            process.exit(1);
        }
        const firstCourse = enrollments[0].course;
        console.log(`Using course for demo: ${firstCourse.name} (${firstCourse.code})`);

        const teacher = await User.findOne({ role: 'teacher' });

        // Function to create an assessment
        const createDemoAssessment = async (title, type) => {
            console.log(`Creating assessment: ${title} of type ${type}...`);
            const assessment = await Assessment.create({
                title,
                course: firstCourse._id,
                type,
                description: `Demo ${type} for ${firstCourse.name}`,
                totalMarks: 10,
                passingMarks: 4,
                duration: 10,
                createdBy: teacher._id,
                isPublished: true,
                isActive: true
            });
            return assessment;
        };

        // 1. Create a Practice Assessment (Pending)
        const practice = await createDemoAssessment('DEMO: New Practice Assignment', 'practice');
        console.log(`✅ Created Pending Assignment ID: ${practice._id}`);

        // 2. Create a Topic Test (Upcoming)
        const topicTest = await createDemoAssessment('DEMO: New Topic Test', 'topic_test');
        console.log(`✅ Created Upcoming Test ID: ${topicTest._id}`);

        console.log('\n--- DEMONSTRATION READY ---');
        console.log('1. Open Student Dashboard (student@demo.com / demo123)');
        console.log('2. Observe "Pending Assignments" and "Upcoming Tests" values.');
        console.log('3. These should have increased by 1 each.');
        console.log('4. Go to Assessments, take/submit one of the demo tests.');
        console.log('5. Observe the dashboard count decrease.');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error during demo setup:', err);
        process.exit(1);
    }
};

demonstrate();
