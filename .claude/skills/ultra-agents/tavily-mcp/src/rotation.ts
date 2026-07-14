import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { ExhaustedReason, RotationState } from "./types.js";

const STATE_FILE = path.resolve("rotation-state.json");
const STATE_TMP = path.resolve("rotation-state.json.tmp");

const MAX_ROTATIONS = 4; // total key attempts per call
const MAX_429_RETRIES = 2;
const MAX_5XX_RETRIES = 1;

// ---------------------------------------------------------------------------
// Mutex
// ---------------------------------------------------------------------------
class Mutex {
  private _locked = false;
  private readonly _queue: Array<() => void> = [];

  async acquire(): Promise<() => void> {
    return new Promise<() => void>((resolve) => {
      if (!this._locked) {
        this._locked = true;
        resolve(() => this._release());
      } else {
        this._queue.push(() => {
          this._locked = true;
          resolve(() => this._release());
        });
      }
    });
  }

  private _release(): void {
    const next = this._queue.shift();
    if (next) {
      next();
    } else {
      this._locked = false;
    }
  }
}

const mutex = new Mutex();
let state: RotationState | null = null;
const keyValues = new Map<string, string>(); // keyId → actual API key

// ---------------------------------------------------------------------------
// State helpers
// ---------------------------------------------------------------------------
function createFreshState(keyIds: string[]): RotationState {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return {
    keys: keyIds.map((id) => ({
      id,
      credits_used: 0,
      last_used_at: new Date(0).toISOString(),
      exhausted: false,
    })),
    period_start: periodStart.toISOString(),
    last_key_index: -1,
    version: 1,
  };
}

async function persistState(s: RotationState): Promise<void> {
  await fs.writeFile(STATE_TMP, JSON.stringify(s, null, 2), "utf-8");
  await fs.rename(STATE_TMP, STATE_FILE);
}

async function loadOrInit(keyIds: string[]): Promise<RotationState> {
  let mainExists = false;
  let tmpExists = false;

  try { await fs.access(STATE_FILE); mainExists = true; } catch { /* not found */ }
  try { await fs.access(STATE_TMP); tmpExists = true; } catch { /* not found */ }

  // If only .tmp exists (interrupted previous write), adopt it
  if (!mainExists && tmpExists) {
    try { await fs.rename(STATE_TMP, STATE_FILE); mainExists = true; } catch { /* ignore */ }
  }

  if (mainExists) {
    try {
      const content = await fs.readFile(STATE_FILE, "utf-8");
      const parsed = JSON.parse(content) as RotationState;
      // Reconcile: add new keys, remove gone keys
      const existingIds = new Set(parsed.keys.map((k) => k.id));
      const keyIdSet = new Set(keyIds);
      for (const id of keyIds) {
        if (!existingIds.has(id)) {
          parsed.keys.push({ id, credits_used: 0, last_used_at: new Date(0).toISOString(), exhausted: false });
        }
      }
      parsed.keys = parsed.keys.filter((k) => keyIdSet.has(k.id));
      return parsed;
    } catch {
      // Corrupt main file → fresh state
      return createFreshState(keyIds);
    }
  }

  return createFreshState(keyIds);
}

function needsMonthlyReset(s: RotationState): boolean {
  const now = new Date();
  const start = new Date(s.period_start);
  return now.getUTCFullYear() !== start.getUTCFullYear() || now.getUTCMonth() !== start.getUTCMonth();
}

function applyMonthlyReset(s: RotationState): void {
  const now = new Date();
  s.period_start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  for (const key of s.keys) {
    key.credits_used = 0;
    if (key.exhausted && (key.exhausted_reason === "432_plan_limit" || key.exhausted_reason === "433_paygo_limit")) {
      key.exhausted = false;
      key.exhausted_at = undefined;
      key.exhausted_reason = undefined;
    }
  }
}

