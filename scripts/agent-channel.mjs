#!/usr/bin/env node

/**
 * Agent School CLI — Inter-agent communication tool
 * Usage: node scripts/agent-channel.mjs <command> [args]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CLAUDE_DIR = join(ROOT, '.claude');

const PATHS = {
  school: join(CLAUDE_DIR, 'AGENT_SCHOOL.md'),
  protocol: join(CLAUDE_DIR, 'PROTOCOL.md'),
  vision: join(CLAUDE_DIR, 'context', 'VISION.md'),
  state: join(CLAUDE_DIR, 'context', 'CURRENT_STATE.md'),
  workflow: join(CLAUDE_DIR, 'context', 'WORKFLOW.md'),
  owner: join(CLAUDE_DIR, 'context', 'CURRENT_OWNER.md'),
  inboxRutvik: join(CLAUDE_DIR, 'channel', 'inbox', 'RUTVIK_AGENT.md'),
  inboxColleague: join(CLAUDE_DIR, 'channel', 'inbox', 'COLLEAGUE_AGENT.md'),
  broadcast: join(CLAUDE_DIR, 'channel', 'broadcast', 'BROADCAST.md'),
};

function read(path) {
  if (!existsSync(path)) {
    console.error(`File not found: ${path}`);
    process.exit(1);
  }
  return readFileSync(path, 'utf-8');
}

function printFile(path, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${label}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(read(path));
}

function resolveAgent(name) {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (lower === 'rutvik' || lower === 'rutvi' || lower === 'rutvik_agent') return 'rutvik';
  if (lower === 'colleague' || lower === 'colleague_agent') return 'colleague';
  console.error(`Unknown agent: "${name}". Use "rutvik" or "colleague".`);
  process.exit(1);
}

// --- Commands ---

function cmdSchool() {
  printFile(PATHS.school, 'AGENT SCHOOL — Orientation');
}

function cmdState() {
  printFile(PATHS.state, 'CURRENT STATE');
}

function cmdInbox(agentArg) {
  const agent = resolveAgent(agentArg);
  if (!agent) {
    console.log('\nUsage: node scripts/agent-channel.mjs inbox [rutvik|colleague]\n');
    console.log('Omit agent name to see both inboxes.\n');
    printFile(PATHS.inboxRutvik, 'INBOX — RUTVIK_AGENT');
    printFile(PATHS.inboxColleague, 'INBOX — COLLEAGUE_AGENT');
    return;
  }
  const path = agent === 'rutvik' ? PATHS.inboxRutvik : PATHS.inboxColleague;
  const label = agent === 'rutvik' ? 'INBOX — RUTVIK_AGENT' : 'INBOX — COLLEAGUE_AGENT';
  printFile(path, label);
}

function cmdBroadcast() {
  printFile(PATHS.broadcast, 'BROADCAST — Shared Discoveries');
}

function cmdToken(agentArg) {
  const content = read(PATHS.owner);

  if (!agentArg) {
    printFile(PATHS.owner, 'CURRENT PUSH TOKEN');
    return;
  }

  const agent = resolveAgent(agentArg);
  const agentName = agent === 'rutvik' ? 'RUTVIK_AGENT' : 'COLLEAGUE_AGENT';
  const now = new Date().toISOString().split('T')[0];

  const newContent = `# Current Push Token Owner

**Owner**: ${agentName}
**Since**: ${now}
**Reason**: Token passed via CLI

---

When you receive the token, update this file:
\`\`\`
**Owner**: <YOUR_AGENT_NAME>
**Since**: <ISO date>
**Reason**: <what you're about to do>
\`\`\`
`;

  writeFileSync(PATHS.owner, newContent, 'utf-8');
  console.log(`\nPush token passed to ${agentName} (${now})\n`);
}

function cmdHandoff() {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const template = `
---
FROM: <YOUR_AGENT_NAME>
TO: <OTHER_AGENT_NAME>
DATE: ${now}
SESSION: <short session id>
TYPE: HANDOFF
PRIORITY: HIGH
REQUIRES_RESPONSE: true
CONTEXT_SNAPSHOT: <1-line summary of what you just finished>
---

## What I Did
- <bullet 1>
- <bullet 2>

## What You Need To Do
- <bullet 1>
- <bullet 2>

## Known Issues
- <any blockers or gotchas>

## Files I Changed
| File | What Changed |
|------|-------------|
| \`path/to/file\` | <description> |
`;

  console.log('\n--- HANDOFF TEMPLATE ---');
  console.log(template);
  console.log('Copy this into the other agent\'s inbox file.');
  console.log(`  Rutvik's inbox:    ${PATHS.inboxRutvik}`);
  console.log(`  Colleague's inbox: ${PATHS.inboxColleague}`);
  console.log('');
}

function cmdSend(toArg, typeArg, subjectArg) {
  if (!toArg || !typeArg || !subjectArg) {
    console.log('\nUsage: node scripts/agent-channel.mjs send <to> <TYPE> "<subject>"\n');
    console.log('  to:      rutvik | colleague');
    console.log('  TYPE:    QUESTION | DECISION | BLOCKER | UPDATE | DISCOVERY | HANDOFF | REVIEW_REQUEST');
    console.log('  subject: Short description in quotes\n');
    console.log('Example:');
    console.log('  node scripts/agent-channel.mjs send colleague QUESTION "Did you change the DB schema?"');
    console.log('');
    return;
  }

  const agent = resolveAgent(toArg);
  const toName = agent === 'rutvik' ? 'RUTVIK_AGENT' : 'COLLEAGUE_AGENT';
  const fromName = agent === 'rutvik' ? 'COLLEAGUE_AGENT' : 'RUTVIK_AGENT';
  const validTypes = ['QUESTION', 'DECISION', 'BLOCKER', 'UPDATE', 'DISCOVERY', 'HANDOFF', 'REVIEW_REQUEST'];
  const type = typeArg.toUpperCase();

  if (!validTypes.includes(type)) {
    console.error(`Invalid type: "${typeArg}". Must be one of: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const requiresResponse = ['QUESTION', 'BLOCKER', 'HANDOFF', 'REVIEW_REQUEST'].includes(type);
  const priority = type === 'BLOCKER' ? 'CRITICAL' : 'MEDIUM';

  const message = `

---
FROM: ${fromName}
TO: ${toName}
DATE: ${now}
SESSION: <update-this>
TYPE: ${type}
PRIORITY: ${priority}
REQUIRES_RESPONSE: ${requiresResponse}
CONTEXT_SNAPSHOT: <update-this>
---

## ${subjectArg}

<write your message here>
`;

  const inboxPath = agent === 'rutvik' ? PATHS.inboxRutvik : PATHS.inboxColleague;
  const existing = read(inboxPath);
  writeFileSync(inboxPath, existing + message, 'utf-8');

  console.log(`\nMessage stub appended to ${toName}'s inbox.`);
  console.log(`Edit the file to complete it: ${inboxPath}`);
  console.log('');
}

function cmdHelp() {
  console.log(`
Agent School CLI — Inter-agent communication tool

Commands:
  school                           Print orientation (AGENT_SCHOOL.md)
  state                            Print current project state
  inbox [rutvik|colleague]         Read agent inbox (omit name for both)
  broadcast                        Read shared discoveries
  token [rutvik|colleague]         Check token owner, or pass token to agent
  handoff                          Generate a HANDOFF message template
  send <to> <TYPE> "<subject>"     Append a message stub to an agent's inbox

Message types: QUESTION, DECISION, BLOCKER, UPDATE, DISCOVERY, HANDOFF, REVIEW_REQUEST

Examples:
  node scripts/agent-channel.mjs school
  node scripts/agent-channel.mjs inbox rutvik
  node scripts/agent-channel.mjs token colleague
  node scripts/agent-channel.mjs send colleague QUESTION "Did you change the DB schema?"
`);
}

// --- Main ---

const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

switch (command) {
  case 'school':     cmdSchool(); break;
  case 'state':      cmdState(); break;
  case 'inbox':      cmdInbox(args[1]); break;
  case 'broadcast':  cmdBroadcast(); break;
  case 'token':      cmdToken(args[1]); break;
  case 'handoff':    cmdHandoff(); break;
  case 'send':       cmdSend(args[1], args[2], args.slice(3).join(' ')); break;
  case 'help':
  case '--help':
  case '-h':         cmdHelp(); break;
  default:           cmdHelp(); break;
}
