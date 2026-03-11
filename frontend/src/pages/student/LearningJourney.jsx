import { useEffect, useState } from 'react';
import { studentAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ChartCard from '../../components/common/ChartCard';
import { HiOutlineFire, HiOutlineCheckCircle, HiOutlineClock, HiOutlineTrendingUp, HiOutlineInformationCircle } from 'react-icons/hi';

export default function LearningJourney() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        studentAPI.getLearningJourney()
            .then((r) => setData(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    const { streak, activities } = data || {};
    const activityMap = activities?.reduce((acc, curr) => {
        acc[curr.dateString] = curr;
        return acc;
    }, {}) || {};

    // Generate heatmap data (last 6 months)
    const generateHeatmap = () => {
        const today = new Date();
        const days = [];
        for (let i = 180; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            days.push({
                date: d,
                dateString: dateStr,
                activity: activityMap[dateStr] || null
            });
        }
        return days;
    };

    const heatmapDays = generateHeatmap();

    // Group heatmap by weeks for the grid
    const weeks = [];
    let currentWeek = [];
    heatmapDays.forEach((day, i) => {
        currentWeek.push(day);
        if (day.date.getDay() === 6 || i === heatmapDays.length - 1) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    const getLevel = (points) => {
        if (!points) return 0;
        if (points >= 5) return 4;
        if (points >= 3) return 3;
        if (points >= 2) return 2;
        return 1;
    };

    const colors = [
        'var(--bg-tertiary)', // Level 0
        '#c7d2fe', // Level 1 (Light Indigo)
        '#818cf8', // Level 2
        '#6366f1', // Level 3
        '#4338ca', // Level 4 (Dark Indigo)
    ];

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>🔥 My Learning Journey</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Consistency is the key to mastery. Keep the flame alive!</p>
                </div>
                <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <HiOutlineFire className="w-8 h-8 text-orange-500 animate-pulse" />
                    <div>
                        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{streak?.current || 0}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500/70">Day Streak</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Streak Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl shadow-sm border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                            <HiOutlineTrendingUp className="w-5 h-5 text-indigo-500" /> Consistency Stats
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Current Streak</span>
                                <span className="text-lg font-bold text-orange-500 flex items-center gap-1">{streak?.current} <HiOutlineFire className="w-4 h-4" /></span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Personal Best</span>
                                <span className="text-lg font-bold text-indigo-500">{streak?.best} Days</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Last Active</span>
                                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {streak?.lastActive ? new Date(streak.lastActive).toLocaleDateString() : 'Never'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs flex gap-3" style={{ color: 'var(--text-secondary)' }}>
                            <HiOutlineInformationCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                            <p>Daily activity resets at midnight. Complete tests or watch lectures to maintain your streak.</p>
                        </div>
                    </div>
                </div>

                {/* Heatmap Grid */}
                <div className="lg:col-span-2 p-6 rounded-2xl shadow-sm border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <HiOutlineClock className="w-5 h-5 text-emerald-500" /> Activity Heatmap
                    </h3>

                    <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <div className="inline-flex flex-col gap-1 min-w-max">
                            <div className="flex gap-1">
                                {weeks.map((week, wi) => (
                                    <div key={wi} className="flex flex-col gap-1">
                                        {/* Spacer to align Friday/Saturday etc if week is short */}
                                        {wi === 0 && Array(7 - week.length).fill(0).map((_, i) => (
                                            <div key={`s-${i}`} className="w-3.5 h-3.5" />
                                        ))}
                                        {week.map((day) => (
                                            <div
                                                key={day.dateString}
                                                className="w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 hover:shadow-xs cursor-help relative group"
                                                style={{ backgroundColor: colors[getLevel(day.activity?.points)] }}
                                            >
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                                    {day.date.toLocaleDateString()}: {day.activity?.points || 0} Action{day.activity?.points === 1 ? '' : 's'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                <span>6 Months Ago</span>
                                <span>Today</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span>Less</span>
                        {colors.map((c, i) => (
                            <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                        ))}
                        <span>More</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity List */}
            <div className="p-6 rounded-2xl shadow-sm border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>Recent Timeline</h3>
                <div className="space-y-6 relative border-l-2 ml-4 pl-8" style={{ borderColor: 'var(--border-color)' }}>
                    {activities?.length > 0 ? (
                        activities.slice().reverse().slice(0, 5).map((dayRec, idx) => (
                            <div key={dayRec._id} className="relative">
                                <div className="absolute -left-[41px] top-1 p-1 rounded-full bg-white dark:bg-[#1e1e1e] border-2 border-indigo-500 z-10 transition-transform hover:scale-110">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-indigo-500" />
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                        {new Date(dayRec.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </h4>
                                    <div className="space-y-2">
                                        {dayRec.activities.map((act, ai) => (
                                            <div key={ai} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 text-xs transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/40">
                                                <span className={`px-2 py-0.5 rounded uppercase font-black text-[9px] ${act.type === 'quiz_submit' ? 'bg-amber-100 text-amber-700' :
                                                        act.type === 'lecture_view' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                                                    }`}>
                                                    {act.type.replace('_', ' ')}
                                                </span>
                                                <span className="flex-1" style={{ color: 'var(--text-secondary)' }}>{act.detail}</span>
                                                <span style={{ color: 'var(--text-muted)' }}>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No activity recorded yet. Start learning to see your timeline!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
