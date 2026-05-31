'use client';

import { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityScoreCard } from '@/components/security-score';
import { FindingsSummary, SeverityBadge } from '@/components/badges';
import type { ConversionReportData } from '@/lib/types';

function CopyPromptButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-2 rounded-md bg-[#27272A]/50 hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white transition-all flex items-center gap-2"
      title="Copy prompt"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
      <span className="text-xs font-medium">{copied ? 'Copied' : 'Copy Prompt'}</span>
    </button>
  );
}

interface ConversionReportLike {
  securityScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  executiveSummary: string | null;
  conversionData?: ConversionReportData | null;
}

interface ConversionReportViewProps {
  report: ConversionReportLike;
}

export function ConversionReportView({ report }: ConversionReportViewProps) {
  const conversion = report.conversionData;

  if (!conversion) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Conversion Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This conversion audit finished, but the structured report payload is missing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SecurityScoreCard
          score={report.securityScore}
          showLabel
          showGrade
          label="Conversion Score"
        />

        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <FindingsSummary
              critical={report.criticalCount}
              high={report.highCount}
              medium={report.mediumCount}
              low={report.lowCount}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">What your page seems to say</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">{conversion.productSummary}</p>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground mb-2">Sharper positioning</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {conversion.valueProposition}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">Why visitors may hesitate</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {conversion.weaknesses.map((weakness) => (
                <li key={weakness} className="flex gap-3 text-sm text-muted-foreground leading-6">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {report.executiveSummary && (
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {report.executiveSummary}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-lg">Suggested rewrite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Headline
            </p>
            <p className="text-xl font-semibold text-foreground">{conversion.headline}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Subheadline
            </p>
            <p className="text-sm text-muted-foreground leading-7">{conversion.subheadline}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Benefit bullets
            </p>
            <ul className="grid gap-3 md:grid-cols-2">
              {conversion.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground leading-6"
                >
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border bg-primary/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Stronger CTA
            </p>
            <p className="text-base font-medium text-foreground">{conversion.cta}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">Social proof to add</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {conversion.socialProofIdeas.map((idea) => (
                <li key={idea} className="text-sm text-muted-foreground leading-6">
                  • {idea}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">Trust signals to add</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {conversion.trustSignals.map((signal) => (
                <li key={signal} className="text-sm text-muted-foreground leading-6">
                  • {signal}
                </li>
              ))}
            </ul>

            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Stronger hook
              </p>
              <p className="text-sm text-muted-foreground leading-6">{conversion.strongerHook}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-lg">Actionable fixes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {conversion.opportunities.map((item) => (
            <div key={`${item.category}-${item.title}`} className="rounded-xl border p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <SeverityBadge severity={item.severity} />
                <span className="text-sm uppercase tracking-wide text-muted-foreground">
                  {item.category}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-6">
                  {item.description}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Why it matters
                  </p>
                  <p className="text-sm text-muted-foreground leading-6">{item.impact}</p>
                </div>
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Recommended fix
                  </p>
                  <p className="text-sm text-muted-foreground leading-6">
                    {item.recommendation}
                  </p>
                </div>
              </div>

              {/* AI Prompt Section */}
              <div className="mt-4 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 p-4 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/0 via-[#8B5CF6]/5 to-[#8B5CF6]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-md bg-[#8B5CF6]/10 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">AI Fix Prompt</h4>
                </div>
                <div className="relative bg-[#09090B] border border-[#27272A] rounded-md p-4">
                  <CopyPromptButton text={`I have an issue on my landing page related to ${item.category}:\n\nIssue: ${item.title}\nDescription: ${item.description}\nWhy it matters: ${item.impact}\n\nPlease help me apply the following recommendation:\n${item.recommendation}`} />
                  <pre className="text-[#A1A1AA] text-sm leading-relaxed whitespace-pre-wrap font-mono pt-1 pb-1 pr-24">
{`I have an issue on my landing page related to ${item.category}:

Issue: ${item.title}
Description: ${item.description}
Why it matters: ${item.impact}

Please help me apply the following recommendation:
${item.recommendation}`}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
