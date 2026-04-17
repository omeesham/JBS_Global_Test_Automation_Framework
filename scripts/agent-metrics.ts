#!/usr/bin/env ts-node
/**
 * Agent Metrics Dashboard - Tracks mistake patterns, defect rates, and trust progression.
 * 
 * Generates weekly/monthly reports on:
 * - Defects per agent
 * - Most violated rules
 * - Trust level progression
 * - Clean cycle tracking
 * 
 * Usage: npm run metrics:agents [--json] [--weekly] [--update-trust]
 * Exit: 0 = success
 */

import * as fs from 'fs';
import * as path from 'path';
import { SHARED_PATHS } from './shared-types';

interface Defect {
  id: string;
  date: string;
  description: string;
  severity: 'low' | 'medium' | 'critical';
  resolved: boolean;
  feature?: string;
}

interface AgentPerformance {
  trustLevel: 'probation' | 'vetting' | 'trusted' | 'autonomous';
  cleanCycles: number;
  totalRuns: number;
  defects: Defect[];
  lastAuditedBy: string | null;
  lastAuditDate: string | null;
  notes: string;
}

interface CycleLogEntry {
  date: string;
  agent: string;
  feature: string;
  defectsFound: string[];
  cleanPass: boolean;
  auditedBy: string;
}

interface PerformanceFile {
  version: string;
  lastUpdated: string;
  promotionRules: object;
  agents: { [key: string]: AgentPerformance };
  cycleLog: CycleLogEntry[];
}

interface MetricsReport {
  generatedAt: string;
  period: string;
  summary: {
    totalDefects: number;
    resolvedDefects: number;
    unresolvedDefects: number;
    agentCount: number;
    avgCleanCycles: number;
  };
  byAgent: {
    name: string;
    trustLevel: string;
    cleanCycles: number;
    totalDefects: number;
    unresolvedDefects: number;
    topViolatedRules: string[];
  }[];
  topViolatedRules: { rule: string; count: number }[];
  recommendations: string[];
}

const PATHS = {
  performance: SHARED_PATHS.performance,
  activityLog: SHARED_PATHS.activityLog,
  output: path.join(path.dirname(SHARED_PATHS.performance), 'agent-metrics-report.md'),
};

const TRUST_PROGRESSION = {
  'probation': 'vetting',
  'vetting': 'trusted',
  'trusted': 'autonomous',
  'autonomous': 'autonomous',
};

const CLEAN_CYCLES_REQUIRED = {
  'probation_to_vetting': 1,
  'vetting_to_trusted': 2,
  'trusted_to_autonomous': 3,
};

function loadPerformance(): PerformanceFile {
  if (!fs.existsSync(PATHS.performance)) {
    throw new Error(`Performance file not found: ${PATHS.performance}`);
  }
  return JSON.parse(fs.readFileSync(PATHS.performance, 'utf-8'));
}

function countRuleViolations(defects: Defect[]): Map<string, number> {
  const counts = new Map<string, number>();
  
  for (const defect of defects) {
    // Extract rule ID from defect ID (e.g., PLN-027 from "PLN-027")
    const ruleMatch = defect.id.match(/^([A-Z]+-\d+)/);
    if (ruleMatch && ruleMatch[1]) {
      const rule = ruleMatch[1];
      counts.set(rule, (counts.get(rule) || 0) + 1);
    }
  }
  
  return counts;
}

function generateReport(perf: PerformanceFile): MetricsReport {
  const allDefects: Defect[] = [];
  const byAgent: MetricsReport['byAgent'] = [];
  const ruleViolations = new Map<string, number>();
  
  for (const [agentName, agent] of Object.entries(perf.agents)) {
    allDefects.push(...agent.defects);
    
    // Count this agent's rule violations
    const agentRules = countRuleViolations(agent.defects);
    for (const [rule, count] of agentRules) {
      ruleViolations.set(rule, (ruleViolations.get(rule) || 0) + count);
    }
    
    byAgent.push({
      name: agentName,
      trustLevel: agent.trustLevel,
      cleanCycles: agent.cleanCycles,
      totalDefects: agent.defects.length,
      unresolvedDefects: agent.defects.filter(d => !d.resolved).length,
      topViolatedRules: Array.from(agentRules.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([rule]) => rule),
    });
  }
  
  // Sort rules by violation count
  const topRules = Array.from(ruleViolations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([rule, count]) => ({ rule, count }));
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  const unresolvedCount = allDefects.filter(d => !d.resolved).length;
  if (unresolvedCount > 0) {
    recommendations.push(`Resolve ${unresolvedCount} unresolved defect(s) before running more cycles`);
  }
  
  if (topRules[0] && topRules[0].count >= 3) {
    recommendations.push(`Focus on ${topRules[0].rule} - violated ${topRules[0].count} times`);
  }
  
  for (const agent of byAgent) {
    if (agent.cleanCycles >= 3 && agent.trustLevel === 'probation') {
      recommendations.push(`${agent.name} eligible for vetting promotion (${agent.cleanCycles} clean cycles)`);
    }
  }
  
  return {
    generatedAt: new Date().toISOString(),
    period: 'all-time',
    summary: {
      totalDefects: allDefects.length,
      resolvedDefects: allDefects.filter(d => d.resolved).length,
      unresolvedDefects: allDefects.filter(d => !d.resolved).length,
      agentCount: Object.keys(perf.agents).length,
      avgCleanCycles: byAgent.reduce((sum, a) => sum + a.cleanCycles, 0) / byAgent.length,
    },
    byAgent,
    topViolatedRules: topRules,
    recommendations,
  };
}

