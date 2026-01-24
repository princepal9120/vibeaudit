"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border py-12">
            <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    VibeAudit
                </div>
                <div className="flex gap-8">
                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
                    <Link href="mailto:hello@vibeaudit.dev" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
                </div>
                <div className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} VibeAudit. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
