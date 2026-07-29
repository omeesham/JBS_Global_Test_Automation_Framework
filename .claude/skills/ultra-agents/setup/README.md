# Copilot workforce — one-time setup

This makes your Copilot and Claude behave the same way they do on the machine this repo came from:
Claude decides and reviews, Copilot workers do the work.

Takes about two minutes. You do it once.

---

## What you need first

- GitHub Copilot CLI installed and signed in. Check with `copilot --version`.
- This repository cloned.
- Git Bash if you are on Windows. The worker script is a bash script.

---

## Step 1 — Copy the agent definitions

Copilot looks for agents in your home folder, not in this repo.

**Mac / Linux**
```bash
mkdir -p ~/.copilot/agents
cp .claude/skills/ultra-agents/setup/agents/*.agent.md ~/.copilot/agents/
```

**Windows (Git Bash)**
```bash
mkdir -p ~/.copilot/agents
cp .claude/skills/ultra-agents/setup/agents/*.agent.md ~/.copilot/agents/
```

That gives you five agents:

| Agent | What it is for |
|---|---|
| `council-worker` | Does the actual work in a ticket |
| `council-reviewer` | Reviews another agent's work, adversarially |
| `council-verifier` | Cheap checks — re-runs commands and confirms claims |
| `council-planner` | Breaks a large job into tickets |
| `chief` | Runs a whole goal end to end |

---

## Step 2 — Copy the configuration

```bash
mkdir -p ~/.claude/delegation
cp -r .claude/skills/ultra-agents/setup/delegation/* ~/.claude/delegation/
chmod +x ~/.claude/delegation/*.sh
```

These are defaults that work. You do not need to edit any of them to get started.

The two worth knowing about later:

- `config.json` — how many workers may run at once, and what happens when one stalls.
- `model-registry.json` — which model each agent runs on, and what reasoning levels it supports.

Two more in the `gates/` folder:

- `gates/envelope.mjs` — snapshots target files before a worker runs
- `gates/verify-run.mjs` — checks the worker's report against that snapshot; `worker-ext.md` shows both commands

---

## Step 3 — Install the Claude hooks

These are the Claude half of the workforce. Without them Claude never becomes a delegating manager and nothing stops it from doing worker-tier work itself.

**Copy the scripts**

```bash
mkdir -p ~/.claude/hooks
cp .claude/skills/ultra-agents/setup/hooks/*.mjs ~/.claude/hooks/
```

**Merge the hook wiring into your settings**

Open `~/.claude/settings.json`. Add the `"hooks"` block from `.claude/skills/ultra-agents/setup/settings-hooks.json` into it. **Merge, do not copy over.** If you already have a `"hooks"` key, add the new arrays alongside your existing ones. Copying the file over wholesale will wipe anything you already had.

If you have no `settings.json` yet, you can copy it directly:

```bash
cp .claude/skills/ultra-agents/setup/settings-hooks.json ~/.claude/settings.json
```

What is in the hooks folder:

- `delegation-primer.mjs` — runs at session start; tells Claude it is the manager
- `delegation-gate.mjs`, `delegation-nudge.mjs`, `ua-worker-guard.mjs`, `labor-gate.mjs` — stop Claude from editing files or running commands that should go to a worker
- Six `check-*.mjs` scripts — pre-call checks that enforce delegation hygiene

---

## Step 4 — Check it works

This asks for a ticket that does not exist on purpose. Nothing runs, nothing is charged.

```bash
bash .claude/skills/ultra-agents/copilot-worker.sh --work-type build --agent council-worker --ticket /nonexistent/x.md
```

You want to see exactly this:

```
copilot-worker: --ticket file missing: '/nonexistent/x.md'
```

That means it found your agent file and your config and got all the way to looking for the ticket.
You are set up.

If you see `FATAL — model-registry block missing`, Step 2 did not land — redo it.
If you see `agent file not found`, Step 1 did not land — redo it.

There is no `--help`. Passing it prints `unknown arg`.

---

## How to actually use it

Read `.claude/skills/ultra-agents/worker-ext.md` first. It is the rulebook — what to delegate, what
never to delegate, and how to write a ticket that a worker can finish.

The short version: you write a ticket file, then dispatch it.

```bash
bash .claude/skills/ultra-agents/copilot-worker.sh \
  --ticket path/to/TICKET.md \
  --agent council-worker \
  --work-type build \
  --max-credits 300
```

The worker writes its result to a file and prints the path. **Read the result, then check the actual
files yourself.** A worker reporting success is a claim, not proof.

Three things that will bite you if nobody tells you:

- **One file per ticket.** Workers reliably die when asked to write several files at the end. Ask for
  one edited file and no new ones.
- **Budget generously.** `--max-credits 300` is a sane floor. A worker that runs out of credits
  produces no output at all and the failure looks like something else entirely.
- **Never let one vendor review its own work.** If a Claude model did the work, a GPT model reviews
  it. That is the point of the reviewer seat.

---

## Where things live

| Thing | Path | Travels with the repo? |
|---|---|---|
| Worker script | `.claude/skills/ultra-agents/copilot-worker.sh` | yes |
| Rulebook | `.claude/skills/ultra-agents/worker-ext.md` | yes |
| These setup copies | `.claude/skills/ultra-agents/setup/` | yes |
| Your agents | `~/.copilot/agents/` | no — Step 1 puts them there |
| Your config | `~/.claude/delegation/` | no — Step 2 puts them there |
| Acceptance gates | `~/.claude/delegation/gates/` | no — Step 2 puts them there |
| Your hooks | `~/.claude/hooks/` | no — Step 3 puts them there |
| Run state, tickets, logs | `.claude/state/ua-worker/` | no — yours only, never shared |

If you change an agent or a config and it works better, copy it back into
`.claude/skills/ultra-agents/setup/` and commit it so everyone else gets it too.
