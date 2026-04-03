"use client";

import { FadeIn } from "@/components/ui/motion";
import { Zap, Clock, TrendingUp, Shield } from "lucide-react";

export default function StatsSection() {
    return (
        <section className="py-12 border-y border-[#1A1A1A] bg-[#09090B]">
            <div className="max-w-7xl mx-auto px-6">
                <FadeIn>
                    {/* Social Proof Logos from Stitch */}
                    <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 grayscale opacity-50 mb-16">
                        <img alt="GitHub" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBblmfekE6ndAciadK0kkG4NnN-1h24cDBYnYLkhTclNTf6ZG-9mWx2LHuIKSGMCxpSdw-LAtwGRx2QSqZPgleTM5AoDfBR2BLOMLxHt7wJXLVq1u3atbgK_cCLMnxeEbsmFBgjgVhoHHu_9QuvDnyN8Ss4p1yKdOwGN6JVDqYI0R6R-T_tugEp9oJs-g1JBlKfeahYo2zo4aKiw8yYhbK_Ddhc1slZfa5W1jzh1EuArTZxion6oOWT8603tsArkKbidd4Mx_vqdw" />
                        <img alt="Vercel" className="h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_9o_U4iyylAxh9vr2MkXEls7-5IWIGSRztlpxqf1n9IvDper0FX3YuJyjnsuwsflBOt5RSsJveK-jqSZrfyu24E8QWM2rYOE8Z1CcqI5TFoIhUs44V2yeX5Fva4Hh0T4P5L-1zozx4jcxJt_gSIKIKqdIX9JWoIzeiBrS3ePQ0P_AKNomX6Y5DTZ0FUoOVgnqy1KGu-yHWO--sZ2GlOjyM2iOlusHN-Q22W-CcOZKTRbk9uvP2HtEPiZ-XFjZHbZ01dcML6gC_w" />
                        <img alt="Supabase" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaf5luCXUUTA4cQTKjTgcZWfGUhhng3euiOMOWHSCumAM3XsGZyLzHOqGmCzSk0gC1VDrRUmYMLIj_tgmwv8HU_honBVmP2e76Wy1VIo-2ykjn4K5vIsK-MWcN0m0U0v4LGFClp7BJhDgYkVn0qPtM4UQ0T-5-NtTJ8FyrajlCzupFwV1YGQC3LCzBA1-023tSJjqNbY3_1S8jdQUJ5iggVDPTnV1Zk7mXU_yKd6g8_n11KllyUAvJ7LjqfINhIJMRP9Cs1kAsbQ" />
                        <img alt="Next.js" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiGCZMcEBh6T9SlXWojySkP2kljXFlx-PcTWhTimDPHswfgVmSFwTB6AVmXaMnR01eA5pvQCT-ZC_Y56ZkNX1JauVgF46SZSgFzQjhHyoSoNPbRveNYhhMPypZJwZVP0bf3f_llM0dli7Tmsouk6fj5ux5IUQkaKUcXrCnzFgpGx018ucik9M2TJrHnLD9AdaaeNTZbnqYHHhnW3RngTp0VYFDFNZudCsRURg0JS7pYpPy0lKjOqPtYGyMVJsoJr02MAc_Zhg3lw" />
                        <img alt="Railway" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARDuLDPOrrtySCV4qmaix05LAVJdszd3vp-utlUyre3Jx8ixoFUm5kGpkwXRTJGueMRYlkvSPIoTh2CAudssz8I3IAsvqYl5ICU4tc8-qyEM51EM7VA_iEDHigCYSHxBW7eNg43e5dFKjfPLpRMWsI6QEHhapjiZg778p6G32eSkbOWIKSo-JwhNz9LnAsJHNCnhVepetp4NEY8Jdva5UqMBJb5i-XzYJsl3I5TIS-5dVVD7o2ED_ySVlMLhgWY5bTeaFEUoyRHw" />
                        <img alt="Cloudflare" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgb-8ytH9OSzQuQut6PcsFxntziPkPwSUj24GxK05Dr_nY4x55sfFujmK2UMkFP6J_JVhiO87sx3dmQ9YD8n8C_wR5yHab1XL-FdCVkddLiASkRGsn7I5wnhUT5XRVq6v7DUsD3btNsyEDmv9gtOIt-vftIEB50EqRnE9IC3OQc4UDsumJh7f5uA0H_qqaSAUrKbgZOLZ8NzAb6d6feD1wOtVSEnrZl7firEAxpMgZldqwkX50CFrTDt8bttudJk_jyuq9EkOrzw" />
                    </div>

                    {/* Preserving user data in a clean dark stat row underneath logos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto pt-8 border-t border-[#1A1A1A]/50">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-10 h-10 rounded bg-[#111113] border border-[#27272A] flex items-center justify-center mb-3">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-2xl font-mono text-white font-bold mb-1">48%</p>
                            <p className="text-xs text-[#71717A] max-w-[120px]">of AI code contains security flaws</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-10 h-10 rounded bg-[#111113] border border-[#27272A] flex items-center justify-center mb-3">
                                <Clock className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-2xl font-mono text-white font-bold mb-1">2 min</p>
                            <p className="text-xs text-[#71717A] max-w-[120px]">average scan time</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-10 h-10 rounded bg-[#111113] border border-[#27272A] flex items-center justify-center mb-3">
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-2xl font-mono text-white font-bold mb-1">$29</p>
                            <p className="text-xs text-[#71717A] max-w-[120px]">per year, unlimited scans</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-10 h-10 rounded bg-[#111113] border border-[#27272A] flex items-center justify-center mb-3">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-2xl font-mono text-white font-bold mb-1">100+</p>
                            <p className="text-xs text-[#71717A] max-w-[120px]">security checks performed</p>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
