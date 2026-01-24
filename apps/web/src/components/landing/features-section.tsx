"use client";

import { FadeIn } from "@/components/ui/motion";
import { Search, Globe, Sparkles, FileText, Lock, BarChart3 } from "lucide-react";

const features = [
    { icon: Search, title: "Deep Code Scanning", desc: "We analyze your codebase for secrets, vulnerabilities, and bad patterns - especially ones AI tools create." },
    { icon: Globe, title: "Live Website Analysis", desc: "Security headers, SSL config, exposed endpoints - we check your running app too." },
    { icon: Sparkles, title: "AI-Aware Detection", desc: "Tuned for patterns that Cursor, Claude, and other AI tools commonly produce." },
    { icon: FileText, title: "Plain English Reports", desc: "No security jargon. Every issue explained like you're talking to a helpful friend." },
    { icon: Lock, title: "Zero Data Storage", desc: "We clone, scan, and delete. Your code never stays on our servers." },
    { icon: BarChart3, title: "Shareable PDF", desc: "Professional reports for clients, investors, or your co-founder." },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="py-20 px-4 sm:px-6 bg-background">
            <div className="container">
                <FadeIn>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4">Enterprise Grade. Indie Price.</h2>
                        <p className="text-xl text-muted-foreground">Security without the confusing jargon.</p>
                    </div>
                </FadeIn>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((item, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <div className="bg-muted/30 border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/20 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                    <item.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-secondary-foreground text-sm">{item.desc}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
