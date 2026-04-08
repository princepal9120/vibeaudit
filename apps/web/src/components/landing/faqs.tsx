"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import { FadeIn } from "@/components/ui/motion"
import { ArrowRight } from "lucide-react"

export default function FAQs() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'How long does a scan take?',
            answer: "Most scans complete in under 3 minutes. We analyze both your GitHub repository and your live application URL simultaneously, giving you a pass/fail score and a detailed plain-English report immediately.",
        },
        {
            id: 'item-2',
            question: 'Does VibeAudit store my code?',
            answer: 'No. We operate with a "clone, scan, delete" policy. We access your repo to perform the security analysis, but your intellectual property is deleted from our servers immediately after report generation.',
        },
        {
            id: 'item-3',
            question: 'What languages do you support?',
            answer: 'We currently support JavaScript/TypeScript, Python, Go, Java, Ruby, PHP, and C#. We also perform Dynamic Application Security Testing (DAST) on your live web application regardless of the underlying tech stack.',
        },
        {
            id: 'item-4',
            question: 'How much does it cost?',
            answer: 'Your first scan is free. After that, you can buy scan credits: $30 for one scan, $125 for five scans, or $200 for ten scans. No subscription is required for the scanner.',
        },
        {
            id: 'item-5',
            question: 'Do scan credits expire?',
            answer: 'No. Once you buy scan credits, they stay on your account until you use them.',
        },
        {
            id: 'item-6',
            question: 'Can I share the report with my client?',
            answer: 'Absolutely. You can generate a professional PDF report to prove to your clients that the code you are delivering has been professionally audited for security vulnerabilities.',
        },
    ]

    return (
        <section id="faq" className="max-w-5xl mx-auto px-6 mt-32 pb-20">
            <FadeIn fullWidth>
                <div className="text-center mb-16">
                    <div className="font-mono text-[11px] text-[#52525B] uppercase tracking-widest mb-3">FAQ</div>
                    <h2 className="text-3xl font-bold text-white mb-4">Your questions answered</h2>
                    <p className="text-[#71717A]">Common questions about VibeAudit</p>
                </div>

                <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-3">
                    {faqItems.map((item) => (
                        <AccordionItem
                            key={item.id}
                            value={item.id}
                            className="w-full bg-[#111113] border border-[#27272A] rounded-lg px-6 py-1 data-[state=open]:border-white/20 transition-colors duration-300"
                        >
                            <AccordionTrigger className="cursor-pointer text-base font-semibold hover:no-underline py-5 text-white text-left">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="pb-5">
                                <p className="text-[#71717A] leading-relaxed text-sm">
                                    {item.answer}
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <div className="text-center pt-10">
                    <p className="text-[#71717A] text-sm">
                        Can&apos;t find what you&apos;re looking for?{' '}
                        <Link
                            href="mailto:support@vibeaudit.site"
                            className="inline-flex items-center gap-1 text-white font-medium hover:underline underline-offset-4 group"
                        >
                            Contact support
                            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </p>
                </div>
            </FadeIn>
        </section>
    )
}
