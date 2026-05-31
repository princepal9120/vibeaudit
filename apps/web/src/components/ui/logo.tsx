import React from "react";

/**
 * VibeAudit Brand Logo
 * 
 * Design Philosophy:
 * - Geometric Construction: Based on a 32x32 grid for perfect scaling.
 * - Symbolism: Combines a Shield (security), letter 'V' (Vibe), and a Checkmark (Audit/Verified).
 * - Style: Minimalist, heavy stroke for readability at small sizes.
 * - Colors: Emerald-600 (Trust/Pass), Slate-900 (Authority).
 */

interface LogoProps {
    className?: string;
    iconClassName?: string;
    textClassName?: string;
    showText?: boolean;
}

export function LogoMark({ className }: { className?: string }) {
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
                className="stroke-emerald-600 dark:stroke-emerald-500"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            {/* Inner Checkmark / Pulse */}
            <path
                d="M11 16L14.5 19.5L21 12.5"
                className="stroke-emerald-600 dark:stroke-emerald-500"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function Logo({ className = "", iconClassName = "w-8 h-8", textClassName = "text-xl", showText = true }: LogoProps) {
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <LogoMark className={`${iconClassName}`} />
            {showText && (
                <span className={`font-bold tracking-tight text-slate-900 dark:text-white ${textClassName}`}>
                    VibeAudit
                </span>
            )}
        </div>
    );
}
