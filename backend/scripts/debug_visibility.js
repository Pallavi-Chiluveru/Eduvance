const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Lecture = require('../models/Lecture');
const Assessment = require('../models/Assessment');

async function debugVisibility(email) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const student = await User.findOne({ email });
        if (!student) {
            console.error(`❌ Student not found: ${email}`);
            process.exit(1);
        }
        console.log(`👤 Found student: ${student.firstName} ${student.lastName} (${student._id})`);

        const enrollments = await Enrollment.find({ student: student._id }).populate('course');
        console.log(`📝 Enrolled in ${enrollments.length} courses:`);

        for (const enr of enrollments) {
            const course = enr.course;
            if (!course) {
                console.log('  ⚠️ Enrollment has no course linked');
                continue;
            }

            const lectureCount = await Lecture.countDocuments({ course: course._id, isActive: true });
            const assessmentCount = await Assessment.countDocuments({ course: course._id, isPublished: true, isActive: true });

            console.log(`  - ${course.name} [${course.code}] (${course._id}):`);
            console.log(`    🎥 Lectures: ${lectureCount}`);
            console.log(`    📋 Assessments: ${assessmentCount}`);

            if (assessmentCount > 0) {
                const quiz = await Assessment.findOne({ course: course._id, isPublished: true, isActive: true });
                console.log(`    Sample Quiz: ${quiz.title} (Published: ${quiz.isPublished}, Active: ${quiz.isActive})`);
            }
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugVisibility('girishchieveru@gmail.com');
