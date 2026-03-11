import { useEffect, useState } from 'react';
import { parentAPI } from '../../services/apiService';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineUsers, HiOutlineChartBar, HiOutlineCalendar, HiOutlineBookOpen, HiOutlineExclamation, HiOutlineRefresh, HiOutlineBell } from 'react-icons/hi';

export default function ParentDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadDashboardData = async (showRefreshLoading = false) => {
        try {
            if (showRefreshLoading) setRefreshing(true);
            const res = await parentAPI.getDashboard();
            setData(res.data.data);
            setError(null);
        } catch (err) {
            console.error('Parent dashboard error:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard data');
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
            if (showRefreshLoading) setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
                <HiOutlineExclamation className="w-16 h-16 text-rose-500" />
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-rose-600">Unable to load dashboard</h3>
                    <p className="text-sm text-gray-600 mt-1">{error}</p>
                </div>
                <button
                    onClick={() => loadDashboardData(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    disabled={refreshing}
                >
                    {refreshing ? 'Refreshing...' : 'Try Again'}
                </button>
            </div>
        );
    }

    const children = data?.children || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome, {user?.firstName}! 👨‍👩‍👧‍👦</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Monitor your children's learning progress</p>
                </div>
                <button
                    onClick={() => loadDashboardData(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                    style={{
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        background: 'var(--bg-card)'
                    }}
                    disabled={refreshing}
                >
                    <HiOutlineRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <StatCard title="Children" value={children.length} icon={HiOutlineUsers} color="indigo" />
                <StatCard title="Avg Performance" value={`${data?.avgPerformance || 0}%`} icon={HiOutlineChartBar} color="emerald" />
                <StatCard title="Avg Attendance" value={`${data?.avgAttendance || 0}%`} icon={HiOutlineCalendar} color="amber" />
                <StatCard title="Notifications" value={data?.unreadNotifications || 0} icon={HiOutlineBell} color="rose" />
            </div>

            {/* Notifications Section */}
            {data?.recentNotifications && data.recentNotifications.length > 0 && (
                <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>🔔 Recent Notifications</h3>
                    <div className="space-y-3">
                        {data.recentNotifications.map((n) => (
                            <div
                                key={n._id}
                                className="p-3 rounded-lg flex items-start gap-3"
                                style={{ background: 'var(--bg-tertiary)' }}
                            >
                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.type === 'attendance' ? 'bg-rose-500' :
                                    n.type === 'result' ? 'bg-emerald-500' :
                                        'bg-indigo-500'
                                    }`} />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Children Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map((childData) => (
                    <div
                        key={childData.child._id}
                        className="rounded-xl p-5 animate-slide-up"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{childData.child.firstName?.[0]}{childData.child.lastName?.[0]}</span>
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{childData.child.firstName} {childData.child.lastName}</h3>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{childData.child.grade} · Section {childData.child.section} · {childData.child.studentId}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                                <p className="text-lg font-bold text-indigo-500">{childData.stats.totalCourses || 0}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Courses</p>
                            </div>
                            <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                                <p className="text-lg font-bold text-emerald-500">{childData.stats.avgScore || 0}%</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Score</p>
                            </div>
                            <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                                <p className="text-lg font-bold text-amber-500">{childData.stats.attendancePercent || 0}%</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Attendance</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link to={`/parent/performance?childId=${childData.child._id}`} className="flex-1 py-2 rounded-lg text-xs font-medium text-white gradient-primary text-center hover:opacity-90">
                                View Performance
                            </Link>
                            <Link to={`/parent/attendance?childId=${childData.child._id}`} className="flex-1 py-2 rounded-lg text-xs font-medium text-center" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                View Attendance
                            </Link>
                        </div>
                    </div>
                ))}
                {children.length === 0 && (
                    <p className="col-span-full text-center py-12" style={{ color: 'var(--text-muted)' }}>No children linked to this account</p>
                )}
            </div>
        </div>
    );
}
