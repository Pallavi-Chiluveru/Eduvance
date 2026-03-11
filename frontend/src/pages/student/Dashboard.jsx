import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/apiService';
import StatCard from '../../components/common/StatCard';
import ChartCard from '../../components/common/ChartCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlineBookOpen, HiOutlineClipboardCheck, HiOutlineChartBar, HiOutlineCalendar, HiOutlineStar, HiOutlineBell, HiOutlineExclamation, HiOutlineRefresh, HiOutlineCheckCircle, HiOutlineClock, HiOutlineFire, HiOutlineArrowRight } from 'react-icons/hi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadDashboardData = async (showRefreshLoading = false) => {
        try {
            if (showRefreshLoading) setRefreshing(true);
            const res = await studentAPI.getDashboard();
            setData(res.data.data);
            setError(null);
        } catch (err) {
            console.error('Dashboard load error:', err);
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

    const stats = data?.stats || {};

    // Use real performance data if available, otherwise show placeholder
    const performanceData = data?.performanceTrend || [
        { month: 'Jan', score: 72 }, { month: 'Feb', score: 78 }, { month: 'Mar', score: 85 },
        { month: 'Apr', score: 80 }, { month: 'May', score: 82 }, { month: 'Jun', score: 90 },
    ];

    const subjectData = data?.subjectScores || [
        { subject: 'OS', score: 82 }, { subject: 'DBMS', score: 75 }, { subject: 'CN', score: 88 },
        { subject: 'DSA', score: 70 }, { subject: 'Java', score: 85 }, { subject: 'Python', score: 92 },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Welcome back, {user?.firstName}! 👋
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Here's your learning progress overview
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => loadDashboardData(true)}
                        className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                        style={{
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                            background: 'var(--bg-card)'
                        }}
                        disabled={refreshing}
                    >
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <Link
                        to="/student/courses"
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white gradient-primary hover:opacity-90 transition-opacity"
                    >
                        Browse Courses →
                    </Link>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <StatCard title="Enrolled Courses" value={stats.totalCourses || 0} icon={HiOutlineBookOpen} color="indigo" />
                <StatCard title="Tests Taken" value={stats.totalTests || 0} icon={HiOutlineClipboardCheck} color="emerald" />
                <StatCard title="Avg Score" value={`${stats.avgScore || 0}%`} icon={HiOutlineChartBar} color="cyan" />
                <StatCard title="Reward Points" value={stats.totalPoints || 0} icon={HiOutlineStar} color="violet" />
                <StatCard title="Notifications" value={stats.unreadNotifications || 0} icon={HiOutlineBell} color="rose" />
            </div>

            {/* New Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Completed Courses */}
                <div className="rounded-xl p-5 hover:shadow-lg transition-shadow" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>📘 Completed</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completedCourses || 0}</p>
                        </div>
                    </div>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Courses finished</p>
                    <Link to="/student/courses" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                        View Details <HiOutlineArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {/* Pending Assignments */}
                <div className="rounded-xl p-5 hover:shadow-lg transition-shadow" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <HiOutlineClock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>📝 Pending</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingAssignments || 0}</p>
                        </div>
                    </div>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Assignments due</p>
                    <Link to="/student/assessments" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                        View Details <HiOutlineArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {/* Upcoming Tests */}
                <div className="rounded-xl p-5 hover:shadow-lg transition-shadow" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                            <HiOutlineCalendar className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>📊 Upcoming</p>
                            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{stats.upcomingTests || 0}</p>
                        </div>
                    </div>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Tests scheduled</p>
                    <Link to="/student/assessments" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                        View Details <HiOutlineArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {/* Current Streak */}
                <div className="rounded-xl p-5 hover:shadow-lg transition-shadow" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                            <HiOutlineFire className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>🔥 Streak</p>
                            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.currentStreak || 0}</p>
                        </div>
                    </div>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Days active</p>
                    <Link to="/student/rewards" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                        View Details <HiOutlineArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="📈 Performance Trend">
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                }}
                            />
                            <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="📊 Subject-wise Scores">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={subjectData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                }}
                            />
                            <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Recent courses & notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                    className="rounded-xl p-5"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
                >
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>📚 Enrolled Courses</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {(data?.recentCourses || []).map((e) => (
                            <div
                                key={e._id}
                                className="p-3 rounded-lg"
                                style={{ background: 'var(--bg-tertiary)' }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {e.course?.name || 'Course'}
                                    </p>
                                    <span className="text-xs font-semibold text-indigo-500">{e.progress || 0}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full mb-2" style={{ background: 'var(--border-color)' }}>
                                    <div
                                        className="h-full rounded-full gradient-primary transition-all"
                                        style={{ width: `${e.progress || 0}%` }}
                                    />
                                </div>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {e.course?.code || 'N/A'}
                                </p>
                            </div>
                        ))}
                        {(!data?.recentCourses || data.recentCourses.length === 0) && (
                            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                                No courses enrolled yet. <Link to="/student/courses" className="text-indigo-500">Browse courses</Link>
                            </p>
                        )}
                    </div>
                </div>

                <div
                    className="rounded-xl p-5"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
                >
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>🔔 Recent Notifications</h3>
                    <div className="space-y-3">
                        {(data?.recentNotifications || []).map((n) => (
                            <div
                                key={n._id}
                                className="p-3 rounded-lg flex items-start gap-3"
                                style={{ background: 'var(--bg-tertiary)' }}
                            >
                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'
                                    }`} />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                                </div>
                            </div>
                        ))}
                        {(!data?.recentNotifications || data.recentNotifications.length === 0) && (
                            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No new notifications</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
