import { useState } from 'react';

export default function UserAvatar({ user, className = 'w-10 h-10', textClassName = 'text-sm' }) {
    const [failedUrl, setFailedUrl] = useState('');
    const imageUrl = typeof user?.avatar === 'string' ? user.avatar.trim() : '';
    const showImage = imageUrl && failedUrl !== imageUrl;
    const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}` || user?.fullName?.[0] || '?';

    return (
        <div className={`${className} shrink-0 rounded-full gradient-primary flex items-center justify-center overflow-hidden`}>
            {showImage ? (
                <img
                    src={imageUrl}
                    alt={`${user?.fullName || 'User'} profile`}
                    className="w-full h-full object-cover"
                    onError={() => setFailedUrl(imageUrl)}
                />
            ) : (
                <span className={`text-white font-semibold ${textClassName}`}>{initials}</span>
            )}
        </div>
    );
}
