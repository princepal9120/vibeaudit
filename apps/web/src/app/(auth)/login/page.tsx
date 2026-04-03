'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';


// GitHub Icon
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// Google Icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Login failed');
      }

      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      await signIn.social({
        provider: 'github',
        callbackURL: window.location.origin + '/dashboard',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub login failed');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      await signIn.social({
        provider: 'google',
        callbackURL: window.location.origin + '/dashboard',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#09090B]">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-3 group">
            <ShieldCheck className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white tracking-tight">ShipSafe</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-[#111113] border border-[#27272A] p-8">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
              <p className="text-[#71717A] text-sm">Sign in to your account to continue</p>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleGitHubLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2 h-10 bg-transparent border border-[#27272A] text-white text-sm font-medium hover:bg-[#18181B] transition-colors"
              >
                <GitHubIcon className="w-4 h-4" />
                GitHub
              </button>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2 h-10 bg-transparent border border-[#27272A] text-white text-sm font-medium hover:bg-[#18181B] transition-colors"
              >
                <GoogleIcon className="w-4 h-4" />
                Google
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#27272A]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#111113] text-[#52525B] uppercase tracking-wider">or continue with email</span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#A1A1AA]">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#09090B] border-[#27272A] text-white placeholder:text-[#52525B] focus:border-white h-10 rounded-none"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#A1A1AA]">Password</label>
                  <Link href="/forgot-password" className="text-xs text-[#71717A] hover:text-white transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-[#09090B] border-[#27272A] text-white placeholder:text-[#52525B] focus:border-white h-10 rounded-none"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#EF4444]/10 border border-[#EF4444]/20 p-3"
                >
                  <p className="text-[#EF4444] text-sm">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-2.5 font-bold text-sm tracking-tight active:scale-[0.98] transition-transform mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-[#71717A] mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-white hover:underline underline-offset-4 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