function pickKeyIndex(s: RotationState): number | null {
  const eligible = s.keys
    .map((k, idx) => ({ idx, key: k }))
    .filter(({ key }) => !key.exhausted);

  if (eligible.length === 0) return null;

  // Least-used-first; tie-break via round-robin on last_key_index
  eligible.sort((a, b) => a.key.credits_used - b.key.credits_used);
  const minCredits = eligible[0].key.credits_used;
  const tieGroup = eligible.filter(({ key }) => key.credits_used === minCredits);

  // Pick first with idx > last_key_index, else wrap to start of tieGroup
  const picked = tieGroup.find(({ idx }) => idx > s.last_key_index) ?? tieGroup[0];
  s.last_key_index = picked.idx;
  return picked.idx;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function initialize(keys: Map<string, string>): Promise<void> {
  keyValues.clear();
  for (const [id, val] of keys) keyValues.set(id, val);
  const keyIds = [...keys.keys()];
  state = await loadOrInit(keyIds);
  if (needsMonthlyReset(state)) {
    applyMonthlyReset(state);
    await persistState(state);
  }
}

export type HttpCallResult<T> =
  | { ok: true; data: T; usageCredits?: number }
  | { ok: false; status: number; message: string; retryAfterSecs?: number };

type SelectResult =
  | { kind: "key"; keyIdx: number; keyId: string; apiKey: string }
  | { kind: "exhausted"; message: string };

async function selectKey(): Promise<SelectResult> {
  const release = await mutex.acquire();
  try {
    const s = state;
    if (!s) return { kind: "exhausted", message: "Rotation not initialized" };
    if (needsMonthlyReset(s)) applyMonthlyReset(s);
    const idx = pickKeyIndex(s);
    if (idx === null) {
      const msg = "ALL_KEYS_EXHAUSTED: " + s.keys.map((k) => `${k.id}:${k.exhausted_reason ?? "active"}`).join(", ");
      await persistState(s);
      return { kind: "exhausted", message: msg };
    }
    const keyId = s.keys[idx].id;
    s.keys[idx].last_used_at = new Date().toISOString();
    await persistState(s);
    const apiKey = keyValues.get(keyId);
    if (!apiKey) return { kind: "exhausted", message: `ALL_KEYS_EXHAUSTED: key ${keyId} not in registry` };
    return { kind: "key", keyIdx: idx, keyId, apiKey };
  } finally {
    release();
  }
}

async function updateCredits(keyIdx: number, credits: number): Promise<void> {
  const release = await mutex.acquire();
  try {
    const s = state;
    if (s) {
      s.keys[keyIdx].credits_used += credits;
      await persistState(s);
    }
  } finally {
    release();
  }
}

async function markExhausted(keyIdx: number, reason: ExhaustedReason): Promise<void> {
  const release = await mutex.acquire();
  try {
    const s = state;
    if (s) {
      s.keys[keyIdx].exhausted = true;
      s.keys[keyIdx].exhausted_at = new Date().toISOString();
      s.keys[keyIdx].exhausted_reason = reason;
      await persistState(s);
    }
  } finally {
    release();
  }
}

async function buildAllExhaustedMessage(): Promise<string> {
  const release = await mutex.acquire();
  try {
    const s = state;
    if (!s) return "ALL_KEYS_EXHAUSTED: no state";
    return "ALL_KEYS_EXHAUSTED: " + s.keys.map((k) => `${k.id}:${k.exhausted_reason ?? "active"}`).join(", ");
  } finally {
    release();
  }
}

export async function executeWithRotation<T>(
  fn: (apiKey: string) => Promise<HttpCallResult<T>>,
  staticFallbackCredits: number
): Promise<{ ok: true; data: T } | { ok: false; message: string; isAllExhausted?: boolean }> {
  for (let rotation = 0; rotation < MAX_ROTATIONS; rotation++) {
    const sel = await selectKey();
    if (sel.kind === "exhausted") {
      return { ok: false, message: sel.message, isAllExhausted: sel.message.startsWith("ALL_KEYS_EXHAUSTED") };
    }

    const { keyIdx, keyId, apiKey } = sel;
    let retries429 = 0;
    let retries5xx = 0;

    while (true) {
      const result = await fn(apiKey);

      if (result.ok) {
        await updateCredits(keyIdx, result.usageCredits ?? staticFallbackCredits);
        return { ok: true, data: result.data };
      }

      const { status, message, retryAfterSecs } = result;

      if (status === 400) {
        return { ok: false, message: `Bad request: ${message}` };
      }

      if (status === 429) {
        if (retries429 >= MAX_429_RETRIES) {
          return { ok: false, message: `Rate limit exhausted retries on key ${keyId}: ${message}` };
        }
        const waitMs = (retryAfterSecs ?? 60) * 1000;
        await new Promise<void>((r) => setTimeout(r, waitMs));
        retries429++;
        continue;
      }

      if (status >= 500 && status < 600) {
        if (retries5xx >= MAX_5XX_RETRIES) {
          return { ok: false, message: `Server error: ${message}` };
        }
        await new Promise<void>((r) => setTimeout(r, 2000));
        retries5xx++;
        continue;
      }

      if (status === 401 || status === 432 || status === 433) {
        const reason: ExhaustedReason =
          status === 401 ? "401_unauthorized" : status === 432 ? "432_plan_limit" : "433_paygo_limit";
        await markExhausted(keyIdx, reason);
        break; // rotate to next key
      }

      // Unexpected (network error, status 0, etc.)
      return { ok: false, message: `Unexpected error (${status}): ${message}` };
    }
  }

  const msg = await buildAllExhaustedMessage();
  return { ok: false, message: msg, isAllExhausted: true };
}
