import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center px-6">
            <ShieldCheck className="w-12 h-12 text-muted-foreground mb-6" />
            <h1 className="text-4xl font-bold text-white mb-2">Page not found</h1>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
                href="/"
                className="bg-white text-black px-6 py-3 font-bold text-sm rounded transition-transform active:scale-95"
            >
                Back to VibeAudit
            </Link>
        </div>
    );
}
