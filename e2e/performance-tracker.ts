import fs from 'node:fs/promises';
import path from 'node:path';
import type { DataLoadMeta } from '@/lib/core/client/loading-tracker';

/**
 * Performance metrics captured during page load
 */
export interface PerformanceMetrics extends DataLoadMeta {
  loadTime: number;
  /** Time from navigation start to DOM ready (ms) */
  domReadyTime: number;
  /** Time to first contentful paint (ms) */
  firstContentfulPaint: number;
  /** Timestamp when metrics were captured */
  timestamp: string;
  /** Page path */
  pagePath: string;
  /** Viewport configuration if custom */
  viewport?: { width: number; height: number };
}

/**
 * Comparison result between baseline and current metrics
 */
export interface MetricsComparison {
  baseline: PerformanceMetrics;
  current: PerformanceMetrics;
  differences: {
    apiCallsDiff: number;
    loadTimeDiff: number;
    waitTimeDiff: number;
    domReadyTimeDiff: number;
    firstContentfulPaintDiff: number;
  };
  percentages: {
    loadTimeChange: number;
    waitTimeChange: number;
    domReadyTimeChange: number;
    firstContentfulPaintChange: number;
  };
  regressions: string[];
  improvements: string[];
}

/**
 * Tracks and compares performance metrics for visual regression tests
 */
export class PerformanceTracker {
  private baselineDir = 'e2e/performance-baselines';
  private currentDir = 'e2e/performance-current';
  private thresholds = {
    loadTime: 20, // Warn if 20% slower
    waitTime: 20,
    apiCalls: 50, // Warn if 50% more API calls
  };

