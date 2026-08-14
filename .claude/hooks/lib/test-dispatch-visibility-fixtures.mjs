// test-dispatch-visibility-fixtures.mjs — fixture suite for check-dispatch-visibility.mjs
// Run with: node .claude/hooks/lib/test-dispatch-visibility-fixtures.mjs

import { checkCommand, checkPayload, canonicalizePath, splitStatements, executableOf, commandHasWrapperInExecutablePosition, isCanonicalWrapper } from './check-dispatch-visibility.mjs';

let passed = 0;
let failed = 0;

function assert(label, cmd, toolName, expectedDeny) {
  const result = checkCommand(cmd, toolName);
  const ok = result.deny === expectedDeny;
  if (ok) {
    passed++;
    console.log(`  PASS [${expectedDeny ? 'DENY' : 'ALLOW'}] ${label}`);
  } else {
    failed++;
    console.error(`  FAIL [expected ${expectedDeny ? 'DENY' : 'ALLOW'}, got ${result.deny ? 'DENY' : 'ALLOW'}] ${label}`);
    console.error(`       reason: ${result.reason}`);
  }
}

function assertPayload(label, payload, expectedDeny) {
  const result = checkPayload(payload);
  const ok = result.deny === expectedDeny;
  if (ok) {
    passed++;
    console.log(`  PASS [${expectedDeny ? 'DENY' : 'ALLOW'}] ${label}`);
  } else {
    failed++;
    console.error(`  FAIL [expected ${expectedDeny ? 'DENY' : 'ALLOW'}, got ${result.deny ? 'DENY' : 'ALLOW'}] ${label}`);
    console.error(`       reason: ${result.reason}`);
  }
}

console.log('\n=== dispatch-visibility-gate fixture suite ===\n');

// ── ALLOW cases ──────────────────────────────────────────────────────────────

assert(
  'F01 foreground copilot-worker.sh (sanctioned dispatch)',
  'bash .claude/skills/ultra-agents/copilot-worker.sh --task t.md --work-type build',
  'Bash', false
);

assert(
  'F02 cmd1 && cmd2 (logical AND — && consumed by tokenizer)',
  'npm run lint && npm run test',
  'Bash', false
);

assert(
  'F03 npm run build 2>&1 | tee x.log (safe redirect, no detach &)',
  'npm run build 2>&1 | tee build.log',
  'Bash', false
);

assert(
  'F04 echo "background &" (& inside double quotes — stripped)',
  'echo "background &"',
  'Bash', false
);

assert(
  'F05 git log --oneline | head -5 (no detach primitives)',
  'git log --oneline | head -5',
  'Bash', false
);

assert(
  'F06 PowerShell Get-ChildItem (normal PS command — allow everything else)',
  'Get-ChildItem -Path .',
  'PowerShell', false
);

assert(
  'F07 cmd1 && cmd2 && cmd3 (chained logical AND)',
  'git pull && npm install && npm test',
  'Bash', false
);

assert(
  'F08 fd redirect 2>&1 in middle of pipeline',
  'tsc --noEmit 2>&1 | head -20',
  'Bash', false
);

// ── DENY cases ───────────────────────────────────────────────────────────────

assert(
  'F09 copilot-worker.sh & (trailing & — invisible background)',
  'bash .claude/skills/ultra-agents/copilot-worker.sh --task t.md &',
  'Bash', true
);

assert(
  'F10 nohup ... & (detach utility + &)',
  'nohup bash .claude/skills/ultra-agents/copilot-worker.sh --task t.md &',
  'Bash', true
);

assert(
  'F11 setsid (detach primitive)',
  'setsid bash .claude/skills/ultra-agents/copilot-worker.sh --task t.md',
  'Bash', true
);

assert(
  'F12 screen -dm (terminal multiplexer detach)',
  'screen -dm bash .claude/skills/ultra-agents/copilot-worker.sh --task t.md',
  'Bash', true
);

assert(
  'F13 cmd1 & cmd2 (infix & — backgrounds cmd1 invisibly)',
  'bash copilot-worker.sh & echo done',
  'Bash', true
);

assert(
  'F14 ANSI-C quoting $\'...\\x26...\' (encodes & as \\x26, bypasses literal scanner)',
  // Over-denial is intentional: $'...' can decode to any byte at runtime
  "bash .claude/skills/ultra-agents/copilot-worker.sh $'--task\\x26t.md'",
  'Bash', true
);

assert(
  'F15 ANSI-C quoting $\'...\\u0026...\' (encodes & as \\u0026)',
  "bash -c $'copilot-worker.sh --ticket t --work-type build \\u0026'",
  'Bash', true
);

assert(
  'F16 variable expansion in bash -c arg: A=\'... &\'; bash -c "$A"',
  // $A expands at runtime to a backgrounding operator — deny (A3)
  "A='bash .claude/skills/ultra-agents/copilot-worker.sh --ticket t --work-type build &'; bash -c \"$A\"",
  'Bash', true
);

assert(
  'F17 here-string: bash <<< \'... &\' (& in here-string body, executes as shell code)',
  "bash <<< 'bash .claude/skills/ultra-agents/copilot-worker.sh --ticket t --work-type build &'",
  'Bash', true
);

assert(
  'F18 command substitution: bash -c "$(printf ... \'&\')" (& decoded at runtime)',
  "bash -c \"$(printf '%s' 'bash copilot-worker.sh &')\"",
  'Bash', true
);

assert(
  'F19 doubly-nested bash -c (beyond one level)',
  "bash -c 'bash -c \"bash copilot-worker.sh --ticket t --work-type build &\"'",
  'Bash', true
);

assert(
  'F20 direct copilot CLI: copilot -p x (bypasses wrapper ledger)',
  'copilot --agent council-worker -p ticket.md',
  'Bash', true
);

assert(
  'F21 npx copilot (direct copilot CLI via npx)',
  'npx copilot --agent council-worker -p ticket.md',
  'Bash', true
);

assert(
  'F22 PowerShell Start-Process (PS detachment primitive)',
  'Start-Process bash -ArgumentList "copilot-worker.sh"',
  'PowerShell', true
);

assert(
  'F23 wsl.exe bash -lc (WSL trampoline — V2 new vector)',
  "wsl.exe bash -lc 'copilot-worker.sh --ticket t.md &'",
  'Bash', true
);

assert(
  'F24 cmd.exe /c start /b (Windows detach trampoline — V2 new vector)',
  'cmd.exe /c start /b bash copilot-worker.sh --ticket t.md',
  'Bash', true
);

assert(
  'F25 rm protected gate file (A5 self-protection)',
  'rm .claude/hooks/dispatch-visibility-gate.sh',
  'Bash', true
);

assert(
  'F26 sed -i targeting settings.json (A5 self-protection)',
  'sed -i "s/dispatch-visibility-gate.sh//" .claude/settings.json',
  'Bash', true
);

// ── Intentional over-deny fixtures (documented) ──────────────────────────────

