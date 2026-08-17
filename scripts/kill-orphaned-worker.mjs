#!/usr/bin/env node
// kill-orphaned-worker.mjs — enumerate and optionally kill orphaned worker processes.
//
// DETECTION, NOT PREVENTION. This helper makes an orphaned worker actionable
// after it has been detected; it does not stop orphans from being created.
// LR-074 §74.4's residual (runtime-assembled launches) remains permanently
// invisible to both visibility layers.
//
// Usage:
//   node scripts/kill-orphaned-worker.mjs --run-id <run-id>           # print-only (default)
//   node scripts/kill-orphaned-worker.mjs --run-id <run-id> --kill    # actually stop processes
//
// REQUIRES --run-id. Will NOT kill anything without --kill flag.

import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const runIdIdx = args.indexOf("--run-id");
const doKill = args.includes("--kill");

if (runIdIdx === -1 || !args[runIdIdx + 1]) {
  console.error("Usage: node scripts/kill-orphaned-worker.mjs --run-id <run-id> [--kill]");
  console.error("  --run-id  REQUIRED. The run-id of the orphaned worker to target.");
  console.error("  --kill    Actually stop the processes. Without this flag, print-only.");
  process.exit(1);
}

const targetRunId = args[runIdIdx + 1];
const isWin = process.platform === "win32";

console.log(`[kill-orphan] Searching for live processes with --run-id ${targetRunId} ...`);

function findProcesses() {
  try {
    if (isWin) {
      const out = execSync(
        'powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | ' +
        "Where-Object { $_.CommandLine -and $_.CommandLine.Contains('copilot-worker.sh') } | " +
        'Select-Object ProcessId, CommandLine | ConvertTo-Json"',
        { encoding: "utf8", timeout: 15000, windowsHide: true }
      );
      if (!out || !out.trim()) return [];
      let parsed = JSON.parse(out.trim());
      if (!Array.isArray(parsed)) parsed = [parsed];
      return parsed
        .filter(p => {
          const cmd = p.CommandLine || "";
          return new RegExp("--run-id\\s+" + targetRunId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\s|$)").test(cmd);
        })
        .map(p => ({ pid: p.ProcessId, commandLine: p.CommandLine }));
    } else {
      const out = execSync("ps aux 2>/dev/null || ps -ef 2>/dev/null", {
        encoding: "utf8", timeout: 10000,
      });
      return out.split("\n")
        .filter(line => line.includes("copilot-worker.sh") && line.includes(targetRunId))
        .map(line => {
          const parts = line.trim().split(/\s+/);
          return { pid: parseInt(parts[1], 10) || 0, commandLine: line };
        });
    }
  } catch {
    return [];
  }
}

const procs = findProcesses();

if (procs.length === 0) {
  console.log(`[kill-orphan] No live processes found for run-id ${targetRunId}.`);
  process.exit(0);
}

console.log(`[kill-orphan] Found ${procs.length} process(es):`);
for (const p of procs) {
  console.log(`  PID=${p.pid}  cmd=${p.commandLine.slice(0, 200)}`);
}

if (!doKill) {
  console.log("\n[kill-orphan] PRINT-ONLY mode. Pass --kill to actually stop these processes.");
  process.exit(0);
}

console.log("\n[kill-orphan] Killing ...");
for (const p of procs) {
  try {
    if (isWin) {
      execSync(`powershell.exe -NoProfile -Command "Stop-Process -Id ${p.pid} -Force -ErrorAction SilentlyContinue"`, {
        encoding: "utf8", timeout: 10000, windowsHide: true,
      });
    } else {
      execSync(`kill -9 ${p.pid} 2>/dev/null || true`, { encoding: "utf8", timeout: 5000 });
    }
    console.log(`  Killed PID=${p.pid}`);
  } catch (e) {
    console.error(`  Failed to kill PID=${p.pid}: ${e.message}`);
  }
}

// Re-verify
const surviving = findProcesses();
if (surviving.length === 0) {
  console.log("[kill-orphan] Verified: no surviving processes for this run-id.");
} else {
  console.error(`[kill-orphan] WARNING: ${surviving.length} process(es) still alive after kill attempt.`);
  for (const p of surviving) {
    console.error(`  PID=${p.pid}`);
  }
  process.exit(1);
}
