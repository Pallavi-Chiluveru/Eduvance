import React from 'react';

/**
 * Logo Component for Digital Learning Support and Evaluation System
 * @param {string} className - Optional tailwind classes for sizing/spacing
 * @param {boolean} showText - Whether to show the logo text next to the icon
 * @param {string} size - size of the icon (xs, sm, md, lg, xl)
 * @param {string} variant - 'light' (for dark backgrounds) or 'dark' (for light backgrounds)
 */
const Logo = ({ className = '', showText = true, size = 'md', variant = 'dark' }) => {
    const sizes = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
        '2xl': 'w-24 h-24'
    };

    const textSizes = {
        xs: 'text-sm',
        sm: 'text-base',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-4xl',
        '2xl': 'text-6xl'
    };

    const iconClasses = sizes[size] || sizes.md;
    const textSizeClass = textSizes[size] || textSizes.md;

    const textColor = variant === 'light' ? 'text-white' : 'text-slate-900 dark:text-white';
    const brandGradient = 'from-blue-500 via-indigo-500 to-purple-500';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <img
                src={import.meta.env.BASE_URL ? `${import.meta.env.BASE_URL}logo.png` : '/logo.png'}
                alt="Logo"
                className={`object-contain ${iconClasses}`}
            />
            {showText && (
                <span className={`font-bold tracking-tight ${textSizeClass} ${textColor}`}>
                    <span className="bg-gradient-to-r from-blue-400 via-sky-500 to-green-400 bg-clip-text text-transparent">
                        Eduvance
                    </span>
                </span>
            )}
        </div>
    );
};

export default Logo;
