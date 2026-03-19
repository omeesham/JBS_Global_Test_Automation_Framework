import { execFileSync } from 'child_process';
import * as path from 'path';

interface GateResult {
  passed: boolean;
  output: string;
}

/**
 * Execute a gate script (pre-run or post-complete).
 * Gate scripts exit 0 = pass, exit 1 = fail.
 */
export function runGate(gateScript: string, args: string[] = []): GateResult {
  const scriptPath = path.resolve(__dirname, '../../scripts', gateScript);

  try {
    const output = execFileSync('npx', ['ts-node', scriptPath, ...args], {
      cwd: path.resolve(__dirname, '../../'),
      encoding: 'utf-8',
      timeout: 60_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { passed: true, output };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number };
    return {
      passed: false,
      output: ((e.stdout ?? '') + '\n' + (e.stderr ?? '')).trim(),
    };
  }
}
