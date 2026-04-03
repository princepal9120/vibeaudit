"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/motion";
import { Check, X, Shield } from "lucide-react";

const pricingTiers = [
    {
        name: "Free",
        description: "Perfect for first-time verification",
        price: "$0",
        period: "/ first scan",
        features: [
            { included: true, text: "1 free security scan" },
            { included: true, text: "Public & Private repos" },
            { included: true, text: "Plain English explanations" },
            { included: false, text: "PDF export" },
            { included: false, text: "Priority support" },
        ],
        buttonText: "Start Free Scan",
        buttonHref: "/signup",
    },
    {
        name: "Pro",
        description: "For indie hackers & solo founders",
        price: "$30",
        period: "/ scan",
        features: [
            { included: true, text: "Unlimited scans (pay-as-you-go)" },
            { included: true, text: "Full vulnerability report" },
            { included: true, text: "Deep code analysis" },
            { included: true, text: "Professional PDF export" },
            { included: true, text: "Priority email support" },
        ],
        buttonText: "Get Started",
        buttonHref: "/signup",
    },
    {
        name: "Agency",
        description: "For freelancers & dev shops",
        price: "Custom",
        period: "Volume Discounts",
        features: [
            { included: true, text: "Bulk scan credits" },
            { included: true, text: "Co-branded reports (Coming Soon)" },
            { included: true, text: "Team management" },
            { included: true, text: "Dedicated account support" },
            { included: true, text: "API access" },
        ],
        buttonText: "Contact Sales",
        buttonHref: "mailto:sales@ShipSafe.dev",
    },
];

export default function PricingSection() {
    return (
        <section id="pricing" className="max-w-7xl mx-auto px-6 mt-40 text-center pb-20">
            <h2 className="text-3xl font-bold mb-12 text-white">Pay as you ship</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {pricingTiers.map((tier, index) => (
                    <FadeIn key={tier.name} delay={0.1 * index}>
                        <div className={`bg-[#111113] border ${tier.name === "Pro" ? "border-white" : "border-[#27272A]"} rounded-lg p-10 text-left relative overflow-hidden flex flex-col h-full`}>
                            {tier.name === "Pro" && (
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <Shield className="w-32 h-32 text-white" />
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                                <p className="text-[#71717A] text-sm h-8">{tier.description}</p>
                            </div>
                            <div className="mb-8">
                                <div className="text-5xl font-bold text-white mb-2">{tier.price}</div>
                                <div className="text-sm text-[#71717A]">{tier.period}</div>
                            </div>
                            <ul className="space-y-4 mb-10 flex-grow">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm">
                                        {feature.included ? (
                                            <Check className="w-4 h-4 text-[#22C55E]" />
                                        ) : (
                                            <X className="w-4 h-4 text-[#71717A]/50" />
                                        )}
                                        <span className={feature.included ? "text-white" : "text-[#71717A]/50"}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <Link href={tier.buttonHref} className={`w-full py-4 font-bold text-sm tracking-tight active:scale-95 transition-transform text-center rounded-sm ${tier.name === "Pro" ? "bg-white text-black" : "bg-transparent border border-[#27272A] text-white hover:bg-[#1A1A1A]"}`}>
                                {tier.buttonText}
                            </Link>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}
