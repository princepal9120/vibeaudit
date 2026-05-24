import OpenAI from 'openai';
import { config } from '../config.js';
import { safeSpawn } from '../lib/safe-exec.js';
import type { Severity } from './scanners/types.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

interface PageSnapshot {
  liveUrl: string;
  title: string;
  metaDescription: string;
  h1: string;
  h2s: string[];
  ctas: string[];
  textExcerpt: string;
  trustSignals: string[];
  socialProofSignals: string[];
  hasPricing: boolean;
  hasFaq: boolean;
  hasTestimonials: boolean;
  hasStats: boolean;
}

export interface ConversionOpportunity {
  title: string;
  severity: Severity;
  category: string;
  description: string;
  impact: string;
  recommendation: string;
}

export interface ConversionAuditResult {
  score: number;
  productSummary: string;
  executiveSummary: string;
  weaknesses: string[];
  valueProposition: string;
  headline: string;
  subheadline: string;
  benefits: string[];
  cta: string;
  socialProofIdeas: string[];
  trustSignals: string[];
  strongerHook: string;
  finalPolishedCopy: {
    headline: string;
    subheadline: string;
    benefits: string[];
    cta: string;
  };
  opportunities: ConversionOpportunity[];
  pageSnapshot: PageSnapshot;
}

interface AiAuditResponse {
  score?: number;
  productSummary?: string;
  executiveSummary?: string;
  weaknesses?: string[];
  valueProposition?: string;
  headline?: string;
  subheadline?: string;
  benefits?: string[];
  cta?: string;
  socialProofIdeas?: string[];
  trustSignals?: string[];
  strongerHook?: string;
  opportunities?: Array<{
    title?: string;
    severity?: Severity;
    category?: string;
    description?: string;
    impact?: string;
    recommendation?: string;
  }>;
}

const GENERIC_CTA_LABELS = new Set([
  'learn more',
  'get started',
  'book a demo',
  'contact us',
  'submit',
  'join now',
  'read more',
  'try now',
]);

const TRUST_SIGNAL_RULES: Array<{ label: string; pattern: RegExp }> = [
  { label: 'Customer logos', pattern: /\b(trusted by|used by|backed by|featured in)\b/i },
  { label: 'Testimonials', pattern: /\b(testimonial|what customers say|customer stories|loved by)\b/i },
  { label: 'Case studies', pattern: /\b(case study|success story|results)\b/i },
  { label: 'Guarantees or risk reversal', pattern: /\b(money-back|guarantee|cancel anytime|free trial)\b/i },
  { label: 'Security or compliance proof', pattern: /\b(soc 2|gdpr|secure|ssl|privacy policy)\b/i },
];

const SOCIAL_PROOF_RULES: Array<{ label: string; pattern: RegExp }> = [
  { label: 'Testimonials', pattern: /\b(testimonial|customer story|reviews?)\b/i },
  { label: 'Usage numbers', pattern: /\b\d[\d,.]*\s?(customers|teams|founders|users|companies)\b/i },
  { label: 'Media or partner mentions', pattern: /\b(featured in|backed by|trusted by)\b/i },
  { label: 'Ratings or review snippets', pattern: /\b(stars?|rating|review)\b/i },
];

export async function runConversionAudit(liveUrl: string): Promise<ConversionAuditResult> {
  const snapshot = await capturePageSnapshot(liveUrl);

  if (config.openaiApiKey) {
    try {
      return await generateAiConversionAudit(snapshot);
    } catch (error) {
      console.error('[Conversion Audit] OpenAI generation failed:', error);
    }
  }

  return generateFallbackAudit(snapshot);
}