assert(
  // INTENTIONAL OVER-DENY: \\& is not a detachment operator in practice, but the
  // conservative tokenizer does not decode escape sequences and flags surviving &.
  'F27 bash x.sh \\& (intentional over-deny: \\& not a real detach but & survives tokenizer)',
  'bash x.sh \\&',
  'Bash', true
);

assert(
  // INTENTIONAL OVER-DENY: `&` in an inline comment has no shell meaning, but
  // the tokenizer operates on the raw string and flags the surviving &.
  'F28 echo ok # R&D comment (intentional over-deny: & in comment body)',
  'echo ok # R&D',
  'Bash', true
);

// ── Malformed / empty stdin is tested at the main() level, not checkCommand.
// checkCommand is pure string logic; the stdin contract is exercised by the
// manual stdin probe in VERIFY step 3.  We add a boundary fixture for
// an empty command string (no command field → allow).

assert(
  'F29 empty command string (no tool_input.command — not a command call, allow)',
  '',
  'Bash', false
);

// ── PowerShell Start-Job ──────────────────────────────────────────────────────

assert(
  'F30 PowerShell Start-Job (PS detachment primitive)',
  'Start-Job { bash copilot-worker.sh }',
  'PowerShell', true
);

// ── C3: expanded destructive patterns ────────────────────────────────────────

assert(
  'F31 find -delete on protected path (C3)',
  'find .claude/hooks -name "dispatch*" -delete',
  'Bash', true
);

assert(
  'F32 cp /dev/null overwrite protected file (C3)',
  'cp /dev/null .claude/hooks/dispatch-visibility-gate.sh',
  'Bash', true
);

assert(
  'F33 python os.remove on protected file (C3)',
  'python -c "import os; os.remove(\'.claude/hooks/dispatch-visibility-gate.sh\')"',
  'Bash', true
);

assert(
  'F34 rm -rf containing directory .claude/hooks (C3)',
  'rm -rf .claude/hooks',
  'Bash', true
);

assert(
  'F35 rm -rf parent directory .claude (C3)',
  'rm -rf .claude',
  'Bash', true
);

// ── C4: path normalization — backslash and ./ forms ───────────────────────────

assert(
  'F36 Remove-Item with backslash path (C4)',
  'Remove-Item .\\.claude\\hooks\\dispatch-visibility-gate.sh',
  'PowerShell', true
);

assert(
  'F37 rm ./dispatch-visibility-gate.sh dot-slash prefix (C4)',
  'rm ./.claude/hooks/dispatch-visibility-gate.sh',
  'Bash', true
);

// ── M5: wrapper allow-rule is canonical-path-based ───────────────────────────

assert(
  'F38 bash ./copilot-worker.sh (non-canonical, name-only path) DENY (M5)',
  'bash ./copilot-worker.sh --task t.md',
  'Bash', true
);

assert(
  'F39 bash ./evil-copilot-worker.sh (renamed wrapper) DENY (M5)',
  'bash ./evil-copilot-worker.sh --task t.md',
  'Bash', true
);

// ── C2: Edit/Write self-protection via checkPayload ───────────────────────────

assertPayload(
  'F40 Edit tool_name targeting .claude/settings.json DENY (C2)',
  { tool_name: 'Edit', tool_input: { file_path: '.claude/settings.json', old_str: 'x', new_str: 'y' } },
  true
);

assertPayload(
  'F41 Write tool_name targeting dispatch-visibility-gate.sh DENY (C2)',
  { tool_name: 'Write', tool_input: { file_path: '.claude/hooks/dispatch-visibility-gate.sh', content: '' } },
  true
);

assertPayload(
  'F42 Edit tool_name targeting non-protected file ALLOW (C2)',
  { tool_name: 'Edit', tool_input: { file_path: 'src/utils.ts', old_str: 'x', new_str: 'y' } },
  false
);

// ── M6: non-string command payloads denied for gated tools ────────────────────

assertPayload(
  'F43 Bash tool with cmd key instead of command (M6)',
  { tool_name: 'Bash', tool_input: { cmd: 'copilot -p x' } },
  true
);

assertPayload(
  'F44 Bash tool with command=null (M6)',
  { tool_name: 'Bash', tool_input: { command: null } },
  true
);

// ── C1: .. traversal bypasses Edit self-protection ───────────────────────────

assertPayload(
  'F45 Edit file_path=plans/../.claude/settings.json DENY (C1 traversal)',
  { tool_name: 'Edit', tool_input: { file_path: 'plans/../.claude/settings.json', old_str: 'x', new_str: 'y' } },
  true
);

assertPayload(
  'F46 Write file_path=a/b/../../.claude/hooks/dispatch-visibility-gate.sh DENY (C1 multi-step traversal)',
  { tool_name: 'Write', tool_input: { file_path: 'a/b/../../.claude/hooks/dispatch-visibility-gate.sh', content: '' } },
  true
);

assertPayload(
  'F47 NotebookEdit notebook_path=plans/../.claude/settings.json DENY (C1 traversal)',
  { tool_name: 'NotebookEdit', tool_input: { notebook_path: 'plans/../.claude/settings.json' } },
  true
);

// ── C2: destructive Node/Python API patterns case-insensitive fix ─────────────

assert(
  'F48 node fs.unlinkSync on protected file DENY (C2 camelCase pattern now /i)',
  "node -e \"require('fs').unlinkSync('.claude/hooks/dispatch-visibility-gate.sh')\"",
  'Bash', true
);

assert(
  'F49 node fs.writeFileSync on protected file DENY (C2 camelCase pattern now /i)',
  "node -e \"require('fs').writeFileSync('.claude/settings.json', '')\"",
  'Bash', true
);

assert(
  'F50 node fs.rmSync on protected file DENY (C2 camelCase pattern now /i)',
  "node -e \"require('fs').rmSync('.claude/hooks/dispatch-visibility-gate.sh')\"",
  'Bash', true
);

// ── M3: canonical wrapper allow is now whitespace-anchored ────────────────────

assert(
  'F51 bash C:/tmp/.claude/skills/ultra-agents/copilot-worker.sh DENY (M3 non-repo copy)',
  'bash C:/tmp/.claude/skills/ultra-agents/copilot-worker.sh --ticket t.md',
  'Bash', true
);

assert(
  'F52 bash /tmp/.claude/skills/ultra-agents/copilot-worker.sh DENY (M3 absolute non-repo)',
  'bash /tmp/.claude/skills/ultra-agents/copilot-worker.sh --ticket t.md',
  'Bash', true
);

assert(
  'F53 canonical in-repo wrapper still ALLOW after M3 fix (regression guard)',
  'bash .claude/skills/ultra-agents/copilot-worker.sh --ticket t.md --work-type build',
  'Bash', false
);

// ── Bounce-3 new fixtures: finding 1 (PS case), 2 (absolute paths), 4 ($'), 5 (quoted wrapper) ──

