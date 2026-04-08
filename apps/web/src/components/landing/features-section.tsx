"use client";

import { FadeIn } from "@/components/ui/motion";
import { Search, Globe, Sparkles, FileText, Lock, BarChart3, ShieldCheck } from "lucide-react";

const features = [
    {
        icon: Search,
        title: "Deep Code Scanning",
        desc: "We analyze your codebase for secrets, vulnerabilities, and bad patterns - especially ones AI tools create.",
        color: "text-[#EF4444]",
        colSpan: "md:col-span-8",
        extraContent: (
            <div className="mt-8 bg-[#09090B] border border-[#27272A] p-6 font-mono text-[12px] rounded-t-lg translate-y-4">
                <div className="text-[#52525B] mb-2">{"// config/aws.js"}</div>
                <div className="flex gap-4">
                    <span className="text-[#52525B]">08</span>
                    <span className="text-white">{"module.exports = {"}</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-[#52525B]">09</span>
                    <span className="bg-[#EF4444]/20 text-[#EF4444] border-l-2 border-[#EF4444] px-2">{'accessKeyId: "AKIAJ2NFEXAMPLE",'}</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-[#52525B]">10</span>
                    <span className="text-white">{'secretAccessKey: "..."'}</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-[#52525B]">11</span>
                    <span className="text-white">{"}"}</span>
                </div>
            </div>
        )
    },
    {
        icon: Globe,
        title: "Live Website Analysis",
        desc: "Security headers, SSL config, exposed endpoints - we check your running app too.",
        color: "text-[#3B82F6]",
        colSpan: "md:col-span-4"
    },
    {
        icon: Sparkles,
        title: "AI-Aware Detection",
        desc: "Tuned for patterns that Cursor, Claude, and other AI tools commonly produce.",
        color: "text-[#F97316]",
        colSpan: "md:col-span-4"
    },
    {
        icon: FileText,
        title: "Plain English Reports",
        desc: "No security jargon. Every issue explained like you're talking to a helpful friend.",
        color: "text-[#EAB308]",
        colSpan: "md:col-span-4"
    },
    {
        icon: Lock,
        title: "Zero Data Storage",
        desc: "We clone, scan, and delete. Your code never stays on our servers.",
        color: "text-[#22C55E]",
        colSpan: "md:col-span-4"
    },
    {
        icon: BarChart3,
        title: "Shareable PDF",
        desc: "Professional reports for clients, investors, or your co-founder.",
        color: "text-white",
        colSpan: "md:col-span-12"
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="bg-[#09090B]">
            <div className="max-w-7xl mx-auto px-6 mt-40">
                <div className="grid md:grid-cols-12 gap-4">
                    {features.map((item, index) => (
                        <div key={index} className={`${item.colSpan} bg-[#111113] border border-[#27272A] rounded-lg p-8 flex flex-col overflow-hidden`}>
                            <div className="mb-auto">
                                <item.icon className={`w-8 h-8 mb-4 ${item.color}`} />
                                <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">{item.title}</h3>
                                <p className="text-[#71717A] text-sm leading-relaxed max-w-md">{item.desc}</p>
                            </div>
                            {item.extraContent && item.extraContent}
                        </div>
                    ))}
                </div>
            </div>

            {/* Score Demo Section */}
            <div className="mt-40 bg-[#0C0C0E] border-y border-[#1A1A1A] py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 items-center gap-16">
                    <div className="md:col-span-5 flex flex-col items-center">
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="128" cy="128" fill="transparent" r="120" stroke="#1A1A1A" strokeWidth="8"></circle>
                                <circle cx="128" cy="128" fill="transparent" r="120" stroke="#EF4444" strokeDasharray="753.6" strokeDashoffset="444.6" strokeWidth="8"></circle>
                            </svg>
                            <div className="text-center">
                                <span className="text-6xl font-bold block text-white">24</span>
                                <span className="text-[#71717A] text-sm font-mono tracking-wider">CRITICAL RISK</span>
                            </div>
                        </div>
                        <div className="mt-12 w-full max-w-xs space-y-4">
                            <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-[#EF4444]">CRITICAL (8)</span>
                                <div className="flex-grow mx-4 h-1.5 bg-[#1A1A1A]">
                                    <div className="h-full bg-[#EF4444] w-[80%]"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
                                <span className="text-[#F97316]">HIGH (12)</span>
                                <div className="flex-grow mx-4 h-1.5 bg-[#1A1A1A]">
                                    <div className="h-full bg-[#F97316] w-[40%]"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
                                <span className="text-[#EAB308]">MEDIUM (4)</span>
                                <div className="flex-grow mx-4 h-1.5 bg-[#1A1A1A]">
                                    <div className="h-full bg-[#EAB308] w-[20%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-7">
                        <div className="bg-[#111113] border border-[#27272A] rounded-lg p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <ShieldCheck className="text-[#EF4444] w-6 h-6" />
                                <h3 className="font-bold text-xl uppercase tracking-tight text-white">SQL Injection Vulnerability</h3>
                            </div>
                            <div className="mb-6">
                                <div className="text-[#71717A] text-xs font-mono mb-2">FILE PATH</div>
                                <div className="bg-[#09090B] p-2 border border-[#1A1A1A] text-sm font-mono text-white">src/app/api/users/[id]/route.ts</div>
                            </div>
                            <div className="mb-8">
                                <p className="text-[#71717A] leading-relaxed mb-4">
                                    The user ID from the URL is passed directly to the database query without sanitization. An attacker could inject malicious SQL commands to bypass authentication or dump the entire database.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#09090B] border border-[#EF4444]/30 rounded p-4">
                                    <div className="text-[10px] text-[#EF4444] font-mono mb-2 uppercase tracking-wider">Vulnerable</div>
                                    <code className="text-[11px] font-mono text-[#71717A] block">db.run(`SELECT * FROM users WHERE id = ${"{id}"}`);</code>
                                </div>
                                <div className="bg-[#09090B] border border-[#22C55E]/30 rounded p-4">
                                    <div className="text-[10px] text-[#22C55E] font-mono mb-2 uppercase tracking-wider">Recommended Fix</div>
                                    <code className="text-[11px] font-mono text-white block">db.run(`SELECT * FROM users WHERE id = ?`, [id]);</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
