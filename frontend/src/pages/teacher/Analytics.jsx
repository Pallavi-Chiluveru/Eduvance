import { useEffect, useState } from 'react';
import { teacherAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ChartCard from '../../components/common/ChartCard';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { HiOutlineUsers, HiOutlineAcademicCap, HiOutlineClock, HiOutlineTrendingUp, HiOutlineLightBulb } from 'react-icons/hi';

export default function TeacherAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        teacherAPI.getAnalytics()
            .then((r) => setData(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    const kpis = data?.kpis || { avgAttendance: 0, avgGrade: 0, passRate: 0, totalEnrollments: 0 };
    const perfDist = data?.performanceDistribution || [];
    const topicPerf = data?.topicPerformance || [];
    const trendData = data?.engagementTrend || [];
    const insights = data?.aiInsights || [];

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="rounded-xl p-5 flex items-center gap-4 animate-fade-in"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📊 Academic Analytics</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Real-time student performance & engagement insights</p>
                </div>
                <div className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    Live Dashboard
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={HiOutlineUsers} label="Total Students" value={kpis.totalEnrollments} color="bg-indigo-500" />
                <StatCard icon={HiOutlineAcademicCap} label="Avg. Grade" value={`${kpis.avgGrade}%`} color="bg-emerald-500" />
                <StatCard icon={HiOutlineTrendingUp} label="Pass Rate" value={`${kpis.passRate}%`} color="bg-cyan-500" />
            </div>

            {/* Main Engagement Trend */}
            <ChartCard title="Student Engagement Trend (Submissions)">
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
                            <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Distribution */}
                <ChartCard title="Performance Split" className="lg:col-span-1">
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={perfDist}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {perfDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                        {perfDist.map((d) => (
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                            </div>
                        ))}
                    </div>
                </ChartCard>

                {/* AI Insights & Radar */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Radar Chart: Topic Difficulty */}
                        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Top Topics Mastery</h3>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topicPerf}>
                                        <PolarGrid stroke="var(--border-color)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                        <Radar name="Performance" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.6} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* AI Insight Cards */}
                        <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-primary)', border: '1px dashed var(--color-primary)' }}>
                            <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                                <HiOutlineLightBulb className="w-5 h-5" />
                                AI ASSISTANT INSIGHTS
                            </div>
                            <div className="space-y-3">
                                {insights.map((insight, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 text-xs font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                        {insight}
                                    </div>
                                ))}
                                {insights.length === 0 && <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>Analyzing class patterns...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Detailed Student Lists */}
                <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h3 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                        <span className="text-emerald-500">🏆</span> Top Performers
                    </h3>
                    <div className="space-y-3">
                        {data?.topPerformers?.map((s, i) => (
                            <div key={s.student?._id || i} className="flex items-center justify-between p-4 rounded-xl transition-all hover:translate-x-1" style={{ background: 'var(--bg-tertiary)' }}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-400 text-white' : 'bg-indigo-100 text-indigo-600'}`}>{i + 1}</div>
                                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.student?.firstName} {s.student?.lastName}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-indigo-600">{s.avgPercentage}%</p>
                                    <p className="text-[10px] uppercase tracking-tighter" style={{ color: 'var(--text-muted)' }}>{s.testsCompleted} Tests</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h3 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                        <span className="text-rose-500">🚩</span> Priority Interventions
                    </h3>
                    <div className="space-y-3">
                        {data?.weakStudents?.map((s, i) => (
                            <div key={s.student?._id || i} className="flex items-center justify-between p-4 rounded-xl border border-rose-100 dark:border-rose-900/30" style={{ background: 'rgba(239, 68, 68, 0.03)' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                                        {s.student?.firstName?.[0]}{s.student?.lastName?.[0]}
                                    </div>
                                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.student?.firstName} {s.student?.lastName}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-rose-600">{s.avgPercentage}%</p>
                                    <button className="text-[10px] bg-rose-600 text-white px-2 py-1 rounded-md mt-1 hover:bg-rose-700">Action</button>
                                </div>
                            </div>
                        ))}
                        {(!data?.weakStudents || data.weakStudents.length === 0) && (
                            <p className="text-center py-8 text-sm italic" style={{ color: 'var(--text-muted)' }}>No high-priority students at the moment.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
