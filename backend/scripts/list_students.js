const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

async function listStudents() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const students = await User.find({ role: 'student' });
        console.log('--- Students ---');
        students.forEach(s => console.log(`${s.firstName} ${s.lastName} (${s.email})`));
        console.log('----------------');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listStudents();
