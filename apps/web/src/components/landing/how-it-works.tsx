"use client";

import { FadeIn } from "@/components/ui/motion";

const steps = [
    {
        step: "01",
        title: "Connect your repo",
        desc: "Paste your GitHub URL. We'll scan your public repository for vulnerabilities."
    },
    {
        step: "02",
        title: "Add your live URL",
        desc: "Optional: We check your running app for runtime issues (SSL, Headers, Exposed Config)."
    },
    {
        step: "03",
        title: "Get your report",
        desc: "A clear, prioritized list of issues with step-by-step fix guidance."
    },
];

export default function HowItWorks() {
    return (
        <div id="how-it-works" className="bg-[#09090B]">
            {/* Side-by-Side Comparison from Stitch */}
            <section className="max-w-7xl mx-auto px-6 pt-32">
                <FadeIn>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-[#111113] border border-[#27272A] rounded-lg p-8 flex flex-col h-full">
                            <div className="font-mono text-[10px] text-[#52525B] mb-6 tracking-widest uppercase">Traditional Raw Output</div>
                            <div className="font-mono text-[12px] text-[#71717A] bg-[#09090B] p-6 rounded border border-[#1A1A1A] flex-grow leading-relaxed">
                                <span className="text-[#EF4444]">[ERR]</span> Found vuln in /lib/db.ts<br />
                                Type: SQL_INJECT_004<br />
                                Trace: (main:23:4 -&gt; execute:89:12)<br />
                                Metadata: {"{ \"risk\": \"CRIT\", \"cve\": \"NULL\" }"}<br /><br />
                                Manual review required to verify context.
                            </div>
                        </div>
                        <div className="bg-[#111113] border border-[#FFFFFF] rounded-lg p-8 flex flex-col h-full relative shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                            <div className="font-mono text-[10px] text-white mb-6 tracking-widest uppercase flex items-center gap-2">
                                VibeAudit Optimized
                                <span className="bg-white text-black px-1.5 py-0.5 text-[9px] font-bold">HUMAN-READABLE</span>
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-start gap-4 mb-6">
                                    <span className="font-mono text-[10px] uppercase font-bold text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 border border-[#EF4444]/20">Critical</span>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1 text-white">SQL Injection in User Search</h4>
                                        <p className="text-[#71717A] text-sm">Raw query parameters are being concatenated directly into the SQL string at <code className="font-mono text-[#E2E2E2] bg-[#27272A] px-1 py-0.5 rounded">db.ts:24</code>.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-[#09090B] border border-[#1A1A1A] rounded overflow-hidden">
                                        <div className="px-3 py-1 bg-[#18181B] text-[10px] text-[#52525B] font-mono border-b border-[#1A1A1A]">FIX PREVIEW</div>
                                        <div className="p-4 font-mono text-[12px]">
                                            <div className="text-[#EF4444] opacity-50 line-through">- `SELECT * FROM users WHERE id = ${"{id}"}`</div>
                                            <div className="text-[#22C55E]">+ `SELECT * FROM users WHERE id = ?`, [id]</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </section>

            {/* How It Works Steps with User Data */}
            <section className="max-w-7xl mx-auto px-6 mt-40 pb-20">
                <div className="grid md:grid-cols-3 gap-12">
                    {steps.map((item, i) => (
                        <FadeIn key={i} delay={i * 0.15}>
                            <div className="relative group p-6 rounded-xl hover:bg-[#111113] border border-transparent hover:border-[#27272A] transition-all">
                                <div className="font-mono text-[24px] font-bold text-[#27272A] mb-4 group-hover:text-white transition-colors">{item.step}</div>
                                <h3 className="font-bold text-xl mb-3 text-white">{item.title}</h3>
                                <p className="text-[#71717A] text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </section>
        </div>
    );
}
