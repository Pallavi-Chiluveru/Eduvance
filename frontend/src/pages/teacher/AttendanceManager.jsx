import { useEffect, useState } from 'react';
import { teacherAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineClock, HiOutlineX } from 'react-icons/hi';

export default function AttendanceManager() {
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [attendance, setAttendance] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        teacherAPI.getCourses().then((r) => setCourses(r.data.data.courses || [])).catch(console.error).finally(() => setLoading(false));
    }, []);

    const loadStudents = async (courseId) => {
        setSelectedCourse(courseId);
        if (!courseId) return;
        try {
            const res = await teacherAPI.getCourseStudents(courseId);
            const s = res.data.data.students || [];
            setStudents(s);
            const init = {};
            s.forEach((st) => init[st._id] = 'present');
            setAttendance(init);
        } catch (err) { console.error(err); }
    };

    const markStatus = (studentId, status) => {
        setAttendance({ ...attendance, [studentId]: status });
    };

    const submitAttendance = async () => {
        setSubmitting(true);
        try {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId, courseId: selectedCourse, status, date: new Date().toISOString().split('T')[0],
            }));
            for (const r of records) {
                await teacherAPI.markAttendance(r);
            }
            toast.success('Attendance marked!');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <LoadingSpinner />;

    const statusButtons = [
        { status: 'present', icon: HiOutlineCheck, color: 'bg-emerald-500', label: 'P' },
        { status: 'late', icon: HiOutlineClock, color: 'bg-amber-500', label: 'L' },
        { status: 'absent', icon: HiOutlineX, color: 'bg-rose-500', label: 'A' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📅 Attendance Manager</h1>

            <select value={selectedCourse} onChange={(e) => loadStudents(e.target.value)} className="w-full max-w-md px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <option value="">Select a course</option>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>

            {selectedCourse && students.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <div className="p-4">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            Date: {new Date().toLocaleDateString()} · {students.length} students
                        </p>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: 'var(--bg-tertiary)' }}>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Student</th>
                                <th className="px-4 py-3 text-center font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s._id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{s.firstName} {s.lastName}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            {statusButtons.map((b) => (
                                                <button
                                                    key={b.status}
                                                    onClick={() => markStatus(s._id, b.status)}
                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${attendance[s._id] === b.status ? `${b.color} text-white` : ''
                                                        }`}
                                                    style={attendance[s._id] !== b.status ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' } : {}}
                                                >
                                                    {b.label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4">
                        <button onClick={submitAttendance} disabled={submitting} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white gradient-primary hover:opacity-90 disabled:opacity-50">
                            {submitting ? 'Saving...' : 'Save Attendance'}
                        </button>
                    </div>
                </div>
            )}

            {selectedCourse && students.length === 0 && (
                <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No students enrolled in this course</p>
            )}
        </div>
    );
}
