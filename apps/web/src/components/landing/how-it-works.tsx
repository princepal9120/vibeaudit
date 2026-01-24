"use client";

import { FadeIn } from "@/components/ui/motion";
import { Github, Globe, FileText } from "lucide-react";

const steps = [
    {
        step: "01",
        icon: Github,
        title: "Connect your repo",
        desc: "Paste your GitHub URL. We'll scan your public repository for vulnerabilities."
    },
    {
        step: "02",
        icon: Globe,
        title: "Add your live URL",
        desc: "Optional: We check your running app for runtime issues (SSL, Headers, Exposed Config)."
    },
    {
        step: "03",
        icon: FileText,
        title: "Get your report",
        desc: "A clear, prioritized list of issues with step-by-step fix guidance."
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-background">
            <div className="container">
                <FadeIn>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4">How it works</h2>
                        <p className="text-xl text-muted-foreground">From &quot;unsure&quot; to &quot;secure&quot; in 3 steps</p>
                    </div>
                </FadeIn>

                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {steps.map((item, i) => (
                        <FadeIn key={i} delay={i * 0.15}>
                            <div className="relative bg-muted/30 border border-border rounded-2xl p-8 hover:border-primary/30 transition-colors group">
                                <div className="absolute -top-4 left-8 bg-foreground text-white text-sm font-bold px-3 py-1 rounded-full">
                                    {item.step}
                                </div>
                                <div className="mt-4">
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                        <item.icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                    <p className="text-secondary-foreground">{item.desc}</p>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
