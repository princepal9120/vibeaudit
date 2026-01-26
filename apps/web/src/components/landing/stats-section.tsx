"use client";

import { FadeIn } from "@/components/ui/motion";
import { Zap, Clock, TrendingUp, Shield } from "lucide-react";
import { useState, useEffect } from "react";

const stats = [
    { stat: "48%", label: "of AI code contains security flaws", icon: Zap },
    { stat: "2 min", label: "average scan time", icon: Clock },
    { stat: "$30", label: "per scan, no subscription", icon: TrendingUp },
    { stat: "100+", label: "security checks performed", icon: Shield },
];

export default function StatsSection() {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    return (
        <section className="py-20 px-4 sm:px-6 bg-muted/30">
            <div className="container">
                <FadeIn>
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                            Scan your code in <span className="bg-primary text-primary-foreground px-3 py-1 rounded-lg">2 minutes</span>
                        </h2>
                        <p className="text-xl text-secondary-foreground">
                            Most security tools {isMobile === true && <br />} are <span className="text-red-500 font-medium line-through decoration-2">enterprise bloatware</span>. <br />
                            ShipSafe is built for speed.
                        </p>
                    </div>
                </FadeIn>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((item, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <div className="bg-background border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                                <item.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                                <p className="text-4xl font-bold text-foreground mb-2">{item.stat}</p>
                                <p className="text-sm text-secondary-foreground">{item.label}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
