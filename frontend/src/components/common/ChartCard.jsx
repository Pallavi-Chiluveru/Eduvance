export default function ChartCard({ title, children, className = '' }) {
    return (
        <div
            className={`rounded-xl p-5 animate-slide-up ${className}`}
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
            }}
        >
            {title && (
                <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {title}
                </h3>
            )}
            <div className="w-full">{children}</div>
        </div>
    );
}
