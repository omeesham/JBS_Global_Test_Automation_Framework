/**
 * Agent type registry — seed data + DB operations.
 * Defines all available agent types that can be used in pipeline definitions.
 */

import type { Pool } from 'pg';

export interface AgentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'testing' | 'security' | 'data' | 'custom';
  defaultModel: string;
  agentFile: string;
  capabilities: string[];
  enabled: boolean;
  sortOrder: number;
}

/** All known agent types — core agents + future extensions */
export const AGENT_REGISTRY: AgentType[] = [
  // ── Core Agents (enabled) ──
  {
    id: 'requirements',
    name: 'Requirements Intake',
    description: 'Explores the live UI via MCP browser, catalogs fields/selectors, produces REQUIREMENTS.md',
    icon: 'Search',
    category: 'core',
    defaultModel: 'haiku',
    agentFile: '.github/agents/playwright-requirements.agent.md',
    capabilities: ['ui-exploration', 'selector-discovery', 'requirements-generation'],
    enabled: true,
    sortOrder: 1,
  },
  {
    id: 'planning',
    name: 'Test Case Planning',
    description: 'Reads requirements, designs test plans and test case matrices with coverage analysis',
    icon: 'ClipboardList',
    category: 'core',
    defaultModel: 'sonnet',
    agentFile: '.github/agents/playwright-test-planner.agent.md',
    capabilities: ['test-planning', 'coverage-analysis', 'test-case-design'],
    enabled: true,
    sortOrder: 2,
  },
  {
    id: 'generation',
    name: 'Spec Generation',
    description: 'Generates Playwright TypeScript spec files from test plans using page objects and fixtures',
    icon: 'Code',
    category: 'core',
    defaultModel: 'sonnet',
    agentFile: '.github/agents/playwright-test-generator.agent.md',
    capabilities: ['code-generation', 'playwright-specs', 'page-object-usage'],
    enabled: true,
    sortOrder: 3,
  },
  {
    id: 'healing',
    name: 'Test Healing',
    description: 'Debugs failing tests via RCA — updates selectors, fixes timing, patches data issues',
    icon: 'Wrench',
    category: 'core',
    defaultModel: 'sonnet',
    agentFile: '.github/agents/playwright-test-healer.agent.md',
    capabilities: ['debugging', 'selector-repair', 'rca-analysis', 'test-fixing'],
    enabled: true,
    sortOrder: 4,
  },
  {
    id: 'audit',
    name: 'Quality Audit',
    description: 'Verifies test quality, checks coverage gaps, runs final validation, produces audit report',
    icon: 'ShieldCheck',
    category: 'core',
    defaultModel: 'haiku',
    agentFile: '.github/agents/playwright-pipeline-audit.agent.md',
    capabilities: ['quality-audit', 'coverage-verification', 'report-generation'],
    enabled: true,
    sortOrder: 5,
  },

  // ── Future Agents (disabled) ──
  {
    id: 'api_testing',
    name: 'API Testing',
    description: 'Generates and runs API integration tests against REST/GraphQL endpoints',
    icon: 'Globe',
    category: 'testing',
    defaultModel: 'sonnet',
    agentFile: '.github/agents/api-testing.agent.md',
    capabilities: ['api-testing', 'rest', 'graphql', 'contract-testing'],
    enabled: false,
    sortOrder: 10,
  },
  {
    id: 'security_scan',
    name: 'Security Scanner',
    description: 'Scans for common vulnerabilities — XSS, CSRF, injection, auth bypass',
    icon: 'Shield',
    category: 'security',
    defaultModel: 'sonnet',
    agentFile: '.github/agents/security-scan.agent.md',
    capabilities: ['security-scanning', 'vulnerability-detection', 'owasp-top-10'],
    enabled: false,
    sortOrder: 11,
  },
  {
    id: 'performance',
    name: 'Performance Testing',
    description: 'Measures page load times, LCP, FCP, CLS, and generates performance reports',
    icon: 'Gauge',
    category: 'testing',
    defaultModel: 'sonnet',
    agentFile: '.github/agents/performance-testing.agent.md',
    capabilities: ['performance-testing', 'web-vitals', 'load-testing'],
    enabled: false,
    sortOrder: 12,
  },
  {
    id: 'accessibility',
    name: 'Accessibility Audit',
    description: 'Checks WCAG compliance, keyboard navigation, screen reader compatibility',
    icon: 'Eye',
    category: 'testing',
    defaultModel: 'haiku',
    agentFile: '.github/agents/accessibility-audit.agent.md',
    capabilities: ['a11y-testing', 'wcag-compliance', 'aria-validation'],
    enabled: false,
    sortOrder: 13,
  },
  {
    id: 'etl_validation',
    name: 'ETL Validation',
    description: 'Validates data pipelines — schema checks, row counts, transformation accuracy',
    icon: 'Database',
    category: 'data',
    defaultModel: 'sonnet',
    agentFile: '.github/agents/etl-validation.agent.md',
    capabilities: ['data-validation', 'schema-checks', 'etl-testing'],
    enabled: false,
    sortOrder: 14,
  },
];

/**
 * Seed agent_types table — upsert all registry entries.
 * Safe to call on every startup (ON CONFLICT DO UPDATE).
 */
export async function seedAgentTypes(pool: Pool): Promise<void> {
  for (const agent of AGENT_REGISTRY) {
    await pool.query(
      `INSERT INTO agent_types (id, name, description, icon, category, default_model, agent_file, capabilities, enabled, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         icon = EXCLUDED.icon,
         category = EXCLUDED.category,
         default_model = EXCLUDED.default_model,
         agent_file = EXCLUDED.agent_file,
         capabilities = EXCLUDED.capabilities,
         sort_order = EXCLUDED.sort_order`,
      [
        agent.id, agent.name, agent.description, agent.icon, agent.category,
        agent.defaultModel, agent.agentFile, agent.capabilities,
        agent.enabled, agent.sortOrder,
      ]
    );
  }
}

/** List all agent types (enabled first, sorted by sort_order) */
export async function listAgentTypes(pool: Pool): Promise<AgentType[]> {
  const { rows } = await pool.query<{
    id: string; name: string; description: string; icon: string;
    category: string; default_model: string; agent_file: string;
    capabilities: string[]; enabled: boolean; sort_order: number;
  }>(
    `SELECT id, name, description, icon, category, default_model, agent_file,
            capabilities, enabled, sort_order
     FROM agent_types
     ORDER BY enabled DESC, sort_order ASC`
  );
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    icon: r.icon,
    category: r.category as AgentType['category'],
    defaultModel: r.default_model,
    agentFile: r.agent_file,
    capabilities: r.capabilities || [],
    enabled: r.enabled,
    sortOrder: r.sort_order,
  }));
}
