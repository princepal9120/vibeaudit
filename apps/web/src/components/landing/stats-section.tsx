"use client";

import { FadeIn } from "@/components/ui/motion";
import { Zap, Clock, TrendingUp, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
    { value: 48, suffix: "%", label: "of AI code contains security flaws", icon: Zap },
    { value: 2, suffix: " min", label: "average scan time", icon: Clock },
    { value: 30, prefix: "$", label: "per scan, no subscription", icon: TrendingUp },
    { value: 100, suffix: "+", label: "security checks performed", icon: Shield },
];

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;

        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [isInView, value]);

    return (
        <span ref={ref} className="tabular-nums">
            {prefix}{count}{suffix}
        </span>
    );
}

export default function StatsSection() {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <section className="py-24 px-4 sm:px-6 bg-muted/30 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />

            <div className="container relative z-10">
                <FadeIn>
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2
                            className="text-3xl sm:text-4xl lg:text-5xl mb-4"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Scan your code in{" "}
                            <span className="relative inline-block">
                                <motion.span
                                    className="absolute inset-0 bg-primary rounded-lg"
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    style={{ originX: 0 }}
                                />
                                <span className="relative z-10 text-primary-foreground px-3 py-1">2 minutes</span>
                            </span>
                        </h2>
                        <p className="text-lg sm:text-xl text-muted-foreground">
                            Most security tools {isMobile === true && <br />} are{" "}
                            <span className="text-destructive font-medium line-through decoration-2">
                                enterprise bloatware
                            </span>
                            . <br />
                            ShipSafe is built for speed.
                        </p>
                    </div>
                </FadeIn>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map((item, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <motion.div
                                className="group relative bg-card border border-border rounded-2xl p-8 text-center overflow-hidden"
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Hover glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Icon */}
                                <div className="relative w-14 h-14 mx-auto mb-5 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <item.icon className="w-7 h-7 text-primary" />
                                </div>

                                {/* Stat value */}
                                <p
                                    className="relative text-4xl lg:text-5xl font-bold text-foreground mb-2"
                                    style={{ fontFamily: "var(--font-display)" }}
                                >
                                    <AnimatedCounter
                                        value={item.value}
                                        prefix={item.prefix || ""}
                                        suffix={item.suffix || ""}
                                    />
                                </p>

                                {/* Label */}
                                <p className="relative text-sm text-muted-foreground">{item.label}</p>
                            </motion.div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
