import { useEffect, useState } from 'react';
import { teacherAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlineBookOpen, HiOutlineUsers } from 'react-icons/hi';

export default function TeacherCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        teacherAPI.getCourses().then((r) => setCourses(r.data.data.courses || [])).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📚 My Courses</h1>
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
                            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{c.description?.substring(0, 80)}...</p>
                            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                                <span className="flex items-center gap-1"><HiOutlineUsers className="w-4 h-4" />{c.studentCount || 0} students</span>
                                <span>{c.chapters?.length || 0} chapters</span>
                            </div>
                        </div>
                    </div>
                ))}
                {courses.length === 0 && <p className="col-span-full text-center py-12" style={{ color: 'var(--text-muted)' }}>No courses assigned</p>}
            </div>
        </div>
    );
}
