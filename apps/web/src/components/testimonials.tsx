"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

const testimonials = [
    {
        name: "Méschac Irung",
        role: "Creator",
        stars: 5,
        avatar: "https://avatars.githubusercontent.com/u/47919550?v=4",
        content:
            "Using VibeAudit has been like unlocking a secret security superpower. It's the perfect fusion of simplicity and depth.",
    },
    {
        name: "Théo Balick",
        role: "Frontend Dev",
        stars: 4,
        avatar: "https://avatars.githubusercontent.com/u/68236786?v=4",
        content:
            "VibeAudit has transformed how I ship web apps. I no longer worry about leaking API keys in client bundles.",
    },
    {
        name: "Glodie Lukose",
        role: "Full Stack Dev",
        stars: 5,
        avatar: "https://avatars.githubusercontent.com/u/99137927?v=4",
        content:
            "The plain English reports significantly accelerated my workflow. I fixed 3 critical issues in under 10 minutes.",
    },
    {
        name: "Sarah Chen",
        role: "Indie Hacker",
        stars: 5,
        avatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
        content:
            "Finally a security tool that doesn't feel like enterprise bloatware. Fast, effective, and beautifully designed.",
    },
];

export default function TestimonialSection() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-20 px-4 sm:px-6 bg-dark-section text-white overflow-hidden">
            <div className="container relative">
                <FadeIn>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4">Trusted by developers</h2>
                        <p className="text-xl text-muted-foreground">Security that moves as fast as you do</p>
                    </div>
                </FadeIn>

                <div className="mx-auto w-full max-w-4xl px-6 relative">
                    {/* Carousel Container */}
                    <div className="relative h-[280px] sm:h-[240px]">
                        {testimonials.map((t, index) => {
                            // Calculate position relative to current index
                            const position = (index - currentIndex + testimonials.length) % testimonials.length;

                            // Determine styles based on position
                            // 0 = active/center
                            // 1 = right/next
                            // last = left/prev
                            // others = hidden/behind

                            let className = "absolute top-0 left-0 w-full transition-all duration-700 ease-in-out opacity-0 pointer-events-none transform translate-x-12 scale-95";

                            if (index === currentIndex) {
                                className = "absolute top-0 left-0 w-full transition-all duration-700 ease-in-out opacity-100 z-10 transform translate-x-0 scale-100";
                            } else if (position === 1) { // Next
                                className = "absolute top-0 left-0 w-full transition-all duration-700 ease-in-out opacity-40 z-0 transform translate-x-[40px] scale-90 blur-[1px]";
                            } else if (position === testimonials.length - 1) { // Prev
                                className = "absolute top-0 left-0 w-full transition-all duration-700 ease-in-out opacity-40 z-0 transform -translate-x-[40px] scale-90 blur-[1px]";
                            }

                            return (
                                <div key={index} className={className}>
                                    <div className="bg-dark-card ring-1 ring-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm mx-auto max-w-2xl">
                                        <div className="flex gap-1 mb-6" aria-label={`${t.stars} out of 5 stars`}>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "size-5",
                                                        i < t.stars
                                                            ? "fill-primary stroke-primary"
                                                            : "fill-muted stroke-transparent"
                                                    )}
                                                />
                                            ))}
                                        </div>

                                        <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed mb-6">
                                            &ldquo;{t.content}&rdquo;
                                        </blockquote>

                                        <div className="flex items-center gap-4">
                                            <Avatar className="size-12 ring-2 ring-primary/20">
                                                <AvatarImage src={t.avatar} alt={t.name} />
                                                <AvatarFallback className="bg-primary text-primary-foreground font-bold">{t.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-white font-bold">{t.name}</div>
                                                <div className="text-primary text-sm font-medium">{t.role}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Indicators */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    currentIndex === index ? "w-8 bg-primary" : "w-1.5 bg-muted hover:bg-muted-foreground"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
