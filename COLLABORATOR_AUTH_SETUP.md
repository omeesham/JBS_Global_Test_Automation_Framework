# Collaborator Auth + MFA Setup — Agent Prompt

> **What this is**: A step-by-step prompt for your Claude agent to set up Navigator Cloud authentication with Microsoft SSO + MFA. Your agent should execute this top-to-bottom, doing everything it can before asking you for anything.

---

## Phase 1: Diagnostics (Agent Does Alone — No Human Input Needed)

Run these checks in order. Do NOT ask the human anything yet.

### 1.1 Prerequisites

```bash
node -v    # Must be >= 18
npm -v     # Must be present
```

If `node_modules/` doesn't exist:
```bash
npm install
```

If Playwright browsers aren't installed:
```bash
npx playwright install
```

### 1.2 Check Environment File

Check if `config/environments/.env.local` exists:
```bash
ls config/environments/.env.local
```

If it **does NOT exist**, create it:
```bash
cp config/environments/.env.example config/environments/.env.local
```

Then open `config/environments/.env.local` and set a vault passphrase. Pick any passphrase (minimum 8 characters). Example:
```
VAULT_PASSPHRASE=MySecurePass2026!
```

**CRITICAL**: The `VAULT_PASSPHRASE` line must NOT be empty. This is the master key that encrypts/decrypts all credentials.

If `.env.local` already exists, verify `VAULT_PASSPHRASE` has a non-empty value.

### 1.3 Check Vault State

Check if the encrypted vault file exists:
```bash
ls config/secrets/.vault.enc
```

If it exists, check what's stored:
```bash
npm run vault:list
```

You need ALL THREE of these keys:
- `NAVIGATOR_USERNAME`
- `NAVIGATOR_PASSWORD`
- `NAVIGATOR_MFA_SECRET`

If any are missing, note which ones — you'll collect them in Phase 2.

If the vault file does NOT exist, that's fine — it will be auto-created when you store the first secret.

### 1.4 Build Check

The vault CLI imports from compiled files. Make sure the build exists:
```bash
npm run build
```

### 1.5 Try Running the Seed Test

Run the auth smoke test to see the actual error:
```bash
npx playwright test tests/seed.spec.ts --project=chrome
```

Capture the error output. Common errors and what they mean:

| Error Message | What's Wrong |
|--------------|-------------|
| `VAULT_PASSPHRASE environment variable not set` | `.env.local` missing or `VAULT_PASSPHRASE` is empty |
| `Failed to decrypt vault. Check passphrase` | Passphrase in `.env.local` doesn't match what was used to create the vault |
| `Secret not found: NAVIGATOR_USERNAME` | Username not stored in vault yet |
| `Secret not found: NAVIGATOR_PASSWORD` | Password not stored in vault yet |
| Login hangs/times out at TOTP field | `NAVIGATOR_MFA_SECRET` missing or invalid |
| `MFA timeout -- TOTP page did not respond within 15s` | TOTP seed is wrong (invalid Base32 string) |
| `OAuth token request returned 400` or `401` | Password is wrong or account is locked |
| `SSO redirect loop detected` | Account not authorized for Navigator Cloud |

### 1.6 Classify the Problem

Based on diagnostics, you now know what's missing. Proceed to Phase 2 to collect only what's needed from the human.

---

## Phase 2: Collect Credentials From Human

**Ask ONLY for what's missing.** If vault already has a key, don't re-ask for it.

### 2.1 Email (if `NAVIGATOR_USERNAME` missing)

Ask:
> What is your Microsoft email address for Navigator Cloud? (e.g., firstname.lastname@encoreglobal.com)

### 2.2 Password (if `NAVIGATOR_PASSWORD` missing)

Ask:
> What is your Microsoft password? I'll store it encrypted in the vault immediately — it won't be displayed or logged anywhere.

### 2.3 MFA Secret (if `NAVIGATOR_MFA_SECRET` missing)

This is the hardest part. The human needs to extract their TOTP Base32 seed from Microsoft. Give them these EXACT instructions:

---

> **I need your Microsoft MFA secret key (Base32 TOTP seed).**
>
> This is NOT the 6-digit code that changes every 30 seconds on your phone.
> This is the underlying secret key used to GENERATE those codes programmatically.
>
> **How to get it:**
>
> 1. Open a browser and go to: **https://mysignins.microsoft.com/security-info**
> 2. Sign in with your Microsoft account (the same one you use for Navigator Cloud)
> 3. Click **"+ Add sign-in method"**
> 4. Select **"Authenticator app"** from the dropdown, click **Add**
> 5. On the setup screen, click **"I want to use a different authenticator app"**
> 6. Click **"Next"**
> 7. You'll see a QR code. Look for a link that says:
>    **"Can't scan the image?"** or **"I can't scan the barcode"** or **"Enter code manually"**
> 8. Click that link — it will reveal a text string like:
>    `JBSWY3DPEHPK3PXP` (uppercase letters A-Z and digits 2-7, no spaces)
> 9. **Copy that ENTIRE string** and paste it here
>
> **Important notes:**
> - If you already use Microsoft Authenticator on your phone, this adds a SECOND method — it will NOT break your existing phone authenticator
> - If your organization restricts adding authenticator apps, ask your IT admin for help getting the TOTP secret key
> - The string should be 16-32 characters, uppercase letters and digits only
> - If the page shows "Account name" and "Secret key" separately, you only need the **Secret key**

---

If the human says their organization blocks adding new authenticator apps, or they can't find the "Can't scan" link, suggest these alternatives:

1. **Ask IT admin** to provide the TOTP seed for their account
2. **Use a TOTP manager** (like Authy, 1Password, Bitwarden) that can export the secret key
3. **Re-register MFA entirely** — IT admin can reset their MFA, then they register fresh and grab the seed during initial setup

