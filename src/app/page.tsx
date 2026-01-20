"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setIsSubmitted(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldIcon className="h-8 w-8 text-emerald-600" />
            <span className="font-bold text-xl text-slate-900">VibeAudit</span>
          </div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            Coming Soon
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-1.5 text-sm border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            Security scanning for indie builders
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            Ship with confidence.
            <span className="text-emerald-600"> Not anxiety.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Did your AI-generated code introduce security vulnerabilities?
            VibeAudit scans your GitHub repos and live apps, explains findings
            in plain English, and generates client-ready reports in under 3
            minutes.
          </p>

          {/* Signup Form */}
          <div className="mt-10 max-w-md mx-auto">
            {isSubmitted ? (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-center gap-2 text-emerald-700">
                    <CheckIcon className="h-5 w-5" />
                    <span className="font-medium">
                      You&apos;re on the list! We&apos;ll notify you at launch.
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-12 text-base"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="submit"
                    className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Joining..." : "Get Early Access"}
                  </Button>
                </div>
                {error && (
                  <p className="text-sm text-red-600 text-left">{error}</p>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gradient-to-b from-slate-50 to-white text-slate-500">
                      or
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-2 font-medium"
                  onClick={() => {
                    // GitHub OAuth will be implemented when backend is ready
                    alert("GitHub signup coming soon!");
                  }}
                >
                  <GitHubIcon className="h-5 w-5" />
                  Continue with GitHub
                </Button>
              </form>
            )}

            <p className="mt-4 text-sm text-slate-500">
              1 free scan included. No credit card required.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-slate-200 hover:border-slate-300 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                <ZapIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Scan in 3 Minutes
              </h3>
              <p className="text-sm text-slate-600">
                Paste your GitHub URL or live site. Get a full security report
                before your coffee gets cold.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:border-slate-300 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Plain English
              </h3>
              <p className="text-sm text-slate-600">
                No cryptic &quot;CWE-94&quot; jargon. Every finding explained so
                anyone can understand and fix it.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:border-slate-300 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <FileTextIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Client-Ready Reports
              </h3>
              <p className="text-sm text-slate-600">
                Professional PDF reports you can share with clients or
                stakeholders. Add your logo for co-branding.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:border-slate-300 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                <ShieldIcon className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                AI Code Coverage
              </h3>
              <p className="text-sm text-slate-600">
                Built for Cursor, Copilot, and Claude users. Catch the
                vulnerabilities AI coding assistants miss.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Scan Section */}
        <div className="mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
            What VibeAudit Scans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                <GitHubIcon className="h-5 w-5" />
                GitHub Repositories
              </h3>
              <ul className="space-y-3">
                {[
                  "SQL injection & XSS vulnerabilities",
                  "Hardcoded API keys & secrets",
                  "Insecure authentication patterns",
                  "Vulnerable dependencies",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-slate-600"
                  >
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                <ZapIcon className="h-5 w-5" />
                Live Applications
              </h3>
              <ul className="space-y-3">
                {[
                  "Missing security headers",
                  "SSL/TLS configuration issues",
                  "XSS & CSRF vulnerabilities",
                  "Cookie security problems",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-slate-600"
                  >
                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="mt-24 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Simple Pricing
          </h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            No subscriptions. No minimums. Pay only when you scan.
          </p>
          <Card className="max-w-sm mx-auto border-emerald-200">
            <CardContent className="pt-8 pb-8">
              <p className="text-5xl font-bold text-slate-900">
                $30
                <span className="text-lg font-normal text-slate-500">
                  /scan
                </span>
              </p>
              <p className="mt-4 text-slate-600">
                Complete security audit with AI explanations and PDF report
              </p>
              <Badge className="mt-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                First scan free
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Ready to ship securely?
          </h2>
          <p className="text-slate-600 mb-8">
            Join the waitlist and be first to know when we launch.
          </p>
          {!isSubmitted && (
            <form
              onSubmit={handleEmailSignup}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 text-base"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Joining..." : "Get Early Access"}
              </Button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-6 w-6 text-emerald-600" />
              <span className="font-semibold text-slate-900">VibeAudit</span>
            </div>
            <p className="text-sm text-slate-500">
              Security scanning for indie builders. Built with care.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
