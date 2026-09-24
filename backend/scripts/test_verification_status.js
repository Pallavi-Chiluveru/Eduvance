require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const controller = require('../controllers/instructorController');
const { generateAccessToken } = require('../config/jwt');

(async () => {
    let user;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        user = await User.create({ firstName: 'Verification regression', email: `verification-${crypto.randomUUID()}@example.invalid`, password: crypto.randomBytes(24).toString('hex'), role: 'instructor', instructorVerification: {
            emailVerificationCodeHash: crypto.randomBytes(32).toString('hex'),
            emailVerificationExpires: new Date(Date.now() + 900000),
            emailVerificationLastSentAt: new Date(),
        } });
        let body;
        await controller.status({ user: { _id: user._id } }, { json(value) { body = value; } }, error => { throw error; });
        assert.equal(body.success, true);
        assert.equal(body.data.emailVerification.hasActiveCode, true);
        assert.equal(body.data.user.instructorVerification.emailVerificationCodeHash, undefined);
        assert.equal(body.data.user.instructorVerification.emailVerificationExpires, undefined);
        assert.equal(body.data.user.password, undefined);
        console.log('Database status query and safe response: PASS');
        const token = generateAccessToken({ id: user._id, role: 'instructor' });
        for (const origin of ['http://localhost:5000', 'http://localhost:5173']) {
            const response = await fetch(`${origin}/api/instructor/verification`, { headers: { Authorization: `Bearer ${token}` } });
            const result = await response.json();
            assert.equal(response.status, 200);
            assert.equal(result.data.emailVerification.hasActiveCode, true);
            assert.equal(result.data.user.instructorVerification.emailVerificationCodeHash, undefined);
            console.log(`${origin}: authenticated verification endpoint PASS (200)`);
        }
    } finally {
        if (user) await User.deleteOne({ _id: user._id });
        await mongoose.disconnect();
        console.log('Temporary test account removed');
    }
})().catch(error => { console.error(error.name, error.message); process.exitCode = 1; });
