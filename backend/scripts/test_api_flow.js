require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const Course = require('../models/Course');

const testApi = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        const osCourse = await Course.findOne({ code: 'CS301' });

        // Simulate getAssessments
        const assessment = await Assessment.findOne({
            title: 'Operating Systems - Video Companion Quiz',
            course: osCourse._id
        });

        if (!assessment) {
            console.log('❌ Assessment not found via query.');
            process.exit(0);
        }
        console.log(`✅ Found Assessment: ${assessment.title} (${assessment._id})`);

        // Simulate getAssessmentQuestions
        let questions = await Question.find({ assessment: assessment._id }).sort('order');
        console.log(`✅ Found ${questions.length} questions.`);

        if (questions.length > 0) {
            const q = questions[0];
            console.log('\n--- First Question Raw ---');
            console.log(JSON.stringify(q.toObject(), null, 2));

            // Simulate controller transformation
            const qObj = q.toObject();
            if (qObj.type === 'mcq') {
                try {
                    const transformedOptions = qObj.options.map((o) => ({ text: o.text, _id: o._id }));
                    console.log('\n--- Transformed Options ---');
                    console.log(transformedOptions);
                } catch (e) {
                    console.log('❌ Error transforming options:', e.message);
                }
            }
        } else {
            console.log('❌ No questions found for this assessment.');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testApi();
