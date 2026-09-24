import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emptyProfile, profileErrors, initialStep, fileError } from '../src/pages/teacher/verificationHelpers.mjs';
const profile = { organization: 'Institute', expertise: 'Web Development', qualification: 'M.Tech', experienceYears: 0, professionalUrl: '', bio: 'I teach practical web development courses.' };
test('restores the first incomplete step from persisted data', () => {
  assert.equal(initialStep({}), 1);
  assert.equal(initialStep({ ...profile, emailVerified: false }), 1);
  assert.equal(initialStep({ emailVerified: true }), 2);
  assert.equal(initialStep({ ...profile, emailVerified: true }), 3);
  assert.equal(initialStep({ ...profile, emailVerified: true, status: 'changes_requested' }), 3);
  assert.equal(initialStep({ emailVerified: true, status: 'changes_requested' }), 2);
  assert.equal(initialStep({ status: 'pending' }), 4);
  assert.equal(initialStep({ status: 'approved' }), 4);
});
test('professional validation accepts zero experience and optional URLs', () => {
  assert.deepEqual(profileErrors(profile), {});
  assert.deepEqual(profileErrors({ ...profile, professionalUrl: 'https://linkedin.com/in/example' }), {});
  assert.ok(profileErrors(emptyProfile).organization);
  for (const value of ['', null, undefined, -1, 71, 'abc', Infinity]) assert.ok(profileErrors({ ...profile, experienceYears: value }).experienceYears);
  assert.ok(profileErrors({ ...profile, organization: '   ' }).organization);
  assert.ok(profileErrors({ ...profile, professionalUrl: 'javascript:alert(1)' }).professionalUrl);
  assert.ok(profileErrors({ ...profile, professionalUrl: 'not-a-url' }).professionalUrl);
  assert.ok(profileErrors({ ...profile, bio: 'short' }).bio);
  assert.ok(profileErrors({ ...profile, bio: 'a'.repeat(1201) }).bio);
});
test('files are checked before upload, including replacements', () => {
  assert.equal(fileError({ name: 'CV.PDF', type: 'application/pdf', size: 5242880 }, 'resume'), '');
  assert.equal(fileError({ name: 'proof.jpg', type: 'image/jpeg', size: 123 }, 'proof'), '');
  assert.equal(fileError({ name: 'CV.docx', type: '', size: 123 }, 'resume'), '');
  assert.ok(fileError({ name: 'CV.pdf', type: 'application/pdf', size: 5242881 }, 'resume'));
  assert.ok(fileError({ name: 'CV.exe', type: 'application/pdf', size: 123 }, 'resume'));
  assert.ok(fileError({ name: 'proof.doc', type: 'application/msword', size: 123 }, 'proof'));
  assert.ok(fileError({ name: 'CV.pdf', type: 'image/png', size: 123 }, 'resume'));
  assert.ok(fileError({ name: 'CV.pdf', type: 'application/pdf', size: 0 }, 'resume'));
});
