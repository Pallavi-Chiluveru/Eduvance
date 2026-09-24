import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheck, FiClock, FiFileText, FiShield, FiUploadCloud } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { instructorAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { emptyProfile, profileErrors, initialStep, fileError } from './verificationHelpers.mjs';

import VerificationDocumentActions from '../../components/instructor/VerificationDocumentActions';

import ReapplicationStatus from '../../components/instructor/ReapplicationStatus';

const primary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed';
const secondary = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50';
const muted = 'text-sm text-slate-500 dark:text-slate-400';
const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-3 outline-none focus:ring-2 focus:ring-indigo-500';

function UploadCard({ kind, file, saved, onSelect, onRemove, busy }) {
  const input = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const title = kind === 'resume' ? 'Resume / CV' : 'Instructor Verification Proof';
  const selected = file || saved;
  const choose = candidate => {
    if (!candidate || busy) return;
    const message = fileError(candidate, kind);
    setError(message);
    if (!message) onSelect(candidate);
  };
  return <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6">
    <h3 className="flex items-center gap-2 font-semibold">{kind === 'resume' ? <FiFileText className="text-indigo-500" /> : <FiShield className="text-indigo-500" />}{title}</h3>
    <p className={`${muted} mt-2`}>{kind === 'resume' ? 'Upload your latest Resume or CV to help the administrator review your professional background, qualifications and experience.' : 'Upload one document that supports your instructor identity or qualification.'}</p>
    {kind === 'proof' && <p className={`${muted} mt-2`}>Examples: Faculty / Employee ID, Teaching Certificate, Experience Certificate, Qualification Certificate, or institution-issued proof.</p>}
    <input ref={input} type="file" hidden accept={kind === 'resume' ? '.pdf,.doc,.docx' : '.pdf,.jpg,.jpeg,.png'} onChange={e => { choose(e.target.files[0]); e.target.value = ''; }} />
    {selected ? <div className="mt-5 rounded-xl bg-slate-50 dark:bg-slate-900 p-4"><div className="flex gap-3"><FiFileText className="mt-1 shrink-0 text-indigo-500" /><div className="min-w-0"><p className="break-all text-sm font-semibold">{selected.name || selected.originalName}</p><p className={muted}>{(selected.size / 1024 / 1024).toFixed(2)} MB</p><p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">{file ? 'Ready to upload' : 'Upload complete ✓'}</p></div></div><div className="mt-4"><VerificationDocumentActions key={file ? `${file.name}-${file.lastModified}` : saved?.storageId} file={file} document={saved} label={kind === 'resume' ? 'Resume' : 'Proof'} loadDocument={() => instructorAPI.getDocument(kind)} /></div><div className="mt-4 flex flex-wrap gap-3"><button type="button" className={secondary} disabled={busy} onClick={() => input.current.click()}>Replace</button><button type="button" className={secondary} disabled={busy} onClick={() => { setError(''); onRemove(); }}>Remove</button></div></div> : <button type="button" disabled={busy} onClick={() => input.current.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files[0]); }} className={`mt-5 flex w-full flex-col items-center rounded-xl border-2 border-dashed p-6 transition-colors ${dragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}><FiUploadCloud className="mb-3 text-3xl text-indigo-500" /><span className="text-sm font-semibold">Upload {kind === 'resume' ? 'Resume' : 'Verification Proof'}</span><span className={`${muted} mt-1`}>Drag & drop or browse files</span></button>}
    <p className={`${muted} mt-3`}>{kind === 'resume' ? 'PDF, DOC or DOCX' : 'PDF, JPG, JPEG or PNG'} · Maximum 5 MB</p>
    {error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </section>;
}

export default function InstructorVerification() {
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true), [loadError, setLoadError] = useState(false);
  const [eligibility, setEligibility] = useState({ rejectionCount: 0, locked: false });
  const [editingReapplication, setEditingReapplication] = useState(false);
  const [step, setStep] = useState(1), [form, setForm] = useState(emptyProfile), [meta, setMeta] = useState({});
  const [digits, setDigits] = useState(Array(6).fill('')), [secondsLeft, setSecondsLeft] = useState(0), [busy, setBusy] = useState('');
  const [files, setFiles] = useState({ resume: null, proof: null }), [removed, setRemoved] = useState({ resume: false, proof: false });
  const [error, setError] = useState(''), [progress, setProgress] = useState(null), [confirm, setConfirm] = useState(false);
  const [touched, setTouched] = useState({});
  const lock = useRef(false), heading = useRef(null), dialog = useRef(null), otp = useRef([]);
  const v = user?.instructorVerification || {};
  const errors = profileErrors(form);
  const code = digits.join('');
  const setCode = value => setDigits(Array.from({ length: 6 }, (_, i) => value[i] || ''));
  const read = async () => {
    setLoading(true); setLoadError(false);
    try {
      const { data } = await instructorAPI.getVerification();
      const next = data.data.user;
      setEligibility(data.data.reapplication || { rejectionCount: 0, locked: false }); setEditingReapplication(false);
      setUser(next); setMeta(data.data.emailVerification || {});
      setForm(Object.fromEntries(Object.keys(emptyProfile).map(k => [k, next.instructorVerification?.[k] ?? ''])));
      setStep(initialStep(next.instructorVerification));
    } catch { setLoadError(true); } finally { setLoading(false); }
  };
  useEffect(() => { read(); }, []);
  useEffect(() => {
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((new Date(meta.resendAvailableAt || 0) - Date.now()) / 1000)));
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [meta.resendAvailableAt]);
  useEffect(() => { heading.current?.focus(); }, [step]);
  useEffect(() => { if (confirm) dialog.current?.showModal(); else dialog.current?.close(); }, [confirm]);
  const run = async (name, action) => {
    if (lock.current) return;
    lock.current = true; setBusy(name); setError('');
    try { await action(); } catch (e) { if (e.response?.data?.code === 'REAPPLICATION_COOLDOWN') await read(); setError(e.response?.data?.message || 'Unable to complete this action. Please try again.'); }
    finally { lock.current = false; setBusy(''); setProgress(null); }
  };
  const save = async (documents = false) => {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, String(value).trim()));
    if (documents) for (const kind of ['resume', 'proof']) {
      if (files[kind]) data.append(kind, files[kind]);
      else if (removed[kind]) data.append(`remove${kind === 'resume' ? 'Resume' : 'Proof'}`, 'true');
    }
    const response = await instructorAPI.updateApplication(data, { onUploadProgress: event => { if (documents && event.total) setProgress(Math.round(event.loaded * 100 / event.total)); } });
    setUser(response.data.data.user);
    if (documents) { setFiles({ resume: null, proof: null }); setRemoved({ resume: false, proof: false }); }
  };
  const missing = () => {
    if (eligibility.locked) return 'Reapplication is temporarily locked. Please check your eligibility date.';
    if (!v.emailVerified) return 'Please verify your email before submitting.';
    if (Object.keys(errors).length) return 'Please complete your professional information before submitting.';
    if (!files.resume && (removed.resume || !v.resumeDocument?.storageId)) return 'Please upload your Resume/CV before submitting.';
    if (!files.proof && (removed.proof || !v.proofDocument?.storageId)) return 'Please upload Instructor Verification Proof before submitting.';
    return '';
  };
  if (loading) return <LoadingSpinner />;
  if (loadError) return <div role="alert" className="mx-auto max-w-xl text-center"><p>Unable to load verification information.</p><button className={`${primary} mt-4`} onClick={read}>Try Again</button></div>;
  if (v.status === 'approved' && v.emailVerified) return <Navigate to="/instructor/dashboard" replace />;
  if (v.status === 'rejected' && (!editingReapplication || eligibility.locked)) return <ReapplicationStatus verification={v} eligibility={eligibility} onRefresh={read} onEdit={() => { setEditingReapplication(true); setStep(v.emailVerified ? 2 : 1); }} />;
  const go = next => { setError(''); setStep(next); };
  const [local, domain] = String(user?.email || '').split('@');
  const masked = domain ? `${local.slice(0, 2)}${'*'.repeat(Math.max(3, local.length - 2))}@${domain}` : '';
  return <div className="mx-auto max-w-[900px] space-y-6 text-slate-900 dark:text-slate-100">
    <header><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Instructor onboarding</p><h1 className="text-2xl sm:text-3xl font-bold">Instructor Verification</h1><p className={`${muted} mt-2`}>Hello {user?.firstName}, complete verification to unlock instructor tools.</p></header>
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70">
      <ol aria-label="Verification progress" className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 px-2 py-6 sm:px-6">
        {['Email Verification', 'Professional Information', 'Supporting Documents', 'Admin Review'].map((label, i) => {
          const number = i + 1, complete = number < step || (number === 1 && v.emailVerified);
          return <li key={label} aria-current={number === step ? 'step' : undefined} className="relative text-center"><div aria-hidden="true" className={`relative z-10 mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${complete ? 'bg-emerald-600 text-white' : number === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300'}`}>{complete ? <FiCheck /> : number}</div>{i < 3 && <div aria-hidden="true" className={`absolute left-1/2 top-[17px] h-0.5 w-full ${number < step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}<span className="mt-3 block px-1 text-[10px] sm:text-xs font-medium">{label}<span className="sr-only">{complete ? ', completed' : number === step ? ', current' : ', upcoming'}</span></span></li>;
        })}
      </ol>
      <div className="p-5 sm:p-8">
        {v.adminMessage && <div className="mb-6 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-200"><strong>Administrator feedback</strong><p className="mt-1 whitespace-pre-wrap">{v.adminMessage}</p></div>}
        {['changes_requested', 'rejected'].includes(v.status) && <p className={`${muted} mb-4`}>Please review your information and documents, make the requested updates, and resubmit.</p>}
        {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300">{error}</p>}
        <p className={`${muted} mb-2`}>Step {step} of 4</p><h2 ref={heading} tabIndex={-1} className="text-xl font-bold outline-none">{['Verify Your Email', 'Professional Information', 'Supporting Documents', 'Application Under Review'][step - 1]}</h2>
        {step === 1 && <div className="mx-auto max-w-md py-5 text-center">
          {v.emailVerified ? <div role="status" className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-6 text-emerald-700 dark:text-emerald-300"><FiCheck className="mx-auto mb-3 text-3xl" />Email verified successfully</div> : <>
            <p className={muted}>{meta.hasActiveCode || meta.codeExpired || meta.resendAvailableAt ? "We've sent a 6-digit verification code to:" : 'Request a verification code for:'}</p><p className="mt-1 font-semibold">{masked}</p>
            {meta.codeExpired && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">Your code has expired. Please resend it below.</p>}
            <form className="mt-6" onSubmit={e => { e.preventDefault(); if (!/^\d{6}$/.test(code)) return; run('verify', async () => { await instructorAPI.verifyCode(code); setUser(current => ({ ...current, instructorVerification: { ...current.instructorVerification, emailVerified: true } })); toast.success('Email verified successfully'); }); }}>
              <div className="flex justify-center gap-2">{Array.from({ length: 6 }, (_, i) => <input key={i} ref={el => { otp.current[i] = el; }} aria-label={`Verification code digit ${i + 1}`} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={6} disabled={!!busy} value={digits[i]} className="h-12 w-9 sm:w-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-center text-xl font-bold focus:ring-2 focus:ring-indigo-500" onPaste={e => { e.preventDefault(); const value = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); setCode(value); otp.current[Math.min(value.length, 5)]?.focus(); }} onChange={e => { const value = e.target.value.replace(/\D/g, ''); if (value.length > 1) { setCode(value.slice(0, 6)); otp.current[5]?.focus(); } else { setDigits(current => current.map((digit, index) => index === i ? value : digit)); if (value) otp.current[Math.min(i + 1, 5)]?.focus(); } }} onKeyDown={e => { if (e.key === 'Backspace' && !digits[i]) otp.current[Math.max(0, i - 1)]?.focus(); }} />)}</div>
              <button className={`${primary} mt-5 w-full`} disabled={!!busy || code.length !== 6}>{busy === 'verify' ? 'Verifying…' : 'Verify Email'}</button>
            </form><div className={`${muted} mt-5`}><p>Code expires in 15 minutes.</p><p className="mt-2">Didn't receive the code?</p>{secondsLeft > 0 ? <p className="mt-2">Resend code in {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</p> : <button className="mt-2 font-semibold text-indigo-600 dark:text-indigo-400" disabled={!!busy} onClick={() => run('send', async () => { try { const response = await instructorAPI.sendCode(); setMeta({ ...response.data.data, hasActiveCode: true, codeExpired: false }); setCode(''); toast.success('Verification code sent'); } catch (e) { const response = await instructorAPI.getVerification(); setMeta(response.data.data.emailVerification || {}); throw e; } })}>{busy === 'send' ? 'Sending…' : !meta.hasActiveCode && !meta.codeExpired && !meta.resendAvailableAt ? 'Send Verification Code' : 'Resend Code'}</button>}</div>
          </>}
          <button className={`${primary} mt-6 w-full`} disabled={!v.emailVerified || !!busy} onClick={() => go(2)}>Next: Professional Information <FiArrowRight /></button>
        </div>}
        {step === 2 && <form className="mt-2" onSubmit={e => { e.preventDefault(); if (Object.keys(errors).length) return; run('profile', async () => { await save(); toast.success('Professional information saved'); go(3); }); }}>
          <p className={muted}>Tell us about your teaching background and expertise.</p><div className="mt-6 grid gap-5 sm:grid-cols-2">
            {[['organization', 'Organization / Institution', 'Keshav Memorial Institute of Technology', 150], ['expertise', 'Teaching Expertise', 'Web Development, MERN Stack', 200], ['qualification', 'Highest Qualification', 'M.Tech Computer Science', 200], ['experienceYears', 'Years of Experience', '3'], ['professionalUrl', 'LinkedIn / Professional Profile (Optional)', 'https://linkedin.com/in/...']].map(([name, label, placeholder, max]) => <label className={`text-sm font-medium ${name === 'professionalUrl' ? 'sm:col-span-2' : ''}`} key={name}>{label}<input className={inputClass} required={name !== 'professionalUrl'} type={name === 'experienceYears' ? 'number' : name === 'professionalUrl' ? 'url' : 'text'} min={name === 'experienceYears' ? 0 : undefined} max={name === 'experienceYears' ? 70 : undefined} step="any" maxLength={max} placeholder={placeholder} value={form[name]} disabled={!!busy} onBlur={() => setTouched(x => ({ ...x, [name]: true }))} onChange={e => setForm(x => ({ ...x, [name]: e.target.value }))} aria-invalid={!!(touched[name] && errors[name])} aria-describedby={touched[name] && errors[name] ? `${name}-error` : undefined} />{touched[name] && errors[name] && <span id={`${name}-error`} className="mt-1 block text-xs text-red-600 dark:text-red-400">{errors[name]}</span>}</label>)}
            <label className="text-sm font-medium sm:col-span-2">Professional Bio<textarea required minLength={20} maxLength={1200} rows={4} disabled={!!busy} className={inputClass} placeholder="Briefly describe your teaching experience, skills and areas of expertise…" value={form.bio} onChange={e => setForm(x => ({ ...x, bio: e.target.value }))} onBlur={() => setTouched(x => ({ ...x, bio: true }))} aria-describedby="bio-help" /><span id="bio-help" className={`${muted} mt-1 flex justify-between gap-3`}><span>{touched.bio && errors.bio ? errors.bio : 'At least 20 characters. A few sentences are enough.'}</span><span className="shrink-0">{form.bio.length} / 1200</span></span></label>
          </div><div className="mt-8 flex flex-wrap justify-between gap-3"><button type="button" className={secondary} disabled={!!busy} onClick={() => go(1)}><FiArrowLeft /> Back</button><button type="button" className={`${secondary} sm:ml-auto`} disabled={!!busy} onClick={() => { const invalid = Object.keys(errors).filter(key => String(form[key] ?? '').trim()); if (invalid.length) { setTouched(Object.fromEntries(invalid.map(key => [key, true]))); setError('Please correct the highlighted fields before saving.'); return; } run('profileDraft', async () => { await save(); toast.success('Professional information draft saved'); }); }}>{busy === 'profileDraft' ? 'Saving?' : 'Save Draft'}</button><button className={primary} disabled={!!busy || Object.keys(errors).length > 0}>{busy === 'profile' ? 'Saving…' : 'Save & Continue'} <FiArrowRight /></button></div>
        </form>}
        {step === 3 && <div className="mt-2"><p className={muted}>Add your resume and one supporting document to complete your application.</p><div className="mt-6 space-y-5">{['resume', 'proof'].map(kind => <UploadCard key={kind} kind={kind} busy={!!busy} file={files[kind]} saved={removed[kind] ? null : v[`${kind}Document`]?.storageId ? v[`${kind}Document`] : null} onSelect={file => setFiles(current => ({ ...current, [kind]: file }))} onRemove={() => { setFiles(current => ({ ...current, [kind]: null })); setRemoved(current => ({ ...current, [kind]: true })); }} />)}</div>
          {busy && <div role="status" className="mt-5"><p className={muted}>{progress !== null ? progress === 100 ? 'Files transferred. Saving application…' : `Uploading… ${progress}%` : 'Saving application…'}</p>{progress !== null && <progress className="mt-2 h-2 w-full accent-indigo-600" value={progress} max="100" aria-label="Upload progress" />}</div>}
          {error && <p className={`${muted} mt-4`}>Your selected files are retained. Use Save Draft or Submit for Verification to try again.</p>}
          <div className="mt-8 flex flex-wrap gap-3"><button className={secondary} disabled={!!busy} onClick={() => go(2)}><FiArrowLeft /> Back</button><button className={`${secondary} sm:ml-auto`} disabled={!!busy} onClick={() => run('draft', async () => { await save(true); toast.success('Application draft saved'); })}>{busy === 'draft' ? 'Saving…' : 'Save Draft'}</button><button className={primary} disabled={!!busy} onClick={() => { const message = missing(); if (message) setError(message); else { setError(''); setConfirm(true); } }}>Submit for Verification</button></div>
        </div>}
        {step === 4 && <div className="py-7 text-center"><div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300"><FiClock className="text-3xl" /></div><p>Your instructor verification application has been submitted successfully.</p><p className={`${muted} mx-auto mt-3 max-w-lg`}>The platform administrator is reviewing your professional information and supporting documents.</p><div className="my-6 rounded-xl bg-slate-50 dark:bg-slate-800 p-5"><p className={muted}>Application Status</p><p className="mt-1 font-semibold text-indigo-600 dark:text-indigo-300">Pending Review</p>{v.submittedAt && <p className={`${muted} mt-3`}>Submitted: {new Date(v.submittedAt).toLocaleString()}</p>}</div><p className={muted}>You'll receive access to Instructor features after your application is approved.</p><section className="mt-6 space-y-4 text-left"><h3 className="font-semibold">Submitted Documents</h3>{['resume', 'proof'].map(kind => { const document = v[`${kind}Document`]; return document?.storageId ? <div key={kind} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"><p className="mb-3 break-all text-sm font-medium">{document.originalName}</p><VerificationDocumentActions document={document} label={kind === 'resume' ? 'Resume' : 'Proof'} loadDocument={() => instructorAPI.getDocument(kind)} /></div> : null; })}</section></div>}
      </div>
    </div>
    <dialog ref={dialog} onCancel={e => { if (busy) e.preventDefault(); else setConfirm(false); }} onClose={() => setConfirm(false)} aria-labelledby="submit-title" className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 backdrop:bg-slate-950/60"><h2 id="submit-title" className="text-xl font-bold">Submit Instructor Application?</h2><p className={`${muted} mt-4`}>Please confirm that the information and documents you provided are correct.</p><p className={`${muted} mt-3`}>After submission, your application will be sent to the platform administrator for review.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button autoFocus className={secondary} disabled={!!busy} onClick={() => setConfirm(false)}>Cancel</button><button className={primary} disabled={!!busy} onClick={() => run('submit', async () => { const message = missing(); if (message) { setConfirm(false); setError(message); return; } try { await save(true); await instructorAPI.submitApplication(); setUser(current => ({ ...current, instructorVerification: { ...current.instructorVerification, status: 'pending', submittedAt: new Date().toISOString(), adminMessage: '' } })); go(4); toast.success('Application submitted for review'); } finally { setConfirm(false); } })}>{busy === 'submit' ? 'Submitting…' : 'Submit Application'}</button></div></dialog>
  </div>;
}

