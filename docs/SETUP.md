# Encore Framework — First-Time Setup

For new collaborators only. Existing collaborators skip this.

**On every session start**, two checks happen automatically:

1. The framework checks if `config/environments/.env.local` exists → if missing, you're in onboarding.
2. **Identity check**: Auto-detected by skill Identity Gates. For non-skill pipeline work, `/identity` Step 1.6 detects from keywords. Manual `/identity` is still available. OWNER is the safe default.

---

## Step 1 — Create your agent identity

Ask: "What's your name?" Copy `.claude/agents/COLLEAGUE.agent.md` → `.claude/agents/<NAME>.agent.md`, replace all `<YOUR_NAME>` placeholders, commit + push.

## Step 2 — Credentials are pre-configured

Credentials are stored directly in `clients/encore/config/environments/.env.e2e` (committed to git). No vault setup needed — clone and run.

## Step 3 — (Optional) Create `.env.local` for overrides

Only needed if you want to override defaults (e.g., different browser, timeouts).

```bash
cp clients/encore/config/environments/.env.e2e config/environments/.env.local
```

## Step 4 — Install Claude CLI

```bash
npm install -g @anthropic-ai/claude-code && claude login
```

Each person needs their own Claude subscription.

## Step 5 — Install deps + browsers

```bash
npm install && npx playwright install
```

## Step 6 — Verify

```bash
npm test -- --project=chrome tests/seed.spec.ts
```

Passes = Navigator Cloud credentials are working.

## Step 7 — Full stack (optional, for website/UI work)

```bash
cp config/environments/.env.server.example config/environments/.env.server
# Set ENCRYPTION_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
cd website/frontend && npm install && cd ../..
cd website/backend && npm install && cd ../..
docker compose up -d && npm run server:start
```

---

## Security Rules

- `.env.local` and `.env.server` are gitignored (for personal overrides)
- Credentials are stored in plain text in `.env` files by design (clone-and-run)
