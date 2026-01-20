"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

function CreditCardIcon({ className }: { className?: string }) {
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
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Pre-order state
  const [preorderEmail, setPreorderEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"single" | "triple">("single");
  const [isPreordering, setIsPreordering] = useState(false);
  const [preorderSuccess, setPreorderSuccess] = useState(false);
  const [preorderError, setPreorderError] = useState("");

  // NPS state
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [npsFeedback, setNpsFeedback] = useState("");
  const [isSubmittingNps, setIsSubmittingNps] = useState(false);
  const [npsSubmitted, setNpsSubmitted] = useState(false);
  const [npsError, setNpsError] = useState("");

  // Shipping intent state
  const [shippingIntentFeedback, setShippingIntentFeedback] = useState("");
  const [isSubmittingShippingIntent, setIsSubmittingShippingIntent] = useState(false);
  const [shippingIntentSubmitted, setShippingIntentSubmitted] = useState(false);
  const [shippingIntentError, setShippingIntentError] = useState("");

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

  const handlePreorder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreorderError("");

    if (!preorderEmail || !preorderEmail.includes("@")) {
      setPreorderError("Please enter a valid email address");
      return;
    }

    setIsPreordering(true);

    try {
      const res = await fetch("/api/preorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: preorderEmail, plan: selectedPlan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setPreorderSuccess(true);
      setPreorderEmail("");
    } catch (err) {
      setPreorderError(err instanceof Error ? err.message : "Failed to reserve");
    } finally {
      setIsPreordering(false);
    }
  };

  const handleNpsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNpsError("");

    if (npsScore === null) {
      setNpsError("Please select a score");
      return;
    }

    setIsSubmittingNps(true);

    try {
      const res = await fetch("/api/nps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: npsScore, feedback: npsFeedback }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setNpsSubmitted(true);
      setNpsFeedback("");
    } catch (err) {
      setNpsError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setIsSubmittingNps(false);
    }
  };

  const handleShippingIntent = async (wouldUse: boolean) => {
    setShippingIntentError("");
    setIsSubmittingShippingIntent(true);

    try {
      const res = await fetch("/api/shipping-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wouldUseBeforeShipping: wouldUse,
          feedback: shippingIntentFeedback,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setShippingIntentSubmitted(true);
      setShippingIntentFeedback("");
    } catch (err) {
      setShippingIntentError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmittingShippingIntent(false);
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

        {/* Early Bird Pre-order Section */}
        <div className="mt-24" id="preorder">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100">
              Limited Early Bird Pricing
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Lock in Founding Member Rates
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Reserve your scans now at early-bird prices. No payment today &mdash;
              we&apos;ll email you when we launch. Prices go up after the first 50 members.
            </p>
          </div>

          {preorderSuccess ? (
            <Card className="max-w-md mx-auto border-emerald-200 bg-emerald-50">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-emerald-800 mb-2">
                  You&apos;re locked in!
                </h3>
                <p className="text-emerald-700">
                  We&apos;ll email you as soon as VibeAudit launches with your exclusive early-bird pricing.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Single Scan */}
              <Card
                className={`relative cursor-pointer transition-all ${
                  selectedPlan === "single"
                    ? "border-emerald-500 ring-2 ring-emerald-500 ring-opacity-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedPlan("single")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Single Scan</span>
                    {selectedPlan === "single" && (
                      <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>Perfect for a single project audit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900">$25</span>
                    <span className="text-slate-500 ml-1">/scan</span>
                    <span className="block text-sm text-slate-400 line-through">$30/scan after launch</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      Full GitHub repo scan
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      Live app security check
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      AI-powered explanations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      PDF report for clients
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Triple Pack */}
              <Card
                className={`relative cursor-pointer transition-all ${
                  selectedPlan === "triple"
                    ? "border-emerald-500 ring-2 ring-emerald-500 ring-opacity-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedPlan("triple")}
              >
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white hover:bg-emerald-600">
                  Best Value
                </Badge>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Triple Pack</span>
                    {selectedPlan === "triple" && (
                      <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>For freelancers &amp; small teams</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900">$60</span>
                    <span className="text-slate-500 ml-1">for 3 scans</span>
                    <span className="block text-sm text-emerald-600 font-medium">Save $30 vs launch price</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      Everything in Single Scan
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      3 scans (use anytime)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      Founding member badge
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pre-order Form */}
          {!preorderSuccess && (
            <form onSubmit={handlePreorder} className="mt-8 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={preorderEmail}
                  onChange={(e) => setPreorderEmail(e.target.value)}
                  className="flex-1 h-12 text-base"
                  disabled={isPreordering}
                />
                <Button
                  type="submit"
                  className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2"
                  disabled={isPreordering}
                >
                  <CreditCardIcon className="h-4 w-4" />
                  {isPreordering ? "Reserving..." : `Reserve for $${selectedPlan === "single" ? "25" : "60"}`}
                </Button>
              </div>
              {preorderError && (
                <p className="mt-2 text-sm text-red-600 text-center">{preorderError}</p>
              )}
              <p className="mt-4 text-sm text-slate-500 text-center">
                No payment required today. We&apos;ll invoice you at launch.
              </p>
            </form>
          )}
        </div>

        {/* NPS Survey Section */}
        <div className="mt-24" id="feedback">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Quick Feedback
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              How likely are you to recommend VibeAudit to a friend or colleague?
            </p>
          </div>

          {npsSubmitted ? (
            <Card className="max-w-md mx-auto border-emerald-200 bg-emerald-50">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-emerald-800 mb-2">
                  Thank you for your feedback!
                </h3>
                <p className="text-emerald-700">
                  Your input helps us build a better product for indie builders.
                </p>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleNpsSubmit} className="max-w-lg mx-auto">
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500">Not likely</span>
                    <span className="text-sm text-slate-500">Very likely</span>
                  </div>
                  <div className="flex gap-1 sm:gap-2 justify-center mb-6">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setNpsScore(score)}
                        className={`w-8 h-10 sm:w-10 sm:h-12 rounded-md text-sm sm:text-base font-medium transition-all ${
                          npsScore === score
                            ? score >= 9
                              ? "bg-emerald-500 text-white"
                              : score >= 7
                              ? "bg-amber-500 text-white"
                              : "bg-red-500 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="npsFeedback"
                        className="block text-sm font-medium text-slate-700 mb-2"
                      >
                        What would make VibeAudit more useful for you? (optional)
                      </label>
                      <textarea
                        id="npsFeedback"
                        value={npsFeedback}
                        onChange={(e) => setNpsFeedback(e.target.value)}
                        placeholder="Share your thoughts..."
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        disabled={isSubmittingNps}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                      disabled={isSubmittingNps || npsScore === null}
                    >
                      {isSubmittingNps ? "Submitting..." : "Submit Feedback"}
                    </Button>

                    {npsError && (
                      <p className="text-sm text-red-600 text-center">{npsError}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          )}
        </div>

        {/* Shipping Intent Survey Section */}
        <div className="mt-24" id="shipping-intent">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
              Quick Question
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Would you use this before shipping?
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Imagine you&apos;re about to deploy your app. Would you run VibeAudit first?
            </p>
          </div>

          {shippingIntentSubmitted ? (
            <Card className="max-w-md mx-auto border-emerald-200 bg-emerald-50">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-emerald-800 mb-2">
                  Thanks for letting us know!
                </h3>
                <p className="text-emerald-700">
                  Your feedback helps us build the right product.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-lg mx-auto border-slate-200">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      type="button"
                      onClick={() => handleShippingIntent(true)}
                      disabled={isSubmittingShippingIntent}
                      className="flex-1 h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                      {isSubmittingShippingIntent ? "Submitting..." : "Yes, I would"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleShippingIntent(false)}
                      disabled={isSubmittingShippingIntent}
                      className="flex-1 h-14 text-lg font-medium"
                    >
                      {isSubmittingShippingIntent ? "Submitting..." : "Probably not"}
                    </Button>
                  </div>

                  <div>
                    <label
                      htmlFor="shippingIntentFeedback"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      What would make you more likely to use it? (optional)
                    </label>
                    <textarea
                      id="shippingIntentFeedback"
                      value={shippingIntentFeedback}
                      onChange={(e) => setShippingIntentFeedback(e.target.value)}
                      placeholder="e.g., faster scans, specific framework support, integrations..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      disabled={isSubmittingShippingIntent}
                    />
                  </div>

                  {shippingIntentError && (
                    <p className="text-sm text-red-600 text-center">{shippingIntentError}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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