assert(
  'F54 PowerShell lowercase start-process DENY (finding 1 — case-sensitive gap closed)',
  'start-process bash -ArgumentList ".claude/skills/ultra-agents/copilot-worker.sh"',
  'PowerShell', true
);

assert(
  'F55 PowerShell lowercase start-job DENY (finding 1)',
  'start-job { bash .claude/skills/ultra-agents/copilot-worker.sh }',
  'PowerShell', true
);

assert(
  'F56 PowerShell invoke-command -asjob DENY (finding 1)',
  'invoke-command -asjob -scriptblock { bash copilot-worker.sh }',
  'PowerShell', true
);

assertPayload(
  'F57 Edit absolute Windows path to .claude/settings.json DENY (finding 2)',
  { tool_name: 'Edit', tool_input: { file_path: 'C:\\Users\\RutvikKhorasiya\\projects\\encore_framework\\.claude\\settings.json', old_str: 'x', new_str: 'y' } },
  true
);

assertPayload(
  'F58 Write UNC extended path to .claude/settings.json DENY (finding 2)',
  { tool_name: 'Write', tool_input: { file_path: '\\\\?\\C:\\Users\\RutvikKhorasiya\\projects\\encore_framework\\.claude\\settings.json', content: '' } },
  true
);

assertPayload(
  'F59 Write lowercase drive absolute path to .claude/settings.json DENY (finding 2)',
  { tool_name: 'Write', tool_input: { file_path: 'c:\\users\\rutvikkhorasiya\\projects\\encore_framework\\.claude\\settings.json', content: '' } },
  true
);

assert(
  'F60 .githooks grep body with $ regex — ALLOW not DENY (finding 4 false-positive closed)',
  "grep -qE '^clients/[^/]+/tests/.*\\.spec\\.ts$'",
  'Bash', false
);

assert(
  'F61 .githooks grep with $1 capture ref in body — ALLOW (finding 4)',
  "grep -qE '^(src|lib)/$1' file.txt",
  'Bash', false
);

assert(
  'F62 quoted canonical wrapper bash ".claude/.../.sh" — ALLOW (finding 5 false-positive closed)',
  'bash ".claude/skills/ultra-agents/copilot-worker.sh" --task ticket.md --work-type build',
  'Bash', false
);

assert(
  'F63 ANSI-C quote $\'...\' after whitespace still DENY (finding 4 scope preserved)',
  "bash .claude/skills/ultra-agents/copilot-worker.sh $'--task\\x26t.md'",
  'Bash', true
);

// ── Structural anti-recurrence test: canonicalizePath is the only normalization site ────

import { readFileSync } from 'node:fs';
{
  const src = readFileSync(new URL('./check-dispatch-visibility.mjs', import.meta.url), 'utf8');
  const toLowerCount = (src.match(/\.toLowerCase\(\)/g) || []).length;
  // backslash-to-slash: .replace(/\\/g, '/')
  const bsReplaceCount = (src.match(/\.replace\(\/\\\\\/g,\s*'\/'\)/g) || []).length;
  const label1 = 'STRUCT01 exactly one .toLowerCase() site (inside canonicalizePath)';
  if (toLowerCount === 1) { passed++; console.log(`  PASS [STRUCT] ${label1} (count=${toLowerCount})`); }
  else { failed++; console.error(`  FAIL [STRUCT] ${label1}: found ${toLowerCount} occurrences — second normalization site detected`); }
  const label2 = 'STRUCT02 exactly one backslash-replace site (inside canonicalizePath)';
  if (bsReplaceCount === 1) { passed++; console.log(`  PASS [STRUCT] ${label2} (count=${bsReplaceCount})`); }
  else { failed++; console.error(`  FAIL [STRUCT] ${label2}: found ${bsReplaceCount} occurrences — second normalization site detected`); }
}

// ── Canonicalization unit table (C1 fix proof) ────────────────────────────────

function assertCanon(label, input, expected) {
  const got = canonicalizePath(input);
  if (got === expected) {
    passed++;
    console.log(`  PASS [CANON] ${label}`);
  } else {
    failed++;
    console.error(`  FAIL [CANON] ${label}: expected "${expected}" got "${got}"`);
  }
}

console.log('\n── Canonicalization unit table ──\n');
assertCanon('./x',                                './x',                    'x');
assertCanon('.\\x (Windows backslash)',           '.\\x',                   'x');
assertCanon('a/../x (dotdot)',                    'a/../x',                 'x');
assertCanon('a\\..\\.\\x (Windows mixed)',        'a\\..\\.\\x',            'x');
assertCanon('//a//x (double separators)',         '//a//x',                 '/a/x');
assertCanon('"x" (quoted)',                       '"x"',                    'x');
assertCanon('plans/../.claude/settings.json',     'plans/../.claude/settings.json', '.claude/settings.json');
assertCanon('a/b/../../.claude/hooks/gate.sh',    'a/b/../../.claude/hooks/gate.sh', '.claude/hooks/gate.sh');
assertCanon('C:/tmp/.claude/settings.json (abs)', 'C:/tmp/.claude/settings.json',   'c:/tmp/.claude/settings.json');
assertCanon('/absolute/outside/repo (abs)',       '/absolute/outside/repo',          '/absolute/outside/repo');
assertCanon('.claude/settings.json (already canonical)', '.claude/settings.json',   '.claude/settings.json');

// ── M1 prove-it: repo searches ALLOW, real invocations DENY ─────────────────

assert('M1-F01 rg copilot .claude/hooks — ALLOW (copilot is argument, not executable)',
  'rg copilot .claude/hooks', 'Bash', false);
assert('M1-F02 git grep copilot — ALLOW (copilot is search term, not executable)',
  'git grep copilot', 'Bash', false);
assert('M1-F03 rg "copilot-worker" -n — ALLOW (copilot-worker is argument)',
  'rg "copilot-worker" -n', 'Bash', false);
assert('M1-F04 direct copilot invocation still DENY (A2)',
  'copilot --agent council-worker -p ticket.md', 'Bash', true);
assert('M1-F05 npx copilot still DENY (package runner + copilot name)',
  'npx copilot --agent council-worker -p ticket.md', 'Bash', true);

// ── M2 prove-it: encoded spawn constructs DENY ───────────────────────────────

assert('M2-F01 child_process import in node -e DENY',
  "node -e \"require('child_process').execSync('id')\"", 'Bash', true);
assert('M2-F02 spawnSync in inline script DENY',
  "node -e \"const {spawnSync}=require('child_process');spawnSync('ls')\"", 'Bash', true);
assert('M2-F03 execSync standalone DENY',
  "node -e \"require('child_process').execSync('ls')\"", 'Bash', true);
assert('M2-F04 String.fromCharCode obfuscation DENY',
  "node -e \"eval(String.fromCharCode(98,97,115,104))\"", 'Bash', true);
