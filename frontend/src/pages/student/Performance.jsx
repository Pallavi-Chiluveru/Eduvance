import { useEffect, useState } from 'react';
import { studentAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ChartCard from '../../components/common/ChartCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend } from 'recharts';

export default function StudentPerformance() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        studentAPI.getPerformance()
            .then((r) => setData(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    // Filter results to ensure a clean view (though backend fix handles most of it)
    const results = (data?.results || []).filter(r => r.assessment && r.assessment.course);
    const subjectAnalysis = data?.subjectAnalysis || [];

    // Nice horizontal bar chart for subject performance
    const subWiseData = subjectAnalysis.map((s) => ({
        subject: s.subject,
        avgScore: s.avgScore,
    })).sort((a, b) => b.avgScore - a.avgScore);

    // Recent results with subject names instead of generic "Test"
    const recentScores = results.slice(0, 8).map((r) => ({
        displayName: r.assessment?.course?.name?.substring(0, 10) || 'Unknown',
        fullTitle: r.assessment?.title,
        score: r.percentage,
        subject: r.assessment?.course?.name
    })).reverse();

    return (
        <div className="space-y-6 pb-12">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📊 Performance Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Subject-wise Proficiency (%)">
                    {subWiseData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={subWiseData} layout="vertical" margin={{ left: 40, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis
                                    dataKey="subject"
                                    type="category"
                                    width={100}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#6366f1' }}
                                />
                                <Bar dataKey="avgScore" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                                    {subWiseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.avgScore >= 70 ? '#10b981' : entry.avgScore >= 40 ? '#6366f1' : '#f43f5e'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 space-y-2">
                            <p style={{ color: 'var(--text-muted)' }}>No proficiency data available.</p>
                        </div>
                    )}
                </ChartCard>

                <ChartCard title="Progression (Latest Scores)">
                    {recentScores.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={recentScores}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis
                                    dataKey="displayName"
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                    interval={0}
                                />
                                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="p-3 rounded-lg shadow-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{payload[0].payload.fullTitle}</p>
                                                    <p className="text-sm font-semibold" style={{ color: '#6366f1' }}>{payload[0].value}% Score</p>
                                                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{payload[0].payload.subject}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="score" fill="#c7d2fe" radius={[4, 4, 0, 0]} barSize={40}>
                                    {recentScores.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === recentScores.length - 1 ? '#6366f1' : '#c7d2fe'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 space-y-2">
                            <p style={{ color: 'var(--text-muted)' }}>Attempt a quiz to see your progress chart!</p>
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* Results table */}
            <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>📋 Academic Record</h3>
                    <span className="text-xs px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 font-medium">
                        Total Tests: {results.length}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: 'var(--bg-tertiary)' }}>
                                {['Assessment', 'Subject', 'Marks', '%', 'Grade', 'Date'].map((h) => (
                                    <th key={h} className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                            {results.map((r, idx) => (
                                <tr key={r._id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                                    <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{r.assessment?.title}</td>
                                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                            {r.assessment?.course?.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>{r.obtainedMarks}/{r.totalMarks}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                <div
                                                    className={`h-full ${r.percentage >= 60 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                    style={{ width: `${r.percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className={`font-bold text-xs ${r.percentage >= 60 ? 'text-emerald-500' : 'text-rose-500'}`}>{r.percentage}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${r.grade === 'A+' || r.grade === 'A' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                                r.grade?.startsWith('B') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' :
                                                    r.grade === 'F' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' :
                                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                            }`}>
                                            {r.grade || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                </tr>
                            ))}
                            {results.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>No academic records found. Start taking tests to see your performance here!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
