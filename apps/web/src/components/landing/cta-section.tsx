"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
    return (
        <section className="max-w-xl mx-auto px-6 text-center py-20">
            <FadeIn>
                <div className="border border-[#27272A] rounded-lg p-12 bg-[#111113] relative overflow-hidden">
                    {/* Subtle bg glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                    <div className="font-mono text-[11px] text-[#52525B] uppercase tracking-widest mb-6">Start for free</div>
                    <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                        Analyze your project<br />in two minutes
                    </h2>
                    <p className="text-[#71717A] mb-10 text-sm leading-relaxed">
                        Your reputation is worth more than a 2-minute scan.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 font-bold text-sm tracking-tight active:scale-95 transition-transform group"
                    >
                        Get started free
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <p className="mt-4 text-[#52525B] text-xs">No credit card required</p>
                </div>
            </FadeIn>
        </section>
    );
}
