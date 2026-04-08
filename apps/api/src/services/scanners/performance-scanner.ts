import { safeSpawn } from '../../lib/safe-exec.js';
import type { RawFinding } from './types.js';

/**
 * Performance Scanner - checks live URLs for performance issues before launch
 *
 * Checks:
 * - Page size / response time
 * - Compression (gzip/brotli)
 * - Large unoptimized images
 * - Render-blocking resources
 * - Caching headers
 * - Too many HTTP requests (scripts/stylesheets)
 * - Minification hints
 */
export async function runPerformanceScanner(liveUrl: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  try {
    new URL(liveUrl);

    // Fetch page with timing info
    const { stdout: timingData } = await safeSpawn(
      'curl',
      [
        '-sL', '--max-time', '20',
        '-o', '/dev/null',
        '-w', '%{time_total}|%{size_download}|%{time_starttfb}|%{time_connect}|%{num_redirects}',
        '-A', 'Mozilla/5.0 (compatible; VibeAudit/1.0)',
        liveUrl,
      ],
      { timeout: 25000 }
    );

    const [totalTime, downloadSize, ttfb, connectTime, redirects] = timingData.trim().split('|');
    const totalTimeSec = parseFloat(totalTime);
    const sizeBytesNum = parseInt(downloadSize);
    const ttfbSec = parseFloat(ttfb);
    const redirectCount = parseInt(redirects);

    // Check total load time
    if (totalTimeSec > 5) {
      findings.push({
        title: 'Slow Page Load Time',
        severity: 'HIGH',
        category: 'PERFORMANCE',
        source: 'PERFORMANCE_SCANNER',
        description: `The page took ${totalTimeSec.toFixed(2)} seconds to load. Anything over 3 seconds is considered slow.`,
        impact: '53% of mobile users abandon sites that take over 3 seconds to load. Slow pages also rank lower in search results.',
        remediation: 'Optimize images, enable compression, minify CSS/JS, use a CDN, and consider server-side rendering or static generation.',
        confidence: 0.9,
        ruleId: 'perf-slow-load',
        rawFinding: { url: liveUrl, totalTime: totalTimeSec },
      });
    } else if (totalTimeSec > 3) {
      findings.push({
        title: 'Moderate Page Load Time',
        severity: 'MEDIUM',
        category: 'PERFORMANCE',
        source: 'PERFORMANCE_SCANNER',
        description: `The page took ${totalTimeSec.toFixed(2)} seconds to load. Aim for under 3 seconds.`,
        impact: 'Pages loading between 3-5 seconds see increased bounce rates. Google considers page speed a ranking factor.',
        remediation: 'Enable compression, optimize images, and minimize render-blocking resources to get under 3 seconds.',
        confidence: 0.85,
        ruleId: 'perf-moderate-load',
        rawFinding: { url: liveUrl, totalTime: totalTimeSec },
      });
    }

    // Check TTFB (Time to First Byte)
    if (ttfbSec > 1.5) {
      findings.push({
        title: 'Slow Server Response Time (TTFB)',
        severity: 'MEDIUM',
        category: 'PERFORMANCE',
        source: 'PERFORMANCE_SCANNER',
        description: `Time to First Byte is ${(ttfbSec * 1000).toFixed(0)}ms. Google recommends under 800ms.`,
        impact: 'A slow TTFB means your server is taking too long to respond, which delays everything else on the page.',
        remediation: 'Optimize server-side code, add caching (Redis/CDN), upgrade hosting, or use edge functions for faster response.',
        confidence: 0.85,
        ruleId: 'perf-slow-ttfb',
        rawFinding: { url: liveUrl, ttfb: ttfbSec },
      });
    }

    // Check page size
    const sizeKB = sizeBytesNum / 1024;
    const sizeMB = sizeKB / 1024;
    if (sizeMB > 5) {
      findings.push({
        title: 'Very Large Page Size',
        severity: 'HIGH',
        category: 'PERFORMANCE',
        source: 'PERFORMANCE_SCANNER',
        description: `The page is ${sizeMB.toFixed(1)}MB. This is very large and will load slowly on mobile networks.`,
        impact: 'Large pages consume user data and take much longer to load on slow connections. Many users will leave before it finishes.',
        remediation: 'Optimize and compress images (use WebP/AVIF), lazy-load below-the-fold content, minify CSS and JavaScript, remove unused code.',
        confidence: 0.9,
        ruleId: 'perf-very-large-page',
        rawFinding: { url: liveUrl, sizeBytes: sizeBytesNum, sizeMB: sizeMB.toFixed(1) },
      });
    } else if (sizeMB > 2) {
      findings.push({
        title: 'Large Page Size',
        severity: 'MEDIUM',
        category: 'PERFORMANCE',
        source: 'PERFORMANCE_SCANNER',
        description: `The page is ${sizeMB.toFixed(1)}MB. Aim for under 2MB for good performance.`,
        impact: 'Large pages load slowly on mobile networks and increase hosting bandwidth costs.',
        remediation: 'Compress images, use modern formats (WebP/AVIF), enable text compression, and lazy-load non-critical resources.',
        confidence: 0.85,
        ruleId: 'perf-large-page',
        rawFinding: { url: liveUrl, sizeBytes: sizeBytesNum, sizeMB: sizeMB.toFixed(1) },
      });
    }

    // Check too many redirects
    if (redirectCount > 2) {
      findings.push({
        title: 'Too Many Redirects',
        severity: 'MEDIUM',
        category: 'PERFORMANCE',
        source: 'PERFORMANCE_SCANNER',
        description: `The page goes through ${redirectCount} redirects before loading. Each redirect adds latency.`,
        impact: 'Each redirect adds 100-500ms of delay. Multiple redirects compound into noticeable slowness.',
        remediation: 'Reduce redirect chains. Update links to point directly to the final URL. Remove unnecessary HTTP-to-HTTPS or www-to-non-www redirect hops.',
        confidence: 0.9,
        ruleId: 'perf-too-many-redirects',
        rawFinding: { url: liveUrl, redirectCount },
      });
    }

    // Check compression
    const { stdout: headers } = await safeSpawn(
      'curl',
      ['-sI', '-H', 'Accept-Encoding: gzip, deflate, br', '--max-time', '10', liveUrl],
      { timeout: 15000 }
    );

    const headersLower = headers.toLowerCase();
    const hasCompression = headersLower.includes('content-encoding: gzip')
      || headersLower.includes('content-encoding: br')
      || headersLower.includes('content-encoding: deflate');

    if (!hasCompression && sizeBytesNum > 10240) {
      findings.push({
        title: 'No Compression Enabled',
        severity: 'MEDIUM',
        category: 'PERFORMANCE',
        source: 'PERFORMANCE_SCANNER',
        description: 'The server is not compressing responses with gzip or Brotli.',
        impact: 'Without compression, text-based resources (HTML, CSS, JS) are sent at full size, increasing load time by 2-5x.',
        remediation: 'Enable gzip or Brotli compression on your server or CDN. Most hosting platforms support this with a simple configuration toggle.',
        confidence: 0.85,
        ruleId: 'perf-no-compression',
        rawFinding: { url: liveUrl, sizeBytes: sizeBytesNum },
      });
    }

    // Check caching headers
    const hasCacheControl = headersLower.includes('cache-control:');
    const hasEtag = headersLower.includes('etag:');
    if (!hasCacheControl && !hasEtag) {
      findings.push({
        title: 'No Caching Headers',
        severity: 'MEDIUM',
        category: 'PERFORMANCE',
        source: 'PERFORMANCE_SCANNER',
        description: 'The server is not sending Cache-Control or ETag headers.',
        impact: 'Without caching headers, browsers will re-download the page on every visit instead of using a cached version. This wastes bandwidth and slows repeat visits.',
        remediation: 'Add Cache-Control headers for static assets (e.g., Cache-Control: public, max-age=31536000 for CSS/JS/images). Use shorter durations for dynamic pages.',
        confidence: 0.8,
        ruleId: 'perf-no-cache-headers',
        rawFinding: { url: liveUrl, check: 'caching' },
      });
    }

    // Analyze HTML content for performance issues
    const { stdout: html } = await safeSpawn(
      'curl',
      ['-sL', '--max-time', '15', '-A', 'Mozilla/5.0 (compatible; VibeAudit/1.0)', liveUrl],
      { timeout: 20000 }
    );

    if (html.trim()) {
      // Count external scripts
      const scriptTags = html.match(/<script[^>]*src=["'][^"']+["'][^>]*>/gi) || [];
      if (scriptTags.length > 15) {
        findings.push({
          title: 'Too Many External Scripts',
          severity: 'MEDIUM',
          category: 'PERFORMANCE',
          source: 'PERFORMANCE_SCANNER',
          description: `Found ${scriptTags.length} external scripts. Each one requires a separate HTTP request.`,
          impact: 'Too many scripts block page rendering and increase load time. Each script can also introduce third-party latency.',
          remediation: 'Bundle scripts together, remove unused scripts, defer non-critical scripts with async or defer attributes, and consider loading them lazily.',
          confidence: 0.8,
          ruleId: 'perf-too-many-scripts',
          rawFinding: { url: liveUrl, scriptCount: scriptTags.length },
        });
      }

      // Count external stylesheets
      const stylesheetTags = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
      if (stylesheetTags.length > 8) {
        findings.push({
          title: 'Too Many External Stylesheets',
          severity: 'LOW',
          category: 'PERFORMANCE',
          source: 'PERFORMANCE_SCANNER',
          description: `Found ${stylesheetTags.length} external stylesheets. Consider bundling them.`,
          impact: 'Each stylesheet blocks rendering until it is downloaded and parsed.',
          remediation: 'Bundle CSS files together, inline critical CSS, and load non-critical CSS asynchronously.',
          confidence: 0.75,
          ruleId: 'perf-too-many-stylesheets',
          rawFinding: { url: liveUrl, stylesheetCount: stylesheetTags.length },
        });
      }

      // Check for render-blocking scripts (no async/defer)
      const blockingScripts = scriptTags.filter(tag =>
        !tag.includes('async') && !tag.includes('defer') && !tag.includes('type="module"')
      );
      if (blockingScripts.length > 3) {
        findings.push({
          title: 'Render-Blocking Scripts',
          severity: 'MEDIUM',
          category: 'PERFORMANCE',
          source: 'PERFORMANCE_SCANNER',
          description: `Found ${blockingScripts.length} scripts without async or defer attributes. These block page rendering.`,
          impact: 'Render-blocking scripts prevent the browser from displaying content until each script is downloaded and executed.',
          remediation: 'Add async or defer attributes to non-critical scripts. Use type="module" for ES modules. Move scripts to the end of <body> if possible.',
          confidence: 0.8,
          ruleId: 'perf-render-blocking-scripts',
          rawFinding: { url: liveUrl, blockingCount: blockingScripts.length },
        });
      }

      // Check for large inline styles/scripts
      const inlineStyles = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
      let totalInlineCSSSize = 0;
      for (const style of inlineStyles) {
        totalInlineCSSSize += style.length;
      }
      if (totalInlineCSSSize > 50000) {
        findings.push({
          title: 'Large Inline CSS',
          severity: 'LOW',
          category: 'PERFORMANCE',
          source: 'PERFORMANCE_SCANNER',
          description: `Found ${(totalInlineCSSSize / 1024).toFixed(0)}KB of inline CSS. Consider extracting to external files.`,
          impact: 'Large inline CSS increases the HTML document size and cannot be cached separately by the browser.',
          remediation: 'Extract inline CSS to external stylesheets that can be cached. Keep only critical above-the-fold CSS inline.',
          confidence: 0.7,
          ruleId: 'perf-large-inline-css',
          rawFinding: { url: liveUrl, inlineCSSSize: totalInlineCSSSize },
        });
      }

      // Check for images without lazy loading
      const images = html.match(/<img[^>]*>/gi) || [];
      const imagesWithoutLazy = images.filter(img =>
        !img.includes('loading="lazy"') && !img.includes("loading='lazy'")
      );
      if (images.length > 5 && imagesWithoutLazy.length > 5) {
        findings.push({
          title: 'Images Without Lazy Loading',
          severity: 'LOW',
          category: 'PERFORMANCE',
          source: 'PERFORMANCE_SCANNER',
          description: `Found ${imagesWithoutLazy.length} of ${images.length} images without lazy loading.`,
          impact: 'All images load immediately when the page opens, even ones the user cannot see yet. This wastes bandwidth and slows initial load.',
          remediation: 'Add loading="lazy" to images below the fold. Keep above-the-fold images eager-loaded for best LCP.',
          confidence: 0.75,
          ruleId: 'perf-no-lazy-loading',
          rawFinding: { url: liveUrl, totalImages: images.length, noLazy: imagesWithoutLazy.length },
        });
      }

      // Check for images without width/height (causes layout shift)
      const imagesWithoutDimensions = images.filter(img =>
        !img.includes('width=') || !img.includes('height=')
      );
      if (imagesWithoutDimensions.length > 3) {
        findings.push({
          title: 'Images Without Dimensions',
          severity: 'LOW',
          category: 'PERFORMANCE',
          source: 'PERFORMANCE_SCANNER',
          description: `Found ${imagesWithoutDimensions.length} images without width/height attributes.`,
          impact: 'Images without explicit dimensions cause layout shifts as they load, resulting in a poor Cumulative Layout Shift (CLS) score.',
          remediation: 'Add width and height attributes to all <img> tags so the browser can reserve space before the image loads.',
          confidence: 0.7,
          ruleId: 'perf-images-no-dimensions',
          rawFinding: { url: liveUrl, count: imagesWithoutDimensions.length },
        });
      }
    }

  } catch (error) {
    console.error('Performance scanner error:', error);
  }

  return findings;
}
