"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, SeverityBadge } from "@/components/ui/badge";
import { SecurityScoreGauge } from "@/components/ui/security-score-gauge";

// ============================================
// Icons
// ============================================

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

function CubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function LightBulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

// ============================================
// Grid Background for Hero
// ============================================

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0, 255, 136, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A2E1F]/50 to-[#0A2E1F]" />
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF88]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
    </div>
  );
}

// ============================================
// Dashboard Mock Component
// ============================================

function DashboardMock() {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          if (prev >= 72) {
            clearInterval(interval);
            return 72;
          }
          return prev + 1;
        });
      }, 25);
      return () => clearInterval(interval);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative animate-float">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-[#00FF88]/20 rounded-3xl blur-2xl" />

      <div className="relative bg-[#1F2937] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#0F1419] border-b border-white/10">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs text-gray-500 ml-2 font-mono">vibeaudit.dev/scan/my-app</span>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Score section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Security Score</h3>
              <p className="text-sm text-gray-400">my-saas-project</p>
            </div>
            <SecurityScoreGauge score={animatedScore} size="md" />
          </div>

          {/* Findings */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="flex-1">
                <span className="text-sm font-medium text-white">Hardcoded API Key</span>
              </div>
              <SeverityBadge severity="CRITICAL" size="sm" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="flex-1">
                <span className="text-sm font-medium text-white">Missing CSP Header</span>
              </div>
              <SeverityBadge severity="MEDIUM" size="sm" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <CheckIcon className="w-4 h-4 text-emerald-500" />
              <div className="flex-1">
                <span className="text-sm font-medium text-white">No SQL Injection</span>
              </div>
              <Badge variant="success" size="sm">Passed</Badge>
            </div>
          </div>

          {/* Action */}
          <Button className="w-full mt-4" variant="electric">
            View Full Report
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// FAQ Component
// ============================================

function FAQ({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left"
      >
        <span className="font-medium text-gray-900 dark:text-white">{question}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

// ============================================
// Feature Card
// ============================================

function FeatureCard({
  icon: Icon,
  title,
  description,
  iconBg
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  iconBg: string;
}) {
  return (
    <Card className="bg-white border-gray-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 group">
      <CardContent className="pt-6">
        <div className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Component
// ============================================

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Preorder/Waitlist State
  const [preorderPlan, setPreorderPlan] = useState<"starter" | "pro" | "enterprise" | null>(null);
  const [preorderEmail, setPreorderEmail] = useState("");
  const [isPreorderSubmitting, setIsPreorderSubmitting] = useState(false);
  const [isPreorderSubmitted, setIsPreorderSubmitted] = useState(false);
  const [preorderError, setPreorderError] = useState("");

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

  const handlePreorderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreorderError("");

    if (!preorderEmail || !preorderEmail.includes("@")) {
      setPreorderError("Please enter a valid email address");
      return;
    }

    setIsPreorderSubmitting(true);

    try {
      const res = await fetch("/api/preorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: preorderEmail, plan: preorderPlan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setIsPreorderSubmitted(true);
      setPreorderEmail("");
    } catch (err) {
      setPreorderError(err instanceof Error ? err.message : "Failed to join waitlist");
    } finally {
      setIsPreorderSubmitting(false);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "VibeAudit",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cloud",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "description": "Security scanning for indie builders. Scan your code and live apps for vulnerabilities.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "120",
    },
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ==================== HEADER ==================== */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0A2E1F]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="hover:opacity-90 transition-opacity">
                <Logo variant="light" />
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">How it Works</a>
                <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
                <a href="#faq" className="text-sm text-gray-300 hover:text-white transition-colors">FAQ</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:block text-sm text-gray-300 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/signup">
                <Button variant="electric" size="sm">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== HERO SECTION (Dark) ==================== */}
      <section className="relative min-h-screen bg-[#0A2E1F] pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
        <HeroBackground />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <Badge variant="electric" className="mb-6 px-4 py-1.5 text-sm inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF88]"></span>
                </span>
                Now in Public Beta
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
                Security Scanning for{" "}
                <span className="text-[#00FF88]">
                  People Who Code
                </span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-[#A7F3D0] leading-relaxed max-w-xl mx-auto lg:mx-0">
                No setup. No subscriptions. Just paste your GitHub URL, get a security report in 2 minutes.
              </p>

              {/* CTA */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button size="lg" variant="electric" className="w-full sm:w-auto h-14 px-8 text-base gap-2">
                    Scan Your First Project Free
                    <ArrowRightIcon className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline-white" size="lg" className="w-full sm:w-auto h-14 px-8 text-base gap-2">
                  <PlayIcon className="w-5 h-5" />
                  See Example Report
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-[#0A2E1F]" />
                  ))}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="font-semibold text-white">1,000+</span> indie hackers trust VibeAudit
                </div>
              </div>
            </div>

            {/* Right: Product Mock */}
            <div className="hidden lg:block">
              <DashboardMock />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PROBLEM SECTION (Light) ==================== */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#064E3B] mb-6">
              Enterprise Security Tools Ignore You
            </h2>
            <p className="text-lg text-gray-600">
              Compare VibeAudit to the enterprise alternatives and see why indie builders choose us.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Enterprise Tools */}
            <Card className="border-red-200 bg-gradient-to-b from-red-50/50 to-transparent">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-gray-900">Snyk / SonarQube</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <XMarkIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-gray-600">$125+/month minimum</span>
                </div>
                <div className="flex items-start gap-3">
                  <XMarkIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Requires DevOps setup</span>
                </div>
                <div className="flex items-start gap-3">
                  <XMarkIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Built for enterprise teams</span>
                </div>
                <div className="flex items-start gap-3">
                  <XMarkIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Confusing security jargon</span>
                </div>
              </CardContent>
            </Card>

            {/* VibeAudit */}
            <Card className="border-emerald-300 bg-gradient-to-b from-emerald-50 to-transparent ring-2 ring-emerald-500 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-600 text-white px-3 py-1">Better Choice</Badge>
              </div>
              <CardHeader className="text-center pb-4 pt-6">
                <CardTitle className="text-xl text-emerald-700">VibeAudit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">$30 per scan, no subscription</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Paste URL, click Scan</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Built for indie builders</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Plain-English explanations</span>
                </div>
              </CardContent>
            </Card>

            {/* Savings */}
            <Card className="border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-transparent flex flex-col justify-center">
              <CardContent className="text-center py-8">
                <div className="text-6xl font-bold text-emerald-600 mb-2">75%</div>
                <p className="text-lg text-gray-600">Less than enterprise tools</p>
                <p className="text-sm text-gray-500 mt-2">with better results for small teams</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS (Dark) ==================== */}
      <section id="how-it-works" className="py-20 sm:py-32 bg-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="electric" className="mb-4">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Security scanning in 3 simple steps
            </h2>
            <p className="text-lg text-gray-400">
              No complex setup. No DevOps expertise required. Just paste your URL and get results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -left-4 top-0 w-10 h-10 rounded-full bg-[#00FF88] text-[#0F1419] flex items-center justify-center font-bold text-lg">1</div>
              <Card className="bg-[#0F1419] border-white/10 h-full group-hover:border-[#00FF88]/30 transition-colors">
                <CardContent className="pt-8 pb-6">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:glow-green-sm transition-all">
                    <GitHubIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-xl text-white mb-2">Paste Your URL</h3>
                  <p className="text-gray-400">Enter your GitHub repo URL, live app URL, or both. We handle public and private repos.</p>
                </CardContent>
              </Card>
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-[#00FF88] to-transparent" />
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -left-4 top-0 w-10 h-10 rounded-full bg-[#00FF88] text-[#0F1419] flex items-center justify-center font-bold text-lg">2</div>
              <Card className="bg-[#0F1419] border-white/10 h-full group-hover:border-[#00FF88]/30 transition-colors">
                <CardContent className="pt-8 pb-6">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:glow-green-sm transition-all">
                    <BoltIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-xl text-white mb-2">We Scan Everything</h3>
                  <p className="text-gray-400">Our engine runs SAST, DAST, dependency checks, and secrets detection in parallel.</p>
                </CardContent>
              </Card>
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-[#00FF88] to-transparent" />
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -left-4 top-0 w-10 h-10 rounded-full bg-[#00FF88] text-[#0F1419] flex items-center justify-center font-bold text-lg">3</div>
              <Card className="bg-[#0F1419] border-white/10 h-full group-hover:border-[#00FF88]/30 transition-colors">
                <CardContent className="pt-8 pb-6">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:glow-green-sm transition-all">
                    <DocumentIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-xl text-white mb-2">Get Your Report</h3>
                  <p className="text-gray-400">Receive a plain-English report with severity scores, fix suggestions, and exportable PDFs.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-4">Average scan time</p>
            <div className="inline-flex items-center gap-3 text-4xl font-bold text-[#00FF88]">
              <BoltIcon className="w-10 h-10" />
              Under 3 minutes
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES (Light Mint) ==================== */}
      <section id="features" className="py-20 sm:py-32 bg-[#D1FAE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#064E3B] mb-6">
              What You Get
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to ship securely, built specifically for indie builders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={ShieldCheckIcon}
              title="Code Vulnerabilities"
              description="Deep SAST analysis detects SQL injection, XSS, insecure auth, and more across your codebase."
              iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <FeatureCard
              icon={KeyIcon}
              title="Secrets Detection"
              description="Find hardcoded API keys, passwords, and tokens before they leak. Supports 100+ secret patterns."
              iconBg="bg-gradient-to-br from-red-500 to-pink-600"
            />
            <FeatureCard
              icon={CubeIcon}
              title="Dependency Scan"
              description="Scan package.json, requirements.txt, and more. Get alerts for known CVEs and outdated packages."
              iconBg="bg-gradient-to-br from-amber-500 to-orange-600"
            />
            <FeatureCard
              icon={GlobeIcon}
              title="Live Site Testing"
              description="DAST scanning of your deployed application. Checks headers, SSL, XSS, CSRF, and cookies."
              iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <FeatureCard
              icon={LightBulbIcon}
              title="Plain-English Fixes"
              description="Every finding explained simply. Know what it is, why it matters, and exactly how to fix it."
              iconBg="bg-gradient-to-br from-purple-500 to-violet-600"
            />
            <FeatureCard
              icon={DocumentIcon}
              title="Client-Ready PDF"
              description="Professional reports for clients and stakeholders. Share via link or download as branded PDF."
              iconBg="bg-gradient-to-br from-slate-600 to-slate-800"
            />
          </div>
        </div>
      </section>

      {/* ==================== DEMO REPORT SECTION ==================== */}
      <section className="py-20 sm:py-32 bg-[#0F1419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Sample Finding */}
            <div>
              <Card className="bg-[#1F2937] border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <SeverityBadge severity="CRITICAL" size="lg" />
                      <h3 className="text-xl font-semibold text-white mt-3">Hardcoded API Keys Detected</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">What it is</h4>
                      <p className="text-gray-300">Your code contains AWS access keys visible in the source code. Anyone with access to your repository can steal these credentials.</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Why it matters</h4>
                      <p className="text-gray-300">Attackers can use leaked AWS keys to access your cloud resources, rack up charges, or steal user data.</p>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                        <LightBulbIcon className="w-4 h-4" />
                        How to Fix
                      </h4>
                      <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                        <li>Move secrets to environment variables</li>
                        <li>Add .env to your .gitignore file</li>
                        <li>Rotate the exposed keys immediately</li>
                      </ol>
                    </div>

                    <div className="bg-[#0F1419] rounded-lg p-4 font-mono text-sm">
                      <div className="text-gray-500 mb-1">// config.js:42</div>
                      <div className="text-red-400">const AWS_KEY = &quot;AKIA...REDACTED&quot;;</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                See exactly what&apos;s wrong,<br />
                and how to fix it
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Every finding comes with plain-English explanations, severity ratings, and step-by-step fix instructions. No security expertise required.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="electric" className="h-14 px-8 text-base">
                  See Your Own Report
                  <ArrowRightIcon className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <section id="pricing" className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Simple, pay-per-scan pricing
            </h2>
            <p className="text-lg text-gray-600">
              No subscriptions. No minimums. Pay only when you scan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Starter</CardTitle>
                <CardDescription className="text-base text-gray-500">For individual developers</CardDescription>
              </CardHeader>
              <CardContent className="text-center px-6">
                <div className="mb-6 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold text-gray-900">$0</span>
                </div>
                <ul className="space-y-4 text-sm text-gray-600 mb-8 text-left">
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>1 public repo scan / month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Secrets detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Dependency audit</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Basic security score</span>
                  </li>
                </ul>
                <Button onClick={() => setPreorderPlan("starter")} variant="secondary" className="w-full">
                  Join Waitlist
                </Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-emerald-300 bg-white relative shadow-lg ring-2 ring-emerald-500">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-600 text-white px-4 py-1.5 uppercase text-xs font-bold tracking-wide">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-4 pt-8">
                <CardTitle className="text-2xl font-bold text-gray-900">Pro</CardTitle>
                <CardDescription className="text-base text-emerald-700 font-medium">For professional teams</CardDescription>
              </CardHeader>
              <CardContent className="text-center px-6">
                <div className="mb-6 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold text-gray-900">$29</span>
                  <span className="text-gray-500 text-lg">/mo</span>
                </div>
                <ul className="space-y-4 text-sm text-gray-600 mb-8 text-left">
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Unlimited private repo scans</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Live URL / DAST scanning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>AI-powered plain English fixes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Client-facing PDF reports</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Priority email support</span>
                  </li>
                </ul>
                <Button onClick={() => setPreorderPlan("pro")} className="w-full shadow-md shadow-emerald-200">
                  Join Waitlist
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Enterprise</CardTitle>
                <CardDescription className="text-base text-gray-500">For large organizations</CardDescription>
              </CardHeader>
              <CardContent className="text-center px-6">
                <div className="mb-6 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold text-gray-900">Custom</span>
                </div>
                <ul className="space-y-4 text-sm text-gray-600 mb-8 text-left">
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>CI/CD pipeline integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>Team collaboration & sharing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>Compliance mapping (SOC2)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
                <Button onClick={() => setPreorderPlan("enterprise")} variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Preorder Modal */}
      {preorderPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Join the Waitlist</CardTitle>
                <button onClick={() => { setPreorderPlan(null); setIsPreorderSubmitted(false); }} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <CardDescription>
                You&apos;re signing up for the <span className="font-semibold text-gray-900 capitalize">{preorderPlan}</span> plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPreorderSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">You&apos;re on the list!</h3>
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto mb-6">
                    We&apos;re launching soon. You&apos;ll be first to know!
                  </p>
                  <Button onClick={() => setPreorderPlan(null)} className="w-full">Got it</Button>
                </div>
              ) : (
                <form onSubmit={handlePreorderSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={preorderEmail}
                      onChange={(e) => setPreorderEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  {preorderError && <p className="text-sm text-red-600">{preorderError}</p>}
                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={isPreorderSubmitting}
                  >
                    {isPreorderSubmitting ? "Joining..." : "Join Waitlist"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ==================== FAQ ==================== */}
      <section id="faq" className="py-20 sm:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Frequently asked questions
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            <FAQ
              question="What languages and frameworks do you support?"
              answer="We support JavaScript/TypeScript, Python, Go, Java, Ruby, PHP, and C#. This covers most popular frameworks like Next.js, React, Express, Django, Flask, Rails, and more."
            />
            <FAQ
              question="Do you store my code?"
              answer="No. We clone your repo temporarily, scan it, and delete it immediately. Your code never touches persistent storage. We only store the findings and report data."
            />
            <FAQ
              question="How is this different from Snyk or SonarQube?"
              answer="VibeAudit is built for indie builders, not enterprises. We combine SAST + DAST + secrets detection in one scan, explain findings in plain English, and cost a fraction of enterprise tools. No subscriptions, no complex setup."
            />
            <FAQ
              question="Can I scan private GitHub repos?"
              answer="Yes! Connect your GitHub account and we'll scan private repos with read-only access. Your credentials are encrypted and never stored in plain text."
            />
            <FAQ
              question="What if I find a false positive?"
              answer="Our AI triage filters most false positives, but you can mark findings as false positives and they won't appear in future scans. We're constantly improving our accuracy."
            />
            <FAQ
              question="Can I share reports with my clients?"
              answer="Absolutely! Generate a shareable link or download a professional PDF report. Perfect for freelancer handoffs and client presentations."
            />
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-[#064E3B] to-[#0A2E1F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to ship with confidence?
          </h2>
          <p className="text-lg text-[#A7F3D0] mb-10 max-w-2xl mx-auto">
            Join 1,000+ indie builders who trust VibeAudit to secure their code. Your first scan is free.
          </p>

          {isSubmitted ? (
            <Card className="max-w-md mx-auto border-emerald-400/30 bg-emerald-500/10">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-center gap-2 text-white">
                  <CheckIcon className="h-5 w-5" />
                  <span className="font-medium">You&apos;re on the list! Check your email.</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-14 text-base bg-white border-0"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                variant="electric"
                size="lg"
                className="h-14 px-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Joining..." : "Get Started Free"}
              </Button>
            </form>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-300">{error}</p>
          )}
          <p className="mt-4 text-sm text-emerald-200">
            No credit card required. 1 free scan included.
          </p>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-white/10 bg-[#0A2E1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <Logo variant="light" />
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Security scanning for indie builders. Ship with confidence.
              </p>
              <div className="flex gap-4">
                <a href="https://twitter.com/vibeaudit" className="text-gray-400 hover:text-white transition-colors">
                  <XIcon className="w-5 h-5" />
                </a>
                <a href="https://github.com/vibeaudit" className="text-gray-400 hover:text-white transition-colors">
                  <GitHubIcon className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security Glossary</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} VibeAudit. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Built for indie hackers, by indie hackers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
