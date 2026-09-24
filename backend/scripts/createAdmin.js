const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin(env = process.env) {
    const name = String(env.ADMIN_NAME || '').trim().replace(/\s+/g, ' ');
    const email = String(env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Set valid ADMIN_NAME and ADMIN_EMAIL environment variables.');
    const existing = await User.findOne({ email }).setOptions({ includeDeleted: true });
    if (existing) {
        if (existing.role !== 'admin' || existing.isDeleted || !existing.isActive) throw new Error('Configured email belongs to another or inactive account. No account was changed.');
        return { created: false, user: existing };
    }
    const password = env.ADMIN_PASSWORD;
    if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) throw new Error('ADMIN_PASSWORD must contain at least 12 characters and at most 72 UTF-8 bytes.');
    const [firstName, ...rest] = name.split(' ');
    // User.create invokes the existing bcrypt pre-save hook exactly once.
    const user = await User.create({ firstName, lastName: rest.join(' '), email, password, role: 'admin', isActive: true });
    return { created: true, user };
}
if (require.main === module) {
    (async () => {
        try {
            if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
            await mongoose.connect(process.env.MONGO_URI);
            const result = await createAdmin();
            console.log(result.created ? 'Admin account created successfully.' : 'Admin account already exists.');
        } catch (error) {
            console.error(error.name === 'Error' ? error.message : 'Admin creation failed. Check configuration and database availability.');
            process.exitCode = 1;
        } finally { await mongoose.disconnect(); }
    })();
}
module.exports = { createAdmin };
