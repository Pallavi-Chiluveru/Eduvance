require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createAdmin } = require('./createAdmin');
const ids = [], files = [];
const password = crypto.randomBytes(24).toString('hex');
const email = () => `admin-flow-${crypto.randomUUID()}@example.invalid`;
async function session(address) {
    const r = await fetch('http://localhost:5000/api/auth/csrf-token');
    const csrf = (await r.json()).data.csrfToken;
    const headers = { 'Content-Type': 'application/json', Cookie: r.headers.get('set-cookie').split(';')[0], 'X-CSRF-Token': csrf };
    const login = await fetch('http://localhost:5000/api/auth/login', { method: 'POST', headers, body: JSON.stringify({ email: address, password }) });
    const body = await login.json(); assert.equal(login.status, 200);
    headers.Authorization = `Bearer ${body.data.accessToken}`;
    const request = async (url, method = 'GET', data) => {
        const response = await fetch(`http://localhost:5000/api${url}`, { method, headers, ...(data && { body: JSON.stringify(data) }) });
        const json = await response.json(); return { status: response.status, body: json };
    };
    request.document = async url => { const r = await fetch(`http://localhost:5000/api${url}`, { headers }); const text = await r.text(); return { status: r.status, text }; };
    return request;
}
(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const env = { ADMIN_NAME: 'Regression Admin', ADMIN_EMAIL: email(), ADMIN_PASSWORD: password };
        const first = await createAdmin(env); ids.push(first.user._id);
        assert.equal(first.created, true); assert.equal((await createAdmin(env)).created, false);
        const stored = await User.findById(first.user._id).select('+password');
        assert.notEqual(stored.password, password); assert.equal(await stored.comparePassword(password), true);
        console.log('Internal admin creation, bcrypt and idempotency: PASS');
        const instructor = await User.create({ firstName: 'Regression Instructor', email: email(), password, role: 'instructor' }); ids.push(instructor._id);
        const student = await User.create({ firstName: 'Regression Student', email: email(), password, role: 'student' }); ids.push(student._id);
        const admin = await session(env.ADMIN_EMAIL), instructorSession = await session(instructor.email), learner = await session(student.email);
        assert.equal((await admin('/admin/dashboard')).status, 200);
        for (const api of [instructorSession, learner]) {
            assert.equal((await api('/admin/instructors')).status, 403);
            assert.equal((await api(`/admin/instructors/${instructor._id}/review`, 'PATCH', { status: 'approved' })).status, 403);
            assert.equal((await api(`/admin/instructors/${instructor._id}/documents/resume`)).status, 403);
        }
        assert.equal((await instructorSession('/instructor/dashboard')).status, 403);
        assert.equal((await admin(`/admin/users/${first.user._id}`, 'PUT', { role: 'student' })).status, 403);
        assert.equal((await learner('/auth/register', 'POST', { fullName: 'Illegal Admin', email: email(), password, role: 'admin' })).status, 400);
        console.log('Normal login, role protection, self-protection, no public admin registration: PASS');
        const folder = path.join(__dirname, '..', 'private-uploads', 'instructor-documents');
        await fs.mkdir(folder, { recursive: true });
        const filename = `regression-${crypto.randomUUID()}.pdf`; const filepath = path.join(folder, filename); files.push(filepath);
        await fs.writeFile(filepath, '%PDF-1.4\n% Test private document\n');
        await User.updateOne({ _id: instructor._id }, { $set: { instructorVerification: { emailVerified: true, status: 'pending', organization: 'Test College', expertise: 'Testing', qualification: 'M.Tech', experienceYears: 0, bio: 'Regression test', submittedAt: new Date(), resumeDocument: { storageId: filename, originalName: 'resume.pdf' }, proofDocument: { storageId: filename, originalName: 'proof.pdf' } } } });
        for (const kind of ['resume', 'proof']) {
            const doc = await admin.document(`/admin/instructors/${instructor._id}/documents/${kind}`);
            assert.equal(doc.status, 200); assert.ok(doc.text.startsWith('%PDF'));
            assert.equal((await instructorSession.document(`/instructor/verification/documents/${kind}`)).status, 200);
        }
        console.log('Private document retrieval by admin and owner: PASS');
        assert.ok((await admin('/admin/instructors')).body.data.instructors.some(u => u._id === String(instructor._id)));
        assert.equal((await admin(`/admin/instructors/${instructor._id}`)).status, 200);
        assert.equal((await admin(`/admin/instructors/${instructor._id}/review`, 'PATCH', { status: 'changes_requested', message: 'Please clarify experience.' })).status, 200);
        assert.equal((await instructorSession('/instructor/verification')).body.data.user.instructorVerification.adminMessage, 'Please clarify experience.');
        assert.equal((await instructorSession('/instructor/verification', 'PUT', { bio: 'Updated professional bio' })).status, 200);
        assert.equal((await instructorSession('/instructor/verification/submit', 'POST', {})).status, 200);
        assert.equal((await admin(`/admin/instructors/${instructor._id}/review`, 'PATCH', { status: 'rejected', message: 'Proof not sufficient.' })).status, 200);
        assert.equal((await instructorSession('/instructor/verification/submit', 'POST', {})).status, 200);
        assert.equal((await admin(`/admin/instructors/${instructor._id}/review`, 'PATCH', { status: 'approved' })).status, 200);
        const approved = await User.findById(instructor._id);
        assert.equal(String(approved.instructorVerification.reviewedBy), String(first.user._id)); assert.ok(approved.instructorVerification.reviewedAt);
        assert.equal((await instructorSession('/instructor/dashboard')).status, 200);
        assert.equal((await instructorSession('/instructor/verification/submit', 'POST', {})).status, 409);
        assert.equal((await admin(`/admin/instructors/${instructor._id}/review`, 'PATCH', { status: 'approved' })).status, 409);
        console.log('Changes, edit/resubmit, rejection, approval, audit fields and dashboard unlock: PASS');
        assert.equal(await Notification.countDocuments({ user: instructor._id }), 3);
        console.log('Instructor decision notifications: PASS');
    } finally {
        await Notification.deleteMany({ user: { $in: ids } });
        // Submission also notifies real admins: remove only this fixture's submission notifications.
        await Notification.deleteMany({ title: 'New Instructor Request', message: 'Regression Instructor submitted an instructor verification request.' });
        await User.deleteMany({ _id: { $in: ids } });
        for (const file of files) await fs.unlink(file);
        await mongoose.disconnect();
        console.log('Regression accounts, documents and notifications removed');
    }
})().catch(error => { console.error(error.name, error.message); process.exitCode = 1; });
