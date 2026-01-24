"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function Navigation() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-lg border-b border-border/50 shadow-sm">
            <div className="container h-16 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    VibeAudit
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#how-it-works" className="text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors">How it works</Link>
                    <Link href="#features" className="text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors">Features</Link>
                    <Link href="#pricing" className="text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors">Pricing</Link>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild className="font-medium">
                        <Link href="/login">Sign in</Link>
                    </Button>
                    <Button
                        size="sm"
                        asChild
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold border-0 shadow-lg"
                    >
                        <Link href="/signup">Get Started Free</Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
