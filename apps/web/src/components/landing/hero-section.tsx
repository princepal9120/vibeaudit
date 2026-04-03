"use client";

import Link from "next/link";
import { FadeIn, Stagger } from "@/components/ui/motion";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

export default function HeroSection() {
    return (
        <main className="pt-32 pb-24">
            <section className="max-w-4xl mx-auto text-center px-6">
                <FadeIn>
                    <div className="inline-flex items-center gap-2 font-mono text-[12px] text-[#52525B] mb-6 px-3 py-1 border border-[#27272A] rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                        <span>LIVE</span>
                        <span className="mx-1 opacity-30">|</span>
                        <span>Scanning 10,000+ repos — done in 2m</span>
                    </div>
                </FadeIn>

                <h1
                    className="text-[40px] sm:text-[56px] font-bold leading-[1.1] tracking-tight mb-6"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    <FadeIn delay={0.1}>
                        <span className="text-white">Security scanning for </span>
                    </FadeIn>
                    <FadeIn delay={0.2} className="block mt-2">
                        <TypewriterEffect
                            words={[
                                { text: "Indie Hackers", className: "bg-gradient-to-r from-[#4ade80] to-[#22c55e] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" },
                                { text: "Vibe Coders", className: "bg-gradient-to-r from-[#4ade80] to-[#22c55e] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" },
                                { text: "Solo Devs", className: "bg-gradient-to-r from-[#4ade80] to-[#22c55e] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" },
                                { text: "Non-Tech Founders", className: "bg-gradient-to-r from-[#4ade80] to-[#22c55e] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" },
                            ]}
                            className=""
                            cursorClassName="bg-white h-8 sm:h-12 lg:h-14"
                        />
                    </FadeIn>
                </h1>

                <FadeIn delay={0.3}>
                    <p className="text-[#71717A] text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-['Geist']">
                        AI writes 48% of your code, but it doesn't check for security. Connect your repo, get a hardened report, and fix critical issues in minutes—not weeks.
                    </p>
                </FadeIn>

                <FadeIn delay={0.4}>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup" className="bg-white text-black px-8 py-3 font-bold text-sm tracking-tight active:scale-95 transition-transform w-full sm:w-auto rounded text-center">
                            Start Free Scan
                        </Link>
                        <Link href="#how-it-works" className="bg-transparent border border-[#27272A] text-white px-8 py-3 font-bold text-sm tracking-tight hover:bg-[#111113] active:scale-95 transition-transform w-full sm:w-auto rounded text-center">
                            See how it works
                        </Link>
                    </div>
                </FadeIn>
            </section>

            {/* Dashboard Screenshot Placeholder */}
            <FadeIn delay={0.6}>
                <section className="mt-20 px-6">
                    <div className="max-w-[1000px] mx-auto bg-[#111113] border border-[#27272A] rounded-lg overflow-hidden shadow-2xl aspect-[16/9] relative flex items-center justify-center">
                        {/* Replace src with the actual path to your dashboard screenshot */}
                        <img
                            src="/dashboard.png"
                            alt="ShipSafe Dashboard"
                            className="w-full h-full object-contain relative z-10 opacity-90 transition-opacity hover:opacity-100"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                </section>
            </FadeIn>
        </main>
    );
}
