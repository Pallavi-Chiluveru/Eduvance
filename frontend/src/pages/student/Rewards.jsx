import { useEffect, useState } from 'react';
import { studentAPI } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
    HiOutlineStar,
    HiOutlineSparkles,
    HiOutlineTrendingUp,
    HiOutlineCollection,
    HiOutlineFire,
    HiOutlineLightBulb,
    HiOutlineAcademicCap,
    HiOutlineCalendar,
    HiOutlineEmojiHappy
} from 'react-icons/hi';

const BADGE_CONFIG = {
    'first_login': { icon: HiOutlineEmojiHappy, color: 'emerald' },
    'course_complete': { icon: HiOutlineAcademicCap, color: 'indigo' },
    'perfect_score': { icon: HiOutlineSparkles, color: 'amber' },
    'streak_7': { icon: HiOutlineFire, color: 'orange' },
    'streak_30': { icon: HiOutlineFire, color: 'rose' },
    'top_performer': { icon: HiOutlineTrendingUp, color: 'sky' },
    'quick_learner': { icon: HiOutlineLightBulb, color: 'yellow' },
    'flashcard_master': { icon: HiOutlineCollection, color: 'violet' },
    'attendance_star': { icon: HiOutlineCalendar, color: 'pink' },
    'explorer': { icon: HiOutlineCollection, color: 'cyan' },
};

export default function StudentRewards() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        studentAPI.getRewards()
            .then((r) => setData(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    const rewards = data?.rewards || [];
    const totalPoints = data?.totalPoints || 0;
    const badges = rewards.filter((r) => r.type === 'badge');

    // Level calculation (Example: Level 1 every 100 points)
    const level = Math.floor(totalPoints / 100) + 1;
    const nextLevelXP = level * 100;
    const prevLevelXP = (level - 1) * 100;
    const progress = ((totalPoints - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

    const getLevelTitle = (lvl) => {
        if (lvl >= 10) return 'Legendary Scholar';
        if (lvl >= 5) return 'Academic Elite';
        if (lvl >= 3) return 'Rising Star';
        return 'Knowledge Seeker';
    };

    return (
        <div className="space-y-8 pb-12">
            <header>
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>🏆 Hall of Fame</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Celebrate your academic milestones and earned achievements.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Level Up Progress Card */}
                <div className="lg:col-span-2 p-8 rounded-3xl shadow-sm border overflow-hidden relative"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    {/* Decorative Background */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 px-3 py-1 rounded-full bg-indigo-500/10 mb-2 inline-block">Current Rank</span>
                            <h2 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{getLevelTitle(level)}</h2>
                        </div>
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-4xl text-white font-black italic">L{level}</span>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{totalPoints} XP Total</span>
                            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{nextLevelXP - totalPoints} XP to Level {level + 1}</span>
                        </div>
                        <div className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-black" style={{ color: 'var(--text-muted)' }}>
                            <span>LVL {level}</span>
                            <span>LVL {level + 1}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 rounded-2xl border flex items-center gap-4 shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-500">
                            <HiOutlineStar className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{totalPoints}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Total Points</div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl border flex items-center gap-4 shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-500">
                            <HiOutlineSparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{badges.length}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Badges Earned</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Collection */}
            <div className="p-8 rounded-3xl border shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-center" style={{ color: 'var(--text-muted)' }}>Achievements Showcase</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {badges.map((b) => {
                        const config = BADGE_CONFIG[b.badge] || { icon: HiOutlineStar, color: 'indigo' };
                        const Icon = config.icon;
                        return (
                            <div key={b._id} className="group flex flex-col items-center">
                                <div className={`relative w-20 h-20 mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                    {/* Badge Shape */}
                                    <div className={`absolute inset-0 bg-${config.color}-500 rounded-[2rem] rotate-45 shadow-lg opacity-20`}></div>
                                    <div className={`absolute inset-1 bg-${config.color}-500 rounded-[1.8rem] rotate-[60deg] shadow-lg opacity-10`}></div>
                                    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-${config.color}-400 to-${config.color}-600 rounded-3xl shadow-xl z-10`}>
                                        <Icon className="w-10 h-10 text-white" />
                                    </div>
                                    {/* Glossy Overlay */}
                                    <div className="absolute inset-2 bg-white/20 rounded-full blur-xl pointer-events-none z-20"></div>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-black leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>{b.title}</p>
                                    <p className="text-[9px] font-bold uppercase text-indigo-500">+{b.points} Points</p>
                                </div>
                            </div>
                        );
                    })}
                    {badges.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center opacity-30">
                            <HiOutlineCollection className="w-16 h-16 mb-4" style={{ color: 'var(--text-muted)' }} />
                            <p className="text-sm font-bold italic" style={{ color: 'var(--text-muted)' }}>Badge case is empty. Complete tasks to fill it!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Achievement History */}
            <div className="p-8 rounded-3xl border shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8" style={{ color: 'var(--text-muted)' }}>Recent Accomplishments</h3>
                <div className="space-y-4">
                    {rewards.length > 0 ? (
                        rewards.slice().reverse().map((r) => (
                            <div key={r._id} className="flex items-center justify-between p-5 rounded-2xl transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/20"
                                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1e1e1e] border-2 border-amber-500/50 flex items-center justify-center font-bold text-amber-500 text-xs">
                                        XP
                                    </div>
                                    <div>
                                        <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                                        <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{r.description || r.type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{new Date(r.earnedAt).toLocaleDateString()}</span>
                                    <div className="text-lg font-black text-amber-500">+{r.points}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No achievements yet. Your journey begins today!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
