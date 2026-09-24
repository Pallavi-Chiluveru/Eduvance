import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineBookOpen, HiOutlineUsers } from 'react-icons/hi';

export default function CourseManagement() {
    const [error, setError] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: '', code: '', description: '', category: 'Computer Science' });

    const load = async () => {
        try {
            setError('');
            const res = await adminAPI.getCourses();
            setCourses(res.data.data.courses || []);
        } catch { setError('Unable to load courses. Please try again.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const review = async (course, action) => {
        const message = action === 'request_changes' ? window.prompt('Required changes') : '';
        if (action === 'request_changes' && !message) return;
        try { await adminAPI.reviewCourse(course._id, { action, message }); toast.success('Course updated'); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Review failed'); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createCourse(form);
            toast.success('Course created!');
            setShowCreate(false);
            setForm({ name: '', code: '', description: '', category: 'Computer Science' });
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📚 Course Management</h1>
                <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white gradient-primary hover:opacity-90">
                    <HiOutlinePlus className="w-4 h-4" /> New Course
                </button>
            </div>

            {error && <p role="alert">{error} <button className="underline" onClick={load}>Try again</button></p>}
            {showCreate && (
                <form onSubmit={handleCreate} className="rounded-xl p-5 space-y-4 animate-slide-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Create Course</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Course Name" required className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                        <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code (e.g. CS101)" required className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                        {['Computer Science', 'Programming', 'Data Science', 'Web Development', 'Aptitude'].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button type="submit" className="px-6 py-2 rounded-lg text-sm font-semibold text-white gradient-primary hover:opacity-90">Create</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {courses.map((c) => (
                    <div key={c._id} className="rounded-xl overflow-hidden animate-slide-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                        <div className="h-2 gradient-primary" />
                        <div className="p-5">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30"><HiOutlineBookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
                                <div>
                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.code} · {c.category}</p>
                                </div>
                            </div>
                            <p className="text-xs capitalize mb-2" style={{ color: 'var(--text-muted)' }}>{c.status?.replaceAll('_', ' ')} ? Created {new Date(c.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{c.description?.substring(0, 80)}</p>
                            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                                <span className="flex items-center gap-1"><HiOutlineUsers className="w-4 h-4" />{c.studentCount || 0} students</span>
                                <span>👨‍🏫 {c.instructor?.firstName || 'Unassigned'}</span>
                            </div>
                            <div className='flex gap-2 mt-4'>{['submitted', 'pending_review'].includes(c.status) && <><button onClick={() => review(c, 'request_changes')}>Request Changes</button><button onClick={() => review(c, 'approve')} className='text-emerald-600'>Approve</button></>}{c.status === 'approved' && <button onClick={() => review(c, 'publish')} className='text-emerald-600'>Publish</button>}{c.status === 'published' && <button onClick={() => review(c, 'archive')}>Archive</button>}</div>
                        </div>
                    </div>
                ))}
                {courses.length === 0 && !error && <p className="col-span-full text-center py-12" style={{ color: 'var(--text-muted)' }}>No courses available.</p>}
            </div>
        </div>
    );
}
