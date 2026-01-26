"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import { FadeIn } from "@/components/ui/motion"
import { HelpCircle, ArrowRight } from "lucide-react"

export default function FAQs() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'How long does a scan take?',
            answer: "Most scans complete in under 3 minutes. We analyze both your GitHub repository and your live application URL simultaneously, giving you a pass/fail score and a detailed plain-English report immediately.",
        },
        {
            id: 'item-2',
            question: 'Does ShipSafe store my code?',
            answer: 'No. Check our privacy policy - we operate with a "clone, scan, delete" policy. We access your repo to perform the security analysis and satisfy the audit, but your intellectual property is deleted from our servers immediately after the report generation.',
        },
        {
            id: 'item-3',
            question: 'What languages do you support?',
            answer: 'We currently support JavaScript/TypeScript, Python, Go, Java, Ruby, PHP, and C#. We also perform Dynamic Application Security Testing (DAST) on your live web application regardless of the underlying tech stack.',
        },
        {
            id: 'item-4',
            question: 'How much does it cost?',
            answer: "We offer a simple 'pay-as-you-go' model. Your first scan is completely free. Subsequent scans are $30 each. There are no monthly subscriptions, hidden fees, or long-term contracts.",
        },
        {
            id: 'item-5',
            question: 'Can I share the report with my client?',
            answer: 'Absolutely. ShipSafe is designed for freelancers and agencies. You can generate a professional, unbranded or co-branded PDF report to prove to your clients that the code you are delivering has been professionally audited for security vulnerabilities.',
        },
    ]

    return (
        <section className="py-24 px-4 sm:px-6 bg-muted/20 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />

            <div className="container max-w-4xl relative z-10">
                <FadeIn>
                    <div className="space-y-12">
                        <div className="text-center">
                            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
                                FAQ
                            </p>
                            <h2
                                className="text-3xl sm:text-4xl lg:text-5xl mb-4"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                Your questions answered
                            </h2>
                            <p className="text-lg sm:text-xl text-muted-foreground">
                                Common questions about ShipSafe
                            </p>
                        </div>

                        <Accordion
                            type="single"
                            collapsible
                            className="space-y-3"
                        >
                            {faqItems.map((item, index) => (
                                <FadeIn key={item.id} delay={index * 0.05}>
                                    <AccordionItem
                                        value={item.id}
                                        className="bg-card border border-border rounded-xl px-6 py-1 data-[state=open]:border-primary/30 data-[state=open]:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                        <AccordionTrigger className="cursor-pointer text-base sm:text-lg font-semibold hover:no-underline py-5 [&[data-state=open]>svg]:rotate-45 [&>svg]:transition-transform">
                                            <div className="flex items-center gap-3 text-left">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <HelpCircle className="w-4 h-4 text-primary" />
                                                </div>
                                                {item.question}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-5">
                                            <p className="text-muted-foreground leading-relaxed pl-11">
                                                {item.answer}
                                            </p>
                                        </AccordionContent>
                                    </AccordionItem>
                                </FadeIn>
                            ))}
                        </Accordion>

                        <div className="text-center pt-4">
                            <p className="text-muted-foreground">
                                Can&apos;t find what you&apos;re looking for?{' '}
                                <Link
                                    href="mailto:support@ShipSafe.dev"
                                    className="inline-flex items-center gap-1 text-primary font-semibold hover:underline group"
                                >
                                    Contact support
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </p>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    )
}
