import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

const ARTIFACT_REQUIREMENTS: Record<string, (context: Record<string, unknown>) => ValidationResult> = {
  planning: () => {
    const missing: string[] = [];
    const reqPath = path.resolve(__dirname, '../../docs/REQUIREMENTS.md');
    if (!fs.existsSync(reqPath)) missing.push('docs/REQUIREMENTS.md');
    return { valid: missing.length === 0, missing, warnings: [] };
  },

  generation: (ctx) => {
    const missing: string[] = [];
    const warnings: string[] = [];
    const module = ctx.module as string || '';

    const tcDir = path.resolve(__dirname, `../../specs_planning/test-cases/${module}`);
    if (!fs.existsSync(tcDir) || fs.readdirSync(tcDir).length === 0) {
      missing.push(`specs_planning/test-cases/${module}/ (no test cases from Planner)`);
    }

    const selectorDir = path.resolve(__dirname, `../../src/selectors/${module}`);
    if (!fs.existsSync(selectorDir) || fs.readdirSync(selectorDir).length === 0) {
      missing.push(`src/selectors/${module}/ (no selectors from Planner)`);
    }

    return { valid: missing.length === 0, missing, warnings };
  },

  healing: (ctx) => {
    const missing: string[] = [];
    const module = ctx.module as string || '';

    const specDir = path.resolve(__dirname, `../../tests/specs/${module}`);
    if (!fs.existsSync(specDir) || fs.readdirSync(specDir).filter(f => f.endsWith('.spec.ts')).length === 0) {
      missing.push(`tests/specs/${module}/*.spec.ts (no spec from Generator)`);
    }

    return { valid: missing.length === 0, missing, warnings: [] };
  },

  audit: (ctx) => {
    const missing: string[] = [];
    const module = ctx.module as string || '';

    const specDir = path.resolve(__dirname, `../../tests/specs/${module}`);
    if (!fs.existsSync(specDir) || fs.readdirSync(specDir).filter(f => f.endsWith('.spec.ts')).length === 0) {
      missing.push(`tests/specs/${module}/*.spec.ts`);
    }

    return { valid: missing.length === 0, missing, warnings: [] };
  },
};

export function validateUpstreamArtifacts(
  nextStageId: string,
  context: Record<string, unknown>
): ValidationResult {
  const validator = ARTIFACT_REQUIREMENTS[nextStageId];
  if (!validator) return { valid: true, missing: [], warnings: [] };
  return validator(context);
}
