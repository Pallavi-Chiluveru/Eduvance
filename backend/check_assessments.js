const mongoose = require('mongoose');
require('dotenv').config();
const Assessment = require('./models/Assessment');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const assessments = await Assessment.find({}, 'title type course').lean();
    console.log(JSON.stringify(assessments, null, 2));
    process.exit(0);
});
