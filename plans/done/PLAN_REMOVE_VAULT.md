# Plan: Remove Vault, Store Credentials in Plain Text

## Context
The vault system (AES-256-GCM encrypted credential storage) creates friction for collaborators who can't get it working. Rutvik wants anyone to be able to clone the repo and immediately run tests without vault setup. Security is not a concern for this project. Credentials will be committed to git in plain `.env` files.

**Credentials:**
- Username: `v-rutvik.khosariya@psav.com`
- Password: `Qa@12345678!!`
- MFA Secret: `CYFRPMNXGR75FQQF`

---

## Task 1: Put real credentials in ALL .env files

Replace `***USE_VAULT***` placeholders with actual values. Remove `VAULT_PASSPHRASE` references.

| File | Changes |
|------|---------|
| `config/environments/.env.example` (lines 67-73) | Set NAVIGATOR_USERNAME/PASSWORD/MFA_SECRET to real values. Remove VAULT_PASSPHRASE line + comments |
| `config/environments/.env.development` (lines 16-20, 42-45) | Set credentials. Remove vault passphrase comment block |
| `config/environments/.env.staging` (lines 40-43) | Set credentials |
| `config/environments/.env.production` (lines 41-44) | Set credentials. Remove "USE VAULT OR CI SECRETS" comment |

---

## Task 2: Rewrite `credential-loader.ts` — remove vault, fix env var names

**File:** `src/common/credential-loader.ts`

1. Remove `import { Vault }` (line 13)
2. Remove `'vault'` from `CredentialSource.type` union (line 16)
3. Remove `_loadVaultRecord()` method entirely (lines 117-130)
4. Remove vault branch in `_resolveSource()` (lines 84-86)
5. Update `_loadEnvRecord()` to read `NAVIGATOR_*` vars (currently reads wrong names `USERNAME_AUTOMATION`/`PASSWORD_AUTOMATION`):
   ```typescript
   private static _loadEnvRecord(): Record<string, any> {
     return {
       username: process.env.NAVIGATOR_USERNAME || process.env.USERNAME_AUTOMATION || 'admin',
       password: process.env.NAVIGATOR_PASSWORD || process.env.PASSWORD_AUTOMATION || 'admin',
       mfaSecret: process.env.NAVIGATOR_MFA_SECRET || process.env.MFA_SECRET,
       role: 'env',
       _source: 'environment variables',
     };
   }
   ```
6. Remove `Log.warn` about "not from data source" (line 134) — env IS the primary source now
7. Update `@agent-doc` header — remove vault references

---

## Task 3: Change all callers from `type: 'vault'` to `type: 'env'`

| File | Line | Change |
|------|------|--------|
| `tests/setup/fixtures.ts` | 168 | `{ type: 'vault' }` → `{ type: 'env' }` |
| `tests/setup/global-setup.ts` | 119 | `{ type: 'vault' }` → `{ type: 'env' }` |
| `tests/examples/basic-test-pattern.spec.ts` | 31 | `{ type: 'vault' }` → `{ type: 'env' }` |

---

## Task 4: Delete vault files

| File | Action |
|------|--------|
| `src/security/vault.ts` | DELETE (only file in `src/security/`) |
| `scripts/vault-manager.ts` | DELETE |
| `config/secrets/.vault.enc` | DELETE |
| `src/security/` directory | DELETE (empty after vault.ts removal) |
| `config/secrets/` directory | DELETE (empty after .vault.enc removal) |

---

## Task 5: Remove Vault export from barrel

**File:** `src/index.ts`
- Delete line 46: `export { Vault } from './security/vault';`
- Delete line 45: `// ==================== SECURITY ====================` section header

---

## Task 6: Remove vault npm scripts from `package.json`

Delete lines 82-87 (all six scripts):
- `vault:init`, `vault:set`, `vault:get`, `vault:list`, `vault:rotate`, `vault:info`

---

## Task 7: Update `.gitignore`

**File:** `.gitignore` (lines 89-101)

Remove these vault/credential glob patterns:
- Line 90: `*credentials*`
- Line 91: `*secrets*`
- Line 92: `!config/secrets/`
- Line 93: `!config/secrets/vault.ts`
- Line 94: `*password*`
- Lines 99-101: `config/secrets/.vault.key`, `config/secrets/*.enc`

