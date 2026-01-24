"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn, Stagger, FloatingElement } from "@/components/ui/motion";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative py-20 lg:py-28 px-4 sm:px-6 overflow-hidden bg-background">
            <div className="container relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <Stagger className="text-left">
                        <FadeIn>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] tracking-tight">
                                Security scanning for
                                <br />
                                <span className="text-primary mt-2 block">
                                    <TypewriterEffect
                                        words={[
                                            { text: "Indie Hackers" },
                                            { text: "Vibe Coders" },
                                            { text: "Solo Devs" },
                                            { text: "Non-Tech Founders" },
                                        ]}
                                        className="text-primary"
                                        cursorClassName="bg-primary h-10 sm:h-16 lg:h-20"
                                    />
                                </span>
                            </h1>
                        </FadeIn>
                        <FadeIn delay={0.1}>
                            <p className="text-xl text-muted-foreground max-w-lg mt-8 leading-relaxed">
                                AI writes 48% of your code, but it doesn&apos;t check for security.
                                VibeAudit scans your GitHub & Live App in 2 minutes.
                                <span className="text-foreground font-medium block mt-2">Zero setup. Plain English reports.</span>
                            </p>
                        </FadeIn>
                        <FadeIn delay={0.2} className="flex flex-col sm:flex-row gap-4 mt-10">
                            <Button
                                size="lg"
                                asChild
                                className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl lime-glow border-0"
                            >
                                <Link href="/signup" className="flex items-center gap-2">
                                    Start Free Security Scan
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </Button>
                        </FadeIn>
                        <FadeIn delay={0.3}>
                            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    No credit card required
                                </span>
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    2 minute setup
                                </span>
                            </div>
                        </FadeIn>
                    </Stagger>

                    {/* Hero Dashboard Mockup */}
                    <FloatingElement delay={0.4} className="relative hidden lg:block">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-3xl blur-3xl" />
                        <div className="relative bg-white border border-border rounded-2xl shadow-2xl overflow-hidden">
                            {/* Browser chrome */}
                            <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="flex-1 ml-4">
                                    <div className="bg-background px-4 py-1.5 rounded-lg border border-border text-xs text-muted-foreground font-mono max-w-xs">
                                        vibeaudit.dev/scan/my-app
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard content */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Security Score</p>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-4xl font-bold text-primary">78</span>
                                            <span className="text-lg text-muted-foreground">/100</span>
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                                            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" strokeDasharray="176" strokeDashoffset="39" strokeLinecap="round" />
                                        </svg>
                                        <span className="text-sm font-bold text-primary">B+</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            <span className="text-sm font-medium">Exposed API Key</span>
                                        </div>
                                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">CRITICAL</span>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                                            <span className="text-sm font-medium">Client-Side Auth</span>
                                        </div>
                                        <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium">HIGH</span>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium">HTTPS Enforced</span>
                                        </div>
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">PASSED</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FloatingElement>
                </div>
            </div>
        </section>
    );
}