---

## Phase 3: Store Credentials in Vault

Now store everything. The vault auto-creates if it doesn't exist yet.

**IMPORTANT**: If the password contains shell-special characters (`!`, `$`, `` ` ``, `\`), wrap it in **single quotes** to prevent shell interpretation.

```bash
# Store email
npm run vault:set NAVIGATOR_USERNAME "user@domain.com"

# Store password (use single quotes if it has special chars like ! or $)
npm run vault:set NAVIGATOR_PASSWORD 'the_password_here'

# Store MFA Base32 seed
npm run vault:set NAVIGATOR_MFA_SECRET "JBSWY3DPEHPK3PXP"
```

Verify all three are stored:
```bash
npm run vault:list
```

Expected output:
```
   - NAVIGATOR_USERNAME
   - NAVIGATOR_PASSWORD
   - NAVIGATOR_MFA_SECRET
```

---

## Phase 4: Verify

Run the seed test:
```bash
npx playwright test tests/seed.spec.ts --project=chrome
```

**SEED-001 passes** = authentication is fully working. You're done.

If it fails, go to Phase 5.

---

## Phase 5: Troubleshooting

### TOTP Code Rejected / MFA Timeout

The most common MFA issue. Check these in order:

1. **Is the secret valid Base32?** It should only contain `A-Z` and `2-7`. No lowercase, no `0`, `1`, `8`, `9`, no spaces, no dashes.

2. **Is your system clock accurate?** TOTP codes are time-based (30-second windows). If your clock is off by more than 30 seconds, codes will be rejected.
   ```bash
   # Check system time vs actual time
   date
   ```
   If the clock is wrong, sync it.

3. **Is it the right secret?** You may have copied the "account name" instead of the "secret key". The secret key is the long alphanumeric string, NOT your email address.

4. **Try generating a code manually** to verify the secret works:
   ```bash
   node -e "const { authenticator } = require('otplib'); console.log(authenticator.generate('YOUR_SECRET_HERE'));"
   ```
   Compare this 6-digit code with what your phone's authenticator app shows. If they match, the secret is correct. If they don't match, the secret is wrong — re-extract it from Microsoft.

### Wrong Password

If you see OAuth 400/401 errors:
1. Verify the password by logging into Navigator Cloud manually in a browser
2. Check if the account is locked (too many failed attempts)
3. Re-store the correct password: `npm run vault:set NAVIGATOR_PASSWORD 'new_password'`

### Vault Decryption Failure

If `Failed to decrypt vault. Check passphrase`:
- The `VAULT_PASSPHRASE` in `.env.local` doesn't match what was used to create the vault
- **Fix**: Delete the vault and start over:
  ```bash
  rm config/secrets/.vault.enc
  ```
  Then re-run Phase 3 to create a fresh vault with the current passphrase.

### "Continue Now" Button Not Found

The Navigator Cloud sign-in page has a "Continue Now" button before redirecting to Microsoft. If this times out:
- Check `BASE_URL` in `.env.local` — it should be `https://cloudapps-e2e.encoreglobal.com/navigator/`
- Check if the site is accessible: open the URL in a browser
- The site may be down — try again later

### Tests Pass Individually But Fail in Suite

This is NOT an auth issue. Auth works. The problem is test isolation/contamination — a different topic entirely.

---

## Phase 6: Nuclear Reset (Last Resort)

If everything is broken and unclear, start completely fresh:

```bash
# 1. Delete the vault
rm -f config/secrets/.vault.enc

# 2. Recreate .env.local from template
cp config/environments/.env.example config/environments/.env.local
```

Edit `.env.local` and set `VAULT_PASSPHRASE` to a new passphrase (min 8 chars).

Then go back to Phase 2 and collect credentials from the human again.

---

## Quick Reference

### Auth Flow (what happens under the hood)
```
.env.local (VAULT_PASSPHRASE)
  -> Vault decrypts config/secrets/.vault.enc
    -> CredentialLoader reads NAVIGATOR_USERNAME, PASSWORD, MFA_SECRET
      -> LoginPage navigates to Navigator Cloud
        -> Clicks "Continue Now"
          -> Microsoft SSO: email -> password -> TOTP code -> "Stay signed in? Yes"
            -> Redirects back to Navigator Cloud Dashboard
              -> Tests run on authenticated session
```

### Vault Commands Cheat Sheet
```bash
npm run vault:set KEY VALUE    # Store/update a secret
npm run vault:get KEY          # Read a secret (outputs plaintext)
npm run vault:list             # List all secret keys (not values)
npm run vault:info             # Show vault metadata
npm run vault:rotate           # Change vault passphrase
```

### Files That Matter
| File | Purpose | Git-tracked? |
|------|---------|-------------|
| `config/environments/.env.local` | Your local env vars + `VAULT_PASSPHRASE` | NO (gitignored) |
| `config/secrets/.vault.enc` | Encrypted credential store | NO (gitignored) |
| `config/environments/.env.example` | Template to copy from | YES |
| `tests/seed.spec.ts` | Auth smoke test | YES |
| `src/security/vault.ts` | Vault encryption code | YES |
| `src/pages/login.page.ts` | Microsoft SSO login flow | YES |

### Required Secrets
| Vault Key | What It Is | Example |
|-----------|-----------|---------|
| `NAVIGATOR_USERNAME` | Microsoft SSO email | `john.doe@encoreglobal.com` |
| `NAVIGATOR_PASSWORD` | Microsoft password | `MyP@ssw0rd!` |
| `NAVIGATOR_MFA_SECRET` | Base32 TOTP seed | `JBSWY3DPEHPK3PXP` |
