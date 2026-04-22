#!/usr/bin/env node
// chain-state.mjs — JSON read/write helper for chain-state.sh.
// Backs chain orchestration because `jq` is absent on this Git Bash.
// Atomic writes via tmp-file + rename.
// Dotted path: e.g. ".budget.executedToday" or ".queue.3.status" (numeric = array index).

import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes } from 'node:crypto';

const [, , cmd, file, ...args] = process.argv;
if (!cmd || !file) {
  console.error('usage: chain-state.mjs <cmd> <file> [args...]');
  console.error('       cmds: exists | get <path> | set <path> <json> | inc <path>');
  console.error('              history-append <json> | pause <reason> | init <json>');
  process.exit(2);
}

function readState() {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf8'));
}

function writeState(state) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${randomBytes(4).toString('hex')}.tmp`;
  writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n', 'utf8');
  renameSync(tmp, file);
}

function splitPath(path) {
  return path.replace(/^\./, '').split('.').filter(Boolean);
}

function pathGet(obj, path) {
  if (path === '' || path === '.') return obj;
  let cur = obj;
  for (const p of splitPath(path)) {
    if (cur == null) return null;
    const i = Number.parseInt(p, 10);
    cur = Number.isNaN(i) ? cur[p] : cur[i];
  }
  return cur;
}

function pathSet(obj, path, value) {
  const parts = splitPath(path);
  let cur = obj;
  for (let j = 0; j < parts.length - 1; j++) {
    const p = parts[j];
    const i = Number.parseInt(p, 10);
    const key = Number.isNaN(i) ? p : i;
    if (cur[key] == null) {
      const nextIsIndex = !Number.isNaN(Number.parseInt(parts[j + 1], 10));
      cur[key] = nextIsIndex ? [] : {};
    }
    cur = cur[key];
  }
  const last = parts[parts.length - 1];
  const li = Number.parseInt(last, 10);
  cur[Number.isNaN(li) ? last : li] = value;
}

switch (cmd) {
  case 'exists':
    process.exit(existsSync(file) ? 0 : 1);

  case 'get': {
    const state = readState();
    if (state == null) process.exit(1);
    const val = pathGet(state, args[0] || '.');
    if (val == null) process.exit(1);
    process.stdout.write(typeof val === 'object' ? JSON.stringify(val) : String(val));
    break;
  }

  case 'set': {
    const state = readState() ?? {};
    let parsed;
    try { parsed = JSON.parse(args[1]); } catch { parsed = args[1]; }
    pathSet(state, args[0], parsed);
    state.updatedAt = new Date().toISOString();
    writeState(state);
    break;
  }

  case 'inc': {
    const state = readState() ?? {};
    const current = pathGet(state, args[0]) ?? 0;
    pathSet(state, args[0], Number(current) + 1);
    state.updatedAt = new Date().toISOString();
    writeState(state);
    break;
  }

  case 'history-append': {
    const state = readState() ?? { history: [] };
    state.history = state.history ?? [];
    state.history.push(JSON.parse(args[0]));
    state.updatedAt = new Date().toISOString();
    writeState(state);
    break;
  }

  case 'pause': {
    const state = readState();
    if (state == null) process.exit(1);
    state.status = 'paused';
    state.pauseReason = args[0] ?? 'unknown';
    state.updatedAt = new Date().toISOString();
    writeState(state);
    break;
  }

  case 'init': {
    const initial = JSON.parse(args[0]);
    initial.createdAt = initial.createdAt ?? new Date().toISOString();
    initial.updatedAt = new Date().toISOString();
    writeState(initial);
    break;
  }

  default:
    console.error(`chain-state.mjs: unknown command '${cmd}'`);
    process.exit(2);
}
