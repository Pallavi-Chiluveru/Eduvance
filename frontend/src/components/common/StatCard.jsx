export default function StatCard({ title, value, icon: Icon, trend, color = 'indigo', subtitle }) {
    const colorMap = {
        indigo: 'from-indigo-500 to-indigo-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        rose: 'from-rose-500 to-rose-600',
        cyan: 'from-cyan-500 to-cyan-600',
        violet: 'from-violet-500 to-violet-600',
    };

    return (
        <div
            className="rounded-xl p-5 animate-slide-up"
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
            }}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                        {title}
                    </p>
                    <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {value}
                    </h3>
                    {subtitle && (
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {subtitle}
                        </p>
                    )}
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                            <span>{trend >= 0 ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend)}% from last month</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${colorMap[color]} shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                )}
            </div>
        </div>
    );
}