assert('M2-F05 Buffer.from base64 decode DENY',
  "node -e \"eval(Buffer.from('YmFzaA==','base64').toString())\"", 'Bash', true);
assert('M2-F06 safe node -e console.log ALLOW (no spawn keywords)',
  "node -e \"console.log(process.version)\"", 'Bash', false);
assert('M2-F07 safe node -e JSON.parse ALLOW',
  "node -e \"const d=JSON.parse(process.argv[1]);console.log(d)\"", 'Bash', false);
assert('M2-F08 safe node -e Date.now ALLOW',
  "node -e \"process.stdout.write(Date.now().toString())\"", 'Bash', false);

// ── B1 fix: separator bypasses — all DENY ────────────────────────────────────

assert(
  'F64 echo hi && copilot --agent x (&& separator, copilot in second statement)',
  'echo hi && copilot --agent x',
  'Bash', true
);

assert(
  'F65 echo hi ; copilot --agent x (; separator, copilot in second statement)',
  'echo hi ; copilot --agent x',
  'Bash', true
);

assert(
  'F66 echo hi\\ncopilot --agent x (newline separator)',
  'echo hi\ncopilot --agent x',
  'Bash', true
);

assert(
  'F67 echo hi && npx copilot -p t (npx copilot in second statement)',
  'echo hi && npx copilot -p t',
  'Bash', true
);

// ── B2 fix: quoted separator — laundering still invisible ─────────────────────
// echo 'noise; bash .../copilot-worker.sh --run-id X' has echo in executable
// position; the semicolon is inside single quotes so splitStatements sees ONE
// statement. commandHasWrapperInExecutablePosition must return false.

{
  const launderCmd = "echo 'noise; bash .claude/skills/ultra-agents/copilot-worker.sh --run-id ghost-123'";
  const hasWrapper = commandHasWrapperInExecutablePosition(launderCmd);
  const label = 'F68 quoted-separator laundering: commandHasWrapperInExecutablePosition returns false (still invisible)';
  if (!hasWrapper) { passed++; console.log(`  PASS [${false ? 'DENY' : 'ALLOW'}] ${label}`); }
  else { failed++; console.error(`  FAIL [expected wrapper=false, got true] ${label}`); }
}

// ── splitStatements unit tests ────────────────────────────────────────────────

function assertSplit(label, input, expected) {
  const got = splitStatements(input);
  const ok = JSON.stringify(got) === JSON.stringify(expected);
  if (ok) { passed++; console.log(`  PASS [SPLIT] ${label}`); }
  else { failed++; console.error(`  FAIL [SPLIT] ${label}: expected ${JSON.stringify(expected)} got ${JSON.stringify(got)}`); }
}

console.log('\n── splitStatements unit table ──\n');
assertSplit('single statement', 'echo hi', ['echo hi']);
assertSplit('; separator', 'echo a ; echo b', ['echo a', 'echo b']);
assertSplit('&& separator', 'echo a && echo b', ['echo a', 'echo b']);
assertSplit('|| separator', 'echo a || echo b', ['echo a', 'echo b']);
assertSplit('newline separator', 'echo a\necho b', ['echo a', 'echo b']);
assertSplit('pipe separator', 'echo a | cat', ['echo a', 'cat']);
assertSplit('quoted ; not split', "echo 'a;b'", ["echo 'a;b'"]);
assertSplit('quoted && not split', 'echo "a&&b"', ['echo "a&&b"']);
assertSplit('2>&1 not split', 'echo hi 2>&1', ['echo hi 2>&1']);
assertSplit('| tee split', 'bash x.sh 2>&1 | tee out.log', ['bash x.sh 2>&1', 'tee out.log']);
assertSplit('$\'...\' ANSI-C not split', "bash x.sh $'a;b'", ["bash x.sh $'a;b'"]);
assertSplit('cd + newline + cmd', 'cd /tmp\nbash copilot-worker.sh', ['cd /tmp', 'bash copilot-worker.sh']);

// ── executableOf unit tests ────────────────────────────────────────────────────

function assertExec(label, input, expected) {
  const got = executableOf(input);
  if (got === expected) { passed++; console.log(`  PASS [EXEC] ${label}`); }
  else { failed++; console.error(`  FAIL [EXEC] ${label}: expected ${JSON.stringify(expected)} got ${JSON.stringify(got)}`); }
}

console.log('\n── executableOf unit table ──\n');
assertExec('plain command', 'bash x.sh', 'bash');
assertExec('env prefix', 'FOO=1 bash x.sh', 'bash');
assertExec('multi env', 'A=1 B=2 node x.js', 'node');
assertExec('empty string', '', null);
assertExec('only env assignment', 'FOO=1', null);

// ── STRUCT03-06: structural anti-recurrence tests ─────────────────────────────

{
  const src = readFileSync(new URL('./check-dispatch-visibility.mjs', import.meta.url), 'utf8');

  // STRUCT03: hasDirectCopilotInvocation routes through splitStatements
  const dciStart = src.indexOf('function hasDirectCopilotInvocation');
  const dciEnd = src.indexOf('\nfunction ', dciStart + 1);
  const dciBody = src.slice(dciStart, dciEnd === -1 ? dciStart + 800 : dciEnd);
  const label3 = 'STRUCT03 hasDirectCopilotInvocation routes through splitStatements (not raw cmd)';
  if (dciBody.includes('splitStatements(cmd)')) { passed++; console.log(`  PASS [STRUCT] ${label3}`); }
  else { failed++; console.error(`  FAIL [STRUCT] ${label3}: splitStatements not called — revert detected`); }

  // STRUCT04: commandHasWrapperInExecutablePosition routes through splitStatements
  const cwepStart = src.indexOf('function commandHasWrapperInExecutablePosition');
  const cwepEnd = src.indexOf('\nfunction ', cwepStart + 1);
  const cwepBody = src.slice(cwepStart, cwepEnd === -1 ? cwepStart + 800 : cwepEnd);
  const label4 = 'STRUCT04 commandHasWrapperInExecutablePosition routes through splitStatements';
  if (cwepBody.includes('splitStatements(cmd)')) { passed++; console.log(`  PASS [STRUCT] ${label4}`); }
  else { failed++; console.error(`  FAIL [STRUCT] ${label4}: splitStatements not called — revert detected`); }

  // STRUCT05: old quote-blind split pattern absent from file
  const oldPattern = '.split(/\\r?\\n|&&|;|\\|/)';
  const label5 = 'STRUCT05 quote-blind split pattern absent (detectors use splitStatements)';
  if (!src.includes(oldPattern)) { passed++; console.log(`  PASS [STRUCT] ${label5}`); }
  else { failed++; console.error(`  FAIL [STRUCT] ${label5}: old quote-blind split still present — must use splitStatements`); }

  // STRUCT06 (V19): hasDirectCopilotInvocation uses executableOf, NOT parseDispatchWrapperPath.
  // This test FAILS when the function derives an executable by any route other than executableOf.
  // Demonstration of failure: replace executableOf with parseDispatchWrapperPath in the function
  // body and this check immediately catches it.
  const dciBody06 = src.slice(dciStart, dciEnd === -1 ? dciStart + 1000 : dciEnd);
  const label6 = 'STRUCT06 hasDirectCopilotInvocation uses executableOf (not parseDispatchWrapperPath) — fails on revert';
  if (dciBody06.includes('executableOf(') && !dciBody06.includes('parseDispatchWrapperPath(')) {
    passed++; console.log(`  PASS [STRUCT] ${label6}`);
  } else {
    failed++; console.error(`  FAIL [STRUCT] ${label6}: must call executableOf(), not parseDispatchWrapperPath()`);
  }
}

