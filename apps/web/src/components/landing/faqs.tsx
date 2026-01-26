"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import { FadeIn } from "@/components/ui/motion"

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
        <section className="py-20 px-4 sm:px-6 bg-background">
            <div className="container max-w-4xl">
                <FadeIn>
                    <div className="space-y-12">
                        <div className="text-center">
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Your questions answered</h2>
                            <p className="text-xl text-secondary-foreground">common questions about ShipSafe</p>
                        </div>

                        <Accordion
                            type="single"
                            collapsible
                            className="-mx-2 sm:mx-0">
                            {faqItems.map((item) => (
                                <div
                                    className="group"
                                    key={item.id}>
                                    <AccordionItem
                                        value={item.id}
                                        className="data-[state=open]:bg-muted peer rounded-xl border-none px-5 py-1 data-[state=open]:border-none md:px-7">
                                        <AccordionTrigger className="cursor-pointer text-lg font-medium hover:no-underline">{item.question}</AccordionTrigger>
                                        <AccordionContent>
                                            <p className="text-base text-secondary-foreground leading-relaxed py-2">{item.answer}</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <hr className="mx-5 -mb-px group-last:hidden peer-data-[state=open]:opacity-0 md:mx-7 border-border" />
                                </div>
                            ))}
                        </Accordion>

                        <p className="text-muted-foreground text-center">
                            Can&apos;t find what you&apos;re looking for? Contact our{' '}
                            <Link
                                href="mailto:support@ShipSafe.dev"
                                className="text-primary font-medium hover:underline">
                                customer support team
                            </Link>
                        </p>
                    </div>
                </FadeIn>
            </div>
        </section>
    )
}
