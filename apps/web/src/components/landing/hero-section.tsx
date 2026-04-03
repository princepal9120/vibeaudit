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
                        <span className="text-white">Security scanning</span><br />
                        <span className="text-white block mt-2">for</span>
                    </FadeIn>
                    <FadeIn delay={0.2} className="block mt-2">
                        <TypewriterEffect
                            words={[
                                { text: "Indie Hackers", className: "text-[#71717A]" },
                                { text: "Vibe Coders", className: "text-[#71717A]" },
                                { text: "Solo Devs", className: "text-[#71717A]" },
                                { text: "Non-Tech Founders", className: "text-[#71717A]" },
                            ]}
                            className="bg-clip-text text-transparent"
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
                        <Link href="/signup" className="bg-white text-black px-8 py-3 font-bold text-sm tracking-tight active:scale-95 transition-transform w-full sm:w-auto rounded-none text-center">
                            Scan a repo
                        </Link>
                        <Link href="#how-it-works" className="bg-transparent border border-[#27272A] text-white px-8 py-3 font-bold text-sm tracking-tight hover:bg-[#111113] active:scale-95 transition-transform w-full sm:w-auto rounded-none text-center">
                            See sample report
                        </Link>
                    </div>
                </FadeIn>
            </section>

            {/* Terminal UI Element */}
            <FadeIn delay={0.6}>
                <section className="mt-20 px-6">
                    <div className="max-w-[900px] mx-auto bg-[#111113] border border-[#27272A] rounded-lg overflow-hidden shadow-2xl">
                        <div className="h-10 bg-[#18181B] border-b border-[#27272A] flex items-center px-4 gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#27272A]"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#27272A]"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#27272A]"></div>
                            <div className="ml-4 font-mono text-[11px] text-[#52525B]">shipsafe-cli — scan — v1.0.4</div>
                        </div>
                        <div className="p-6 font-mono text-[13px] leading-relaxed overflow-x-auto text-left">
                            <div className="flex gap-4 mb-2">
                                <span className="text-[#52525B]">14:02:11</span>
                                <span className="text-white">Analyzing <span className="text-[#3B82F6]">auth-middleware.ts</span>...</span>
                            </div>
                            <div className="flex gap-4 mb-4 items-start">
                                <span className="text-[#52525B]">14:02:13</span>
                                <span className="text-[#EF4444] font-bold">CRITICAL</span>
                                <span className="text-white">Broken Access Control detected in route /api/admin/*</span>
                            </div>
                            <div className="pl-20 mb-6 text-[#52525B]">
                                &gt; Severity: 9.8 (High Impact)<br />
                                &gt; Found in: line 42<br />
                                &gt; Recommendation: Implement JWT verification before logic.
                            </div>
                            <div className="flex gap-4 mb-2">
                                <span className="text-[#52525B]">14:02:14</span>
                                <span className="text-[#F97316] font-bold">HIGH</span>
                                <span className="text-white">Exposed AWS Secret Access Key in .env.production</span>
                            </div>
                            <div className="flex gap-4 mb-2">
                                <span className="text-[#52525B]">14:02:15</span>
                                <span className="text-[#EAB308] font-bold">MEDIUM</span>
                                <span className="text-white">Outdated package: "jsonwebtoken" (v8.5.1) — Vulnerable to CVE-2022-23529</span>
                            </div>
                            <div className="flex gap-4 mb-4 pt-2">
                                <span className="text-[#52525B]">14:02:16</span>
                                <span className="text-[#22C55E] font-bold">SUCCESS</span>
                                <span className="text-white">Scan complete. 14 vulnerabilities identified.</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-[#18181B] text-left">
                                <span className="text-white inline-block border-r-2 border-white pr-1 animate-pulse">$ shipsafe fix --auto</span>
                            </div>
                        </div>
                    </div>
                </section>
            </FadeIn>
        </main>
    );
}
