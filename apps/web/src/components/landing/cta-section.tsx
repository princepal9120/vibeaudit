"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
    return (
        <section className="py-20 px-4 sm:px-6 bg-muted/30 bg-dots">
            <div className="container">
                <FadeIn>
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                            Analyze your project<br />in two minutes
                        </h2>
                        <p className="text-xl text-secondary-foreground mb-10">
                            Your reputation is worth more than a 2-minute scan.
                        </p>
                        <Button
                            size="lg"
                            asChild
                            className="h-16 px-12 text-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl lime-glow"
                        >
                            <Link href="/signup" className="flex items-center gap-3">
                                Get started free
                                <ArrowRight className="w-6 h-6" />
                            </Link>
                        </Button>
                        <p className="mt-6 text-muted-foreground">No credit card required</p>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
