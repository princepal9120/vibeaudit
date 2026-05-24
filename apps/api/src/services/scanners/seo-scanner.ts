import { safeSpawn } from '../../lib/safe-exec.js';
import type { RawFinding } from './types.js';

/**
 * SEO Scanner - checks live URLs for SEO readiness before launch
 *
 * Checks:
 * - Meta tags (title, description)
 * - Open Graph tags (og:title, og:description, og:image)
 * - Twitter Card tags
 * - Canonical URL
 * - Sitemap.xml presence
 * - Robots.txt presence
 * - Structured data (JSON-LD)
 * - H1 tag presence and uniqueness
 * - Lang attribute on <html>
 * - Mobile viewport meta tag
 */
export async function runSeoScanner(liveUrl: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  try {
    new URL(liveUrl);

    // Fetch the page HTML
    const { stdout: html } = await safeSpawn(
      'curl',
      ['-sL', '--max-time', '15', '-A', 'Mozilla/5.0 (compatible; VibeAudit/1.0)', liveUrl],
      { timeout: 20000 }
    );

    if (!html.trim()) {
      return findings;
    }

    // Check title tag
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
      findings.push({
        title: 'Missing Page Title',
        severity: 'HIGH',
        category: 'SEO',
        source: 'SEO_SCANNER',
        description: 'The page is missing a <title> tag. This is the most important on-page SEO element.',
        impact: 'Search engines use the title tag as the main headline in search results. Without it, your page will rank poorly and get fewer clicks.',
        remediation: 'Add a descriptive <title> tag inside <head>. Keep it under 60 characters and include your primary keyword.',
        confidence: 0.95,
        ruleId: 'seo-missing-title',
        rawFinding: { url: liveUrl, check: 'title' },
      });
    } else if (titleMatch[1].trim().length > 60) {
      findings.push({
        title: 'Page Title Too Long',
        severity: 'LOW',
        category: 'SEO',
        source: 'SEO_SCANNER',
        description: `The page title is ${titleMatch[1].trim().length} characters. Google typically displays 50-60 characters.`,
        impact: 'Long titles get truncated in search results, which can reduce click-through rates.',
        remediation: 'Shorten your title to under 60 characters while keeping your primary keyword.',
        confidence: 0.9,
        ruleId: 'seo-title-too-long',
        rawFinding: { url: liveUrl, titleLength: titleMatch[1].trim().length },
      });
    }

    // Check meta description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["'][^>]*>/i)
      || html.match(/<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["'][^>]*>/i);
    if (!descMatch || !descMatch[1].trim()) {
      findings.push({
        title: 'Missing Meta Description',
        severity: 'HIGH',
        category: 'SEO',
        source: 'SEO_SCANNER',
        description: 'The page is missing a meta description tag.',
        impact: 'Search engines display the meta description as the snippet below your title in search results. Without it, Google will auto-generate one that may not represent your page well.',
        remediation: 'Add <meta name="description" content="Your description here"> inside <head>. Keep it between 120-160 characters.',
        confidence: 0.95,
        ruleId: 'seo-missing-description',
        rawFinding: { url: liveUrl, check: 'meta-description' },
      });
    } else if (descMatch[1].trim().length > 160) {
      findings.push({
        title: 'Meta Description Too Long',
        severity: 'LOW',
        category: 'SEO',
        source: 'SEO_SCANNER',
        description: `The meta description is ${descMatch[1].trim().length} characters. Google typically shows 150-160 characters.`,
        impact: 'Long descriptions get truncated in search results.',
        remediation: 'Shorten your meta description to 120-160 characters.',
        confidence: 0.85,
        ruleId: 'seo-description-too-long',
        rawFinding: { url: liveUrl, descLength: descMatch[1].trim().length },
      });
    }

    // Check Open Graph tags
    const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["'][^>]*>/i);
    const ogDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["'][^>]*>/i);
    const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["'][\s\S]*?["'][^>]*>/i);

    const missingOg: string[] = [];
    if (!ogTitle) missingOg.push('og:title');
    if (!ogDesc) missingOg.push('og:description');
    if (!ogImage) missingOg.push('og:image');

    if (missingOg.length > 0) {
      findings.push({
        title: 'Missing Open Graph Tags',
        severity: missingOg.includes('og:image') ? 'MEDIUM' : 'LOW',
        category: 'SEO',
        source: 'SEO_SCANNER',
        description: `Missing Open Graph tags: ${missingOg.join(', ')}. These control how your page appears when shared on social media.`,
        impact: 'When someone shares your link on Facebook, LinkedIn, or Slack, it will look plain and unprofessional without OG tags. No preview image means significantly fewer clicks.',
        remediation: `Add the missing OG tags inside <head>:\n${missingOg.map(t => `<meta property="${t}" content="...">`).join('\n')}`,
        confidence: 0.9,
        ruleId: 'seo-missing-og-tags',
        rawFinding: { url: liveUrl, missingTags: missingOg },
      });
    }

    // Check Twitter Card tags
    const twitterCard = html.match(/<meta\s+name=["']twitter:card["']\s+content=["'][\s\S]*?["'][^>]*>/i);
    if (!twitterCard) {
      findings.push({
        title: 'Missing Twitter Card Tags',
        severity: 'LOW',
        category: 'SEO',
        source: 'SEO_SCANNER',
        description: 'No Twitter Card meta tags found. These control how your page appears when shared on X/Twitter.',
        impact: 'Shared links on X/Twitter will show a plain URL instead of a rich preview with image and description.',
        remediation: 'Add <meta name="twitter:card" content="summary_large_image">, along with twitter:title, twitter:description, and twitter:image tags.',
        confidence: 0.85,
        ruleId: 'seo-missing-twitter-card',
        rawFinding: { url: liveUrl, check: 'twitter-card' },
      });
    }

    // Check canonical URL
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["'][^>]*>/i);
    if (!canonical) {
      findings.push({
        title: 'Missing Canonical URL',
        severity: 'MEDIUM',
        category: 'SEO',
        source: 'SEO_SCANNER',
        description: 'No canonical URL tag found on the page.',
        impact: 'Without a canonical tag, search engines may index duplicate versions of your page (www vs non-www, http vs https), diluting your SEO ranking.',
        remediation: 'Add <link rel="canonical" href="https://yourdomain.com/page"> inside <head>.',
        confidence: 0.85,
        ruleId: 'seo-missing-canonical',
        rawFinding: { url: liveUrl, check: 'canonical' },
      });
    }

    // Check H1 tags
    const h1Matches = html.match(/<h1[\s>]/gi);
    if (!h1Matches) {
      findings.push({
        title: 'Missing H1 Heading',
        severity: 'MEDIUM',
        category: 'SEO',
        source: 'SEO_SCANNER',
        description: 'No H1 heading found on the page.',
        impact: 'The H1 tag tells search engines what your page is about. Missing it weakens your on-page SEO signal.',
        remediation: 'Add a single H1 heading that describes the main topic of the page.',
        confidence: 0.9,
        ruleId: 'seo-missing-h1',
        rawFinding: { url: liveUrl, check: 'h1' },
      });
    } else if (h1Matches.length > 1) {
      findings.push({
        title: 'Multiple H1 Headings',
        severity: 'LOW',
        category: 'SEO',
        source: 'SEO_SCANNER',
        description: `Found ${h1Matches.length} H1 headings on the page. Best practice is to have exactly one.`,
        impact: 'Multiple H1 tags can confuse search engines about the primary topic of your page.',
        remediation: 'Use only one H1 for the main heading. Use H2-H6 for subheadings.',
        confidence: 0.8,
        ruleId: 'seo-multiple-h1',
        rawFinding: { url: liveUrl, h1Count: h1Matches.length },
      });
    }

    // Check lang attribute
    const langAttr = html.match(/<html[^>]*\slang=["'][^"']+["'][^>]*>/i);
    if (!langAttr) {
      findings.push({
        title: 'Missing Language Attribute',
        severity: 'MEDIUM',
        category: 'SEO',
        source: 'SEO_SCANNER',
        description: 'The <html> tag is missing a lang attribute.',
        impact: 'Search engines and screen readers use the lang attribute to understand the page language. Missing it hurts both SEO and accessibility.',
        remediation: 'Add lang="en" (or your language code) to the <html> tag: <html lang="en">.',
        confidence: 0.9,
        ruleId: 'seo-missing-lang',
        rawFinding: { url: liveUrl, check: 'lang' },
      });
    }

    // Check viewport meta tag
    const viewport = html.match(/<meta\s+name=["']viewport["']\s+content=["'][\s\S]*?["'][^>]*>/i);
    if (!viewport) {
      findings.push({
        title: 'Missing Viewport Meta Tag',
        severity: 'HIGH',
        category: 'SEO',
        source: 'SEO_SCANNER',
        description: 'No viewport meta tag found. This is required for mobile responsiveness.',
        impact: 'Google uses mobile-first indexing. Without a viewport tag, your site will not display properly on mobile devices and will rank lower in mobile search results.',
        remediation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> inside <head>.',
        confidence: 0.95,
        ruleId: 'seo-missing-viewport',
        rawFinding: { url: liveUrl, check: 'viewport' },
      });
    }

    // Check sitemap.xml
    const baseUrl = new URL(liveUrl);
    const sitemapUrl = `${baseUrl.origin}/sitemap.xml`;
    try {
      const { stdout: sitemapResponse } = await safeSpawn(
        'curl',
        ['-sI', '--max-time', '5', '-o', '/dev/null', '-w', '%{http_code}', sitemapUrl],
        { timeout: 10000 }
      );
      if (!sitemapResponse.trim().startsWith('200')) {
        findings.push({
          title: 'Missing Sitemap.xml',
          severity: 'MEDIUM',
          category: 'SEO',
          source: 'SEO_SCANNER',
          description: 'No sitemap.xml found at the root of the site.',
          impact: 'A sitemap helps search engines discover and index all your pages. Without it, some pages may never appear in search results.',
          remediation: 'Generate a sitemap.xml and place it at the root of your site. Most frameworks have plugins to auto-generate sitemaps.',
          confidence: 0.85,
          ruleId: 'seo-missing-sitemap',
          rawFinding: { url: sitemapUrl, statusCode: sitemapResponse.trim() },
        });
      }
    } catch {
      // Sitemap check failed, skip
    }

    // Check robots.txt
    const robotsUrl = `${baseUrl.origin}/robots.txt`;
    try {
      const { stdout: robotsResponse } = await safeSpawn(
        'curl',
        ['-sI', '--max-time', '5', '-o', '/dev/null', '-w', '%{http_code}', robotsUrl],
        { timeout: 10000 }
      );
      if (!robotsResponse.trim().startsWith('200')) {
        findings.push({
          title: 'Missing Robots.txt',
          severity: 'LOW',
          category: 'SEO',
          source: 'SEO_SCANNER',
          description: 'No robots.txt file found at the root of the site.',
          impact: 'A robots.txt file tells search engines which pages to crawl and which to skip. Without it, crawlers may index pages you want to keep private.',
          remediation: 'Create a robots.txt file at the root of your site. At minimum, include: User-agent: * and Sitemap: https://yourdomain.com/sitemap.xml.',
          confidence: 0.8,
          ruleId: 'seo-missing-robots',
          rawFinding: { url: robotsUrl, statusCode: robotsResponse.trim() },
        });
      }
    } catch {
      // Robots check failed, skip
    }

    // Check for structured data (JSON-LD)
    const jsonLd = html.match(/<script\s+type=["']application\/ld\+json["'][\s\S]*?>/i);
    if (!jsonLd) {
      findings.push({
        title: 'No Structured Data (JSON-LD)',
        severity: 'LOW',
        category: 'SEO',
        source: 'SEO_SCANNER',
        description: 'No JSON-LD structured data found on the page.',
        impact: 'Structured data helps search engines understand your content and can enable rich snippets (star ratings, FAQ dropdowns, etc.) in search results.',
        remediation: 'Add JSON-LD structured data relevant to your page type. Common types: WebSite, Organization, Product, Article, FAQ.',
        confidence: 0.8,
        ruleId: 'seo-missing-structured-data',
        rawFinding: { url: liveUrl, check: 'json-ld' },
      });
    }

  } catch (error) {
    console.error('SEO scanner error:', error);
  }

  return findings;
}
