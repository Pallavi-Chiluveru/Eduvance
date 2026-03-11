import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import ChartCard from '../../components/common/ChartCard';
import { HiOutlineUsers, HiOutlineClipboardCheck, HiOutlineChartBar, HiOutlineCalendar } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SystemAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminAPI.getAnalytics().then((r) => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    const roles = data?.usersByRole || {};
    const chartData = Object.entries(roles).map(([role, count]) => ({ role: role.charAt(0).toUpperCase() + role.slice(1), count }));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📊 System Analytics</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="New Users (30d)" value={data?.newUsersLast30Days || 0} icon={HiOutlineUsers} color="indigo" />
                <StatCard title="Total Submissions" value={data?.totalSubmissions || 0} icon={HiOutlineClipboardCheck} color="emerald" />
                <StatCard title="Platform Avg Score" value={`${data?.platformAvgScore || 0}%`} icon={HiOutlineChartBar} color="amber" />
                <StatCard title="Active Users" value={Object.values(roles).reduce((s, v) => s + v, 0)} icon={HiOutlineCalendar} color="cyan" />
            </div>

            <ChartCard title="Users by Role">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="role" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No analytics data</p>
                )}
            </ChartCard>
        </div>
    );
}
