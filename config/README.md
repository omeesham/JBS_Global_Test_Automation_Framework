# Multi-Environment Configuration System

## Overview

This framework uses `dotenv-flow` to manage environment-specific configuration. The system supports multiple environments (development, staging, production) with local overrides and secure secret management.

## File Hierarchy

`.env` files are loaded in the following order (later files override earlier ones):

```
1. .env                    # Base configuration (committed to Git)
2. .env.local              # Local overrides (NOT in Git)
3. .env.{environment}      # Environment-specific (committed to Git)
4. .env.{environment}.local # Local environment overrides (NOT in Git)
```

### File Descriptions

- **`.env.example`** - Template showing all available configuration options. Copy this to create new `.env` files.
- **`.env.development`** - Local development settings (localhost, verbose logging, no retries)
- **`.env.staging`** - Staging environment settings (placeholders for secrets)
- **`.env.production`** - Production settings (placeholders for secrets)
- **`.env.local`** - Your local overrides (create this yourself, NOT committed)

## Environment Detection

The environment is determined by (in order):

1. `CI_ENV` environment variable (set by CI platforms)
2. `NODE_ENV` environment variable (standard Node.js)
3. Defaults to `development` if neither is set

Valid environments: `development`, `staging`, `production`, `test`

## Usage

### Basic Import

```typescript
import { config } from './config/env';

// Access typed configuration
const baseUrl = config.baseUrl;
const adminUser = config.credentials.admin.username;
const dbHost = config.database.host;
```

### In Playwright Config

```typescript
import { config } from './config/env';

export default defineConfig({
  use: {
    baseURL: config.baseUrl,
    actionTimeout: config.timeouts.action,
  },
  timeout: config.timeouts.default,
});
```

### In Tests

```typescript
import { config } from '@/config/env';

test('login with admin', async ({ page }) => {
  await page.goto(config.baseUrl);
  await loginPage.login(
    config.credentials.admin.username,
    config.credentials.admin.password
  );
});
```

### Accessing Database Config

```typescript
// Database adapter uses process.env directly for flexibility
const dbAdapter = new DbAdapter();
const result = await dbAdapter.load({ 
  query: 'SELECT * FROM users'
});
// Automatically uses DB_HOST, DB_USER, DB_PASSWORD, DB_NAME from env
```

## Configuration Options

### Application URLs

- `BASE_URL` - Main application URL
- `API_BASE_URL` - API endpoint URL
- `HOME_URL` - Home page URL (legacy)

### Timeouts (milliseconds)

- `TIMEOUT_DEFAULT` - Default timeout (30000ms = 30s)
- `TIMEOUT_NAVIGATION` - Page navigation timeout (60000ms)
- `TIMEOUT_ACTION` - Action timeout (clicks, typing) (15000ms)
- `TIMEOUT_ASSERTION` - Assertion timeout (5000ms)

### Database

- `DB_HOST` - Database hostname/IP
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password ⚠️
- `DB_NAME` - Database name
- `DB_TYPE` - Database type (postgresql, mysql, mssql)

### AWS S3

- `AWS_REGION` - AWS region (e.g., us-east-1)
- `AWS_ACCESS_KEY_ID` - AWS access key ⚠️
- `AWS_SECRET_ACCESS_KEY` - AWS secret key ⚠️
- `AWS_SESSION_TOKEN` - Session token (optional)
- `S3_BUCKET` - S3 bucket name

### Test Credentials

- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - Admin user ⚠️
- `USER_USERNAME` / `USER_PASSWORD` - Standard user ⚠️

### Feature Flags

- `ENABLE_TRACING` - Enable Playwright traces (true/false)
- `ENABLE_VIDEO` - Record test videos (true/false)
- `ENABLE_SCREENSHOTS` - Capture screenshots (true/false)
- `ENABLE_API_MOCKING` - Enable API mocking (true/false)

### Retry Configuration

- `RETRY_COUNT` - Number of retries for failed tests
- `MAX_FAILURES` - Maximum failures before stopping

## Local Development Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit .env.local with your settings:**
   ```bash
   # .env.local (NOT committed to Git)
   BASE_URL=http://localhost:3000
   DB_PASSWORD=my_local_password
   OPENAI_API_KEY=sk-your-key-here
   ```

