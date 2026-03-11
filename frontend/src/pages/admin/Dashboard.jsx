import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/apiService';
import StatCard from '../../components/common/StatCard';
import ChartCard from '../../components/common/ChartCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlineUsers, HiOutlineBookOpen, HiOutlineClipboardCheck, HiOutlineUserGroup, HiOutlineExclamation, HiOutlineRefresh } from 'react-icons/hi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadDashboardData = async (showRefreshLoading = false) => {
        try {
            if (showRefreshLoading) setRefreshing(true);
            const res = await adminAPI.getDashboard();
            setData(res.data.data);
            setError(null);
        } catch (err) {
            console.error('Admin dashboard error:', err);
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
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
    const roleData = [
        { name: 'Students', value: s.totalStudents || 0 },
        { name: 'Teachers', value: s.totalTeachers || 0 },
        { name: 'Parents', value: s.totalParents || 0 },
        { name: 'Admins', value: s.totalAdmins || 0 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Dashboard 🛡️</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>System overview and management</p>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <StatCard title="Total Users" value={s.totalUsers || 0} icon={HiOutlineUsers} color="indigo" />
                <StatCard title="Students" value={s.totalStudents || 0} icon={HiOutlineUserGroup} color="emerald" />
                <StatCard title="Teachers" value={s.totalTeachers || 0} icon={HiOutlineUserGroup} color="cyan" />
                <StatCard title="Courses" value={s.totalCourses || 0} icon={HiOutlineBookOpen} color="amber" />
                <StatCard title="Assessments" value={s.totalAssessments || 0} icon={HiOutlineClipboardCheck} color="rose" />
                <StatCard title="Active (7d)" value={s.activeUsersLast7Days || 0} icon={HiOutlineUsers} color="violet" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="📊 User Distribution">
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={roleData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                {roleData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>👤 Recent Registrations</h3>
                    <div className="space-y-3">
                        {(data?.recentUsers || []).map((u) => (
                            <div key={u._id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{u.firstName?.[0]}{u.lastName?.[0]}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.firstName} {u.lastName}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full capitalize ${u.role === 'student' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                        : u.role === 'teacher' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : u.role === 'parent' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                    }`}>{u.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
