# Plan 53E: Client Onboarding Setup Flow

**Priority**: 5
**Depends on**: 53B + 53D (needs pages table + page APIs)
**Parent**: PLAN_53_PIPELINE_UX_OVERHAUL.md

---

## Goal

New clients get guided setup — URL, creds, config → requirements agent crawls app → page tree discovered.

## New DB Table — `src/server/db/schema.sql`

```sql
CREATE TABLE IF NOT EXISTS client_setup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(100) NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  home_url TEXT,
  auth_config JSONB,
  setup_config JSONB,
  setup_run_id UUID REFERENCES pipeline_runs(id),
  initiated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Backend — `src/server/routes/setup.ts`

- `POST /api/setup/initiate` — start onboarding (encrypt creds, create pipeline run, agent explores app)
- `GET /api/setup/status` — check status
- `POST /api/setup/credentials` — store encrypted creds
- `POST /api/setup/rediscover` — re-run discovery for new pages

## Frontend — `website/frontend/src/components/settings/ClientSetupWizard.tsx`

Card-based wizard: Welcome → URL → Auth → Config (maxPages/maxDepth) → Discovery (live) → Complete (page tree)

Shows in: Settings (client_admin), Dashboard (setup required card), Chat (quick action)

## Key Files
- Create: `src/server/routes/setup.ts`, `ClientSetupWizard.tsx`
- Modify: `schema.sql`, `src/server/index.ts`, `SettingsPage.tsx`, `DashboardPage.tsx`, `ChatWelcome.tsx`

## Credential Lifecycle

1. **Storage**: Encrypted in `client_setup.auth_config` JSONB. Format: `{ iv: hex, authTag: hex, ciphertext: hex, type: 'sso'|'basic' }`
2. **Encryption**: `crypto.createCipheriv('aes-256-gcm', key, randomIV)`. Key from `process.env.SETUP_ENCRYPTION_KEY`.
3. **If key not set**: Server refuses to store creds, returns 500 "SETUP_ENCRYPTION_KEY not configured". Never falls back to plaintext.
4. **Retrieval**: Only decrypted when building agent prompt for discovery run. Decrypted in-memory, never logged.
5. **Agent usage**: Creds passed in worker task context (encrypted field) → worker decrypts when building auth session.
6. **Rotation**: If key changes, old creds unreadable. Re-setup required. (Acceptable for MVP.)

## Guidance
- Discovery limits: maxPages (default 100), maxDepth (default 3), timeout (default 600s). All configurable in wizard.
- Cycle detection: before inserting page with `parent_page_id`, verify parent is not a descendant of the new page. Simple depth check: if `depth >= maxDepth`, don't recurse.
- Re-discover preserves existing pages, only adds new ones
- Agent calls `POST /api/pages` for each discovered page with `parent_page_id` for tree
- Permission: only `client_admin` or `super_admin` can initiate setup (check role in route handler)
