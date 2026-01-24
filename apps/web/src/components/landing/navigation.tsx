"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-lg border-b border-border/50 shadow-sm">
            <div className="container h-16 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    VibeAudit
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#how-it-works" className="text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors">How it works</Link>
                    <Link href="#features" className="text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors">Features</Link>
                    <Link href="#pricing" className="text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors">Pricing</Link>
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center gap-3">
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

                {/* Mobile Menu Button - Visible only on mobile */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg absolute w-full left-0 px-4 py-6 shadow-xl animate-in slide-in-from-top-2">
                    <div className="flex flex-col space-y-4">
                        <Link
                            href="#how-it-works"
                            className="text-lg font-medium text-foreground py-2 border-b border-border/50"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            How it works
                        </Link>
                        <Link
                            href="#features"
                            className="text-lg font-medium text-foreground py-2 border-b border-border/50"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Features
                        </Link>
                        <Link
                            href="#pricing"
                            className="text-lg font-medium text-foreground py-2 border-b border-border/50"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Pricing
                        </Link>
                        <div className="pt-4 flex flex-col gap-3">
                            <Button variant="outline" size="lg" asChild className="w-full justify-center">
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign in</Link>
                            </Button>
                            <Button
                                size="lg"
                                asChild
                                className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                            >
                                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Get Started Free</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
