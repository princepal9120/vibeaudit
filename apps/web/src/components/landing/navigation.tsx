"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Menu, X, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
                    ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg"
                    : "bg-transparent"
                }`}
        >
            <div className="container h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,217,255,0.4)]">
                            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
                        </div>
                        {/* Pulse effect */}
                        <div className="absolute inset-0 rounded-lg bg-primary/50 animate-ping opacity-0 group-hover:opacity-30" />
                    </div>
                    <span
                        className="text-xl font-bold text-foreground tracking-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        ShipSafe
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {["How it works", "Features", "Pricing"].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                            className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            {item}
                            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-1/2 group-hover:left-1/4" />
                        </Link>
                    ))}
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/login">Sign in</Link>
                    </Button>
                    <Button variant="glow" size="sm" asChild className="gap-2">
                        <Link href="/signup">
                            <Zap className="w-4 h-4" />
                            Get Started Free
                        </Link>
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <AnimatePresence mode="wait">
                        {isMobileMenuOpen ? (
                            <motion.div
                                key="close"
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 90 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="menu"
                                initial={{ opacity: 0, rotate: 90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: -90 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Menu className="w-5 h-5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="md:hidden overflow-hidden border-t border-border bg-background/98 backdrop-blur-xl"
                    >
                        <div className="container py-6 space-y-2">
                            {["How it works", "Features", "Pricing"].map((item, index) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 + 0.1 }}
                                >
                                    <Link
                                        href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                        className="block py-3 text-lg font-medium text-foreground border-b border-border/50 hover:text-primary transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="pt-4 flex flex-col gap-3"
                            >
                                <Button variant="outline" size="lg" asChild className="w-full justify-center">
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        Sign in
                                    </Link>
                                </Button>
                                <Button variant="glow" size="lg" asChild className="w-full justify-center gap-2">
                                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Zap className="w-4 h-4" />
                                        Get Started Free
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
