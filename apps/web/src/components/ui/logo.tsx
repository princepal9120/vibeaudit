import React from "react";



interface LogoMarkProps {
    className?: string;
    variant?: 'default' | 'light';
}

interface LogoProps {
    className?: string;
    iconClassName?: string;
    textClassName?: string;
    showText?: boolean;
    variant?: 'default' | 'light';
}

export function LogoMark({ className, variant = 'default' }: LogoMarkProps) {
    // Light variant uses electric green for dark backgrounds
    const strokeClass = variant === 'light'
        ? 'stroke-[#00FF88]'
        : 'stroke-emerald-600 dark:stroke-emerald-500';

    return (
        <svg
            className={className}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="VibeAudit Logo Mark"
        >
            {/* Primary Shape: Abstract Shield / V / Check */}
            <path
                d="M16 2.5C9 2.5 5 6 4 11V16C4 22 10 27 16 30C22 27 28 22 28 16V11C27 6 23 2.5 16 2.5Z"
                className={strokeClass}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            {/* Inner Checkmark / Pulse */}
            <path
                d="M11 16L14.5 19.5L21 12.5"
                className={strokeClass}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function Logo({
    className = "",
    iconClassName = "w-8 h-8",
    textClassName = "text-xl",
    showText = true,
    variant = 'default'
}: LogoProps) {
    // Light variant uses white text for dark backgrounds
    const textClass = variant === 'light'
        ? 'text-white'
        : 'text-slate-900 dark:text-white';

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <LogoMark className={iconClassName} variant={variant} />
            {showText && (
                <span className={`font-bold tracking-tight ${textClass} ${textClassName}`}>
                    VibeAudit
                </span>
            )}
        </div>
    );
}
