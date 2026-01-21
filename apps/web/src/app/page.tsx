"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";





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

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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



function GridBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
        <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-emerald-200 to-emerald-400 opacity-20" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
      </div>
    </div>
  );
}



function ScanResultMock() {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          if (prev >= 87) {
            clearInterval(interval);
            return 87;
          }
          return prev + 1;
        });
      }, 20);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent rounded-3xl blur-2xl" />

      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs text-slate-500 ml-2">vibeaudit.dev/scan/my-saas-app</span>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Score Card */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Security Score</h3>
              <p className="text-sm text-slate-500">my-awesome-saas</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-emerald-600">{animatedScore}</div>
              <div className="text-sm text-emerald-600 font-medium">Good</div>
            </div>
          </div>

          {/* Findings */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="flex-1">
                <span className="text-sm font-medium text-red-700">Hardcoded API Key</span>
                <span className="text-xs text-red-500 ml-2">CRITICAL</span>
              </div>
              <Badge className="bg-red-100 text-red-700 text-xs">config.js:42</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="flex-1">
                <span className="text-sm font-medium text-amber-700">Missing CSP Header</span>
                <span className="text-xs text-amber-500 ml-2">MEDIUM</span>
              </div>
              <Badge className="bg-amber-100 text-amber-700 text-xs">headers</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex-1 flex items-center gap-3">
                <CheckIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">No SQL Injection found</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 text-xs">Passed</Badge>
            </div>
          </div>

          {/* Action */}
          <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
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
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left"
      >
        <span className="font-medium text-slate-900">{question}</span>
        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-6 text-slate-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
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
  const [preorderPlan, setPreorderPlan] = useState<"single" | "triple" | "waitlist" | "current" | null>(null);
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

  return (
    <div className="min-h-screen bg-white">
      {/* ==================== HEADER ==================== */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="hover:opacity-90 transition-opacity">
                <Logo />
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
                <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
                <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:block text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Sign in
              </Link>
              <Link href="/signup">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
        <GridBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-emerald-200 bg-emerald-50 text-emerald-700 inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Now in Public Beta
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                Security scanning for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  indie builders
                </span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                48% of AI-generated code has security flaws. VibeAudit scans your repos and live apps in under 3 minutes, explains findings in plain English, and generates client-ready reports.
              </p>

              {/* CTA */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base gap-2">
                    Start Free Scan
                    <ArrowRightIcon className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 font-medium text-base gap-2">
                  <PlayIcon className="w-4 h-4" />
                  Watch Demo
                </Button>
              </div>

              {/* Social Proof */}
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white" />
                  ))}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">500+</span> indie builders trust VibeAudit
                </div>
              </div>
            </div>

            {/* Right: Product Mock */}
            <div className="hidden lg:block">
              <ScanResultMock />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== LOGOS/TRUST BAR ==================== */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500 mb-8">Built for developers using modern tools</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            <div className="flex items-center gap-2 text-slate-600">
              <CodeIcon className="w-6 h-6" />
              <span className="font-semibold">Next.js</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CodeIcon className="w-6 h-6" />
              <span className="font-semibold">React</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CodeIcon className="w-6 h-6" />
              <span className="font-semibold">Node.js</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CodeIcon className="w-6 h-6" />
              <span className="font-semibold">Python</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CodeIcon className="w-6 h-6" />
              <span className="font-semibold">Go</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CodeIcon className="w-6 h-6" />
              <span className="font-semibold">Ruby</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PROBLEM SECTION ==================== */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4 border-red-200 bg-red-50 text-red-700">
              The Problem
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              AI code is fast. Security reviews are not.
            </h2>
            <p className="text-lg text-slate-600">
              You&apos;re shipping faster than ever with Cursor, Copilot, and Claude. But who&apos;s checking for vulnerabilities?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-red-100 bg-gradient-to-b from-red-50/50 to-transparent">
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-red-600 mb-2">48%</div>
                <p className="text-slate-600">of AI-generated code contains security vulnerabilities</p>
                <p className="text-xs text-slate-400 mt-2">Source: Veracode 2025</p>
              </CardContent>
            </Card>
            <Card className="border-amber-100 bg-gradient-to-b from-amber-50/50 to-transparent">
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-amber-600 mb-2">$125+</div>
                <p className="text-slate-600">per month for enterprise security tools—overkill for indie builders</p>
              </CardContent>
            </Card>
            <Card className="border-slate-100 bg-gradient-to-b from-slate-50/50 to-transparent">
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-slate-600 mb-2">0</div>
                <p className="text-slate-600">tools that scan repos AND live apps with plain-English explanations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="py-20 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Security scanning in 3 simple steps
            </h2>
            <p className="text-lg text-slate-600">
              No complex setup. No DevOps expertise required. Just paste your URL and get results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="relative">
              <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <Card className="border-slate-200 h-full">
                <CardContent className="pt-8 pb-6">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                    <GitHubIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">Paste Your URL</h3>
                  <p className="text-slate-600">Enter your GitHub repo URL, live app URL, or both. We handle public and private repos.</p>
                </CardContent>
              </Card>
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <Card className="border-slate-200 h-full">
                <CardContent className="pt-8 pb-6">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                    <ZapIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">We Scan Everything</h3>
                  <p className="text-slate-600">Our engine runs SAST, DAST, dependency checks, and secrets detection in parallel.</p>
                </CardContent>
              </Card>
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <Card className="border-slate-200 h-full">
                <CardContent className="pt-8 pb-6">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                    <FileTextIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">Get Your Report</h3>
                  <p className="text-slate-600">Receive a plain-English report with severity scores, fix suggestions, and exportable PDFs.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">Average scan time</p>
            <div className="inline-flex items-center gap-2 text-3xl font-bold text-emerald-600">
              <ZapIcon className="w-8 h-8" />
              Under 3 minutes
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section id="features" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Everything you need to ship securely
            </h2>
            <p className="text-lg text-slate-600">
              Built specifically for indie builders, freelancers, and small teams who ship fast.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                  <GitHubIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">GitHub Repo Scanning</h3>
                <p className="text-slate-600 text-sm">Deep SAST analysis of your codebase. Detects SQL injection, XSS, insecure auth, and more.</p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                  <ZapIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">Live App Testing</h3>
                <p className="text-slate-600 text-sm">DAST scanning of your deployed application. Checks headers, SSL, XSS, CSRF, and cookies.</p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4">
                  <LockIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">Secrets Detection</h3>
                <p className="text-slate-600 text-sm">Find hardcoded API keys, passwords, and tokens before they leak. Supports 100+ secret patterns.</p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4">
                  <AlertTriangleIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">Dependency Audit</h3>
                <p className="text-slate-600 text-sm">Scan package.json, requirements.txt, and more. Get alerts for known CVEs and outdated packages.</p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mb-4">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">AI Explanations</h3>
                <p className="text-slate-600 text-sm">Every finding explained in plain English. Know what it is, why it matters, and how to fix it.</p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-4">
                  <FileTextIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">PDF Reports</h3>
                <p className="text-slate-600 text-sm">Professional reports for clients and stakeholders. Share via link or download as PDF.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ==================== USE CASES ==================== */}
      <section className="py-20 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700">
              Use Cases
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Built for how you work
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <ZapIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-slate-900">Pre-Launch Validation</CardTitle>
                <CardDescription>For indie hackers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  &ldquo;I&apos;m shipping tomorrow. Let me scan for obvious holes before I deploy.&rdquo;
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Scan GitHub repo + staging URL
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Get pass/fail security score
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Fix critical issues before launch
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <FileTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-slate-900">Client Handoff</CardTitle>
                <CardDescription>For freelancers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  &ldquo;I need to show my client I audited this code before delivery.&rdquo;
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Professional PDF reports
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Plain-English for non-tech clients
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Reduce liability and disputes
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                  <SparklesIcon className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-slate-900">AI Code Validation</CardTitle>
                <CardDescription>For vibe coders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  &ldquo;I built 90% with Claude. Is it safe to deploy?&rdquo;
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Catch AI-introduced vulnerabilities
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    No security expertise needed
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Ship with confidence
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700">
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Loved by indie builders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  &ldquo;Found a hardcoded Stripe key I completely missed. VibeAudit paid for itself instantly.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                  <div>
                    <div className="font-medium text-slate-900">Sarah Chen</div>
                    <div className="text-sm text-slate-500">Indie Hacker</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  &ldquo;The PDF reports are perfect for client handoffs. Professional and easy to understand.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500" />
                  <div>
                    <div className="font-medium text-slate-900">Marcus Rivera</div>
                    <div className="text-sm text-slate-500">Freelance Developer</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  &ldquo;Finally a security tool that doesn&apos;t require a PhD to understand. Plain English FTW.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500" />
                  <div>
                    <div className="font-medium text-slate-900">Alex Kim</div>
                    <div className="text-sm text-slate-500">Vibe Coder</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <section id="pricing" className="py-20 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700">
              Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Simple, pay-per-scan pricing
            </h2>
            <p className="text-lg text-slate-600">
              No subscriptions. No minimums. Pay only when you scan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {/* Waitlist */}
            <Card className="border-blue-200 bg-white">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-slate-900">Waitlist</CardTitle>
                <CardDescription>Get early access</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold text-slate-900">$0</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2 justify-center">
                    <CheckIcon className="w-4 h-4 text-blue-500" />
                    Priority notification
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckIcon className="w-4 h-4 text-blue-500" />
                    Early bird discount
                  </li>
                </ul>
                <Button
                  onClick={() => setPreorderPlan("waitlist")}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  Join Waitlist
                </Button>
              </CardContent>
            </Card>

            {/* Free */}
            <Card className="border-slate-200 bg-white">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-slate-900">Free</CardTitle>
                <CardDescription>Try it out</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold text-slate-900">$0</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2 justify-center">
                    <CheckIcon className="w-4 h-4 text-emerald-500" />
                    1 free scan
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckIcon className="w-4 h-4 text-emerald-500" />
                    Full report
                  </li>
                </ul>
                <Link href="/signup">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Current (Waitlist Plan) */}
            <Card className="border-emerald-200 bg-white relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-600 text-white px-4 py-1">Current</Badge>
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-slate-900">Single Scan</CardTitle>
                <CardDescription>Per project</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold text-slate-900">$25</span>
                  <span className="text-slate-500 ml-1">/scan</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2 justify-center">
                    <CheckIcon className="w-4 h-4 text-emerald-500" />
                    GitHub + Live Scan
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckIcon className="w-4 h-4 text-emerald-500" />
                    PDF Report
                  </li>
                </ul>
                <Button
                  onClick={() => setPreorderPlan("current")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Join Waitlist
                </Button>
              </CardContent>
            </Card>

            {/* Triple Pack */}
            <Card className="border-slate-200 bg-white">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-slate-900">Triple Pack</CardTitle>
                <CardDescription>Best value</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold text-slate-900">$60</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2 justify-center">
                    <CheckIcon className="w-4 h-4 text-emerald-500" />
                    3 full scans
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckIcon className="w-4 h-4 text-emerald-500" />
                    Priority support
                  </li>
                </ul>
                <Link href="/signup">
                  <Button variant="outline" className="w-full">Buy Pack</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise/Advanced (Placeholder for 'Current' if it meant something else) */}
            <Card className="border-purple-200 bg-white">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-slate-900">Advanced</CardTitle>
                <CardDescription>For teams</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold text-slate-900">$150</span>
                  <span className="text-slate-500 ml-1">/mo</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2 justify-center">
                    <CheckIcon className="w-4 h-4 text-purple-500" />
                    Unlimited scans
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckIcon className="w-4 h-4 text-purple-500" />
                    Team management
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50">Contact Sales</Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      {/* Preorder Modal/Overlay */}
      {preorderPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Join the Waitlist</CardTitle>
                <button onClick={() => { setPreorderPlan(null); setIsPreorderSubmitted(false); }} className="text-slate-400 hover:text-slate-600">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <CardDescription>
                You&apos;re signing up for the <span className="font-semibold text-slate-900 capitalize">{preorderPlan}</span> plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPreorderSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">You&apos;re on the list!</h3>
                  <p className="text-slate-600">Check your email for confirmation.</p>
                  <Button onClick={() => setPreorderPlan(null)} className="mt-6 w-full">Close</Button>
                </div>
              ) : (
                <form onSubmit={handlePreorderSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
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
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
                    disabled={isPreorderSubmitting}
                  >
                    {isPreorderSubmitting ? "Joining..." : "Join Waitlist"}
                  </Button>
                  <p className="text-xs text-center text-slate-500"
                  >
                    We&apos;ll notify you as soon as early access is available.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <section id="faq" className="py-20 sm:py-32">

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700">
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Frequently asked questions
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
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
      <section className="py-20 sm:py-32 bg-gradient-to-b from-emerald-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to ship with confidence?
          </h2>
          <p className="text-lg text-emerald-100 mb-10 max-w-2xl mx-auto">
            Join 500+ indie builders who trust VibeAudit to secure their code. Your first scan is free.
          </p>

          {isSubmitted ? (
            <Card className="max-w-md mx-auto border-emerald-400 bg-emerald-500/20">
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
                className="flex-1 h-12 text-base bg-white border-0"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Joining..." : "Get Started Free"}
              </Button>
            </form>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-200">{error}</p>
          )}
          <p className="mt-4 text-sm text-emerald-200">
            No credit card required. 1 free scan included.
          </p>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <Logo />
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Security scanning for indie builders. Ship with confidence.
              </p>
              <div className="flex gap-4">
                <a href="https://twitter.com/vibeaudit" className="text-slate-400 hover:text-slate-600 transition-colors">
                  <XIcon className="w-5 h-5" />
                </a>
                <a href="https://github.com/vibeaudit" className="text-slate-400 hover:text-slate-600 transition-colors">
                  <GitHubIcon className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a></li>
                <li><a href="#faq" className="text-slate-600 hover:text-slate-900 transition-colors">FAQ</a></li>
                <li><Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Security Glossary</a></li>
                <li><a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} VibeAudit. All rights reserved.
            </p>
            <p className="text-sm text-slate-500">
              Made with care for the indie builder community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
