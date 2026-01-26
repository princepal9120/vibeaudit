"use client";

import Link from "next/link";
import { ShieldCheck, Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
    product: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "How it works", href: "#how-it-works" },
        { name: "FAQ", href: "#faq" },
    ],
    company: [
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "mailto:hello@shipsafe.dev" },
    ],
    legal: [
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
        { name: "Security", href: "/security" },
    ],
};

const socialLinks = [
    { name: "GitHub", href: "https://github.com/shipsafe", icon: Github },
    { name: "Twitter", href: "https://twitter.com/shipsafe", icon: Twitter },
    { name: "LinkedIn", href: "https://linkedin.com/company/shipsafe", icon: Linkedin },
    { name: "Email", href: "mailto:hello@shipsafe.dev", icon: Mail },
];

export default function Footer() {
    return (
        <footer className="bg-muted/30 border-t border-border relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />

            <div className="container relative z-10">
                {/* Main footer content */}
                <div className="py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
                    {/* Brand column */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-3 group mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,217,255,0.4)]">
                                <ShieldCheck className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span
                                className="text-xl font-bold text-foreground"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                ShipSafe
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-xs mb-6">
                            Security scanning for indie hackers and solo developers.
                            Ship with confidence.
                        </p>
                        {/* Social links */}
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                    aria-label={social.name}
                                >
                                    <social.icon className="w-4 h-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Product links */}
                    <div>
                        <h4
                            className="text-sm font-semibold text-foreground mb-4"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Product
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company links */}
                    <div>
                        <h4
                            className="text-sm font-semibold text-foreground mb-4"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Company
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal links */}
                    <div>
                        <h4
                            className="text-sm font-semibold text-foreground mb-4"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Legal
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="py-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} ShipSafe. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        All systems operational
                    </div>
                </div>
            </div>
        </footer>
    );
}
