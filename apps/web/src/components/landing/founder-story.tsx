"use client";

import { FadeIn } from "@/components/ui/motion";

const leaks = [
  {
    title: "Clarity",
    description:
      "Visitors can’t quickly understand what you do, who it’s for, or why it matters.",
  },
  {
    title: "Trust",
    description:
      "Something feels off, but there isn’t enough proof, confidence, or reassurance to keep them engaged.",
  },
  {
    title: "Messaging",
    description:
      "Founders keep tweaking colors and buttons while the real issue is a weak headline or confusing structure.",
  },
  {
    title: "CTA friction",
    description:
      "People reach the call to action without enough momentum, context, or confidence to convert.",
  },
];

export default function FounderStory() {
  return (
    <section className="bg-[#09090B] pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr] items-stretch">
          <FadeIn>
            <div className="h-full rounded-2xl border border-[#27272A] bg-[#111113] p-8 md:p-10">
              <div className="mb-5 inline-flex items-center rounded-full border border-[#27272A] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[#71717A]">
                Why I built VibeAudit
              </div>

              <h2
                className="max-w-3xl text-3xl font-bold leading-tight text-white md:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Most landing pages don&apos;t lose conversions because of the UI.
              </h2>

              <div className="mt-6 max-w-3xl space-y-5 text-base leading-8 text-[#A1A1AA]">
                <p>
                  I kept seeing founders spend hours tweaking buttons, colors, and
                  layouts, while the real issues were usually clarity, trust, and
                  messaging.
                </p>
                <p>
                  Visitors land, feel that something is off, and leave without ever
                  telling you why. That makes it hard to know whether the leak is
                  your headline, structure, proof, or CTA flow.
                </p>
                <p>
                  So I built VibeAudit to audit landing pages and surface those
                  conversion leaks faster, before you waste more time, traffic, or
                  energy guessing.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid h-full gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {leaks.map((leak, index) => (
                <div
                  key={leak.title}
                  className="rounded-2xl border border-[#27272A] bg-[#111113] p-6"
                >
                  <div className="mb-4 font-mono text-xs text-[#52525B]">
                    0{index + 1}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {leak.title}
                  </h3>
                  <p className="text-sm leading-6 text-[#71717A]">
                    {leak.description}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.15}>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-7 text-[#71717A]">
            Still early, but the goal is simple: help founders spot weak
            headlines, confusing structure, trust gaps, and friction in the CTA
            flow faster.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