3. **The framework will automatically load it:**
   ```
   .env.development  →  .env.local  →  config/env.ts
   ```

## CI/CD Setup

### GitHub Actions

```yaml
env:
  CI_ENV: staging
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
```

### Jenkins

```groovy
environment {
  CI_ENV = 'staging'
  DB_PASSWORD = credentials('db-password')
  AWS_ACCESS_KEY_ID = credentials('aws-access-key')
  AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
}
```

### Azure Pipelines

```yaml
variables:
  - name: CI_ENV
    value: 'staging'
  - group: 'staging-secrets'  # Contains DB_PASSWORD, AWS keys, etc.
```

## Security Best Practices

### ✅ DO:

- Commit `.env.example`, `.env.development`, `.env.staging`, `.env.production`
- Use placeholders (`***SET_IN_CI_SECRETS***`) for sensitive values in committed files
- Store actual secrets in CI platform (GitHub Secrets, Jenkins Credentials, etc.)
- Create `.env.local` for your personal development overrides
- Review `.gitignore` to ensure `.env.local` and `.env.*.local` are excluded

### ❌ DON'T:

- Commit `.env.local` or `.env.*.local` files
- Put real passwords or API keys in committed `.env` files
- Share credentials via Slack, email, or other insecure channels
- Use production credentials in development/staging environments

## Troubleshooting

### Missing Environment Variables

When env vars are missing, `config/env.ts` will:

1. Log a warning: `⚠️  Missing env var: DB_PASSWORD, using default: ***`
2. Use the default value specified in `config/env.ts`
3. Adapters enter "stub mode" and return empty data instead of failing

### Environment Not Detected

```bash
# Check current environment:
node -e "console.log(process.env.CI_ENV || process.env.NODE_ENV || 'development')"

# Explicitly set environment:
export CI_ENV=staging  # Unix/macOS
$env:CI_ENV="staging"  # PowerShell
```

### Adapter Stub Mode

If adapters return empty data:

1. Check `artifacts/adapter-warnings.log` for missing credentials
2. Set required env vars:
   ```bash
   # For database:
   DB_HOST=localhost
   DB_USER=myuser
   DB_PASSWORD=mypassword
   DB_NAME=mydb
   
   # For S3:
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   ```

## Type Safety

All configuration is fully typed via the `IConfig` interface:

```typescript
interface IConfig {
  environment: 'development' | 'staging' | 'production' | 'test';
  baseUrl: string;
  timeouts: { default: number; navigation: number; ... };
  database: { host: string; port: number; ... };
  // ... full type definitions in config/env.ts
}
```

TypeScript will catch typos and invalid config access at compile time.

## Extension

To add new configuration options:

1. **Update `.env.example`:**
   ```bash
   # Custom configuration
   MY_CUSTOM_VALUE=default_value
   ```

2. **Add to `IConfig` interface in `config/env.ts`:**
   ```typescript
   export interface IConfig {
     // ... existing props
     myCustomValue: string;
   }
   ```

3. **Add to `config` object in `config/env.ts`:**
   ```typescript
   export const config: Readonly<IConfig> = Object.freeze({
     // ... existing values
     myCustomValue: getRequiredEnvVar('MY_CUSTOM_VALUE', 'default')
   });
   ```

4. **Use in tests:**
   ```typescript
   import { config } from '@/config/env';
   console.log(config.myCustomValue);
   ```

## Migration from Old System

If migrating from simple `dotenv`:

1. Install `dotenv-flow`: ✅ Already installed
2. Replace `dotenv.config()` with `import { config } from './config/env'`
3. Update `process.env.X` to `config.X` for type safety
4. Create environment-specific `.env.{environment}` files
5. Update CI to set `CI_ENV` variable

## Related Files

- `config/env.ts` - Main configuration module
- `src/data/adapters/dbAdapter.ts` - Uses DB config
- `src/data/adapters/s3Adapter.ts` - Uses S3 config
- `playwright.config.ts` - Should import config for URLs and timeouts
- `.gitignore` - Excludes `.env.local` and `.env.*.local`
