"use client";

import Navigation from "@/components/landing/navigation";
import HeroSection from "@/components/landing/hero-section";
import FounderStory from "@/components/landing/founder-story";
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
    <div className="flex flex-col min-h-screen bg-[#09090B] text-white font-sans selection:bg-white selection:text-black">
      <Navigation />
      <HeroSection />
      <FounderStory />
      <StatsSection />
      <HowItWorks />
      <FeaturesSection />
      <PricingSection />
      <TestimonialSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
