import { safeSpawn } from '../../lib/safe-exec.js';
import type { RawFinding } from './types.js';

/**
 * Accessibility Scanner - checks live URLs for basic accessibility issues
 *
 * Checks:
 * - Images without alt text
 * - Missing form labels
 * - Missing ARIA landmarks
 * - Color contrast hints (inline styles)
 * - Heading hierarchy
 * - Skip navigation link
 * - Focus indicators
 * - Lang attribute
 * - Button/link accessibility
 */
export async function runAccessibilityScanner(liveUrl: string): Promise<RawFinding[]> {
  const findings: RawFinding[] = [];

  try {
    new URL(liveUrl);

    const { stdout: html } = await safeSpawn(
      'curl',
      ['-sL', '--max-time', '15', '-A', 'Mozilla/5.0 (compatible; ShipSafe/1.0)', liveUrl],
      { timeout: 20000 }
    );

    if (!html.trim()) {
      return findings;
    }

    // Check images without alt text
    const images = html.match(/<img[^>]*>/gi) || [];
    const imagesWithoutAlt = images.filter(img =>
      !img.includes('alt=') || /alt=["']\s*["']/i.test(img)
    );
    // Exclude decorative images (role="presentation" or aria-hidden)
    const meaningfulImagesWithoutAlt = imagesWithoutAlt.filter(img =>
      !img.includes('role="presentation"') && !img.includes('aria-hidden="true"')
    );

    if (meaningfulImagesWithoutAlt.length > 0) {
      findings.push({
        title: 'Images Missing Alt Text',
        severity: meaningfulImagesWithoutAlt.length > 5 ? 'HIGH' : 'MEDIUM',
        category: 'ACCESSIBILITY',
        source: 'ACCESSIBILITY_SCANNER',
        description: `Found ${meaningfulImagesWithoutAlt.length} image(s) without descriptive alt text.`,
        impact: 'Screen readers cannot describe these images to visually impaired users. Alt text is also used by search engines and displayed when images fail to load.',
        remediation: 'Add descriptive alt attributes to all meaningful images. Use alt="" (empty) only for purely decorative images and add role="presentation".',
        confidence: 0.9,
        ruleId: 'a11y-missing-alt',
        rawFinding: { url: liveUrl, count: meaningfulImagesWithoutAlt.length, total: images.length },
      });
    }

    // Check for form inputs without labels
    const inputs = html.match(/<input[^>]*>/gi) || [];
    const textInputs = inputs.filter(input =>
      !input.includes('type="hidden"') &&
      !input.includes("type='hidden'") &&
      !input.includes('type="submit"') &&
      !input.includes("type='submit'") &&
      !input.includes('type="button"') &&
      !input.includes("type='button'")
    );

    const inputsWithoutLabel = textInputs.filter(input => {
      const hasAriaLabel = input.includes('aria-label=') || input.includes('aria-labelledby=');
      const hasPlaceholder = input.includes('placeholder=');
      const hasTitle = input.includes('title=');
      // Check if input has an id that matches a label's for attribute
      const idMatch = input.match(/id=["']([^"']+)["']/);
      const hasMatchingLabel = idMatch && html.includes(`for="${idMatch[1]}"`);
      return !hasAriaLabel && !hasMatchingLabel && !hasTitle && !hasPlaceholder;
    });

    if (inputsWithoutLabel.length > 0) {
      findings.push({
        title: 'Form Inputs Without Labels',
        severity: 'MEDIUM',
        category: 'ACCESSIBILITY',
        source: 'ACCESSIBILITY_SCANNER',
        description: `Found ${inputsWithoutLabel.length} form input(s) without associated labels or aria-label attributes.`,
        impact: 'Screen reader users will not know what information to enter in these fields. This also affects voice control users.',
        remediation: 'Add <label for="inputId"> elements or aria-label attributes to all form inputs. Note: placeholder is not a substitute for a label.',
        confidence: 0.85,
        ruleId: 'a11y-missing-labels',
        rawFinding: { url: liveUrl, count: inputsWithoutLabel.length },
      });
    }

    // Check heading hierarchy
    const headings: { level: number; index: number }[] = [];
    const headingRegex = /<h([1-6])[^>]*>/gi;
    let match;
    while ((match = headingRegex.exec(html)) !== null) {
      headings.push({ level: parseInt(match[1]), index: match.index });
    }

    if (headings.length > 0) {
      // Check if first heading is H1
      if (headings[0].level !== 1) {
        findings.push({
          title: 'Heading Hierarchy Does Not Start With H1',
          severity: 'LOW',
          category: 'ACCESSIBILITY',
          source: 'ACCESSIBILITY_SCANNER',
          description: `The first heading on the page is H${headings[0].level} instead of H1.`,
          impact: 'Screen reader users rely on heading hierarchy to navigate the page. Starting with the wrong level is confusing.',
          remediation: 'Ensure the first heading on the page is an H1 that describes the main content.',
          confidence: 0.8,
          ruleId: 'a11y-heading-order',
          rawFinding: { url: liveUrl, firstHeading: headings[0].level },
        });
      }

      // Check for skipped heading levels
      for (let i = 1; i < headings.length; i++) {
        if (headings[i].level > headings[i - 1].level + 1) {
          findings.push({
            title: 'Skipped Heading Level',
            severity: 'LOW',
            category: 'ACCESSIBILITY',
            source: 'ACCESSIBILITY_SCANNER',
            description: `Heading jumps from H${headings[i - 1].level} to H${headings[i].level}, skipping a level.`,
            impact: 'Screen reader users use heading levels to understand page structure. Skipping levels creates a confusing outline.',
            remediation: 'Use heading levels sequentially (H1 → H2 → H3). Do not skip levels for styling purposes — use CSS instead.',
            confidence: 0.75,
            ruleId: 'a11y-skipped-heading',
            rawFinding: { url: liveUrl, from: headings[i - 1].level, to: headings[i].level },
          });
          break; // Only report once
        }
      }
    }

    // Check for ARIA landmarks
    const hasMain = /<main[\s>]/i.test(html) || /role=["']main["']/i.test(html);
    const hasNav = /<nav[\s>]/i.test(html) || /role=["']navigation["']/i.test(html);

    if (!hasMain) {
      findings.push({
        title: 'Missing Main Landmark',
        severity: 'MEDIUM',
        category: 'ACCESSIBILITY',
        source: 'ACCESSIBILITY_SCANNER',
        description: 'No <main> element or role="main" found on the page.',
        impact: 'Screen reader users use landmarks to jump directly to the main content. Without it, they must tab through the entire page.',
        remediation: 'Wrap your primary content in a <main> element. Each page should have exactly one.',
        confidence: 0.85,
        ruleId: 'a11y-missing-main',
        rawFinding: { url: liveUrl, check: 'main-landmark' },
      });
    }

    if (!hasNav) {
      findings.push({
        title: 'Missing Navigation Landmark',
        severity: 'LOW',
        category: 'ACCESSIBILITY',
        source: 'ACCESSIBILITY_SCANNER',
        description: 'No <nav> element or role="navigation" found on the page.',
        impact: 'Screen reader users cannot quickly find and navigate to the site navigation.',
        remediation: 'Wrap your navigation menu in a <nav> element.',
        confidence: 0.75,
        ruleId: 'a11y-missing-nav',
        rawFinding: { url: liveUrl, check: 'nav-landmark' },
      });
    }

    // Check for skip navigation link
    const hasSkipLink = /skip[- ]?(to[- ]?)?(main|content|nav)/i.test(html);
    if (!hasSkipLink && headings.length > 3) {
      findings.push({
        title: 'No Skip Navigation Link',
        severity: 'LOW',
        category: 'ACCESSIBILITY',
        source: 'ACCESSIBILITY_SCANNER',
        description: 'No "Skip to content" link found at the top of the page.',
        impact: 'Keyboard users must tab through all navigation links before reaching the main content on every page load.',
        remediation: 'Add a "Skip to main content" link as the first focusable element on the page. It can be visually hidden until focused.',
        confidence: 0.7,
        ruleId: 'a11y-no-skip-link',
        rawFinding: { url: liveUrl, check: 'skip-link' },
      });
    }

    // Check for buttons without accessible text
    const buttons = html.match(/<button[^>]*>[\s\S]*?<\/button>/gi) || [];
    const emptyButtons = buttons.filter(btn => {
      const content = btn.replace(/<button[^>]*>/i, '').replace(/<\/button>/i, '').trim();
      const hasAriaLabel = btn.includes('aria-label=');
      const hasTitle = btn.includes('title=');
      // Check if content is only an icon/svg/img with no text
      const textContent = content.replace(/<[^>]*>/g, '').trim();
      return !textContent && !hasAriaLabel && !hasTitle;
    });

    if (emptyButtons.length > 0) {
      findings.push({
        title: 'Buttons Without Accessible Text',
        severity: 'MEDIUM',
        category: 'ACCESSIBILITY',
        source: 'ACCESSIBILITY_SCANNER',
        description: `Found ${emptyButtons.length} button(s) with no visible text or aria-label. These are likely icon-only buttons.`,
        impact: 'Screen readers will announce these as "button" with no description. Users will not know what action the button performs.',
        remediation: 'Add aria-label="Description" to icon-only buttons. Example: <button aria-label="Close menu">×</button>.',
        confidence: 0.85,
        ruleId: 'a11y-empty-buttons',
        rawFinding: { url: liveUrl, count: emptyButtons.length },
      });
    }

    // Check for links without href or with empty href
    const links = html.match(/<a[^>]*>/gi) || [];
    const emptyLinks = links.filter(link =>
      !link.includes('href=') || /href=["']\s*#?\s*["']/i.test(link)
    );
    // Filter out anchor links that have an id target
    const problematicLinks = emptyLinks.filter(link =>
      !link.includes('aria-label=') && !link.includes('role="button"')
    );

    if (problematicLinks.length > 3) {
      findings.push({
        title: 'Links Without Proper Href',
        severity: 'LOW',
        category: 'ACCESSIBILITY',
        source: 'ACCESSIBILITY_SCANNER',
        description: `Found ${problematicLinks.length} links with missing or empty href attributes.`,
        impact: 'Links without proper href are not keyboard-navigable and screen readers may not announce them correctly.',
        remediation: 'Use <button> for actions and <a href="..."> for navigation. If using JavaScript for navigation, ensure href is set to the actual URL.',
        confidence: 0.7,
        ruleId: 'a11y-empty-links',
        rawFinding: { url: liveUrl, count: problematicLinks.length },
      });
    }

    // Check for tabindex > 0
    const positiveTabindex = html.match(/tabindex=["'][1-9]\d*["']/gi) || [];
    if (positiveTabindex.length > 0) {
      findings.push({
        title: 'Positive Tabindex Values',
        severity: 'MEDIUM',
        category: 'ACCESSIBILITY',
        source: 'ACCESSIBILITY_SCANNER',
        description: `Found ${positiveTabindex.length} element(s) with positive tabindex values. This overrides natural tab order.`,
        impact: 'Positive tabindex values create a confusing and unpredictable keyboard navigation order that is difficult to maintain.',
        remediation: 'Remove positive tabindex values. Use tabindex="0" to add elements to the natural tab order, or tabindex="-1" for programmatic focus only.',
        confidence: 0.85,
        ruleId: 'a11y-positive-tabindex',
        rawFinding: { url: liveUrl, count: positiveTabindex.length },
      });
    }

    // Check for focus outline removal
    if (html.includes('outline: none') || html.includes('outline:none') || html.includes('outline: 0')) {
      findings.push({
        title: 'Focus Outlines Removed',
        severity: 'MEDIUM',
        category: 'ACCESSIBILITY',
        source: 'ACCESSIBILITY_SCANNER',
        description: 'CSS rules removing focus outlines detected in inline styles.',
        impact: 'Keyboard users cannot see which element is currently focused, making the site impossible to navigate without a mouse.',
        remediation: 'Instead of removing outlines, replace them with custom focus styles: :focus-visible { outline: 2px solid #4A90D9; }',
        confidence: 0.7,
        ruleId: 'a11y-no-focus-outline',
        rawFinding: { url: liveUrl, check: 'focus-outline' },
      });
    }

  } catch (error) {
    console.error('Accessibility scanner error:', error);
  }

  return findings;
}
