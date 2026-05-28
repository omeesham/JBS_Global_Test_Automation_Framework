# Encore Framework — First-Time Setup

For new collaborators only. Existing collaborators skip this.

**On every session start**, two checks happen automatically:

1. The framework checks if `config/environments/.env.local` exists → if missing, you're in onboarding.
2. **Identity check**: Auto-detected by skill Identity Gates. For non-skill pipeline work, `/identity` Step 1.6 detects from keywords. Manual `/identity` is still available. OWNER is the safe default.

---

## Step 1 — Create your agent identity

Ask: "What's your name?" Copy `.claude/agents/COLLEAGUE.agent.md` → `.claude/agents/<NAME>.agent.md`, replace all `<YOUR_NAME>` placeholders, commit + push.

## Step 2 — Create your local credentials file

Local runs (ours only — Encore runs via CI) load `.env.local`, which is gitignored. Create `clients/encore/config/environments/.env.local` with:

```ini
CI_ENV=local
BASE_URL=https://cloudapps-e2e.encoreglobal.com/navigator/
HOME_URL=https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/home
NAVIGATOR_USERNAME=<microsoft-sso-automation-user>
NAVIGATOR_PASSWORD=<password>
```

Get the SSO automation-user credentials from the team. (CI uses `.env.e2e` + GitHub Secrets — no creds in the repo.)

## Step 3 — (Optional) Tune your local run

`.env.local` can also set `MAX_WORKERS`, `LOG_LEVEL`, `DEFAULT_BROWSER`. Defaults are fine for most work.

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
cd clients/encore && npm run test:grep -- "TC-LOC-CUR-001" --project=encore-locations
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

- `.env.local` and `.env.server` are gitignored — your credentials live there and are never committed.
- `.env.e2e` is the CI config and holds NO credentials; GitHub Actions injects them from repo Secrets.
