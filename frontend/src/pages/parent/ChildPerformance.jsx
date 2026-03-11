import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parentAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ChartCard from '../../components/common/ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ChildPerformance() {
    const [searchParams] = useSearchParams();
    const childId = searchParams.get('childId');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!childId) {
            setLoading(false);
            return;
        }
        parentAPI.getChildPerformance(childId)
            .then((r) => setData(r.data.data))
            .catch((err) => {
                console.error('Failed to load performance:', err);
                setData(null);
            })
            .finally(() => setLoading(false));
    }, [childId]);

    if (loading) return <LoadingSpinner />;

    if (!childId) {
        return (
            <div className="text-center py-12">
                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Child Selected</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Please select a child from the dashboard to view their performance.</p>
            </div>
        );
    }

    const results = data?.results || [];
    const child = data?.child;
    const chartData = (data?.subjectAnalysis || []).map((s) => ({
        subject: s._id?.substring(0, 10),
        score: Math.round(s.avgPercentage),
        classAvg: Math.round(s.classAvg || 0),
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📊 Performance Report</h1>
                {child && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{child.firstName} {child.lastName} · {child.grade}</p>}
            </div>

            <ChartCard title="Subject Performance vs Class Average">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                            <Bar dataKey="score" fill="#6366f1" name="Child" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="classAvg" fill="#94a3b8" name="Class Avg" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No performance data yet</p>
                )}
            </ChartCard>

            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                <div className="p-5"><h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>All Results</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr style={{ background: 'var(--bg-tertiary)' }}>
                            {['Assessment', 'Score', '%', 'Grade', 'Date'].map((h) => (
                                <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {results.map((r) => (
                                <tr key={r._id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{r.assessment?.title}</td>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{r.obtainedMarks}/{r.totalMarks}</td>
                                    <td className="px-4 py-3"><span className={r.percentage >= 60 ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}>{r.percentage}%</span></td>
                                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{r.grade}</span></td>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {results.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>No results</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
