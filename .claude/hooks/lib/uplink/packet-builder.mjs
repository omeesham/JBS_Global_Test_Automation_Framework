#!/usr/bin/env node
// packet-builder.mjs — UPLINK packet assembly with split authorship, boundary redaction,
// priority truncation, and sig computation. No network, no LLM, no external deps.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { redactObject } from './redact.mjs';

const DEFAULT_POLICY_PATH = join(homedir(), '.claude', 'delegation', 'uplink-policy.json');

// goal and failing_state are load-bearing — must never be dropped during truncation.
const NEVER_DROP = new Set(['goal', 'failing_state']);

export function loadPolicy(path = DEFAULT_POLICY_PATH) {
  try {
    const raw = readFileSync(path, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`loadPolicy: cannot read or parse policy at "${path}": ${err.message}`);
  }
}

export function buildPacket({ envelope, askBlock }, policy) {
  if (!Array.isArray(policy.classes) || !policy.classes.includes(askBlock.class)) {
    throw new Error(
      `buildPacket: askBlock.class "${askBlock.class}" is not in policy.classes ` +
      `[${(policy.classes || []).join(', ')}]`
    );
  }

  // Boundary redaction — applied to all string fields before assembly.
  const redactedEnvelope = redactObject(envelope ?? {});
  const redactedAsk = redactObject(askBlock ?? {});

  // Sig: stable hash of normalized class+ask (envelope content does NOT affect sig).
  const normClassAsk = (askBlock.class + '' + askBlock.ask)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  const sig = createHash('sha256').update(normClassAsk).digest('hex').slice(0, 16);

  // SPLIT AUTHORSHIP: envelope assembled exclusively from the envelope arg.
  // Worker free-text arrives solely via askBlock and is stored in packetObj.ask.
  const packetObj = {
    envelope: { ...redactedEnvelope },
    ask: { ...redactedAsk },
  };

  const maxChars = policy.packet.max_chars;
  const truncOrder = Array.isArray(policy.packet.truncation_order)
    ? policy.packet.truncation_order
    : [];
  const dropped = [];

  let serialized = JSON.stringify(packetObj);

  // Truncation loop: drop envelope fields in declared order; NEVER_DROP fields are skipped.
  for (const field of truncOrder) {
    if (serialized.length <= maxChars) break;
    if (NEVER_DROP.has(field)) continue;
    if (Object.prototype.hasOwnProperty.call(packetObj.envelope, field)) {
      delete packetObj.envelope[field];
      dropped.push(field);
      serialized = JSON.stringify(packetObj);
    }
  }

  // Overflow: still over cap after exhausting all droppable fields.
  let overflow = false;
  if (serialized.length > maxChars) {
    serialized = serialized.slice(0, maxChars);
    overflow = true;
  }

  return { packet: serialized, dropped, overflow, sig };
}