function formatReportMarkdown(report: MetricsReport): string {
  let md = '# Agent Metrics Report\n\n';
  md += `Generated: ${report.generatedAt}\n\n`;
  
  md += '## Summary\n\n';
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Total Defects | ${report.summary.totalDefects} |\n`;
  md += `| Resolved | ${report.summary.resolvedDefects} |\n`;
  md += `| Unresolved | ${report.summary.unresolvedDefects} |\n`;
  md += `| Agents | ${report.summary.agentCount} |\n`;
  md += `| Avg Clean Cycles | ${report.summary.avgCleanCycles.toFixed(1)} |\n\n`;
  
  md += '## By Agent\n\n';
  md += '| Agent | Trust | Clean Cycles | Defects | Unresolved | Top Rules |\n';
  md += '|-------|-------|--------------|---------|------------|----------|\n';
  for (const agent of report.byAgent) {
    md += `| ${agent.name} | ${agent.trustLevel} | ${agent.cleanCycles} | ${agent.totalDefects} | ${agent.unresolvedDefects} | ${agent.topViolatedRules.join(', ') || '-'} |\n`;
  }
  md += '\n';
  
  if (report.topViolatedRules.length > 0) {
    md += '## Top Violated Rules\n\n';
    md += '| Rule | Violations |\n|------|------------|\n';
    for (const rule of report.topViolatedRules) {
      md += `| ${rule.rule} | ${rule.count} |\n`;
    }
    md += '\n';
  }
  
  if (report.recommendations.length > 0) {
    md += '## Recommendations\n\n';
    for (const rec of report.recommendations) {
      md += `- ${rec}\n`;
    }
    md += '\n';
  }
  
  return md;
}

function addCycleEntry(
  perf: PerformanceFile,
  agent: string,
  feature: string,
  defectsFound: string[],
  auditedBy: string
): void {
  const cleanPass = defectsFound.length === 0;
  
  perf.cycleLog.push({
    date: new Date().toISOString().split('T')[0] || '',
    agent,
    feature,
    defectsFound,
    cleanPass,
    auditedBy,
  });
  
  // Update agent stats
  if (perf.agents[agent]) {
    const agentPerf = perf.agents[agent];
    if (agentPerf) {
      agentPerf.totalRuns++;
      if (cleanPass) {
        agentPerf.cleanCycles++;
      } else {
        agentPerf.cleanCycles = 0; // Reset on defect
      }
      agentPerf.lastAuditedBy = auditedBy;
      agentPerf.lastAuditDate = new Date().toISOString();
    }
  }
}

function updateTrustLevels(perf: PerformanceFile): string[] {
  const promotions: string[] = [];
  
  for (const [agentName, agent] of Object.entries(perf.agents)) {
    const currentLevel = agent.trustLevel;
    const nextLevel = TRUST_PROGRESSION[currentLevel];
    
    if (currentLevel === nextLevel) continue; // Already at max
    
    const requiredCycles = CLEAN_CYCLES_REQUIRED[`${currentLevel}_to_${nextLevel}` as keyof typeof CLEAN_CYCLES_REQUIRED] || 999;
    
    if (agent.cleanCycles >= requiredCycles) {
      const unresolvedCount = agent.defects.filter(d => !d.resolved).length;
      
      if (unresolvedCount === 0) {
        agent.trustLevel = nextLevel as AgentPerformance['trustLevel'];
        agent.cleanCycles = 0; // Reset for next level
        promotions.push(`${agentName}: ${currentLevel} -> ${nextLevel}`);
      }
    }
  }
  
  return promotions;
}

function main() {
  const outputJson = process.argv.includes('--json');
  const updateTrust = process.argv.includes('--update-trust');
  
  console.log('='.repeat(60));
  console.log('Agent Metrics Dashboard');
  console.log('='.repeat(60));
  
  try {
    const perf = loadPerformance();
    
    // Optionally update trust levels
    if (updateTrust) {
      const promotions = updateTrustLevels(perf);
      if (promotions.length > 0) {
        console.log('\n[!] Trust Level Promotions:');
        for (const promo of promotions) {
          console.log(`   ${promo}`);
        }
        
        // Save updated performance file
        perf.lastUpdated = new Date().toISOString();
        fs.writeFileSync(PATHS.performance, JSON.stringify(perf, null, 2), 'utf-8');
        console.log(`\n[OK] Performance file updated`);
      } else {
        console.log('\nNo trust level changes');
      }
    }

    // ── Archive resolved defects older than 30 days ──
    const archiveCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let totalArchived = 0;
    for (const [agentName, agent] of Object.entries(perf.agents)) {
      if (!agent.defects || agent.defects.length === 0) continue;
      const toArchive = agent.defects.filter(
        d => d.resolved && new Date(d.date).getTime() < archiveCutoff
      );
      if (toArchive.length === 0) continue;
      // Move to archivedDefects array (create if needed)
      const agentAny = agent as any;
      if (!agentAny.archivedDefects) agentAny.archivedDefects = [];
      agentAny.archivedDefects.push(...toArchive);
      agent.defects = agent.defects.filter(
        d => !(d.resolved && new Date(d.date).getTime() < archiveCutoff)
      );
      totalArchived += toArchive.length;
    }
    if (totalArchived > 0) {
      perf.lastUpdated = new Date().toISOString();
      fs.writeFileSync(PATHS.performance, JSON.stringify(perf, null, 2), 'utf-8');
      console.log(`\n[OK] Archived ${totalArchived} resolved defect(s) older than 30 days`);
    }
    
    // Generate report
    const report = generateReport(perf);
    const velocity = getVelocityMetrics();
    
    if (outputJson) {
      console.log(JSON.stringify({ ...report, velocity }, null, 2));
    } else {
      let markdown = formatReportMarkdown(report);
      
      // Append velocity section
      markdown += '## Velocity\n\n';
      markdown += `| Metric | Value |\n|--------|-------|\n`;
      markdown += `| Completed Specs | ${velocity.completedSpecs} |\n`;
      markdown += `| Pending Specs | ${velocity.pendingSpecs} |\n`;
      markdown += `| Avg Days to Complete | ${velocity.avgDaysToComplete ?? 'N/A'} |\n`;
      markdown += `| Weekly Throughput | ${velocity.throughputPerWeek} |\n`;
      if (velocity.stalledItems.length > 0) {
        markdown += `| Stalled (3+ days) | ${velocity.stalledItems.join(', ')} |\n`;
      }
      markdown += '\n';
      
      fs.writeFileSync(PATHS.output, markdown, 'utf-8');
      console.log(`\n${markdown}`);
      console.log(`\nReport saved to: ${PATHS.output}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(`[ERR] Error: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

// ── Velocity Tracking (Fix 11) ──

interface VelocityMetrics {
  completedSpecs: number;
  pendingSpecs: number;
  avgDaysToComplete: number | null;
  stalledItems: string[];
  throughputPerWeek: number;
}

function getVelocityMetrics(): VelocityMetrics {
  const queuePath = SHARED_PATHS.queue;
  if (!fs.existsSync(queuePath)) {
    return { completedSpecs: 0, pendingSpecs: 0, avgDaysToComplete: null, stalledItems: [], throughputPerWeek: 0 };
  }

  const queue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
  const items = queue.queue || [];
  const completedLog = queue.completedLog || [];
  const now = Date.now();
  const dayMs = 86400000;

  const pending = items.filter((i: { stage: string }) =>
    ['pending_generation', 'generation', 'testing', 'pending_healing', 'healing'].includes(i.stage)
  );
  const completed = items.filter((i: { stage: string }) => i.stage === 'completed');

  // Avg days from start to completion
  const completionTimes: number[] = [];
  for (const item of [...completed, ...completedLog]) {
    const history = (item.history || []) as Array<{ action?: string; timestamp?: string; date?: string }>;
    const startEntry = history.find((h: { action?: string }) => h.action === 'started' || h.action === 'generation');
    const endEntry = history.find((h: { action?: string }) => h.action === 'completed' || h.action === 'done');
    if (startEntry && endEntry) {
      const s = new Date(startEntry.timestamp || startEntry.date || '').getTime();
      const e = new Date(endEntry.timestamp || endEntry.date || '').getTime();
      if (s && e && e > s) completionTimes.push((e - s) / dayMs);
    }
  }
  const avgDays = completionTimes.length > 0
    ? Math.round((completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length) * 10) / 10
    : null;

  // Stalled items (no history entry in 3+ days)
  const stalled: string[] = [];
  for (const item of pending) {
    const history = (item.history || []) as Array<{ timestamp?: string; date?: string }>;
    const last = history[history.length - 1];
    if (last) {
      const t = new Date(last.timestamp || last.date || '').getTime();
      if (t && (now - t) > 3 * dayMs) stalled.push(item.id);
    } else {
      stalled.push(item.id);
    }
  }

  // Throughput: completed in last 30 days
  const cutoff = now - 30 * dayMs;
  let recent = 0;
  for (const item of [...completed, ...completedLog]) {
    const history = (item.history || []) as Array<{ action?: string; timestamp?: string; date?: string }>;
    const end = history.find((h: { action?: string }) => h.action === 'completed' || h.action === 'done');
    if (end) {
      const t = new Date(end.timestamp || end.date || '').getTime();
      if (t && t > cutoff) recent++;
    }
  }

  return {
    completedSpecs: completed.length + completedLog.length,
    pendingSpecs: pending.length,
    avgDaysToComplete: avgDays,
    stalledItems: stalled,
    throughputPerWeek: Math.round((recent / 30) * 7 * 10) / 10,
  };
}

// Export for programmatic use
export { generateReport, addCycleEntry, updateTrustLevels, getVelocityMetrics };

main();
