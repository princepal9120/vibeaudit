"use client";

import Link from "next/link";
import { ShieldCheck, Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
    product: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "How it works", href: "#how-it-works" },
        { name: "Changelog", href: "/changelog" },
        { name: "Roadmap", href: "/roadmap" },
    ],
    legal: [
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
        { name: "Security", href: "/security" },
        { name: "DPA", href: "/dpa" },
    ],
};

const socialLinks = [
    { name: "GitHub", href: "https://github.com/shipsafe", icon: Github },
    { name: "Twitter", href: "https://twitter.com/shipsafe", icon: Twitter },
    { name: "Email", href: "mailto:support@shipsafe.dev", icon: Mail },
];

export default function Footer() {
    return (
        <footer className="bg-[#09090B] w-full py-16 border-t border-[#1A1A1A]">
            <div className="grid grid-cols-2 gap-8 px-6 max-w-7xl mx-auto">
                {/* Brand column */}
                <div className="col-span-2 md:col-span-1">
                    <Link href="/" className="flex items-center gap-2 mb-6">
                        <ShieldCheck className="w-5 h-5 text-white" />
                        <span className="font-bold text-white text-xl">ShipSafe</span>
                    </Link>
                    <p className="text-sm leading-relaxed text-[#71717A] max-w-xs mb-6">
                        Building the future of developer security. High-performance scanning for the modern web.
                    </p>
                    {/* Social links */}
                    <div className="flex gap-4 grayscale opacity-50">
                        {socialLinks.map((social) => (
                            <Link
                                key={social.name}
                                href={social.href}
                                className="text-white hover:opacity-100 transition-opacity"
                                aria-label={social.name}
                            >
                                <social.icon className="w-5 h-5 m-2" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Nav columns */}
                <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-8">
                    <div>
                        <div className="text-white font-bold text-sm mb-4">Product</div>
                        <ul className="space-y-3 text-sm text-[#71717A]">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="hover:text-white hover:underline underline-offset-4 transition-colors py-2 inline-block">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="text-white font-bold text-sm mb-4">Legal</div>
                        <ul className="space-y-3 text-sm text-[#71717A]">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="hover:text-white hover:underline underline-offset-4 transition-colors py-2 inline-block">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="col-span-2 border-t border-[#1A1A1A] pt-8 flex justify-between items-center">
                    <div className="text-sm text-[#71717A]">
                        © {new Date().getFullYear()} ShipSafe. All rights reserved.
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#71717A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                        All systems operational
                    </div>
                </div>
            </div>
        </footer>
    );
}