// ── V19: eight owner-confirmed bypasses now DENY ──────────────────────────────

console.log('\n── V19 bypass DENY probes (owner-confirmed) ──\n');

assert(
  'V19-B1 FOO=1 copilot --agent x (env-prefix direct copilot — executableOf fix)',
  'FOO=1 copilot --agent x',
  'Bash', true
);

assert(
  'V19-B2 A=1 B=2 copilot --agent x (multi-env direct copilot)',
  'A=1 B=2 copilot --agent x',
  'Bash', true
);

assert(
  'V19-B3 ( copilot --agent x ) (subshell)',
  '( copilot --agent x )',
  'Bash', true
);

assert(
  'V19-B4 echo `copilot --agent x` (backtick without shell launcher)',
  'echo `copilot --agent x`',
  'Bash', true
);

assert(
  'V19-B5 echo $(copilot --agent x) (command substitution without shell launcher)',
  'echo $(copilot --agent x)',
  'Bash', true
);

assert(
  'V19-B6 eval "copilot --agent x" (eval)',
  'eval "copilot --agent x"',
  'Bash', true
);

assert(
  'V19-B7 bash -c "copilot --agent x" (bash -c unmodeled form)',
  'bash -c "copilot --agent x"',
  'Bash', true
);

assert(
  'V19-B8 timeout 60 copilot --agent x (timeout launcher)',
  'timeout 60 copilot --agent x',
  'Bash', true
);

// ── V19: unmodeled contexts with NO dispatch token → ALLOW ────────────────────

console.log('\n── V19 unmodeled-no-dispatch ALLOW probes ──\n');

assert('V19-A1 echo $(date) — $() no dispatch token → ALLOW',
  'echo $(date)', 'Bash', false);

assert('V19-A2 echo $(git rev-parse HEAD) — $() no dispatch token → ALLOW',
  'echo $(git rev-parse HEAD)', 'Bash', false);

assert('V19-A3 timeout 60 npm test — timeout no dispatch token → ALLOW',
  'timeout 60 npm test', 'Bash', false);

assert('V19-A4 bash -c "npm run typecheck" — bash -c no dispatch token → ALLOW',
  'bash -c "npm run typecheck"', 'Bash', false);

assert('V19-A5 env FOO=1 node -e "console.log(1)" — env no dispatch token → ALLOW',
  'env FOO=1 node -e "console.log(1)"', 'Bash', false);

assert('V19-A6 heredoc writing config file — no dispatch token → ALLOW',
  'cat <<EOF\n[section]\nname=foo\nEOF', 'Bash', false);

// ── V19: real .githooks/pre-push body lines ALLOW ─────────────────────────────

console.log('\n── V19 real pre-push body ALLOW probes ──\n');

assert('V19-PP1 mkdir -p .claude/state → ALLOW (state dir creation)',
  'mkdir -p .claude/state', 'Bash', false);

assert('V19-PP2 echo log >> .claude/state/gate-fires.log → ALLOW (telemetry append)',
  'echo "pre-push-leak-scan, 2026-08-14T00:00:00Z, deny, file.ts" >> .claude/state/gate-fires.log',
  'Bash', false);

assert('V19-PP3 full pre-push telemetry line (line 22 body) → ALLOW',
  'echo "gate-input-closure, $(date -u +%Y-%m-%dT%H:%M:%SZ), announce, pre-push" >> .claude/state/gate-fires.log',
  'Bash', false);

// ── V20A: full pre-push file content verbatim ALLOW ──────────────────────────

{
  const _prePush = readFileSync(new URL('../../../.githooks/pre-push', import.meta.url), 'utf8');
  assert('V20A-PP full .githooks/pre-push file content verbatim → ALLOW (A3 no longer over-fires on shebang+$())',
    _prePush, 'Bash', false);
}

// ── V20A: regression — F16/F18 still DENY after A3 $() removal ───────────────

assert('V20A-R1 F16 regression: variable expansion bash -c dispatch still DENY',
  "A='bash .claude/skills/ultra-agents/copilot-worker.sh --ticket t --work-type build &'; bash -c \"$A\"",
  'Bash', true);

assert('V20A-R2 F18 regression: cmd-sub bash -c dispatch still DENY',
  "bash -c \"$(printf '%s' 'bash copilot-worker.sh &')\"",
  'Bash', true);

// ── V22: package runner family — all DENY copilot ─────────────────────────────

console.log('\n── V22 package runner family DENY probes ──\n');

assert('V22-R1 npm exec copilot DENY (two-word runner)',
  'npm exec copilot -- --agent council-worker -p ticket.md', 'Bash', true);
assert('V22-R2 pnpm dlx copilot DENY (two-word runner)',
  'pnpm dlx copilot --agent council-worker -p ticket.md', 'Bash', true);
assert('V22-R3 pnpm exec copilot DENY (two-word runner)',
  'pnpm exec copilot -- --agent council-worker -p ticket.md', 'Bash', true);
assert('V22-R4 yarn dlx copilot DENY (two-word runner)',
  'yarn dlx copilot --agent council-worker -p ticket.md', 'Bash', true);
assert('V22-R5 bun x copilot DENY (two-word runner)',
  'bun x copilot --agent council-worker -p ticket.md', 'Bash', true);

// V22: package runners with non-copilot target — ALLOW
assert('V22-R6 npm exec jest ALLOW (non-copilot target)',
  'npm exec jest -- --ci', 'Bash', false);
assert('V22-R7 pnpm dlx playwright ALLOW (non-copilot target)',
  'pnpm dlx playwright install', 'Bash', false);
assert('V22-R8 yarn dlx tsc ALLOW (non-copilot target)',
  'yarn dlx tsc --noEmit', 'Bash', false);

// ── V22: unmodeled prefix commands with dispatch token — DENY ─────────────────

console.log('\n── V22 unmodeled prefix DENY probes ──\n');

assert('V22-U1 exec bash wrapper DENY (prefix command + dispatch token)',
  'exec bash .claude/skills/ultra-agents/copilot-worker.sh --run-id X', 'Bash', true);
assert('V22-U2 time bash wrapper DENY',
  'time bash .claude/skills/ultra-agents/copilot-worker.sh --run-id X', 'Bash', true);
