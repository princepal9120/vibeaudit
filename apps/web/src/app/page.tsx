"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn, Stagger, FloatingElement } from "@/components/ui/motion";
import {
  ShieldCheck,
  Search,
  FileText,
  CheckCircle2,
  Zap,
  ArrowRight,
  Github,
  Globe,
  Lock,
  TrendingUp,
  Clock,
  Users,
  Sparkles,
  BarChart3,
  Shield,
  Check,
  X,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            VibeAudit
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors">How it works</Link>
            <Link href="#features" className="text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="font-medium">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-[#CCFF00] text-foreground hover:bg-[#B8E600] font-semibold border-0 shadow-lg"
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* HERO SECTION */}
        <section className="relative py-20 lg:py-28 px-4 sm:px-6 overflow-hidden bg-white">
          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <Stagger className="text-left">
                <FadeIn>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] tracking-tight">
                    Cut security risks,
                    <br />
                    <span className="text-secondary-foreground">not shipping speed.</span>
                  </h1>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <p className="text-xl text-secondary-foreground max-w-lg mt-8 leading-relaxed">
                    AI-generated code often hides security flaws. VibeAudit scans your
                    GitHub repo and live app in 2 minutes, giving you a plain-English
                    security report.
                  </p>
                </FadeIn>
                <FadeIn delay={0.2} className="flex flex-col sm:flex-row gap-4 mt-10">
                  <Button
                    size="lg"
                    asChild
                    className="h-14 px-8 text-lg bg-[#CCFF00] text-foreground hover:bg-[#B8E600] font-bold rounded-xl lime-glow border-0"
                  >
                    <Link href="/signup" className="flex items-center gap-2">
                      Start Free Security Scan
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      No credit card required
                    </span>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      2 minute setup
                    </span>
                  </div>
                </FadeIn>
              </Stagger>

              {/* Hero Dashboard Mockup */}
              <FloatingElement delay={0.4} className="relative hidden lg:block">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#CCFF00]/10 via-primary/10 to-[#CCFF00]/10 rounded-3xl blur-3xl" />
                <div className="relative bg-white border border-border rounded-2xl shadow-2xl overflow-hidden">
                  {/* Browser chrome */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-border flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="bg-white px-4 py-1.5 rounded-lg border border-border text-xs text-muted-foreground font-mono max-w-xs">
                        vibeaudit.dev/scan/my-app
                      </div>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Security Score</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-4xl font-bold text-primary">78</span>
                          <span className="text-lg text-muted-foreground">/100</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" strokeDasharray="176" strokeDashoffset="39" strokeLinecap="round" />
                        </svg>
                        <span className="text-sm font-bold text-primary">B+</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-sm font-medium">Exposed API Key</span>
                        </div>
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">CRITICAL</span>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-sm font-medium">Client-Side Auth</span>
                        </div>
                        <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium">HIGH</span>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">HTTPS Enforced</span>
                        </div>
                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">PASSED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </FloatingElement>
            </div>
          </div>
        </section>

        {/* SAVINGS/VALUE SECTION */}
        <section className="py-20 px-4 sm:px-6 bg-gray-50">
          <div className="container">
            <FadeIn>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                  Scan your code in <span className="text-[#CCFF00] bg-foreground px-3 py-1 rounded-lg">2 minutes</span>
                </h2>
                <p className="text-xl text-secondary-foreground">
                  Most security tools are slow, expensive, and built for enterprises.
                  VibeAudit is built for indie hackers and small teams.
                </p>
              </div>
            </FadeIn>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { stat: "75%", label: "of AI-generated code has security issues", icon: Zap },
                { stat: "2 min", label: "average scan time", icon: Clock },
                { stat: "$30", label: "per scan, no subscription", icon: TrendingUp },
                { stat: "100+", label: "security checks performed", icon: Shield },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="bg-white border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                    <item.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                    <p className="text-4xl font-bold text-foreground mb-2">{item.stat}</p>
                    <p className="text-sm text-secondary-foreground">{item.label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-white">
          <div className="container">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">How it works</h2>
                <p className="text-xl text-secondary-foreground">Three steps to security clarity</p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "01",
                  icon: Github,
                  title: "Connect your repo",
                  desc: "Paste your GitHub URL. Public or private, we handle auth securely."
                },
                {
                  step: "02",
                  icon: Globe,
                  title: "Add your live URL",
                  desc: "Optional: We'll also scan your deployed app for runtime vulnerabilities."
                },
                {
                  step: "03",
                  icon: FileText,
                  title: "Get your report",
                  desc: "A clear, prioritized list of issues with step-by-step fix guidance."
                },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.15}>
                  <div className="relative bg-gray-50 border border-border rounded-2xl p-8 hover:border-primary/30 transition-colors group">
                    <div className="absolute -top-4 left-8 bg-foreground text-white text-sm font-bold px-3 py-1 rounded-full">
                      {item.step}
                    </div>
                    <div className="mt-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-secondary-foreground">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIAL / DARK SECTION */}
        <section className="py-20 px-4 sm:px-6 bg-grid-dark text-white">
          <div className="container">
            <FadeIn>
              <div className="max-w-4xl mx-auto text-center">
                <blockquote className="text-2xl sm:text-3xl font-medium leading-relaxed mb-8">
                  &ldquo;I built my entire app with Cursor and Claude. I had no idea my API keys
                  were visible in the client bundle until VibeAudit caught it. That one scan
                  probably saved me from a major breach.&rdquo;
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#CCFF00] flex items-center justify-center text-foreground font-bold">
                    JK
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Jake K.</p>
                    <p className="text-gray-400 text-sm">Indie Hacker, shipped 3 apps</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-20 px-4 sm:px-6 bg-white">
          <div className="container">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">We&apos;ve got your back</h2>
                <p className="text-xl text-secondary-foreground">Everything you need, nothing you don&apos;t</p>
              </div>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Search, title: "Deep Code Scanning", desc: "We analyze your codebase for secrets, vulnerabilities, and bad patterns - especially ones AI tools create." },
                { icon: Globe, title: "Live Website Analysis", desc: "Security headers, SSL config, exposed endpoints - we check your running app too." },
                { icon: Sparkles, title: "AI-Aware Detection", desc: "Tuned for patterns that Cursor, Claude, and other AI tools commonly produce." },
                { icon: FileText, title: "Plain English Reports", desc: "No security jargon. Every issue explained like you're talking to a helpful friend." },
                { icon: Lock, title: "Zero Data Storage", desc: "We clone, scan, and delete. Your code never stays on our servers." },
                { icon: BarChart3, title: "Shareable PDF", desc: "Professional reports for clients, investors, or your co-founder." },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="bg-gray-50 border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/20 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-secondary-foreground text-sm">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* DARK DASHBOARD PREVIEW */}
        <section className="py-20 px-4 sm:px-6 bg-[#0F1419]">
          <div className="container">
            <FadeIn>
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">See exactly what needs fixing</h2>
                  <p className="text-gray-400">Your security report, prioritized by severity</p>
                </div>

                {/* Dark Dashboard Mockup */}
                <div className="bg-[#1A1F26] border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">my-saas-app</p>
                        <p className="text-gray-500 text-sm">Scanned 2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-primary">78</span>
                      <span className="text-gray-500">/100</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    {[
                      { severity: "critical", title: "Hardcoded Stripe API Key in checkout.js", file: "src/lib/checkout.js:42" },
                      { severity: "high", title: "JWT verification on client-side only", file: "src/utils/auth.ts:18" },
                      { severity: "medium", title: "Missing rate limiting on API routes", file: "src/app/api/*" },
                      { severity: "passed", title: "HTTPS properly enforced", file: "SSL/TLS Configuration" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`rounded-xl p-4 flex items-center justify-between ${item.severity === "critical" ? "bg-red-500/10 border border-red-500/20" :
                            item.severity === "high" ? "bg-amber-500/10 border border-amber-500/20" :
                              item.severity === "medium" ? "bg-yellow-500/10 border border-yellow-500/20" :
                                "bg-primary/10 border border-primary/20"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${item.severity === "critical" ? "bg-red-500" :
                              item.severity === "high" ? "bg-amber-500" :
                                item.severity === "medium" ? "bg-yellow-500" :
                                  "bg-primary"
                            }`} />
                          <div>
                            <p className="text-white font-medium">{item.title}</p>
                            <p className="text-gray-500 text-sm font-mono">{item.file}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium uppercase ${item.severity === "critical" ? "bg-red-500 text-white" :
                            item.severity === "high" ? "bg-amber-500 text-white" :
                              item.severity === "medium" ? "bg-yellow-500 text-foreground" :
                                "bg-primary text-white"
                          }`}>
                          {item.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-20 px-4 sm:px-6 bg-white">
          <div className="container">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">Pricing</h2>
                <p className="text-xl text-secondary-foreground">No subscriptions. No hidden fees. Pay per scan.</p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Tier */}
              <FadeIn delay={0.1}>
                <div className="bg-gray-50 border border-border rounded-2xl p-8 h-full">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2">Free</h3>
                    <p className="text-secondary-foreground">Try before you buy</p>
                  </div>
                  <div className="mb-8">
                    <span className="text-5xl font-bold">$0</span>
                    <span className="text-secondary-foreground"> / first scan</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {[
                      { included: true, text: "1 free security scan" },
                      { included: true, text: "Full vulnerability report" },
                      { included: true, text: "Plain English explanations" },
                      { included: false, text: "PDF export" },
                      { included: false, text: "Priority support" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        {item.included ? (
                          <Check className="w-5 h-5 text-primary" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300" />
                        )}
                        <span className={item.included ? "" : "text-gray-400"}>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="lg" asChild className="w-full h-14 text-lg rounded-xl">
                    <Link href="/signup">Start Free Scan</Link>
                  </Button>
                </div>
              </FadeIn>

              {/* Pro Tier */}
              <FadeIn delay={0.2}>
                <div className="bg-foreground text-white rounded-2xl p-8 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-[#CCFF00] text-foreground text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </div>
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2">Pro</h3>
                    <p className="text-gray-400">For serious builders</p>
                  </div>
                  <div className="mb-8">
                    <span className="text-5xl font-bold">$30</span>
                    <span className="text-gray-400"> / scan</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {[
                      { included: true, text: "Unlimited scans" },
                      { included: true, text: "Full vulnerability report" },
                      { included: true, text: "Plain English explanations" },
                      { included: true, text: "PDF export included" },
                      { included: true, text: "Priority support" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-[#CCFF00]" />
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="lg"
                    asChild
                    className="w-full h-14 text-lg rounded-xl bg-[#CCFF00] text-foreground hover:bg-[#B8E600] font-bold lime-glow"
                  >
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-20 px-4 sm:px-6 bg-gray-50 bg-dots">
          <div className="container">
            <FadeIn>
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                  Analyze your project<br />in two minutes
                </h2>
                <p className="text-xl text-secondary-foreground mb-10">
                  Stop hoping your AI-generated code is secure. Know for sure.
                </p>
                <Button
                  size="lg"
                  asChild
                  className="h-16 px-12 text-xl bg-[#CCFF00] text-foreground hover:bg-[#B8E600] font-bold rounded-xl lime-glow"
                >
                  <Link href="/signup" className="flex items-center gap-3">
                    Get started with VibeAudit for free
                    <ArrowRight className="w-6 h-6" />
                  </Link>
                </Button>
                <p className="mt-6 text-muted-foreground">No credit card required</p>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-12">
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
    </div>
  );
}
