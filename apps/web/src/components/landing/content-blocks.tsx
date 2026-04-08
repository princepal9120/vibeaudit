"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StepBlockProps {
    number: number;
    title: string;
    description: string;
    variant?: "card" | "list";
    icon?: ReactNode;
}

export function StepBlock({
    number,
    title,
    description,
    variant = "card"
}: StepBlockProps) {
    if (variant === "list") {
        return (
            <motion.div
                className="flex gap-6 group"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all">
                        {number}
                    </div>
                </div>
                <div className="pt-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-base text-secondary-foreground leading-relaxed max-w-md">{description}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="relative bg-white border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group overflow-hidden"
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* Gradient glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:scale-110 transition-all">
                    {number}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
                <p className="text-base text-secondary-foreground leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
}

interface PersonaCardProps {
    title: string;
    description: string;
    icon?: ReactNode;
    bullets?: string[];
    footer?: string;
}

export function PersonaCard({
    title,
    description,
    icon,
    bullets,
    footer
}: PersonaCardProps) {
    return (
        <motion.div
            className="relative bg-white border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all h-full group overflow-hidden"
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* Accent gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />

            <div className="relative z-10 flex flex-col h-full">
                {icon && (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                )}
                <h3 className="text-2xl font-bold text-foreground mb-4">{title}</h3>
                <p className="text-base leading-relaxed text-secondary-foreground flex-grow">
                    {description}
                </p>
                {bullets && (
                    <ul className="space-y-3 mt-6 pt-6 border-t border-border/50">
                        {bullets.map((bullet, idx) => (
                            <li key={idx} className="flex gap-3 text-secondary-foreground text-sm">
                                <span className="text-primary font-bold">→</span>
                                <span className="italic">{bullet}</span>
                            </li>
                        ))}
                    </ul>
                )}
                {footer && (
                    <div className="mt-6 pt-6 border-t border-border/50">
                        <p className="text-sm font-semibold text-primary bg-primary/5 px-4 py-3 rounded-xl">{footer}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

interface OutcomeCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    compare?: {
        bad: string;
        good: string;
    }
}

export function OutcomeCard({
    title,
    description,
    icon,
    compare
}: OutcomeCardProps) {
    return (
        <motion.div
            className="relative bg-white border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all h-full group overflow-hidden"
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
                <p className="text-base text-secondary-foreground leading-relaxed mb-6">
                    {description}
                </p>

                {compare && (
                    <div className="space-y-3">
                        <div className="bg-red-50 border border-red-100 border-l-4 border-l-red-400 p-4 rounded-xl">
                            <p className="text-[11px] uppercase tracking-wider text-red-400 font-semibold mb-1">Before</p>
                            <code className="text-xs text-red-600 line-through">{compare.bad}</code>
                        </div>
                        <div className="bg-primary/5 border border-primary/20 border-l-4 border-l-primary p-4 rounded-xl">
                            <p className="text-[11px] uppercase tracking-wider text-primary font-semibold mb-1">After</p>
                            <code className="text-xs text-foreground">{compare.good}</code>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