assert('V22-U3 command bash wrapper DENY',
  'command bash .claude/skills/ultra-agents/copilot-worker.sh --run-id X', 'Bash', true);
assert('V22-U4 source wrapper DENY',
  '. .claude/skills/ultra-agents/copilot-worker.sh --run-id X', 'Bash', true);
assert('V22-U5 python -c subprocess dispatch DENY',
  "python -c \"subprocess.run(['bash','copilot-worker.sh'])\"", 'Bash', true);
assert('V22-U6 function def with dispatch token DENY',
  'run() { bash copilot-worker.sh "$@"; }', 'Bash', true);
assert('V22-U7 alias assignment with dispatch token DENY',
  "alias cw='bash copilot-worker.sh'", 'Bash', true);
assert('V22-U8 process substitution with dispatch token DENY',
  'cat <(bash copilot-worker.sh --run-id X)', 'Bash', true);
assert('V22-U9 IFS reassignment with dispatch token DENY',
  'IFS=/ cmd=bash; $cmd copilot-worker.sh --run-id X', 'Bash', true);
assert('V22-U10 trap with dispatch command DENY',
  "trap 'bash copilot-worker.sh --run-id X' EXIT", 'Bash', true);
assert('V22-U11 brace expansion with dispatch token DENY',
  '{ba,}sh copilot-worker.sh --run-id X', 'Bash', true);
assert('V22-U12 line-continuation with dispatch token DENY',
  'ba\\\nsh copilot-worker.sh --run-id X', 'Bash', true);

// V22: unmodeled prefix commands WITHOUT dispatch token — ALLOW
assert('V22-U13 exec without dispatch token ALLOW',
  'exec > /dev/null', 'Bash', false);
assert('V22-U14 time without dispatch token ALLOW',
  'time npm test', 'Bash', false);
assert('V22-U15 command without dispatch token ALLOW',
  'command -v git', 'Bash', false);
assert('V22-U16 source without dispatch token ALLOW',
  '. ~/.bashrc', 'Bash', false);
assert('V22-U17 python -c without dispatch token ALLOW',
  "python -c \"print('hello')\"", 'Bash', false);

// ── V22: dispatch-argument integrity — DENY non-wrapper executables ───────────

console.log('\n── V22 dispatch-arg integrity probes ──\n');

assert('V22-D1 symlink with dispatch args DENY',
  'cw-v21 --run-id X --agent council-worker', 'Bash', true);
assert('V22-D2 PATH renamed binary with dispatch args DENY',
  '/tmp/mybin --run-id X --ticket t.md', 'Bash', true);
assert('V22-D3 sanctioned wrapper with dispatch args ALLOW',
  'bash .claude/skills/ultra-agents/copilot-worker.sh --ticket t.md --run-id X --work-type build', 'Bash', false);

// ── P67-F1: ordinary-English ALLOW block (false-deny fix) ─────────────────────

console.log('\n── P67-F1 ordinary-English ALLOW probes ──\n');

assert('ENG-01 commit message with "at" → ALLOW',
  'git commit -m "fix the crash at startup"', 'Bash', false);
assert('ENG-02 echo with "at" → ALLOW',
  'echo "look at this"', 'Bash', false);
assert('ENG-03 npm test --grep with "at" → ALLOW',
  'npm test -- --grep "renders at 1280px"', 'Bash', false);
assert('ENG-04 grep with "at " → ALLOW',
  'grep -n "at " src/', 'Bash', false);
assert('ENG-05 node with "at" in comment → ALLOW',
  'node -e "console.log(1)" # runs at build time', 'Bash', false);
assert('ENG-06 commit message with "screen" → ALLOW',
  'git commit -m "update screen layout"', 'Bash', false);
assert('ENG-07 commit message with "start" → ALLOW',
  'git commit -m "start the migration"', 'Bash', false);
assert('ENG-08 echo with "nice" → ALLOW',
  'echo "that looks nice"', 'Bash', false);
assert('ENG-09 commit message with "nohup" → ALLOW',
  'git commit -m "remove nohup from script"', 'Bash', false);
assert('ENG-10 grep for "start" → ALLOW',
  'grep -rn "start" src/', 'Bash', false);
assert('ENG-11 echo with "setsid" → ALLOW',
  'echo "do not use setsid in production"', 'Bash', false);
assert('ENG-12 commit with "disown" → ALLOW',
  'git commit -m "disown the old API endpoint"', 'Bash', false);
assert('ENG-13 npm test with "screen" in grep → ALLOW',
  'npm test -- --grep "screen resizes correctly"', 'Bash', false);

// ── P67-F1: .githooks file bodies ALLOW (read from disk at test time) ─────────

console.log('\n── P67-F1 .githooks body ALLOW probes ──\n');

{
  const _preCommit = readFileSync(new URL('../../../.githooks/pre-commit', import.meta.url), 'utf8');
  assert('HOOK-01 .githooks/pre-commit body verbatim → ALLOW', _preCommit, 'Bash', false);
}
{
  const _commitMsg = readFileSync(new URL('../../../.githooks/commit-msg', import.meta.url), 'utf8');
  assert('HOOK-02 .githooks/commit-msg body verbatim → ALLOW', _commitMsg, 'Bash', false);
}
// pre-push already tested as V20A-PP above

// ── P67-F1: V22 dispatch-args quote-aware ALLOW ──────────────────────────────

console.log('\n── P67-F1 dispatch-args quote-aware probes ──\n');

assert('DARG-01 echo "--run-id abc" → ALLOW (dispatch arg in quotes)',
  'echo "--run-id abc"', 'Bash', false);
assert('DARG-02 grep --run-id src/ → ALLOW (dispatch arg as grep argument)',
  'grep "--run-id" src/', 'Bash', false);
assert('DARG-03 git commit -m "added --ticket flag" → ALLOW',
  'git commit -m "added --ticket flag support"', 'Bash', false);
assert('DARG-04 cat file with --agent in quotes → ALLOW',
  "cat 'logs with --agent data'", 'Bash', false);
assert('DARG-05 real dispatch args on non-wrapper still DENY',
  'mybin --run-id X --agent council-worker', 'Bash', true);

// ── P67-F1: absolute-path wrapper ALLOW ───────────────────────────────────────

console.log('\n── P67-F1 absolute-path wrapper probes ──\n');

assert('ABSWRAP-01 bash with absolute Windows path to canonical wrapper → ALLOW',
  'bash C:\\Users\\RutvikKhorasiya\\projects\\encore_framework\\.claude\\skills\\ultra-agents\\copilot-worker.sh --run-id X --work-type build',
  'Bash', false);
assert('ABSWRAP-02 bash with non-local Unix absolute path to wrapper → DENY (different repo)',
  'bash /home/user/encore_framework/.claude/skills/ultra-agents/copilot-worker.sh --run-id X --work-type build',
  'Bash', true);