Keep the rest (`.pem`, `.key`, `*token*` are still sensible).

---

## Task 8: Update `CLAUDE.md` onboarding

**File:** `CLAUDE.md`

- **Step 2** (lines 14-21): Replace vault setup with "Credentials are pre-configured in `.env.development` — no setup needed"
- **Step 3** (lines 23-27): Simplify — `.env.local` is only needed for personal overrides, not vault passphrase
- **Security Rules** (lines 55-58): Remove vault-related rules, note credentials are plain text by design
- **Step 6 verify** (line 44): Remove "vault are working" wording

---

## Task 9: Fix `common-methods.ts` env var names

**File:** `src/utils/common-methods.ts` (lines 37-39)

Update `initProp()` to prefer `NAVIGATOR_*` env vars:
```typescript
username_automation: process.env.NAVIGATOR_USERNAME || process.env.USERNAME_AUTOMATION || 'test_user',
password_automation: process.env.NAVIGATOR_PASSWORD || process.env.PASSWORD_AUTOMATION || 'test_password',
mfa_secret: process.env.NAVIGATOR_MFA_SECRET || process.env.MFA_SECRET,
```

---

## Task 10: Update documentation

| File | Changes |
|------|---------|
| `docs/REQUIREMENTS.md` (lines 43, 108-113) | Replace vault references with "stored in .env files" |
| `docs/read_only_docs/ARCHITECTURE.md` (lines 34, 140-142) | Remove security/vault section, update directory tree |
| `specs_planning/_internal/agent-mistakes.md` (line 148) | Update GEN-004: "vault + CredentialLoader" → "CredentialLoader + env" |

---

## Task 11: Update scripts and pending plans

| File | Changes |
|------|---------|
| `scripts/client-package.ts` (lines 225-228, 249-253, 271, 289, 298) | Remove vault gitignore entries, vault:init/set instructions, vault:list command, VAULT_PASSPHRASE essential var, config/secrets/ from dir structure |
| `scripts/detect-duplication.ts` (line 21) | Remove "AES-256-GCM vault reference" pattern entry |
| `plans/pending/PLAN_CLIENT_REPO_DELIVERY.md` (lines 75, 99, 148-154, 351, 400, 414) | Update: remove security/vault from COPY_FILES, remove Vault from exports, remove Task 3 vault-manager section, remove VAULT_PASSPHRASE from CI template, update credential references |

---

## Verification

1. `npx tsc --noEmit` — no TypeScript errors after removing vault imports
2. `grep -ri "vault" src/ tests/ config/ scripts/ --include="*.ts" --include="*.env*"` — zero remaining vault references in code/config
3. `npm test -- --project=chrome tests/seed.spec.ts` — credentials load from `.env.development` and auth succeeds
4. Confirm `config/secrets/` and `src/security/` directories are fully removed

---

## Execution Order

```
Batch 1 (foundation):  Tasks 1, 4, 6, 7
Batch 2 (code):        Tasks 2, 5
Batch 3 (callers):     Tasks 3, 9
Batch 4 (docs):        Tasks 8, 10, 11
Batch 5 (verify):      Task 12 (verification)
```

---

## Files Modified (22 total)

**DELETE (5):**
- `src/security/vault.ts`
- `scripts/vault-manager.ts`
- `config/secrets/.vault.enc`
- `src/security/` (directory)
- `config/secrets/` (directory)

**EDIT (17):**
- `config/environments/.env.example`
- `config/environments/.env.development`
- `config/environments/.env.staging`
- `config/environments/.env.production`
- `src/common/credential-loader.ts`
- `src/index.ts`
- `tests/setup/fixtures.ts`
- `tests/setup/global-setup.ts`
- `tests/examples/basic-test-pattern.spec.ts`
- `package.json`
- `.gitignore`
- `CLAUDE.md`
- `src/utils/common-methods.ts`
- `docs/REQUIREMENTS.md`
- `docs/read_only_docs/ARCHITECTURE.md`
- `specs_planning/_internal/agent-mistakes.md`
- `scripts/client-package.ts`
- `scripts/detect-duplication.ts`
- `plans/pending/PLAN_CLIENT_REPO_DELIVERY.md`
