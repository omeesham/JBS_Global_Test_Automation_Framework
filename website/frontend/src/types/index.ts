export type TestType = 'UI' | 'API' | 'DATA' | 'E2E';

export type AuthType = 'form' | 'oauth' | 'sso';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type Browser = 'chromium' | 'firefox' | 'webkit';
export type Environment = 'dev' | 'qa' | 'staging' | 'prod';
export type DataSourceType = 'csv' | 'database' | 'datalake' | 'api_feed';
export type TestCaseType = 'e2e' | 'positive' | 'negative' | 'edge' | 'api' | 'data' | 'smoke';
export type TestPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type AgentStatus = 'idle' | 'active' | 'running' | 'error' | 'completed';

export interface UIConfig {
  appUrl: string;
  loginUrl: string;
  username: string;
  password: string;
  authType: AuthType;
  browser: Browser;
  environment: Environment;
  sessionCookie?: string;
  headers?: string;
  featureFlags?: string;
}

export interface APIEndpoint {
  id: string;
  uri: string;
  method: HttpMethod;
  headers: string;
  body: string;
  expectedStatus: number;
  testCount?: number;
}

export interface APIConfig {
  baseUrl: string;
  authType: 'bearer' | 'apikey' | 'oauth';
  authToken: string;
  endpoints: APIEndpoint[];
}

export interface DataConfig {
  sourceType: DataSourceType;
  fileLocation: string;
  filePattern: string;
  sampleFile?: File | null;
  expectedSchema: string[];
  validationRules: {
    nullCheck: boolean;
    rangeValidation: boolean;
    schemaValidation: boolean;
    duplicateDetection: boolean;
    crossFileValidation: boolean;
  };
}

export interface E2EConfig {
  appUrl: string;
  apiBaseUrl: string;
  dataSource: string;
  environment: Environment;
  credentials: { username: string; password: string };
  testScenario: string;
}

export interface RequirementSource {
  type: 'jira' | 'brd' | 'confluence' | 'testspec' | 'criteria';
  value: string;
  file?: File | null;
}

export interface TestConfiguration {
  testType: TestType;
  uiConfig?: UIConfig;
  apiConfig?: APIConfig;
  dataConfig?: DataConfig;
  e2eConfig?: E2EConfig;
  requirements?: RequirementSource;
}

export interface TestCase {
  id: string;
  feature: string;
  scenario: string;
  steps: string[];
  expectedResult: string;
  type: TestCaseType;
  priority: TestPriority;
  status: 'generated' | 'automated' | 'executed' | 'passed' | 'failed';
}

export interface AutomationScript {
  testCaseId: string;
  fileName: string;
  code: string;
  language: 'typescript';
}

export interface ExecutionResult {
  id: string;
  testSuite: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: string;
  environment: Environment;
  timestamp: string;
  status: 'running' | 'passed' | 'failed' | 'healing';
}

export type PipelineStage =
  | 'pending_requirements'
  | 'requirements'
  | 'pending_planning'
  | 'planning'
  | 'pending_generation'
  | 'generation'
  | 'testing'
  | 'pending_healing'
  | 'healing'
  | 'triage'
  | 'audit'
  | 'completed'
  | 'fixme';

export type BugSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type BugStatus = 'open' | 'confirmed' | 'fixed' | 'wont_fix' | 'not_a_bug';

export interface AgentInfo {
  id: string;
  name: string;
  agentFile: string;
  status: AgentStatus;
  description: string;
  model: string;
  tools: string[];
  lastRun?: string;
  queueSize: number;
  processingTime?: string;
  icon: string;
  handoffTo?: string;
  pipelineOrder: number;
}

export interface QueueItem {
  id: string;
  feature: string;
  module: string;
  stage: PipelineStage;
  priority: 'P0' | 'P1' | 'P2';
  lockedBy: string | null;
  intent: string;
  artifacts: {
    testCaseFile?: string;
    testPlanFile?: string;
    specFiles?: string[];
  };
  history: { agent: string; action: string; timestamp: string }[];
  totalTcCount: number;
  automatableCount: number;
}

