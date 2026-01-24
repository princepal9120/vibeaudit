"use client";

import Navigation from "@/components/landing/navigation";
import HeroSection from "@/components/landing/hero-section";
import StatsSection from "@/components/landing/stats-section";
import HowItWorks from "@/components/landing/how-it-works";
import TestimonialSection from "@/components/testimonials";
import FeaturesSection from "@/components/landing/features-section";
import PricingSection from "@/components/landing/pricing-section";
import FAQSection from "@/components/landing/faqs";
import CTASection from "@/components/landing/cta-section";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navigation />

      <main className="pt-16">
        <HeroSection />
        <StatsSection />
        <HowItWorks />
        <TestimonialSection />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
