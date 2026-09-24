export const emptyProfile = { organization: '', expertise: '', qualification: '', experienceYears: '', professionalUrl: '', bio: '' };
export function profileErrors(form) {
  const errors = {};
  for (const [key, label, max] of [['organization', 'Organization / Institution', 150], ['expertise', 'Teaching Expertise', 200], ['qualification', 'Highest Qualification', 200]]) {
    if (!String(form[key] ?? '').trim()) errors[key] = `${label} is required.`;
    else if (form[key].length > max) errors[key] = `Use at most ${max} characters.`;
  }
  if (form.experienceYears === '' || form.experienceYears == null || !Number.isFinite(Number(form.experienceYears)) || Number(form.experienceYears) < 0 || Number(form.experienceYears) > 70) errors.experienceYears = 'Enter a number between 0 and 70.';
  const bio = String(form.bio ?? '').trim();
  if (bio.length < 20 || bio.length > 1200) errors.bio = 'Write between 20 and 1,200 characters.';
  if (form.professionalUrl?.trim()) {
    try { if (!['https:', 'http:'].includes(new URL(form.professionalUrl.trim()).protocol)) throw new Error(); }
    catch { errors.professionalUrl = 'Enter a valid http:// or https:// URL.'; }
  }
  return errors;
}
export function initialStep(v = {}) {
  if (v.status === 'pending' || v.status === 'approved') return 4;
  if (!v.emailVerified) return 1;
  return Object.keys(profileErrors(v)).length ? 2 : 3;
}
export function fileError(file, kind) {
  const extensions = kind === 'resume' ? ['pdf', 'doc', 'docx'] : ['pdf', 'jpg', 'jpeg', 'png'];
  const types = kind === 'resume' ? ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] : ['application/pdf', 'image/jpeg', 'image/png'];
  if (!extensions.includes(file.name.split('.').pop().toLowerCase()) || (file.type && !types.includes(file.type))) return `Please upload a ${kind === 'resume' ? 'PDF, DOC or DOCX' : 'PDF, JPG, JPEG or PNG'} file.`;
  if (file.size > 5 * 1024 * 1024) return 'File size must be 5 MB or less.';
  if (!file.size) return 'This file is empty. Please choose another file.';
  return '';
}
