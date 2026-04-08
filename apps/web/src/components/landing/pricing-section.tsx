"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/motion";
import { Check, Shield } from "lucide-react";

const pricingTiers = [
  {
    name: "Free Trial",
    description: "Try VibeAudit on one real repo or live app.",
    price: "$0",
    period: "one-time",
    features: [
      { text: "1 free security scan" },
      { text: "Repo or live URL scan" },
      { text: "Plain-English findings" },
      { text: "Security score" },
      { text: "Shareable report" },
    ],
    buttonText: "Start Free Scan",
    buttonHref: "/signup",
    featured: false,
  },
  {
    name: "Launch Audit",
    description: "Best for a launch, handoff, or pre-release confidence check.",
    price: "$39",
    period: "per scan",
    features: [
      { text: "Full repo + live app scan" },
      { text: "PDF report export" },
      { text: "AI fix guidance" },
      { text: "No subscription required" },
      { text: "Actionable issues in plain English" },
    ],
    buttonText: "Buy Launch Audit",
    buttonHref: "/checkout",
    featured: true,
  },
  {
    name: "Growth Packs",
    description: "For freelancers, agencies, and teams shipping repeatedly.",
    price: "$99",
    period: "5 scans · or $179 for 10 scans",
    features: [
      { text: "Save up to 54% per scan" },
      { text: "No expiration on credits" },
      { text: "Great for client work" },
      { text: "Re-scan after fixes" },
      { text: "Same full reporting" },
    ],
    buttonText: "Buy Growth Pack",
    buttonHref: "/checkout",
    featured: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-6 mt-40 text-center pb-20">
      <h2 className="text-3xl font-bold mb-4 text-white">Launch-ready security in minutes</h2>
      <p className="text-[#71717A] max-w-2xl mx-auto mb-12">
        Start with 1 free scan, then only pay when you ship.
      </p>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {pricingTiers.map((tier, index) => (
          <FadeIn key={tier.name} delay={0.1 * index}>
            <div
              className={`bg-[#111113] border ${tier.featured ? "border-white" : "border-[#27272A]"} rounded-lg p-10 text-left relative overflow-hidden flex flex-col h-full`}
            >
              {tier.featured && (
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Shield className="w-32 h-32 text-white" />
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-[#71717A] text-sm min-h-10">{tier.description}</p>
              </div>
              <div className="mb-8">
                <div className="text-5xl font-bold text-white mb-2">{tier.price}</div>
                <div className="text-sm text-[#71717A]">{tier.period}</div>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-white">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.buttonHref}
                className={`w-full py-4 font-bold text-sm tracking-tight active:scale-95 transition-transform text-center rounded-sm ${tier.featured ? "bg-white text-black" : "bg-transparent border border-[#27272A] text-white hover:bg-[#1A1A1A]"}`}
              >
                {tier.buttonText}
              </Link>
            </div>
          </FadeIn>
        ))}
      </div>
      <p className="text-[#71717A] text-sm mt-8">
        No monthly subscription. Just buy credits when you need them.
      </p>
    </section>
  );
}
