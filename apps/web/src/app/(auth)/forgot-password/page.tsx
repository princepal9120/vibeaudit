'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                throw new Error('Failed to send reset email');
            }

            setSent(true);
            toast.success('Check your email for a reset link');
        } catch {
            // Always show success to prevent email enumeration
            setSent(true);
            toast.success('If an account exists, a reset link has been sent');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center px-4">
            <Link href="/" className="flex items-center gap-2 mb-10">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold text-white">ShipSafe</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="bg-[#111113] border border-[#27272A] rounded-lg p-8 w-full max-w-[400px]">
                    {!sent ? (
                        <>
                            <h1 className="text-xl font-bold text-white text-center mb-2">
                                Reset your password
                            </h1>
                            <p className="text-sm text-[#71717A] text-center mb-6">
                                Enter your email and we'll send you a reset link
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm text-[#A1A1AA]">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-[#09090B] border-[#27272A] text-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-black py-2.5 rounded font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Send reset link
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-white mb-2">
                                Check your email
                            </h1>
                            <p className="text-sm text-[#71717A] mb-6">
                                If an account exists for {email}, you'll receive a password reset link shortly.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-sm text-[#71717A] hover:text-white transition-colors inline-flex items-center gap-1"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
