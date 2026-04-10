"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/motion";
import { Check, Shield } from "lucide-react";

const pricingTiers = [
  {
    name: "Free User",
    description: "Start using VibeAudit with the core experience at no cost.",
    price: "$0",
    period: "free forever",
    features: [
      { text: "Get started instantly" },
      { text: "Try the product before upgrading" },
      { text: "Core security insights" },
      { text: "Plain-English findings" },
      { text: "Shareable report access" },
    ],
    buttonText: "Start Free",
    buttonHref: "/signup",
    featured: false,
  },
  {
    name: "Lifetime Plan",
    description: "Unlock all features with a one-time payment and keep access for life.",
    price: "$29",
    period: "one-time lifetime access",
    features: [
      { text: "All features included" },
      { text: "Full repo + live app analysis" },
      { text: "AI fix guidance" },
      { text: "PDF exports and shareable reports" },
      { text: "Future updates included" },
    ],
    buttonText: "Get Lifetime Access",
    buttonHref: "/signup",
    featured: true,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-6 mt-40 text-center pb-20">
      <h2 className="text-3xl font-bold mb-4 text-white">Launch-ready security in minutes</h2>
      <p className="text-[#71717A] max-w-2xl mx-auto mb-12">
        Choose between a free plan and a simple $29 lifetime unlock.
      </p>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
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
        No monthly subscription. Just free access or one $29 lifetime plan.
      </p>
    </section>
  );
}
