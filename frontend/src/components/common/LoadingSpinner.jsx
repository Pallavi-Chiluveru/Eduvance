export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
    const sizes = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-4',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className={`${sizes[size]} border-indigo-500 border-t-transparent rounded-full animate-spin`} />
            {text && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{text}</p>}
        </div>
    );
}
