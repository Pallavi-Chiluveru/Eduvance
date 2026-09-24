const assert = require('node:assert/strict');
const { test } = require('node:test');
const User = require('../models/User');
const controller = require('../controllers/instructorController');

test('application saves profile and document removals through existing fields', async () => {
  const original = User.findById;
  let saves = 0;
  const user = { _id: 'test', instructorVerification: { status: 'incomplete', emailVerified: true, resumeDocument: { storageId: 'old-resume' }, proofDocument: { storageId: 'old-proof' } }, async save() { saves++; } };
  User.findById = () => Object.assign(Promise.resolve(user), { select: async () => user });
  let body;
  try {
    const res = { json(value) { body = value; }, status(code) { this.code = code; return this; } };
    const next = error => { throw error; };
    await controller.updateApplication({ user: { _id: 'test' }, body: { organization: 'Institute', expertise: 'Web', qualification: 'M.Tech', experienceYears: 0, bio: 'Teaching practical web development.', removeResume: 'true' } }, res, next);
    assert.equal(saves, 1);
    assert.equal(body.data.user.instructorVerification.organization, 'Institute');
    assert.equal(user.instructorVerification.experienceYears, 0);
    assert.equal(user.instructorVerification.resumeDocument, undefined);
    assert.equal(user.instructorVerification.proofDocument.storageId, 'old-proof');
    await controller.updateApplication({ user: { _id: 'test' }, body: { removeProof: 'true' }, files: { proof: [{ filename: 'replacement', originalname: 'faculty.pdf', mimetype: 'application/pdf', size: 120 }] } }, res, next);
    assert.equal(user.instructorVerification.proofDocument.storageId, 'replacement');
    user.instructorVerification.status = 'pending';
    await controller.updateApplication({ user: { _id: 'test' }, body: { removeProof: 'true' } }, res, next);
    assert.equal(res.code, 409);
    assert.equal(saves, 2);
    assert.equal(user.instructorVerification.proofDocument.storageId, 'replacement');
  } finally { User.findById = original; }
});