assert('ABSWRAP-03 non-repo absolute path still DENY (M3 preserved)',
  'bash /tmp/.claude/skills/ultra-agents/copilot-worker.sh --ticket t.md', 'Bash', true);

// ── P67-F1: $'…' narrowing probes ────────────────────────────────────────────

console.log('\n── P67-F1 ANSI-C narrowing probes ──\n');

assert('ANSIC-01 echo $\'hello\\nworld\' → ALLOW (safe escape only)',
  "echo $'hello\\nworld'", 'Bash', false);
assert('ANSIC-02 echo $\'tab\\there\' → ALLOW (safe escape)',
  "echo $'tab\\there'", 'Bash', false);
assert('ANSIC-03 $\'\\x26\' still DENY (hex-encoded &)',
  "bash script.sh $'--flag\\x26bg'", 'Bash', true);
assert('ANSIC-04 $\'\\u0026\' still DENY (unicode-encoded &)',
  "bash -c $'cmd \\u0026'", 'Bash', true);
assert('ANSIC-05 $\'copilot-worker.sh\' DENY (dispatch token in ANSI-C)',
  "bash $'copilot-worker.sh'", 'Bash', true);

// ── P67-F1: still-denies block (real detachment primitives survive) ───────────

console.log('\n── P67-F1 still-denies probes ──\n');

assert('STILL-01 real at scheduler → DENY',
  'at 09:00 bash deploy.sh', 'Bash', true);
assert('STILL-02 real nohup → DENY',
  'nohup bash deploy.sh', 'Bash', true);
assert('STILL-03 real screen -dm → DENY',
  'screen -dm bash deploy.sh', 'Bash', true);
assert('STILL-04 real setsid → DENY',
  'setsid bash deploy.sh', 'Bash', true);
assert('STILL-05 real disown → DENY',
  'disown -h %1', 'Bash', true);
assert('STILL-06 real cmd.exe /c start → DENY',
  'cmd.exe /c start /b notepad', 'Bash', true);
assert('STILL-07 real wsl.exe → DENY',
  'wsl.exe bash -c "echo hi"', 'Bash', true);
assert('STILL-08 detached: true syntax → DENY',
  'spawn("node", [], {detached: true})', 'Bash', true);
assert('STILL-09 start_new_session=True syntax → DENY',
  'subprocess.Popen(["bash"], start_new_session=True)', 'Bash', true);
assert('STILL-10 real coproc → DENY',
  'coproc myfd { bash deploy.sh; }', 'Bash', true);

// ── P67-F1: isCanonicalWrapper unit tests ─────────────────────────────────────

{
  const label1 = 'ISWRAP-01 repo-relative path matches';
  if (isCanonicalWrapper('.claude/skills/ultra-agents/copilot-worker.sh')) { passed++; console.log(`  PASS [ISWRAP] ${label1}`); }
  else { failed++; console.error(`  FAIL [ISWRAP] ${label1}`); }

  const label2 = 'ISWRAP-02 absolute path ending with canonical matches';
  if (isCanonicalWrapper('c:/users/rutvikkhorasiya/projects/encore_framework/.claude/skills/ultra-agents/copilot-worker.sh')) { passed++; console.log(`  PASS [ISWRAP] ${label2}`); }
  else { failed++; console.error(`  FAIL [ISWRAP] ${label2}`); }

  const label3 = 'ISWRAP-03 non-repo absolute path does not match';
  if (!isCanonicalWrapper(canonicalizePath('/tmp/.claude/skills/ultra-agents/copilot-worker.sh'))) { passed++; console.log(`  PASS [ISWRAP] ${label3}`); }
  else { failed++; console.error(`  FAIL [ISWRAP] ${label3}`); }

  const label4 = 'ISWRAP-04 null returns false';
  if (!isCanonicalWrapper(null)) { passed++; console.log(`  PASS [ISWRAP] ${label4}`); }
  else { failed++; console.error(`  FAIL [ISWRAP] ${label4}`); }
}

// ── P67-F2V2: Ledger write-protection (Finding A) ────────────────────────────

assert('LEDGER-01 append-redirect to ledger → DENY',
  'echo "forged" >> .claude/state/ua-worker/ledger.jsonl', 'Bash', true);
assert('LEDGER-02 truncate ledger → DENY',
  'truncate -s 0 .claude/state/ua-worker/ledger.jsonl', 'Bash', true);
assert('LEDGER-03 rm ledger → DENY',
  'rm .claude/state/ua-worker/ledger.jsonl', 'Bash', true);
assert('LEDGER-04 mv ledger → DENY',
  'mv .claude/state/ua-worker/ledger.jsonl /tmp/gone', 'Bash', true);
assert('LEDGER-05 sed -i on ledger → DENY',
  'sed -i "s/real/fake/" .claude/state/ua-worker/ledger.jsonl', 'Bash', true);
assert('LEDGER-06 cp overwrite ledger → DENY',
  'cp /tmp/fake.jsonl .claude/state/ua-worker/ledger.jsonl', 'Bash', true);
assertPayload('LEDGER-07 Write tool to ledger → DENY',
  { tool_name: 'Write', tool_input: { file_path: '.claude/state/ua-worker/ledger.jsonl', content: 'forged' } }, true);
assertPayload('LEDGER-08 Edit tool to ledger → DENY',
  { tool_name: 'Edit', tool_input: { file_path: '.claude/state/ua-worker/ledger.jsonl', old_str: 'x', new_str: 'y' } }, true);

// False-deny guards: reads of ledger must ALLOW
assert('LEDGER-09 cat ledger → ALLOW (read-only)',
  'cat .claude/state/ua-worker/ledger.jsonl', 'Bash', false);
assert('LEDGER-10 grep ledger → ALLOW (read-only)',
  'grep "run-id" .claude/state/ua-worker/ledger.jsonl', 'Bash', false);
assert('LEDGER-11 tail ledger → ALLOW (read-only)',
  'tail -20 .claude/state/ua-worker/ledger.jsonl', 'Bash', false);
assert('LEDGER-12 node read ledger → ALLOW (read-only)',
  'node -e "const d = require(\'fs\').readFileSync(\'.claude/state/ua-worker/ledger.jsonl\',\'utf8\'); console.log(d)"', 'Bash', false);
assert('LEDGER-13 wc ledger → ALLOW (read-only)',
  'wc -l .claude/state/ua-worker/ledger.jsonl', 'Bash', false);

// ── P67-F2V2: Missing spawn keywords (Finding B) ────────────────────────────

assert('SPAWN-01 spawn_sync via process.binding → DENY',
  "node -e \"process.binding('spawn_sync')\"", 'Bash', true);
assert('SPAWN-02 worker_threads require → DENY',
  'node -e "require(\'worker_threads\')"', 'Bash', true);
assert('SPAWN-03 node:worker_threads import → DENY',
  'node -e "import(\'node:worker_threads\')"', 'Bash', true);
assert('SPAWN-04 execFileSync → DENY',
  'node -e "execFileSync(\'ls\')"', 'Bash', true);