async function capturePageSnapshot(liveUrl: string): Promise<PageSnapshot> {
  new URL(liveUrl);

  const { stdout: html } = await safeSpawn(
    'curl',
    ['-sL', '--max-time', '20', '-A', 'Mozilla/5.0 (compatible; VibeAudit/1.0)', liveUrl],
    { timeout: 25000 }
  );

  if (!html.trim()) {
    throw new Error('Unable to fetch landing page HTML');
  }

  const normalizedHtml = html.replace(/\r/g, ' ');
  const cleanedText = extractVisibleText(normalizedHtml);
  const title = extractSingleMatch(normalizedHtml, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription = extractMetaContent(normalizedHtml, 'description');
  const h1 = extractSingleMatch(normalizedHtml, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h2s = extractTagTexts(normalizedHtml, 'h2').slice(0, 6);
  const ctas = extractCallToActions(normalizedHtml).slice(0, 8);
  const lowerText = `${normalizedHtml}\n${cleanedText}`.toLowerCase();

  return {
    liveUrl,
    title,
    metaDescription,
    h1,
    h2s,
    ctas,
    textExcerpt: cleanedText.slice(0, 6000),
    trustSignals: TRUST_SIGNAL_RULES.filter((rule) => rule.pattern.test(lowerText)).map((rule) => rule.label),
    socialProofSignals: SOCIAL_PROOF_RULES.filter((rule) => rule.pattern.test(lowerText)).map((rule) => rule.label),
    hasPricing: /\bpricing|plans|per month|per year|free trial|subscription\b/i.test(lowerText),
    hasFaq: /\bfaq|frequently asked questions\b/i.test(lowerText),
    hasTestimonials: /\btestimonial|customer stories|loved by|what customers say\b/i.test(lowerText),
    hasStats: /\b\d[\d,.]*\s?(customers|users|founders|teams|companies|businesses|%\b)/i.test(lowerText),
  };
}

async function generateAiConversionAudit(snapshot: PageSnapshot): Promise<ConversionAuditResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    temperature: 0.6,
    max_tokens: 2200,
    messages: [
      {
        role: 'system',
        content: `You are VibeAudit, an expert conversion strategist and landing-page copywriter for SaaS products.

Analyze the provided landing page snapshot and rewrite it for better conversion.

Return valid JSON only with this exact structure:
{
  "score": number,
  "productSummary": string,
  "executiveSummary": string,
  "weaknesses": string[],
  "valueProposition": string,
  "headline": string,
  "subheadline": string,
  "benefits": string[],
  "cta": string,
  "socialProofIdeas": string[],
  "trustSignals": string[],
  "strongerHook": string,
  "opportunities": [
    {
      "title": string,
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "category": string,
      "description": string,
      "impact": string,
      "recommendation": string
    }
  ]
}

Rules:
- Write for founders and SaaS landing pages
- Be clear, human, direct, and founder-friendly
- Focus on clarity, trust, positioning, structure, offer understanding, and CTA friction
- Avoid buzzwords and generic filler
- Benefits must be 3 to 5 items
- Weaknesses should be specific, not abstract
- Opportunities should be actionable and prioritized`,
      },
      {
        role: 'user',
        content: JSON.stringify(snapshot),
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  const parsed = JSON.parse(content) as AiAuditResponse;
  const fallback = generateFallbackAudit(snapshot);
  const opportunities = normalizeOpportunities(parsed.opportunities, fallback.opportunities);
  const score = normalizeScore(parsed.score, opportunities);
  const benefits = normalizeStringList(parsed.benefits, fallback.benefits, 3, 5);
  const weaknesses = normalizeStringList(parsed.weaknesses, fallback.weaknesses, 3, 5);
  const socialProofIdeas = normalizeStringList(parsed.socialProofIdeas, fallback.socialProofIdeas, 2, 4);
  const trustSignals = normalizeStringList(parsed.trustSignals, fallback.trustSignals, 2, 4);
  const headline = sanitizeText(parsed.headline, fallback.headline);
  const subheadline = sanitizeText(parsed.subheadline, fallback.subheadline);
  const cta = sanitizeText(parsed.cta, fallback.cta);

  return {
    score,
    productSummary: sanitizeText(parsed.productSummary, fallback.productSummary),
    executiveSummary: sanitizeText(parsed.executiveSummary, fallback.executiveSummary),
    weaknesses,
    valueProposition: sanitizeText(parsed.valueProposition, fallback.valueProposition),
    headline,
    subheadline,
    benefits,
    cta,
    socialProofIdeas,
    trustSignals,
    strongerHook: sanitizeText(parsed.strongerHook, fallback.strongerHook),
    finalPolishedCopy: {
      headline,
      subheadline,
      benefits,
      cta,
    },
    opportunities,
    pageSnapshot: snapshot,
  };
}

function generateFallbackAudit(snapshot: PageSnapshot): ConversionAuditResult {
  const opportunities = buildHeuristicOpportunities(snapshot);
  const score = normalizeScore(undefined, opportunities);
  const subject = pickSubject(snapshot);

  const productSummary = snapshot.metaDescription
    ? `This page appears to offer ${subject} to people who need a clearer reason to trust the product quickly.`
    : `This page appears to promote ${subject}, but the core promise is not yet as clear or persuasive as it should be.`;

  const executiveSummary = 'The page likely loses visitors because the promise, proof, and next step are not doing enough work together. Tighten the main message, add stronger trust signals, and make the CTA feel like the obvious next move.';
  const weaknesses = opportunities.slice(0, 4).map((item) => item.description);
  const valueProposition = `Explain what ${subject} helps visitors achieve, who it is for, and why it is worth acting on in the first screen.`;
  const headline = snapshot.h1 && !isGenericHeading(snapshot.h1)
    ? `Make ${snapshot.h1} feel instantly clear and worth acting on`
    : `Help visitors understand the value of ${subject} in five seconds`;
  const subheadline = snapshot.metaDescription
    ? 'Turn the current pitch into a clearer promise with sharper audience targeting, more proof, and a lower-friction CTA.'
    : 'Lead with the outcome, support it with proof, and make the next action feel safe and obvious.';
  const benefits = [
    'Clarify what the product does before visitors start guessing.',
    'Add proof that makes the offer feel trustworthy and real.',
    'Make the structure easier to scan so the main message lands faster.',
    'Reduce CTA friction so interested visitors know exactly what to do next.',
  ];
  const cta = 'See what to improve';
  const socialProofIdeas = [
    'Add one customer quote that mentions a concrete result.',
    'Show a usage stat, customer count, or founder credibility signal near the hero.',
    'Include recognizable logos, proof screenshots, or before/after outcomes.',
  ];
  const trustSignals = [
    'Add a clear privacy, security, or no-risk reassurance near the CTA.',
    'Show testimonials or case-study proof above the fold if possible.',
    'Make pricing, guarantee, or onboarding expectations easier to understand.',
  ];
  const strongerHook = `Most visitors are not rejecting ${subject} on purpose. They are leaving because the page is asking them to trust too much before it has earned enough clarity.`;

  return {
    score,
    productSummary,
    executiveSummary,
    weaknesses,
    valueProposition,
    headline,
    subheadline,
    benefits,
    cta,
    socialProofIdeas,
    trustSignals,
    strongerHook,
    finalPolishedCopy: {
      headline,
      subheadline,
      benefits,
      cta,
    },
    opportunities,
    pageSnapshot: snapshot,
  };
}

function buildHeuristicOpportunities(snapshot: PageSnapshot): ConversionOpportunity[] {
  const opportunities: ConversionOpportunity[] = [];
  const primaryHeading = snapshot.h1 || snapshot.title;
  const hasGenericCta = snapshot.ctas.some((cta) => GENERIC_CTA_LABELS.has(cta.toLowerCase()));

  if (!primaryHeading || isGenericHeading(primaryHeading)) {
    opportunities.push({
      title: 'Clarify the main promise above the fold',
      severity: 'HIGH',
      category: 'clarity',
      description: 'The page does not immediately explain what the product does, who it is for, and why it matters.',
      impact: 'Visitors have to work too hard to understand the offer, which increases bounce and lowers trust.',
      recommendation: 'Rewrite the hero to state the audience, outcome, and reason to care in one clear sentence.',
    });
  }

  if (!snapshot.socialProofSignals.length && !snapshot.hasTestimonials && !snapshot.hasStats) {
    opportunities.push({
      title: 'Add visible proof that the offer is real',
      severity: 'HIGH',
      category: 'trust',
      description: 'The page lacks obvious testimonials, stats, or recognizable proof that builds confidence.',
      impact: 'Without proof, visitors may assume the product is untested or not yet credible.',
      recommendation: 'Add customer quotes, usage numbers, partner logos, or concrete outcomes near the hero and CTA.',
    });
  }

  if (!snapshot.trustSignals.length) {
    opportunities.push({
      title: 'Reduce perceived risk around the CTA',
      severity: 'MEDIUM',
      category: 'trust',
      description: 'There are few visible trust signals that make the next step feel safe.',
      impact: 'Even interested visitors may hesitate if they do not see privacy, security, or expectation-setting cues.',
      recommendation: 'Add reassurance near the CTA, such as no credit card required, privacy language, onboarding expectations, or a guarantee.',
    });
  }

  if (snapshot.ctas.length === 0 || hasGenericCta) {
    opportunities.push({
      title: 'Make the CTA more specific and outcome-led',
      severity: 'MEDIUM',
      category: 'cta',
      description: 'The current CTA is either missing or too generic to communicate the value of clicking.',
      impact: 'Generic CTAs weaken momentum because visitors do not know what happens next or why it is worth it.',
      recommendation: 'Use a CTA that communicates the immediate value, such as the audit, demo, or result the visitor will get.',
    });
  }

  if (!snapshot.hasFaq && !snapshot.hasPricing) {
    opportunities.push({
      title: 'Answer key objections before visitors leave',
      severity: 'MEDIUM',
      category: 'structure',
      description: 'The page appears light on objection handling and expectation-setting sections.',
      impact: 'Visitors may leave with unresolved doubts about pricing, fit, setup, or outcomes.',
      recommendation: 'Add FAQ or objection-handling sections covering who the product is for, how it works, and what happens after sign-up.',
    });
  }

  if (snapshot.textExcerpt.length < 500) {
    opportunities.push({
      title: 'Add more message support around the hero',
      severity: 'LOW',
      category: 'messaging',
      description: 'The page appears to have very little supporting copy beyond the top-level headline area.',
      impact: 'Short pages can feel incomplete or under-explained when the offer is not already familiar to visitors.',
      recommendation: 'Add a short problem/solution section, benefit bullets, and proof blocks that reinforce the main promise.',
    });
  }

  if (opportunities.length < 3) {
    opportunities.push({
      title: 'Tighten the message hierarchy',
      severity: 'LOW',
      category: 'messaging',
      description: 'The page would likely convert better with a clearer sequence from problem to promise to proof to CTA.',
      impact: 'If the story unfolds out of order, visitors may not feel enough confidence to keep reading.',
      recommendation: 'Lead with the strongest outcome, then reinforce it with proof and a clear next step.',
    });
  }

  return opportunities.slice(0, 6);
}

function normalizeOpportunities(
  parsed: AiAuditResponse['opportunities'],
  fallback: ConversionOpportunity[]
): ConversionOpportunity[] {
  if (!parsed?.length) {
    return fallback;
  }

  const normalized = parsed
    .map((item) => ({
      title: sanitizeText(item.title, ''),
      severity: normalizeSeverity(item.severity),
      category: sanitizeText(item.category, 'messaging').toLowerCase(),
      description: sanitizeText(item.description, ''),
      impact: sanitizeText(item.impact, ''),
      recommendation: sanitizeText(item.recommendation, ''),
    }))
    .filter((item) => item.title && item.description && item.impact && item.recommendation);

  return normalized.length ? normalized.slice(0, 6) : fallback;
}

function normalizeScore(score: number | undefined, opportunities: ConversionOpportunity[]): number {
  if (typeof score === 'number' && Number.isFinite(score)) {
    return Math.min(100, Math.max(1, Math.round(score)));
  }

  const penalty = opportunities.reduce((total, item) => {
    switch (item.severity) {
      case 'CRITICAL':
        return total + 18;
      case 'HIGH':
        return total + 12;
      case 'MEDIUM':
        return total + 7;
      case 'LOW':
      default:
        return total + 4;
    }
  }, 0);

  return Math.max(32, 92 - penalty);
}

function normalizeSeverity(value?: Severity): Severity {
  if (value === 'CRITICAL' || value === 'HIGH' || value === 'MEDIUM' || value === 'LOW') {
    return value;
  }
  return 'MEDIUM';
}

function normalizeStringList(
  value: string[] | undefined,
  fallback: string[],
  min: number,
  max: number
): string[] {
  const normalized = (value || [])
    .map((item) => sanitizeText(item, ''))
    .filter(Boolean)
    .slice(0, max);

  return normalized.length >= min ? normalized : fallback;
}

function sanitizeText(value: string | undefined, fallback: string): string {
  const normalized = normalizeWhitespace(value || '');
  return normalized || fallback;
}

function extractSingleMatch(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  return normalizeWhitespace(stripHtml(match?.[1] || ''));
}

function extractMetaContent(html: string, name: string): string {
  const patterns = [
    new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([\\s\\S]*?)["'][^>]*>`, 'i'),
    new RegExp(`<meta\\s+content=["']([\\s\\S]*?)["']\\s+name=["']${name}["'][^>]*>`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return normalizeWhitespace(decodeHtmlEntities(match[1]));
    }
  }

  return '';
}

function extractTagTexts(html: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const values: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const text = normalizeWhitespace(stripHtml(match[1]));
    if (text) {
      values.push(text);
    }
  }

  return unique(values);
}

function extractCallToActions(html: string): string[] {
  const patterns = [
    /<a\b[^>]*>([\s\S]*?)<\/a>/gi,
    /<button\b[^>]*>([\s\S]*?)<\/button>/gi,
    /<input\b[^>]*type=["']submit["'][^>]*value=["']([^"']+)["'][^>]*>/gi,
  ];

  const ctas: string[] = [];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      const text = normalizeWhitespace(stripHtml(match[1] || ''));
      if (text && text.length <= 60) {
        ctas.push(text);
      }
    }
  }

  return unique(ctas);
}

function extractVisibleText(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ');

  return normalizeWhitespace(stripHtml(withoutScripts));
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, ' '));
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, '\'')
    .replace(/&apos;/gi, '\'')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function pickSubject(snapshot: PageSnapshot): string {
  const subject = snapshot.h1 || snapshot.title || 'the offer';
  return subject.replace(/\s*\|\s.*$/, '').trim();
}

function isGenericHeading(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized.length < 8 || /\b(welcome|home|homepage|landing page|get started|hello world)\b/i.test(normalized);
}
