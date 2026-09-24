import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/apiService';

import VerificationDocumentActions from '../../components/instructor/VerificationDocumentActions';

const card = { background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' };
const label = value => String(value || 'incomplete').replaceAll('_', ' ');
const date = value => value ? new Date(value).toLocaleDateString() : 'Not submitted';
export default function InstructorRequests() {
    const { id } = useParams();
    const [status, setStatus] = useState('pending');
    const [items, setItems] = useState([]);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);
    const [decision, setDecision] = useState('');
    const [message, setMessage] = useState('');
    const [eligibility, setEligibility] = useState({ rejectionCount: 0 });
    const [finalConfirmed, setFinalConfirmed] = useState(false);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        let active = true;
        setLoading(true); setError('');
        const request = id ? adminAPI.getInstructorApplication(id) : adminAPI.getInstructorRequests(status);
        request.then(r => { if (active) { if (id) { setApplication(r.data.data.instructor); setEligibility(r.data.data.reapplication || { rejectionCount: 0 }); } else setItems(r.data.data.instructors); } })
            .catch(() => { if (active) setError('Unable to load instructor requests. Please try again.'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [id, status, revision]);
    async function review(e) {
        e.preventDefault(); setBusy(true); setError('');
        try { await adminAPI.reviewInstructor(id, { status: decision, message, confirmFinalRejection: finalConfirmed }); setDecision(''); setMessage(''); setRevision(x => x + 1); }
        catch (error) { setError(error.response?.data?.message || 'Unable to review this application. Refresh and try again.'); }
        finally { setBusy(false); }
    }
    const v = application?.instructorVerification || {};
    const complete = Boolean(v.organization && v.expertise && v.qualification && v.experienceYears != null && v.bio);
    const profile = /^https?:\/\//i.test(v.professionalUrl || '') ? v.professionalUrl : null;
    return <div className="space-y-6" style={{ color: 'var(--text-primary)' }}>
        <header><h1 className="text-2xl font-bold">{id ? 'Instructor Verification Request' : 'Instructor Requests'}</h1><p style={{ color: 'var(--text-muted)' }}>Review professional details and private supporting documents.</p></header>
        {error && <div role="alert" className="rounded-xl border p-4" style={card}>{error} <button className="underline" onClick={() => setRevision(x => x + 1)}>Try again</button></div>}
        {loading ? <p role="status">Loading instructor requests...</p> : id && application ? <>
            <Link to="/admin/instructors" className="text-indigo-500 underline">Back to requests</Link>
            <section className="rounded-2xl border p-6 space-y-5" style={card}>
                <h2 className="text-xl font-bold">{application.firstName} {application.lastName}</h2>
                <p className="break-all">{application.email}</p><span className="inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-sm capitalize">{label(v.status)}</span>
                <dl className="grid sm:grid-cols-2 gap-5">{[['Organization',v.organization],['Expertise',v.expertise],['Qualification',v.qualification],['Experience',v.experienceYears == null ? '' : `${v.experienceYears} years`],['Submitted',date(v.submittedAt)],['Reviewed',v.reviewedAt ? date(v.reviewedAt) : 'Awaiting review']].map(([k,val]) => <div key={k}><dt className="text-sm" style={{color:'var(--text-muted)'}}>{k}</dt><dd className="break-words">{val || 'Not provided'}</dd></div>)}</dl>
                {profile && <a href={profile} target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline">Open professional profile</a>}
                <div><h3 className="font-semibold">Professional Bio</h3><p className="whitespace-pre-wrap break-words">{v.bio || 'Not provided'}</p></div>
                <ul className="grid sm:grid-cols-2 gap-2">{[['Email verified',v.emailVerified],['Professional profile completed',complete],['Resume uploaded',v.resumeDocument?.storageId],['Verification proof uploaded',v.proofDocument?.storageId]].map(([k,ok]) => <li key={k}>{ok ? '✓' : '○'} {k}</li>)}</ul>
                <section className="space-y-4"><h3 className="text-lg font-semibold">Supporting Documents</h3>{[['resume', 'Resume'], ['proof', 'Proof']].map(([kind, title]) => { const document = v[`${kind}Document`]; return <div key={kind} className="rounded-xl border p-4 space-y-3" style={card}><h4 className="font-semibold">{kind === 'resume' ? 'Resume / CV' : 'Instructor Verification Proof'}</h4>{document?.storageId ? <><p className="break-all text-sm">{document.originalName}</p><p className="text-sm" style={{ color: 'var(--text-muted)' }}>{document.originalName?.split('.').pop().toUpperCase()} ? {((document.size || 0) / 1024).toFixed(0)} KB</p><VerificationDocumentActions key={document.storageId} document={document} label={title} loadDocument={() => adminAPI.getInstructorDocument(id, kind)} /></> : <p>Not uploaded</p>}</div>; })}</section>
                <section className="rounded-xl border p-4 space-y-3" style={card}><h3 className="text-lg font-semibold">Verification History</h3><p>Rejections: {eligibility.rejectionCount} / 3</p>{v.reapplyAvailableAt && <p>Reapply available: {new Date(v.reapplyAvailableAt).toLocaleString()}</p>}<ol className="space-y-3">{[...(v.rejectionHistory || []).map(item => ({ at: item.rejectedAt, label: 'Rejected', reason: item.reason })), ...(v.submissionHistory || []).map(item => ({ at: item.submittedAt, label: 'Submitted / Resubmitted' }))].sort((a, b) => new Date(b.at) - new Date(a.at)).map((event, index) => <li key={`${event.at}-${index}`} className="border-l-2 border-indigo-400 pl-3"><p className="text-sm">{new Date(event.at).toLocaleString()} - <strong>{event.label}</strong></p>{event.reason && <p className="whitespace-pre-wrap break-words">{event.reason}</p>}</li>)}</ol>{!v.rejectionHistory?.length && !v.submissionHistory?.length && <p className="text-sm">No recorded verification events yet.</p>}</section>
                {v.adminMessage && <p className="rounded-xl bg-amber-500/10 p-4 whitespace-pre-wrap">Admin message: {v.adminMessage}</p>}
                {v.status === 'pending' && <div className="flex flex-wrap gap-3">{[['approved','Approve Instructor'],['changes_requested','Request Changes'],['rejected','Reject']].map(([value,title]) => <button key={value} onClick={() => {setDecision(value);setMessage('');setFinalConfirmed(false);}} className="rounded-xl bg-indigo-600 px-4 py-2 text-white">{title}</button>)}</div>}
            </section>
            {decision && <section aria-label="Review confirmation" className="rounded-2xl border p-6" style={card}><form onSubmit={review} className="space-y-4"><h2 className="text-lg font-bold">{decision === 'approved' ? 'Approve this instructor?' : decision === 'rejected' ? 'Reject Instructor Application' : 'Changes required'}</h2>{decision === 'approved' ? <p>This Instructor will receive access to the Instructor Dashboard and course management features.</p> : <label className="block">Message<textarea autoFocus required maxLength={1000} value={message} onChange={e => setMessage(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border bg-transparent p-3" /></label>}{decision === 'rejected' && <div className="space-y-3"><p>Please explain why this application is being rejected.</p><p>Current rejection count: {eligibility.rejectionCount} of 3. This will become rejection {eligibility.rejectionCount + 1} of 3.</p>{eligibility.rejectionCount >= 2 && <div role="alert" className="rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 p-4 text-red-800 dark:text-red-200"><h3 className="font-bold">Final Rejection Attempt</h3><p className="mt-2">This is the Instructor's third rejection within the current period. If you continue, the Instructor will be unable to reapply for 30 days.</p><label className="mt-3 flex items-start gap-2"><input type="checkbox" checked={finalConfirmed} onChange={e => setFinalConfirmed(e.target.checked)} className="mt-1" />I confirm this final rejection and the 30-day cooldown.</label></div>}</div>}<div className="flex gap-3"><button type="button" disabled={busy} onClick={() => setDecision('')} className="rounded-xl border px-4 py-2">Cancel</button><button disabled={busy || (decision !== 'approved' && !message.trim()) || (decision === 'rejected' && eligibility.rejectionCount >= 2 && !finalConfirmed)} className="rounded-xl bg-indigo-600 text-white px-4 py-2 disabled:opacity-50">{busy ? 'Saving...' : decision === 'approved' ? 'Approve' : decision === 'rejected' ? (eligibility.rejectionCount >= 2 ? 'Confirm Final Rejection' : 'Reject Application') : 'Request Changes'}</button></div></form></section>}
        </> : !id && <><div className="flex flex-wrap gap-2">{['pending','approved','changes_requested','rejected'].map(s => <button key={s} onClick={() => setStatus(s)} aria-pressed={status === s} className={`rounded-xl border px-4 py-2 capitalize ${status === s ? 'bg-indigo-600 text-white' : ''}`}>{label(s)}</button>)}</div><div className="grid lg:grid-cols-2 gap-4">{items.map(u => {const q=u.instructorVerification;return <article key={u._id} className="rounded-2xl border p-5 space-y-3" style={card}><h2 className="font-bold">{u.firstName} {u.lastName}</h2><p className="break-all">{u.email}</p><p>{q.organization} · {q.expertise}</p><p>{q.qualification} · {q.experienceYears} years of experience</p><p className="text-sm capitalize">{label(q.status)} · Submitted {date(q.submittedAt)}</p><Link className="inline-block rounded-xl bg-indigo-600 text-white px-4 py-2" to={`/admin/instructors/${u._id}`}>View Application</Link></article>})}</div>{!items.length && !error && <p className="rounded-2xl border p-10 text-center" style={card}>{status === 'pending' ? 'No instructor verification requests are waiting for review.' : `No ${label(status)} instructor applications.`}</p>}</>}
    </div>;
}
