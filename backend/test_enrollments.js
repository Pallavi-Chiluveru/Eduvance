const mongoose = require('mongoose');
const Enrollment = require('./models/Enrollment');
const Course = require('./models/Course');
const Assessment = require('./models/Assessment');
const Question = require('./models/Question');

async function run() {
    await mongoose.connect('mongodb://localhost:27017/dlses');
    const enrollments = await Enrollment.find().populate('course');
    console.log(`Total Enrollments: ${enrollments.length}`);
    for (const e of enrollments) {
        if (!e.course) continue;
        console.log(`\nCourse: ${e.course.name} (${e.course._id})`);
        const finalAss = await Assessment.findOne({ course: e.course._id, type: 'final' });
        console.log(`  Final Assessment: ${finalAss ? 'Yes' : 'No'}`);
        const topicAss = await Assessment.find({ course: e.course._id, type: { $ne: 'final' } });
        console.log(`  Topic Assessments: ${topicAss.length}`);
        const topicAssIds = topicAss.map(a => a._id);
        const questions = await Question.find({ assessment: { $in: topicAssIds } });
        console.log(`  Questions: ${questions.length}`);
    }
    process.exit(0);
}
run();
