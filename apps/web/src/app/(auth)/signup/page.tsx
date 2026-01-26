'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, signUp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// GitHub Icon
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// Google Icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Signup failed');
      }

      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setError(null);
    setLoading(true);

    try {
      await signIn.social({
        provider: 'github',
        callbackURL: window.location.origin + '/dashboard',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'GitHub signup failed';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);

    try {
      await signIn.social({
        provider: 'google',
        callbackURL: window.location.origin + '/dashboard',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google signup failed';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
            <Logo iconClassName="w-10 h-10" textClassName="text-2xl" />
          </Link>
        </div>

        <Card className="border-slate-200">
          <CardHeader className="text-center">
            <CardTitle className="text-slate-900">Create an account</CardTitle>
            <CardDescription className="text-slate-500">
              Start securing your code in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GitHub Signup */}
            <Button
              onClick={handleGitHubSignup}
              disabled={loading}
              variant="outline"
              className="w-full border-slate-200 hover:bg-slate-50 text-slate-900"
            >
              <GitHubIcon className="w-5 h-5 mr-2" />
              Continue with GitHub
            </Button>

            {/* Google Signup */}
            <Button
              onClick={handleGoogleSignup}
              disabled={loading}
              variant="outline"
              className="w-full border-slate-200 hover:bg-slate-50 text-slate-900"
            >
              <GoogleIcon className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">or</span>
              </div>
            </div>

            {/* Email Signup Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="signup-name" className="text-sm font-medium text-slate-700">Name</label>
                <Input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="signup-email" className="text-sm font-medium text-slate-700">Email</label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  spellCheck={false}
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="signup-password" className="text-sm font-medium text-slate-700">Password</label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-500">Minimum 8 characters</p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            {/* Login link */}
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Sign in
              </Link>
            </p>

            {/* Terms */}
            <p className="text-center text-xs text-slate-500">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-slate-600 hover:text-slate-700">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-slate-600 hover:text-slate-700">Privacy Policy</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
