"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn, Stagger, FloatingElement } from "@/components/ui/motion";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { CheckCircle2, ArrowRight, Shield, AlertTriangle, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
    return (
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-hero" />
            <div className="absolute inset-0 bg-dot-pattern opacity-50" />

            {/* Animated gradient orbs */}
            <motion.div
                className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute bottom-0 right-[10%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]"
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <div className="container relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <Stagger className="text-left">
                        {/* Badge */}
                        <FadeIn>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                                </span>
                                Now scanning 10,000+ repos
                            </div>
                        </FadeIn>

                        <FadeIn>
                            <h1
                                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] tracking-tight mb-0"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                <span className="text-foreground">Security scanning for</span>
                                <br />
                                <span className="text-gradient-cyan mt-2 block">
                                    <TypewriterEffect
                                        words={[
                                            { text: "Indie Hackers" },
                                            { text: "Vibe Coders" },
                                            { text: "Solo Devs" },
                                            { text: "Non-Tech Founders" },
                                        ]}
                                        className="text-gradient-cyan"
                                        cursorClassName="bg-primary h-8 sm:h-12 lg:h-14"
                                    />
                                </span>
                            </h1>
                        </FadeIn>

                        <FadeIn delay={0.1}>
                            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mt-6 leading-relaxed">
                                AI writes 48% of your code, but it doesn&apos;t check for security.
                                ShipSafe scans your GitHub & Live App in{" "}
                                <span className="text-foreground font-semibold">2 minutes</span>.
                            </p>
                            <p className="text-foreground font-medium mt-3">
                                Zero setup. Plain English reports.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.2} className="flex flex-col sm:flex-row gap-4 mt-8">
                            <Button
                                size="xl"
                                variant="glow"
                                asChild
                                className="group"
                            >
                                <Link href="/signup" className="flex items-center gap-2">
                                    Start Free Security Scan
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button
                                size="xl"
                                variant="outline"
                                asChild
                            >
                                <Link href="#how-it-works">See How It Works</Link>
                            </Button>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    No credit card required
                                </span>
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    2 minute setup
                                </span>
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    SOC 2 compliant
                                </span>
                            </div>
                        </FadeIn>
                    </Stagger>

                    {/* Hero Dashboard Mockup */}
                    <FloatingElement delay={0.4} className="relative hidden lg:block">
                        {/* Glow behind card */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/30 to-accent/20 rounded-3xl blur-3xl opacity-60" />

                        <div className="relative bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Browser chrome */}
                            <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                                    <div className="w-3 h-3 rounded-full bg-primary/60" />
                                </div>
                                <div className="flex-1 ml-4">
                                    <div className="bg-background px-4 py-1.5 rounded-lg border border-border text-xs text-muted-foreground font-mono max-w-xs">
                                        shipsafe.dev/scan/my-app
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard content */}
                            <div className="p-6 space-y-5">
                                {/* Score header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                                            Security Score
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <motion.span
                                                className="text-5xl font-bold text-primary"
                                                style={{ fontFamily: "var(--font-display)" }}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.8, duration: 0.5 }}
                                            >
                                                78
                                            </motion.span>
                                            <span className="text-lg text-muted-foreground">/100</span>
                                        </div>
                                    </div>

                                    {/* Circular progress */}
                                    <div className="relative w-20 h-20">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="42"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                className="text-muted/30"
                                            />
                                            <motion.circle
                                                cx="50"
                                                cy="50"
                                                r="42"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                className="text-primary"
                                                initial={{ strokeDasharray: "264", strokeDashoffset: "264" }}
                                                animate={{ strokeDashoffset: "58" }}
                                                transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-bold text-primary">B+</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Findings list */}
                                <div className="space-y-3">
                                    {[
                                        { icon: AlertTriangle, label: "Exposed API Key", severity: "CRITICAL", color: "destructive" },
                                        { icon: Shield, label: "Missing Rate Limiting", severity: "HIGH", color: "amber-500" },
                                        { icon: Lock, label: "HTTPS Enforced", severity: "PASSED", color: "primary" },
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item.label}
                                            className={`flex items-center justify-between p-3 rounded-xl border ${item.color === "destructive"
                                                    ? "bg-destructive/5 border-destructive/20"
                                                    : item.color === "amber-500"
                                                        ? "bg-amber-500/5 border-amber-500/20"
                                                        : "bg-primary/5 border-primary/20"
                                                }`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1 + index * 0.15 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon
                                                    className={`w-4 h-4 ${item.color === "destructive"
                                                            ? "text-destructive"
                                                            : item.color === "amber-500"
                                                                ? "text-amber-500"
                                                                : "text-primary"
                                                        }`}
                                                />
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </div>
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${item.color === "destructive"
                                                        ? "bg-destructive text-destructive-foreground"
                                                        : item.color === "amber-500"
                                                            ? "bg-amber-500 text-white"
                                                            : "bg-primary text-primary-foreground"
                                                    }`}
                                            >
                                                {item.severity}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Scan progress indicator */}
                                <motion.div
                                    className="pt-3 border-t border-border"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.5 }}
                                >
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                        <span>Scan completed</span>
                                        <span className="text-foreground font-medium">14 findings</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ delay: 1.6, duration: 0.8 }}
                                        />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </FloatingElement>
                </div>
            </div>
        </section>
    );
}
