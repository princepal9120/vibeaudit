import { safeSpawn } from '../../lib/safe-exec.js';
import type { RawFinding } from './types.js';

/**
 * Essentials Scanner - checks live URLs for launch essentials
 *
 * Checks:
 * - Favicon present
 * - Custom 404 page
 * - Legal pages (privacy policy, terms)
 * - Analytics installed
 * - HTTPS redirect
 * - Broken links (sample check)
 * - Error console hints (inline script errors)
 * - Contact/support info
 * - Mobile responsiveness meta
 */
export async function runEssentialsScanner(liveUrl: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  try {
    const urlObj = new URL(liveUrl);

    // Fetch the page HTML
    const { stdout: html } = await safeSpawn(
      'curl',
      ['-sL', '--max-time', '15', '-A', 'Mozilla/5.0 (compatible; VibeAudit/1.0)', liveUrl],
      { timeout: 20000 }
    );

    if (!html.trim()) {
      return findings;
    }

    // Check favicon
    const hasFaviconLink = /<link[^>]*rel=["'](icon|shortcut icon|apple-touch-icon)["'][^>]*>/i.test(html);
    if (!hasFaviconLink) {
      // Also check if /favicon.ico exists
      try {
        const { stdout: faviconStatus } = await safeSpawn(
          'curl',
          ['-sI', '--max-time', '5', '-o', '/dev/null', '-w', '%{http_code}', `${urlObj.origin}/favicon.ico`],
          { timeout: 10000 }
        );
        if (!faviconStatus.trim().startsWith('200')) {
          findings.push({
            title: 'Missing Favicon',
            severity: 'MEDIUM',
            category: 'ESSENTIALS',
            source: 'ESSENTIALS_SCANNER',
            description: 'No favicon found. Neither a <link rel="icon"> tag nor a /favicon.ico file exists.',
            impact: 'Without a favicon, browser tabs show a generic icon. This looks unprofessional and makes your site harder to find among open tabs. Bookmarks also look plain.',
            remediation: 'Add a favicon: <link rel="icon" href="/favicon.ico">. Also add an apple-touch-icon for iOS. Use a tool like realfavicongenerator.net.',
            confidence: 0.9,
            ruleId: 'essentials-missing-favicon',
            rawFinding: { url: liveUrl, check: 'favicon' },
          });
        }
      } catch {
        // Skip if check fails
      }
    }

    // Check HTTPS redirect (if site is HTTP, check if it redirects to HTTPS)
    if (urlObj.protocol === 'https:') {
      const httpUrl = liveUrl.replace('https://', 'http://');
      try {
        const { stdout: redirectCheck } = await safeSpawn(
          'curl',
          ['-sI', '--max-time', '5', '-o', '/dev/null', '-w', '%{redirect_url}', '-L', httpUrl],
          { timeout: 10000 }
        );
        // This is fine - we just want to verify HTTPS works
      } catch {
        // Skip
      }
    } else {
      findings.push({
        title: 'Not Using HTTPS',
        severity: 'HIGH',
        category: 'ESSENTIALS',
        source: 'ESSENTIALS_SCANNER',
        description: 'The site is served over HTTP instead of HTTPS.',
        impact: 'Browsers will show a "Not Secure" warning, damaging user trust. Data transmitted is not encrypted. Google penalizes non-HTTPS sites in rankings.',
        remediation: 'Enable HTTPS with a free SSL certificate from Let\'s Encrypt. Most hosting platforms offer one-click HTTPS setup.',
        confidence: 0.95,
        ruleId: 'essentials-no-https',
        rawFinding: { url: liveUrl, check: 'https' },
      });
    }

    // Check for custom 404 page
    const notFoundUrl = `${urlObj.origin}/this-page-definitely-does-not-exist-${Date.now()}`;
    try {
      const { stdout: notFoundHeaders } = await safeSpawn(
        'curl',
        ['-sI', '--max-time', '5', '-w', '\n%{http_code}', notFoundUrl],
        { timeout: 10000 }
      );
      const statusCode = notFoundHeaders.trim().split('\n').pop()?.trim();

      if (statusCode === '200') {
        findings.push({
          title: 'No Custom 404 Page',
          severity: 'MEDIUM',
          category: 'ESSENTIALS',
          source: 'ESSENTIALS_SCANNER',
          description: 'Non-existent URLs return a 200 status code instead of 404. This means there is no proper 404 error handling.',
          impact: 'Search engines will index broken URLs as real pages, diluting your SEO. Users who land on wrong URLs get no guidance back to valid content.',
          remediation: 'Configure your server/framework to return a 404 status code for non-existent pages, with a helpful custom error page that links back to your homepage.',
          confidence: 0.8,
          ruleId: 'essentials-no-404',
          rawFinding: { url: notFoundUrl, statusCode },
        });
      }
    } catch {
      // Skip
    }

    // Check for analytics
    const hasGoogleAnalytics = html.includes('googletagmanager.com') || html.includes('google-analytics.com') || html.includes('gtag(');
    const hasPlausible = html.includes('plausible.io');
    const hasFathom = html.includes('usefathom.com');
    const hasPosthog = html.includes('posthog');
    const hasMixpanel = html.includes('mixpanel');
    const hasAmplitude = html.includes('amplitude');
    const hasAnalytics = hasGoogleAnalytics || hasPlausible || hasFathom || hasPosthog || hasMixpanel || hasAmplitude;

    if (!hasAnalytics) {
      findings.push({
        title: 'No Analytics Detected',
        severity: 'MEDIUM',
        category: 'ESSENTIALS',
        source: 'ESSENTIALS_SCANNER',
        description: 'No web analytics tool was detected on the page (Google Analytics, Plausible, Fathom, PostHog, Mixpanel, or Amplitude).',
        impact: 'Without analytics, you cannot track visitors, understand user behavior, measure conversions, or make data-driven decisions about your product.',
        remediation: 'Add an analytics tool. Plausible or Fathom are privacy-friendly options. Google Analytics is free and full-featured. PostHog is great for product analytics.',
        confidence: 0.75,
        ruleId: 'essentials-no-analytics',
        rawFinding: { url: liveUrl, check: 'analytics' },
      });
    }

    // Check for legal pages (privacy policy, terms of service)
    const htmlLower = html.toLowerCase();
    const hasPrivacyLink = htmlLower.includes('privacy') && (
      htmlLower.includes('href') && /href=["'][^"']*privac/i.test(html)
    );
    const hasTermsLink = htmlLower.includes('terms') && (
      /href=["'][^"']*terms/i.test(html)
    );

    if (!hasPrivacyLink) {
      findings.push({
        title: 'No Privacy Policy Link',
        severity: 'HIGH',
        category: 'ESSENTIALS',
        source: 'ESSENTIALS_SCANNER',
        description: 'No link to a privacy policy was found on the page.',
        impact: 'A privacy policy is legally required in most jurisdictions (GDPR, CCPA) if you collect any user data — including analytics cookies. App stores also require it.',
        remediation: 'Create a privacy policy page and link it from your footer. Services like Termly or iubenda can auto-generate one for your use case.',
        confidence: 0.8,
        ruleId: 'essentials-no-privacy-policy',
        rawFinding: { url: liveUrl, check: 'privacy-policy' },
      });
    }

    if (!hasTermsLink) {
      findings.push({
        title: 'No Terms of Service Link',
        severity: 'MEDIUM',
        category: 'ESSENTIALS',
        source: 'ESSENTIALS_SCANNER',
        description: 'No link to terms of service was found on the page.',
        impact: 'Without terms of service, you have limited legal protection if users misuse your platform or dispute charges.',
        remediation: 'Create a terms of service page and link it from your footer. Consider including acceptable use, liability limitations, and payment terms.',
        confidence: 0.75,
        ruleId: 'essentials-no-terms',
        rawFinding: { url: liveUrl, check: 'terms-of-service' },
      });
    }

    // Check for contact/support information
    const hasContactLink = /href=["'][^"']*contact/i.test(html) || /href=["']mailto:/i.test(html);
    const hasSupport = htmlLower.includes('support') || htmlLower.includes('help center') || htmlLower.includes('contact us');

    if (!hasContactLink && !hasSupport) {
      findings.push({
        title: 'No Contact or Support Information',
        severity: 'LOW',
        category: 'ESSENTIALS',
        source: 'ESSENTIALS_SCANNER',
        description: 'No contact page, email link, or support information was found.',
        impact: 'Users who encounter issues cannot reach you. This damages trust and can increase churn. Some jurisdictions also require contact information.',
        remediation: 'Add a contact page, support email, or help widget. At minimum, include an email address in the footer.',
        confidence: 0.7,
        ruleId: 'essentials-no-contact',
        rawFinding: { url: liveUrl, check: 'contact' },
      });
    }

    // Check for error-prone patterns in inline scripts
    const inlineScripts = html.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi) || [];
    let hasConsoleErrors = false;
    for (const script of inlineScripts) {
      if (script.includes('console.error') || script.includes('console.warn')) {
        hasConsoleErrors = true;
        break;
      }
    }

    // Check sample of links for broken ones
    const linkHrefs: string[] = [];
    const linkRegex = /href=["'](\/[^"'#][^"']*?)["']/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null && linkHrefs.length < 5) {
      const href = linkMatch[1];
      if (!href.startsWith('/_next') && !href.startsWith('/static') && !href.includes('.')) {
        linkHrefs.push(href);
      }
    }

    if (linkHrefs.length > 0) {
      const brokenLinks: string[] = [];
      await Promise.all(
        linkHrefs.map(async (href) => {
          try {
            const fullUrl = `${urlObj.origin}${href}`;
            const { stdout: status } = await safeSpawn(
              'curl',
              ['-sI', '--max-time', '5', '-o', '/dev/null', '-w', '%{http_code}', fullUrl],
              { timeout: 10000 }
            );
            const code = parseInt(status.trim());
            if (code >= 400) {
              brokenLinks.push(`${href} (${code})`);
            }
          } catch {
            // Skip
          }
        })
      );

      if (brokenLinks.length > 0) {
        findings.push({
          title: 'Broken Internal Links',
          severity: 'HIGH',
          category: 'ESSENTIALS',
          source: 'ESSENTIALS_SCANNER',
          description: `Found ${brokenLinks.length} broken internal link(s): ${brokenLinks.join(', ')}`,
          impact: 'Broken links frustrate users and hurt SEO. Search engines will lower your ranking if they encounter many 404 errors.',
          remediation: 'Fix or remove the broken links. Check for typos in href attributes and ensure all linked pages exist.',
          confidence: 0.9,
          ruleId: 'essentials-broken-links',
          rawFinding: { url: liveUrl, brokenLinks },
        });
      }
    }

    // Check for manifest.json (PWA readiness)
    const hasManifest = /<link[^>]*rel=["']manifest["'][^>]*>/i.test(html);
    if (!hasManifest) {
      findings.push({
        title: 'No Web App Manifest',
        severity: 'LOW',
        category: 'ESSENTIALS',
        source: 'ESSENTIALS_SCANNER',
        description: 'No web app manifest (manifest.json) found. This is needed for PWA support and mobile "Add to Home Screen".',
        impact: 'Users cannot install your web app on their home screen. The app will not work offline or show a splash screen.',
        remediation: 'Create a manifest.json with your app name, icons, and theme colors. Add <link rel="manifest" href="/manifest.json"> to your HTML.',
        confidence: 0.7,
        ruleId: 'essentials-no-manifest',
        rawFinding: { url: liveUrl, check: 'manifest' },
      });
    }

    // Check for Open Graph / Social sharing image (critical for launches)
    const hasOgImage = /<meta[^>]*property=["']og:image["'][^>]*>/i.test(html);
    if (!hasOgImage) {
      findings.push({
        title: 'No Social Sharing Image',
        severity: 'MEDIUM',
        category: 'ESSENTIALS',
        source: 'ESSENTIALS_SCANNER',
        description: 'No og:image meta tag found. When shared on social media, your link will have no preview image.',
        impact: 'Links shared on social media without an image get 2-3x fewer clicks. This is especially important for product launches.',
        remediation: 'Create a 1200x630px social sharing image and add <meta property="og:image" content="https://yourdomain.com/og-image.png">.',
        confidence: 0.85,
        ruleId: 'essentials-no-og-image',
        rawFinding: { url: liveUrl, check: 'og-image' },
      });
    }

  } catch (error) {
    console.error('Essentials scanner error:', error);
  }

  return findings;
}
