"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";
import { Check, X } from "lucide-react";

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
        buttonVariant: "default" as const,
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
        buttonHref: "mailto:sales@vibeaudit.dev",
        highlighted: false,
    },
];

export default function PricingSection() {
    return (
        <section id="pricing" className="py-20 px-4 sm:px-6 bg-background">
            <div className="container">
                <FadeIn>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4">Pricing</h2>
                        <p className="text-xl text-muted-foreground">Pay per scan. No subscriptions. No bullshit.</p>
                    </div>
                </FadeIn>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {pricingTiers.map((tier, index) => (
                        <FadeIn key={tier.name} delay={0.1 * (index + 1)}>
                            <div
                                className={`${tier.highlighted
                                        ? "bg-background border border-primary/50 ring-1 ring-primary/20 rounded-2xl p-8 h-full relative overflow-hidden lime-glow transform md:-translate-y-4 flex flex-col shadow-2xl shadow-primary/5"
                                        : "bg-muted/30 border border-border rounded-2xl p-8 h-full flex flex-col hover:border-border/80 transition-colors"
                                    }`}
                            >
                                {tier.highlighted && (
                                    <>
                                        <div className="absolute top-0 inset-x-0 h-1 bg-primary" />
                                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Popular
                                        </div>
                                    </>
                                )}
                                <div className="mb-6">
                                    <h3 className={`text-2xl font-bold mb-2 ${tier.highlighted ? "text-primary" : ""}`}>
                                        {tier.name}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">{tier.description}</p>
                                </div>
                                <div className="mb-6">
                                    <span className={tier.highlighted ? "text-5xl font-bold" : "text-4xl font-bold"}>
                                        {tier.price}
                                    </span>
                                    <span className={tier.name === "Agency" ? "block text-sm mt-1 text-muted-foreground" : "text-muted-foreground"}>
                                        {" "}{tier.period}
                                    </span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className={`flex items-center gap-3 text-sm ${tier.highlighted ? "font-medium" : ""}`}>
                                            {feature.included ? (
                                                <Check className="w-5 h-5 text-primary shrink-0" />
                                            ) : (
                                                <X className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                                            )}
                                            <span className={feature.included ? "" : "text-muted-foreground/50"}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                {tier.buttonVariant === "outline" ? (
                                    <Button variant="outline" size="lg" asChild className="w-full h-12 rounded-xl border-border hover:bg-muted font-medium">
                                        <Link href={tier.buttonHref}>{tier.buttonText}</Link>
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        asChild
                                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
                                    >
                                        <Link href={tier.buttonHref}>{tier.buttonText}</Link>
                                    </Button>
                                )}
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