  constructor() {
    // Ensure directories exist
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.baselineDir, { recursive: true });
      await fs.mkdir(this.currentDir, { recursive: true });
    } catch (_error) {
      // Directories might already exist
    }
  }

  /**
   * Save metrics as baseline
   */
  async saveBaseline(screenshotName: string, metrics: PerformanceMetrics): Promise<void> {
    const fileName = screenshotName.replace('.png', '.json');
    const filePath = path.join(this.baselineDir, fileName);

    await fs.writeFile(filePath, JSON.stringify(metrics, null, 2), 'utf-8');
  }

  /**
   * Save current run metrics
   */
  async saveCurrent(screenshotName: string, metrics: PerformanceMetrics): Promise<void> {
    const fileName = screenshotName.replace('.png', '.json');
    const filePath = path.join(this.currentDir, fileName);

    await fs.writeFile(filePath, JSON.stringify(metrics, null, 2), 'utf-8');
  }

  /**
   * Load baseline metrics
   */
  async loadBaseline(screenshotName: string): Promise<PerformanceMetrics | null> {
    const fileName = screenshotName.replace('.png', '.json');
    const filePath = path.join(this.baselineDir, fileName);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (_error) {
      return null;
    }
  }

  /**
   * Compare current metrics against baseline
   */
  async compare(screenshotName: string, currentMetrics: PerformanceMetrics): Promise<MetricsComparison | null> {
    const baseline = await this.loadBaseline(screenshotName);

    if (!baseline) {
      console.warn(`⚠️  No baseline found for ${screenshotName}`);
      return null;
    }

    // Calculate differences
    const differences = {
      apiCallsDiff: currentMetrics.totalCount - baseline.totalCount,
      loadTimeDiff: currentMetrics.loadTime - baseline.loadTime,
      waitTimeDiff: currentMetrics.elapsedMs - baseline.elapsedMs,
      domReadyTimeDiff: currentMetrics.domReadyTime - baseline.domReadyTime,
      firstContentfulPaintDiff: currentMetrics.firstContentfulPaint - baseline.firstContentfulPaint,
    };

    // Calculate percentage changes
    const percentages = {
      loadTimeChange: this.calculatePercentChange(baseline.loadTime, currentMetrics.loadTime),
      waitTimeChange: this.calculatePercentChange(baseline.elapsedMs, currentMetrics.elapsedMs),
      domReadyTimeChange: this.calculatePercentChange(baseline.domReadyTime, currentMetrics.domReadyTime),
      firstContentfulPaintChange: this.calculatePercentChange(
        baseline.firstContentfulPaint,
        currentMetrics.firstContentfulPaint,
      ),
    };

    // Identify regressions and improvements
    const regressions: string[] = [];
    const improvements: string[] = [];

    if (Math.abs(percentages.loadTimeChange) > this.thresholds.loadTime) {
      if (percentages.loadTimeChange > 0) {
        regressions.push(`Load time ${percentages.loadTimeChange.toFixed(0)}% slower`);
      } else {
        improvements.push(`Load time ${Math.abs(percentages.loadTimeChange).toFixed(0)}% faster`);
      }
    }

    if (Math.abs(percentages.waitTimeChange) > this.thresholds.waitTime) {
      if (percentages.waitTimeChange > 0) {
        regressions.push(`Wait time ${percentages.waitTimeChange.toFixed(0)}% slower`);
      } else {
        improvements.push(`Wait time ${Math.abs(percentages.waitTimeChange).toFixed(0)}% faster`);
      }
    }

    const apiCallPercentChange = this.calculatePercentChange(baseline.totalCount, currentMetrics.totalCount);
    if (Math.abs(apiCallPercentChange) > this.thresholds.apiCalls) {
      if (apiCallPercentChange > 0) {
        regressions.push(`${apiCallPercentChange.toFixed(0)}% more API calls`);
      } else {
        improvements.push(`${Math.abs(apiCallPercentChange).toFixed(0)}% fewer API calls`);
      }
    }

    return {
      baseline,
      current: currentMetrics,
      differences,
      percentages,
      regressions,
      improvements,
    };
  }

  /**
   * Generate a summary report of all comparisons
   */
  async generateSummaryReport(): Promise<string> {
    const baselineFiles = await fs.readdir(this.baselineDir);
    const results: { name: string; comparison: MetricsComparison | null }[] = [];

    for (const fileName of baselineFiles) {
      if (!fileName.endsWith('.json')) continue;

      const screenshotName = fileName.replace('.json', '.png');
      const currentFilePath = path.join(this.currentDir, fileName);

      try {
        const currentContent = await fs.readFile(currentFilePath, 'utf-8');
        const currentMetrics = JSON.parse(currentContent);
        const comparison = await this.compare(screenshotName, currentMetrics);

        results.push({ name: screenshotName, comparison });
      } catch (_error) {
        // No current metrics for this baseline
      }
    }

    // Generate report
    let report = '# Performance Comparison Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    const regressionPages = results.filter((r) => r.comparison && r.comparison.regressions.length > 0);
    const improvementPages = results.filter((r) => r.comparison && r.comparison.improvements.length > 0);

    if (regressionPages.length > 0) {
      report += '## ⚠️ Performance Regressions\n\n';
      for (const { name, comparison } of regressionPages) {
        if (!comparison) continue;
        report += `### ${name}\n`;
        for (const regression of comparison.regressions) {
          report += `- ❌ ${regression}\n`;
        }
        report += '\n';
      }
    }

    if (improvementPages.length > 0) {
      report += '## ✅ Performance Improvements\n\n';
      for (const { name, comparison } of improvementPages) {
        if (!comparison) continue;
        report += `### ${name}\n`;
        for (const improvement of comparison.improvements) {
          report += `- ✨ ${improvement}\n`;
        }
        report += '\n';
      }
    }

    // Overall stats
    report += '## Summary\n\n';
    report += `- Total pages tested: ${results.length}\n`;
    report += `- Pages with regressions: ${regressionPages.length}\n`;
    report += `- Pages with improvements: ${improvementPages.length}\n`;

    return report;
  }

  /**
   * Calculate percentage change
   */
  private calculatePercentChange(baseline: number, current: number): number {
    if (baseline === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - baseline) / baseline) * 100);
  }

  /**
   * Format metrics for display
   */
  formatMetrics(metrics: PerformanceMetrics): string {
    return `
📊 Performance Metrics
  API Calls: ${metrics.totalCount}
  Load Time: ${metrics.loadTime}ms
  DOM Ready: ${metrics.domReadyTime}ms
  First Paint: ${metrics.firstContentfulPaint}ms
  Wait Time: ${metrics.elapsedMs}ms
  First Query: ${metrics.firstQueryAt}ms
  Last Query: ${metrics.lastQueryAt}ms
    `.trim();
  }

  /**
   * Format comparison for display
   */
  formatComparison(comparison: MetricsComparison): string {
    let output = '\n📈 Performance Comparison\n';

    if (comparison.regressions.length > 0) {
      output += '\n❌ Regressions:\n';
      for (const regression of comparison.regressions) {
        output += `  - ${regression}\n`;
      }
    }

    if (comparison.improvements.length > 0) {
      output += '\n✅ Improvements:\n';
      for (const improvement of comparison.improvements) {
        output += `  - ${improvement}\n`;
      }
    }

    if (comparison.regressions.length === 0 && comparison.improvements.length === 0) {
      output += '\n✓ No significant changes\n';
    }

    return output;
  }
}