assert('SPAWN-05 spawnSync still denied (regression)',
  'node -e "spawnSync(\'ls\')"', 'Bash', true);
assert('SPAWN-06 child_process still denied (regression)',
  'node -e "require(\'child_process\')"', 'Bash', true);

// ── P67-F3: Prose-mention ALLOW (every ENCODED_SPAWN_PATTERNS entry) ────────
// A guard's corpus must contain the ordinary inputs it must NOT block.

console.log('\n── P67-F3 prose-mention ALLOW probes ──\n');

// -- child_process --
assert('PROSE-01 grep for child_process → ALLOW',
  'grep -rn "child_process" src/', 'Bash', false);
assert('PROSE-02 commit message mentioning child_process → ALLOW',
  'git commit -m "document the child_process limitation"', 'Bash', false);
assert('PROSE-03 echo child_process to docs → ALLOW',
  'echo "Uses child_process for IPC" >> docs/architecture.md', 'Bash', false);

// -- spawnSync --
assert('PROSE-04 grep for spawnSync → ALLOW',
  'grep -rn "spawnSync" src/', 'Bash', false);
assert('PROSE-05 commit message mentioning spawnSync → ALLOW',
  'git commit -m "replace spawnSync with a safer call"', 'Bash', false);
assert('PROSE-06 echo spawnSync to docs → ALLOW',
  'echo "Avoid spawnSync in hot paths" >> docs/notes.md', 'Bash', false);

// -- spawn_sync --
assert('PROSE-07 grep for spawn_sync → ALLOW',
  'grep -n "spawn_sync" notes.md', 'Bash', false);
assert('PROSE-08 commit message mentioning spawn_sync → ALLOW',
  'git commit -m "remove spawn_sync usage"', 'Bash', false);
assert('PROSE-09 echo spawn_sync to docs → ALLOW',
  'echo "spawn_sync is a Node binding" >> docs/internals.md', 'Bash', false);

// -- execSync --
assert('PROSE-10 grep for execSync → ALLOW',
  'grep -rn "execSync" lib/', 'Bash', false);
assert('PROSE-11 commit message mentioning execSync → ALLOW',
  'git commit -m "migrate from execSync to spawn"', 'Bash', false);
assert('PROSE-12 echo execSync to docs → ALLOW',
  'echo "execSync blocks the event loop" >> docs/perf.md', 'Bash', false);

// -- execFile --
assert('PROSE-13 grep for execFile → ALLOW',
  'grep -rn "execFile" src/', 'Bash', false);
assert('PROSE-14 commit message mentioning execFile → ALLOW',
  'git commit -m "replace execFile with spawn"', 'Bash', false);
assert('PROSE-15 echo execFile to docs → ALLOW',
  'echo "execFile is safer than exec" >> docs/security.md', 'Bash', false);

// -- execFileSync --
assert('PROSE-16 grep for execFileSync → ALLOW',
  'grep -rn "execFileSync" src/', 'Bash', false);
assert('PROSE-17 commit message mentioning execFileSync → ALLOW',
  'git commit -m "replace execFileSync with a safer call"', 'Bash', false);
assert('PROSE-18 echo execFileSync to docs → ALLOW',
  'echo "execFileSync is synchronous" >> docs/api.md', 'Bash', false);

// -- worker_threads --
assert('PROSE-19 grep for worker_threads → ALLOW',
  'grep -rn "worker_threads" src/', 'Bash', false);
assert('PROSE-20 commit message mentioning worker_threads → ALLOW',
  'git commit -m "document the worker_threads limitation"', 'Bash', false);
assert('PROSE-21 echo worker_threads to docs → ALLOW',
  'echo "worker_threads enables parallelism" >> docs/threading.md', 'Bash', false);

// -- String.fromCharCode --
assert('PROSE-22 grep for String.fromCharCode → ALLOW',
  'grep -rn "String.fromCharCode" src/', 'Bash', false);
assert('PROSE-23 commit message mentioning String.fromCharCode → ALLOW',
  'git commit -m "audit String.fromCharCode usage"', 'Bash', false);
assert('PROSE-24 echo String.fromCharCode to docs → ALLOW',
  'echo "String.fromCharCode converts code points" >> docs/strings.md', 'Bash', false);

// -- Buffer.from(base64) --
assert('PROSE-25 grep for Buffer.from base64 → ALLOW',
  "grep -rn \"Buffer.from('base64')\" src/", 'Bash', false);
assert('PROSE-26 commit message mentioning Buffer.from base64 → ALLOW',
  "git commit -m \"audit Buffer.from with base64 encoding\"", 'Bash', false);

// -- Auto-memory directory write mentioning these APIs --
assert('PROSE-27 write agent-mistakes.md discussing spawn APIs → ALLOW',
  'echo "Lesson: child_process and spawnSync and worker_threads keywords in grep must not be blocked" >> .claude/collaborator-memory/agent-mistakes.md', 'Bash', false);

// -- The four ticket-cited commands that must ALLOW --
assert('PROSE-28 ticket-cited: git commit mentioning worker_threads → ALLOW',
  'git commit -m "document the worker_threads limitation"', 'Bash', false);
assert('PROSE-29 ticket-cited: grep worker_threads → ALLOW',
  'grep -rn "worker_threads" src/', 'Bash', false);
assert('PROSE-30 ticket-cited: git commit mentioning execFileSync → ALLOW',
  'git commit -m "replace execFileSync with a safer call"', 'Bash', false);
assert('PROSE-31 ticket-cited: grep spawn_sync → ALLOW',
  'grep -n "spawn_sync" notes.md', 'Bash', false);

// -- Deny direction: inline-eval still denies via runner and shell wrapper --
assert('PROSE-DENY-01 npx node -e with child_process → DENY',
  'npx node -e "require(\'child_process\')"', 'Bash', true);
assert('PROSE-DENY-02 bunx node -e with spawnSync → DENY',
  'bunx node -e "spawnSync(\'ls\')"', 'Bash', true);
assert('PROSE-DENY-03 bash -c wrapping node -e with worker_threads → DENY',
  "bash -c 'node -e \"require(worker_threads)\"'", 'Bash', true);
assert('PROSE-DENY-04 node --eval with execSync → DENY',
  'node --eval "require(\'child_process\').execSync(\'id\')"', 'Bash', true);
assert('PROSE-DENY-05 node -p with child_process → DENY',
  'node -p "require(\'child_process\').execSync(\'id\').toString()"', 'Bash', true);
assert('PROSE-DENY-06 node --print with spawn_sync → DENY',
  'node --print "process.binding(\'spawn_sync\')"', 'Bash', true);
assert('PROSE-DENY-07 npm exec node -e with execFileSync → DENY',
  'npm exec node -e "execFileSync(\'ls\')"', 'Bash', true);

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${passed} passed, ${failed} failed (total ${passed + failed}) ===\n`);
if (failed > 0) process.exit(1);
