import axe, { AxeResults, Result } from 'axe-core';
import { parse } from 'node-html-parser';
import type { TestResult, AccessibilityIssue } from '../types';
import { addLegislationRefs } from './legislationMapper';

function mapAxeImpactLevel(impact: string | undefined): 'critical' | 'serious' | 'moderate' | 'minor' {
  switch (impact) {
    case 'critical':
      return 'critical';
    case 'serious':
      return 'serious';
    case 'moderate':
      return 'moderate';
    default:
      return 'minor';
  }
}

function convertAxeResultToIssue(result: Result): AccessibilityIssue {
  return {
    id: result.id,
    impact: mapAxeImpactLevel(result.impact),
    description: result.help,
    helpUrl: result.helpUrl,
    nodes: result.nodes.map(node => node.html),
    wcagCriteria: [result.id]
  };
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  const corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://proxy.cors.sh/'
  ];

  try {
    const response = await fetchWithTimeout(url);
    if (response.ok) return response;
  } catch (error) {
    console.warn('Direct fetch failed, trying proxies');
  }

  for (const proxy of corsProxies) {
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        const response = await fetchWithTimeout(proxyUrl);
        if (response.ok) return response;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retry) * 1000));
      }
    }
  }

  throw new Error(
    'Failed to access the website. This could be due to:\n' +
    '• The website blocking access\n' +
    '• Invalid URL format\n' +
    '• Website is currently offline\n\n' +
    'Please verify the URL and try again.'
  );
}

export async function testAccessibility(url: string, region: string = 'global'): Promise<TestResult> {
  try {
    new URL(url);
  } catch {
    throw new Error('Please enter a valid URL (e.g., https://example.com)');
  }

  try {
    const response = await fetchWithRetry(url);
    const html = await response.text();
    
    if (!html.trim()) {
      throw new Error('The website returned an empty response');
    }

    // Create a temporary container for testing
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '1024px';
    container.style.height = '768px';
    document.body.appendChild(container);

    try {
      // Parse and inject HTML
      const root = parse(html);
      container.innerHTML = root.toString();

      // Run axe
      const results: AxeResults = await axe.run(container, {
        reporter: 'v2',
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
        }
      });

      // Process results
      const issues = results.violations.map(convertAxeResultToIssue);
      const passes = results.passes.map(convertAxeResultToIssue);
      const warnings = results.incomplete.map(convertAxeResultToIssue);

      const summary = {
        critical: issues.filter(i => i.impact === 'critical').length,
        serious: issues.filter(i => i.impact === 'serious').length,
        moderate: issues.filter(i => i.impact === 'moderate').length,
        minor: issues.filter(i => i.impact === 'minor').length,
        passes: passes.length,
        warnings: warnings.length
      };

      const testResults: TestResult = {
        url,
        timestamp: new Date().toISOString(),
        issues,
        passes,
        warnings,
        summary
      };

      return addLegislationRefs(testResults);
    } finally {
      // Clean up
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('The request timed out. Please try again.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred while testing the website.');
  }
}