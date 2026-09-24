const assert = require('node:assert/strict');
const { test } = require('node:test');
const { PERIOD_MS, reapplicationState, rejectionUpdate } = require('../services/instructorReapplication');
const User = require('../models/User');
const Notification = require('../models/Notification');
const admin = require('../controllers/instructorAdminController');
const instructor = require('../controllers/instructorController');

test('period reset and cooldown boundaries use server dates, independent of process memory', () => {
    const start = new Date('2026-09-07T12:00:00Z');
    let v = { status: 'rejected' };
    for (let i = 1; i <= 3; i++) {
        const update = rejectionUpdate(v, 'admin', 'Reason', new Date(+start + i * 1000));
        v = { ...v, ...update };
        assert.equal(v.rejectionCount, i);
    }
    assert.equal(+v.reapplyAvailableAt, +start + 3000 + PERIOD_MS);
    assert.equal(reapplicationState(JSON.parse(JSON.stringify(v)), new Date(+v.reapplyAvailableAt - 1)).locked, true);
    const expired = reapplicationState(v, v.reapplyAvailableAt);
    assert.equal(expired.locked, false); assert.equal(expired.rejectionCount, 0);
    assert.equal(expired.eligibleAgain, true);
    assert.equal(reapplicationState({ ...v, status: 'approved' }, start).locked, false);
    for (const count of [1, 2]) {
        const old = { status: 'rejected', rejectionCount: count, rejectionWindowStartedAt: start };
        assert.equal(reapplicationState(old, new Date(+start + PERIOD_MS - 1)).rejectionCount, count);
        assert.equal(reapplicationState(old, new Date(+start + PERIOD_MS)).rejectionCount, 0);
        assert.equal(rejectionUpdate(old, 'admin', 'New period', new Date(+start + PERIOD_MS)).rejectionCount, 1);
    }
    assert.equal(reapplicationState({}).rejectionCount, 0);
});

test('existing review and submit handlers count only rejects, lock, reset, preserve audit, and ignore forged controls', async () => {
    const saved = { findById: User.findById, findOne: User.findOne, findOneAndUpdate: User.findOneAndUpdate, find: User.find, create: Notification.create };
    const user = { _id: { equals: () => false }, fullName: 'Test Instructor', instructorVerification: { status: 'pending', emailVerified: true, organization: 'Institute', expertise: 'Web', qualification: 'M.Tech', experienceYears: 0, bio: 'Practical teaching background.', resumeDocument: { storageId: 'cv.pdf' }, proofDocument: { storageId: 'proof.pdf' }, rejectionCount: 0, rejectionHistory: [], submissionHistory: [] }, async save() {} };
    const v = user.instructorVerification;
    let forceConflict = false;
    User.findOne = async () => user;
    User.findById = () => Object.assign(Promise.resolve(user), { select: async () => user });
    User.find = () => ({ select: async () => [] });
    Notification.create = async () => {};
    User.findOneAndUpdate = async (filter, update) => {
        if (forceConflict || filter['instructorVerification.status'] !== v.status) return null;
        for (const [key, value] of Object.entries(update.$set)) v[key.split('.')[1]] = value;
        for (const [key, value] of Object.entries(update.$push || {})) v[key.split('.')[1]].push(value);
        return user;
    };
    const call = async (handler, body = {}) => {
        const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
        await handler({ user: { _id: 'admin' }, params: { id: 'instructor' }, body }, res, error => { throw error; });
        return res;
    };
    try {
        assert.equal((await call(admin.review, { status: 'rejected', message: '' })).code, 400);
        assert.equal(v.rejectionCount, 0);
        for (let i = 0; i < 4; i++) {
            assert.equal((await call(admin.review, { status: 'changes_requested', message: 'Please update.' })).code, 200);
            assert.equal((await call(instructor.submit)).code, 200);
            assert.equal(v.rejectionCount, 0);
        }
        for (let i = 1; i <= 2; i++) {
            assert.equal((await call(admin.review, { status: 'rejected', message: `Reason ${i}` })).code, 200);
            assert.equal(v.rejectionCount, i);
            assert.equal(v.rejectionHistory.length, i);
            assert.equal((await call(admin.review, { status: 'rejected', message: 'Duplicate' })).code, 409);
            assert.equal((await call(instructor.updateApplication, { rejectionCount: 0, rejectionHistory: [], status: 'approved', reapplyAvailableAt: null })).code, 200);
            assert.equal(v.rejectionCount, i); assert.equal(v.status, 'rejected');
            assert.equal((await call(instructor.submit)).code, 200);
        }
        assert.equal((await call(admin.review, { status: 'rejected', message: 'Third' })).body.code, 'FINAL_REJECTION_CONFIRMATION_REQUIRED');
        assert.equal(v.rejectionCount, 2);
        forceConflict = true;
        assert.equal((await call(admin.review, { status: 'rejected', message: 'Third', confirmFinalRejection: true })).code, 409);
        assert.equal(v.rejectionCount, 2);
        forceConflict = false;
        assert.equal((await call(admin.review, { status: 'rejected', message: 'Third', confirmFinalRejection: true })).code, 200);
        assert.equal(v.rejectionCount, 3);
        assert.equal((await call(instructor.submit, { rejectionCount: 0 })).code, 403);
        assert.equal((await call(instructor.updateApplication, { reapplyAvailableAt: null })).code, 403);
        assert.equal(v.status, 'rejected'); assert.equal(v.rejectionHistory.length, 3);
        v.reapplyAvailableAt = new Date(Date.now() - 1);
        assert.equal((await call(instructor.submit)).code, 200);
        assert.equal(v.rejectionCount, 0); assert.equal(v.reapplyAvailableAt, null);
        assert.equal(v.rejectionHistory.length, 3);
        assert.ok(v.submissionHistory.length >= 7);
        assert.equal((await call(admin.review, { status: 'approved' })).code, 200);
        assert.equal(v.status, 'approved'); assert.equal(v.rejectionHistory.length, 3);
        assert.equal((await call(instructor.submit)).code, 409);
    } finally { Object.assign(User, { findById: saved.findById, findOne: saved.findOne, findOneAndUpdate: saved.findOneAndUpdate, find: saved.find }); Notification.create = saved.create; }
});


test('locked applications are stopped before upload middleware runs', () => {
    let continued = false;
    const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    instructor.requireEditable({ user: { instructorVerification: { status: 'rejected', rejectionCount: 3, reapplyAvailableAt: new Date(Date.now() + PERIOD_MS) } } }, res, () => { continued = true; });
    assert.equal(res.code, 403); assert.equal(continued, false);
    instructor.requireEditable({ user: { instructorVerification: { status: 'rejected', rejectionCount: 3, reapplyAvailableAt: new Date(Date.now() - 1) } } }, res, () => { continued = true; });
    assert.equal(continued, true);
});
