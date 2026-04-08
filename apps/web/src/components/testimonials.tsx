"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
    {
        name: "Méschac Irung",
        role: "Creator",
        stars: 5,
        avatar: "https://avatars.githubusercontent.com/u/47919550?v=4",
        content: "ShipSafe is the first security tool that doesn't feel like a chore. It gives me exactly what I need to fix, and then gets out of my way.",
    },
    {
        name: "Théo Balick",
        role: "Frontend Dev",
        stars: 4,
        avatar: "https://avatars.githubusercontent.com/u/68236786?v=4",
        content: "ShipSafe has transformed how I ship web apps. I no longer worry about leaking API keys in client bundles.",
    },
    {
        name: "Glodie Lukose",
        role: "Full Stack Dev",
        stars: 5,
        avatar: "https://avatars.githubusercontent.com/u/99137927?v=4",
        content: "The plain English reports significantly accelerated my workflow. I fixed 3 critical issues in under 10 minutes.",
    },
    {
        name: "Sarah Chen",
        role: "Indie Hacker",
        stars: 5,
        avatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
        content: "Finally a security tool that doesn't feel like enterprise bloatware. Fast, effective, and beautifully designed.",
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

    const t = testimonials[currentIndex];

    return (
        <section className="max-w-4xl mx-auto px-6 mt-40 mb-20 text-center">
            {/* Decorative giant quote mark */}
            <div className="text-[120px] font-bold text-[#1A1A1A] leading-none select-none mb-[-40px]">&quot;</div>

            <div className="relative min-h-[160px] flex flex-col items-center justify-center">
                <blockquote className="text-xl sm:text-2xl font-medium mb-8 leading-relaxed italic text-white transition-all duration-500">
                    {t.content}
                </blockquote>

                <div className="flex items-center gap-4 flex-col">
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    "size-4",
                                    i < t.stars ? "fill-white stroke-white" : "fill-[#27272A] stroke-[#27272A]"
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <Avatar className="size-8 ring-1 ring-[#27272A]">
                            <AvatarImage src={t.avatar} alt={t.name} />
                            <AvatarFallback className="bg-[#27272A] text-white font-bold text-xs">{t.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-mono text-sm tracking-widest text-[#52525B] uppercase">
                            {t.name}, {t.role}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                            "h-1 rounded-full transition-all duration-300",
                            currentIndex === index ? "w-8 bg-white" : "w-1.5 bg-[#27272A] hover:bg-[#71717A]"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
