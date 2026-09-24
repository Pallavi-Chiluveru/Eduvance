const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const User = require('../models/User');
const { generateAccessToken } = require('../config/jwt');

test('private document routes enforce ownership and admin access, preserve bytes and MIME types', async () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  const originalById = User.findById, originalFindOne = User.findOne;
  const folder = path.join(__dirname, '..', 'private-uploads', 'instructor-documents');
  await fs.mkdir(folder, { recursive: true });
  const created = [];
  const users = {
    owner: { _id: 'owner', role: 'instructor', isActive: true, instructorVerification: { status: 'pending' } },
    other: { _id: 'other', role: 'instructor', isActive: true, instructorVerification: {} },
    admin: { _id: 'admin', role: 'admin', isActive: true },
    student: { _id: 'student', role: 'student', isActive: true },
  };
  User.findById = async id => users[id];
  User.findOne = async query => users[query._id]?.role === query.role ? users[query._id] : null;
  const app = express();
  app.use('/api/instructor', require('../routes/instructor'));
  app.use('/api/admin', require('../routes/admin'));
  app.use((error, req, res, next) => { res.status(error.status || 500).json({ message: error.message }); });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const get = (url, id) => fetch(origin + url, { headers: id ? { Authorization: `Bearer ${generateAccessToken({ id })}` } : {} });
  try {
    for (const [extension, mime] of [['pdf', 'application/pdf'], ['png', 'image/png'], ['jpg', 'image/jpeg'], ['doc', 'application/msword'], ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']]) {
      const filename = `verification-test-${crypto.randomUUID()}.${extension}`;
      const bytes = Buffer.from(`private ${extension} fixture`);
      await fs.writeFile(path.join(folder, filename), bytes); created.push(filename);
      users.owner.instructorVerification.resumeDocument = { storageId: filename, originalName: `Original Name.${extension}`, mimeType: mime, size: bytes.length };
      users.owner.instructorVerification.proofDocument = users.owner.instructorVerification.resumeDocument;
      for (const kind of ['resume', 'proof']) {
        const owner = await get(`/api/instructor/verification/documents/${kind}`, 'owner');
        assert.equal(owner.status, 200);
        assert.equal(owner.headers.get('content-type'), mime);
        assert.equal(owner.headers.get('cache-control'), 'private, no-store');
        assert.equal(owner.headers.get('x-content-type-options'), 'nosniff');
        assert.deepEqual(Buffer.from(await owner.arrayBuffer()), bytes);
        const admin = await get(`/api/admin/instructors/owner/documents/${kind}`, 'admin');
        assert.equal(admin.status, 200);
        assert.deepEqual(Buffer.from(await admin.arrayBuffer()), bytes);
        assert.equal((await get(`/api/admin/instructors/owner/documents/${kind}`, 'other')).status, 403);
        assert.equal((await get(`/api/instructor/verification/documents/${kind}`, 'other')).status, 404);
        assert.equal((await get(`/api/instructor/verification/documents/${kind}`, 'student')).status, 403);
        assert.equal((await get(`/api/instructor/verification/documents/${kind}`)).status, 401);
        assert.equal((await get(`/api/admin/instructors/owner/documents/${kind}`)).status, 401);
      }
    }
    assert.equal((await get('/api/instructor/verification/documents/invalid', 'owner')).status, 400);
    users.owner.instructorVerification.resumeDocument.storageId = '../outside.pdf';
    assert.equal((await get('/api/instructor/verification/documents/resume', 'owner')).status, 404);
    users.owner.instructorVerification.resumeDocument.storageId = 'missing-file.pdf';
    assert.equal((await get('/api/instructor/verification/documents/resume', 'owner')).status, 404);
  } finally {
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    await Promise.all(created.map(filename => fs.unlink(path.join(folder, filename))));
    User.findById = originalById; User.findOne = originalFindOne;
    if (previousSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previousSecret;
  }
});
