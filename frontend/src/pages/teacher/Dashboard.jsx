import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherAPI } from '../../services/apiService';
import StatCard from '../../components/common/StatCard';
import ChartCard from '../../components/common/ChartCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlineBookOpen, HiOutlineUsers, HiOutlineClipboardCheck, HiOutlinePencilAlt, HiOutlineExclamation, HiOutlineRefresh } from 'react-icons/hi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadDashboardData = async (showRefreshLoading = false) => {
        try {
            if (showRefreshLoading) setRefreshing(true);
            const res = await teacherAPI.getDashboard();
            setData(res.data.data);
            setError(null);
        } catch (err) {
            console.error('Teacher dashboard error:', err);
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
    const s = data?.stats || {};
    const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    const courseData = (data?.courses || []).map((c, i) => ({
        name: c.name?.substring(0, 12),
        value: c.studentCount || 1,
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome, {user?.firstName}! 👨‍🏫</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage your courses, assessments, and students</p>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="My Courses" value={s.totalCourses || 0} icon={HiOutlineBookOpen} color="indigo" />
                <StatCard title="Total Students" value={s.totalStudents || 0} icon={HiOutlineUsers} color="emerald" />
                <StatCard title="Assessments" value={s.totalAssessments || 0} icon={HiOutlinePencilAlt} color="amber" />
                <StatCard title="Pending Submissions" value={s.pendingSubmissions || 0} icon={HiOutlineClipboardCheck} color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="📊 Students per Course">
                    {courseData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={courseData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                                    {courseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No courses yet</p>
                    )}
                </ChartCard>

                <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>📋 Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[{ label: 'Upload Content', href: '/teacher/content', icon: '📤', color: 'from-indigo-500 to-indigo-600' },
                        { label: 'Create Test', href: '/teacher/assessments', icon: '📝', color: 'from-emerald-500 to-emerald-600' },
                        { label: 'Grade Work', href: '/teacher/grading', icon: '✅', color: 'from-amber-500 to-amber-600' },
                        { label: 'View Analytics', href: '/teacher/analytics', icon: '📊', color: 'from-cyan-500 to-cyan-600' },
                        ].map((a) => (
                            <Link
                                key={a.label}
                                to={a.href}
                                className={`bg-gradient-to-br ${a.color} text-white p-4 rounded-xl text-center hover:opacity-90 transition-opacity block`}
                            >
                                <span className="text-2xl block mb-1">{a.icon}</span>
                                <span className="text-sm font-medium">{a.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
