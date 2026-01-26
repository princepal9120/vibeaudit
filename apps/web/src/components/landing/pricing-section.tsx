"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";
import { Check, X, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

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
        buttonVariant: "outline" as const,
        buttonHref: "/signup",
        highlighted: false,
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
        buttonVariant: "glow" as const,
        buttonHref: "/signup",
        highlighted: true,
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
        buttonVariant: "outline" as const,
        buttonHref: "mailto:sales@ShipSafe.dev",
        highlighted: false,
    },
];

export default function PricingSection() {
    return (
        <section id="pricing" className="py-24 px-4 sm:px-6 bg-background relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />

            <div className="container relative z-10">
                <FadeIn>
                    <div className="text-center mb-16">
                        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
                            Pricing
                        </p>
                        <h2
                            className="text-3xl sm:text-4xl lg:text-5xl mb-4"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Simple, transparent pricing
                        </h2>
                        <p className="text-lg sm:text-xl text-muted-foreground">
                            Pay per scan. No subscriptions. No bullshit.
                        </p>
                    </div>
                </FadeIn>

                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {pricingTiers.map((tier, index) => (
                        <FadeIn key={tier.name} delay={0.1 * (index + 1)}>
                            <motion.div
                                className={`relative h-full ${tier.highlighted ? "md:-translate-y-4" : ""}`}
                                whileHover={{ y: tier.highlighted ? -20 : -4 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div
                                    className={`relative h-full rounded-2xl p-8 flex flex-col overflow-hidden transition-all duration-300 ${tier.highlighted
                                            ? "bg-card border-2 border-primary/50 shadow-2xl"
                                            : "bg-card border border-border hover:border-primary/30"
                                        }`}
                                >
                                    {/* Highlighted tier decorations */}
                                    {tier.highlighted && (
                                        <>
                                            {/* Top gradient line */}
                                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-primary to-accent" />

                                            {/* Popular badge */}
                                            <div className="absolute -top-px -right-px">
                                                <div className="flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-xl">
                                                    <Sparkles className="w-3 h-3" />
                                                    Popular
                                                </div>
                                            </div>

                                            {/* Glow effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                                        </>
                                    )}

                                    {/* Content */}
                                    <div className="relative">
                                        {/* Header */}
                                        <div className="mb-6">
                                            <h3
                                                className={`text-2xl font-bold mb-2 ${tier.highlighted ? "text-primary" : ""}`}
                                                style={{ fontFamily: "var(--font-display)" }}
                                            >
                                                {tier.name}
                                            </h3>
                                            <p className="text-muted-foreground text-sm">{tier.description}</p>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-8">
                                            <span
                                                className={`text-5xl font-bold ${tier.highlighted ? "text-foreground" : ""}`}
                                                style={{ fontFamily: "var(--font-display)" }}
                                            >
                                                {tier.price}
                                            </span>
                                            <span className={`text-muted-foreground ${tier.name === "Agency" ? "block text-sm mt-1" : "ml-1"}`}>
                                                {tier.period}
                                            </span>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-4 mb-8 flex-1">
                                            {tier.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm">
                                                    {feature.included ? (
                                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <Check className="w-3 h-3 text-primary" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <X className="w-3 h-3 text-muted-foreground/50" />
                                                        </div>
                                                    )}
                                                    <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                                                        {feature.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA Button */}
                                        <Button
                                            variant={tier.buttonVariant}
                                            size="lg"
                                            asChild
                                            className={`w-full ${tier.highlighted ? "gap-2" : ""}`}
                                        >
                                            <Link href={tier.buttonHref}>
                                                {tier.highlighted && <Zap className="w-4 h-4" />}
                                                {tier.buttonText}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
