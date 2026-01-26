"use client";

import { FadeIn } from "@/components/ui/motion";
import { Search, Globe, Sparkles, FileText, Lock, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        icon: Search,
        title: "Deep Code Scanning",
        desc: "We analyze your codebase for secrets, vulnerabilities, and bad patterns - especially ones AI tools create.",
        gradient: "from-cyan-500/20 to-blue-500/20",
    },
    {
        icon: Globe,
        title: "Live Website Analysis",
        desc: "Security headers, SSL config, exposed endpoints - we check your running app too.",
        gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
        icon: Sparkles,
        title: "AI-Aware Detection",
        desc: "Tuned for patterns that Cursor, Claude, and other AI tools commonly produce.",
        gradient: "from-violet-500/20 to-purple-500/20",
    },
    {
        icon: FileText,
        title: "Plain English Reports",
        desc: "No security jargon. Every issue explained like you're talking to a helpful friend.",
        gradient: "from-amber-500/20 to-orange-500/20",
    },
    {
        icon: Lock,
        title: "Zero Data Storage",
        desc: "We clone, scan, and delete. Your code never stays on our servers.",
        gradient: "from-rose-500/20 to-pink-500/20",
    },
    {
        icon: BarChart3,
        title: "Shareable PDF",
        desc: "Professional reports for clients, investors, or your co-founder.",
        gradient: "from-sky-500/20 to-indigo-500/20",
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 px-4 sm:px-6 bg-muted/20 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-dot-pattern opacity-30" />

            <div className="container relative z-10">
                <FadeIn>
                    <div className="text-center mb-16">
                        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
                            Features
                        </p>
                        <h2
                            className="text-3xl sm:text-4xl lg:text-5xl mb-4"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Enterprise Grade. Indie Price.
                        </h2>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Security without the confusing jargon.
                        </p>
                    </div>
                </FadeIn>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((item, i) => (
                        <FadeIn key={i} delay={i * 0.08}>
                            <motion.div
                                className="group relative h-full"
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="relative h-full bg-card border border-border rounded-2xl p-8 overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg">
                                    {/* Gradient background on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    {/* Content */}
                                    <div className="relative">
                                        {/* Icon */}
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                                            <item.icon className="w-7 h-7 text-primary" />
                                        </div>

                                        <h3
                                            className="text-lg font-bold mb-3"
                                            style={{ fontFamily: "var(--font-display)" }}
                                        >
                                            {item.title}
                                        </h3>

                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>

                                    {/* Corner decoration */}
                                    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </motion.div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
