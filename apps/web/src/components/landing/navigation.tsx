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
        <>
            <nav
                className={`fixed top-0 w-full h-[56px] z-50 transition-all duration-300 border-b ${isScrolled
                    ? "bg-[#09090B]/80 backdrop-blur-md border-[#27272A]"
                    : "bg-transparent border-transparent"
                    }`}
            >
                <div className="flex justify-between items-center px-6 w-full max-w-7xl mx-auto h-full">
                    {/* Logo */}
                    <Link href="/" className="font-['Geist'] font-medium text-white flex items-center gap-2 group">
                        <ShieldCheck className="w-5 h-5 text-white" />
                        <span className="tracking-tight">ShipSafe</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {["How it works", "Features", "Pricing"].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                className="font-['Geist'] text-[14px] tracking-tight text-[#71717A] hover:text-white transition-colors duration-200 py-3"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="font-['Geist'] text-[14px] text-[#71717A] hover:text-white transition-colors py-3">
                            Sign in
                        </Link>
                        <Link
                            href="/signup"
                            className="bg-white text-[#09090B] px-4 py-1.5 text-[14px] font-medium transition-transform active:scale-95 flex items-center gap-1.5"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            Start Free Scan
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg text-white"
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
                            className="md:hidden overflow-hidden border-t border-[#27272A] bg-[#09090B]/98 backdrop-blur-xl absolute top-[56px] left-0 w-full"
                        >
                            <div className="px-6 py-6 space-y-2">
                                {["How it works", "Features", "Pricing"].map((item, index) => (
                                    <motion.div
                                        key={item}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 + 0.1 }}
                                    >
                                        <Link
                                            href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                            className="block py-3 text-lg font-medium text-white border-b border-[#27272A]/50 transition-colors"
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
                                    className="pt-4 flex items-center justify-between"
                                >
                                    <Link href="/login" className="text-[#71717A] font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/signup"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="bg-white text-[#09090B] px-4 py-2 text-[14px] font-medium flex items-center gap-2"
                                    >
                                        <Zap className="w-4 h-4" />
                                        Start Free Scan
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
}
