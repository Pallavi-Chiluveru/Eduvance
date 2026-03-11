import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parentAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import { HiOutlineCheck, HiOutlineClock, HiOutlineX, HiOutlineCalendar } from 'react-icons/hi';

export default function AttendanceMonitor() {
    const [searchParams] = useSearchParams();
    const childId = searchParams.get('childId');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!childId) {
            setLoading(false);
            return;
        }
        parentAPI.getChildAttendance(childId)
            .then((r) => setData(r.data.data))
            .catch((err) => {
                console.error('Failed to load attendance:', err);
                setData(null);
            })
            .finally(() => setLoading(false));
    }, [childId]);

    if (loading) return <LoadingSpinner />;

    if (!childId) {
        return (
            <div className="text-center py-12">
                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Child Selected</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Please select a child from the dashboard to view their attendance.</p>
            </div>
        );
    }

    const records = data?.records || [];
    const summary = data?.summary || {};

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📅 Attendance Monitor</h1>
                {data?.child && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{data.child.firstName} {data.child.lastName} · {data.child.grade}</p>}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total" value={summary.total || 0} icon={HiOutlineCalendar} color="indigo" />
                <StatCard title="Present" value={summary.present || 0} icon={HiOutlineCheck} color="emerald" />
                <StatCard title="Late" value={summary.late || 0} icon={HiOutlineClock} color="amber" />
                <StatCard title="Absent" value={summary.absent || 0} icon={HiOutlineX} color="rose" />
            </div>

            <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Attendance Rate</span>
                    <span className={`text-sm font-bold ${(summary.percentage || 0) >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>{summary.percentage || 0}%</span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className={`h-full rounded-full transition-all ${(summary.percentage || 0) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${summary.percentage || 0}%` }} />
                </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                <div className="p-5"><h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Records</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr style={{ background: 'var(--bg-tertiary)' }}>
                            {['Date', 'Course', 'Status'].map((h) => <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {records.map((r) => (
                                <tr key={r._id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{new Date(r.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{r.course?.name || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${r.status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : r.status === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                            }`}>{r.status}</span>
                                    </td>
                                </tr>
                            ))}
                            {records.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>No records</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