export interface DashboardMetrics {
  testsGenerated: number;
  automationCoverage: number;
  passRate: number;
  flakyTests: number;
  dataHealthScore: number;
  activeAgents: number;
}

export interface DataValidationResult {
  fileName: string;
  totalRecords: number;
  schemaErrors: number;
  nullValues: number;
  duplicates: number;
  anomalies: number;
  healthScore: number;
  timestamp: string;
}

export interface QualityTrend {
  date: string;
  passRate: number;
  coverage: number;
  testsRun: number;
}

// --- Encore Pipeline Types ---

export interface SSEEvent {
  type: string;
  stage?: string;
  data?: unknown;
  error?: string;
  message?: string;
  runId?: string;
  name?: string;
  artifactType?: string;
  artifactId?: string;
  status?: string;
  totalCost?: number;
  result?: string;
  cost?: number;
  duration?: number;
  agent?: string;
  model?: string;
  attempt?: number;
  timestamp?: string;
}

export type ExecutionMode = 'full-auto' | 'approve-per-stage' | 'dry-run';

export interface CreatePipelineRequest {
  feature: string;
  module: string;
  intent: string;
  priority?: string;
  targetUrl?: string;
  clientId?: string;
  dryRun?: boolean;
  startStage?: string;
  executionMode?: ExecutionMode;
}

export interface StageResult {
  stage: string;
  result: string;
  cost: number;
  duration: number;
  agent: string;
  model: string;
  attempts: number;
}

export interface Artifact {
  id: string;
  name: string;
  artifactType: string;
  runId: string;
  content?: string | null;
}

export interface PipelineRun {
  id: string;
  clientId?: string | null;
  feature: string;
  module: string;
  intent: string;
  status: string;
  stages: StageResult[];
  artifacts: Artifact[];
  totalCost: number;
  createdAt: string;
  completedAt?: string;
}

export interface AdminUsage {
  totalRuns: number;
  completedRuns: number;
  totalCost: number;
  avgCostPerRun: number;
}

export interface WorkerStatus {
  connected: boolean;
  lastHeartbeat: string | null;
  currentTask: string | null;
  spawnedByServer?: boolean;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  db: boolean;
  worker: boolean;
  uptime: number;
  timestamp: string;
}

export interface StageDefinition {
  id: string;
  name: string;
  agent: string;
  agentFile: string;
  model: string;
  enabled: boolean;
  maxTurns: number;
  budgetCap: number;
  retries: number;
  timeoutSeconds: number;
  next: Record<string, string>;
  routing?: {
    condition: string;
    rules: Array<{ when: string; then: string }>;
  };
  preRunGate: string;
  postCompleteGate: string;
  description: string;
  approvalMode?: 'auto' | 'manual';
}

export interface ConvergenceGuardConfig {
  enabled: boolean;
  sameFindings: { enabled: boolean; action: string };
  notDecreasing: { enabled: boolean; windowSize: number; action: string };
  maxIterations: { enabled: boolean; limit: number; action: string };
  budgetExhausted: { enabled: boolean; action: string };
}

export interface PipelineDefinition {
  version: string;
  defaults: {
    model: string;
    maxTurnsPerStage: number;
    budgetPerRunUsd: number;
    budgetPerStageUsd: number;
    workerPollIntervalMs: number;
    workerHeartbeatIntervalMs: number;
    cliPath: string;
    cliOutputFormat: string;
    agentRunner: 'cli' | 'sdk';
    autoInvoke: boolean;
  };
  models: {
    available: string[];
    costPerMTokenInput: Record<string, number>;
    costPerMTokenOutput: Record<string, number>;
  };
  stages: StageDefinition[];
  terminalStates: string[];
  convergenceGuards: ConvergenceGuardConfig;
}

// ── Plan 50: Agent Registry + Per-Client Pipeline ──

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

export interface PipelineDefinitionResponse {
  definition: PipelineDefinition;
  version: number;
  isDefault: boolean;
  clientId: string | null;
}

export interface PipelineValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
