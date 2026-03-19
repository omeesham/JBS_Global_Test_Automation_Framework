# PLAN_32: Schema Foundation (RUNS FIRST)

**Status**: Pending
**Dependencies**: None — this runs before everything else
**Execution order**: Phase 0 (foundation)

---

## Why This Exists

Plans 34 and 38 both need the clients table and tenant schema. Creating them early eliminates FK violations and users-table collisions. This is the foundation everything else builds on.

**Key architectural decision**: There is NO intermediate `JBSTestOpsAI.users` table. Users go directly into tenant schemas from day one:
- Super admins → `JBSTestOpsAI.platform_users`
- Everyone else → `tenant_{schema}.users`

---

## What This Plan Creates

### 1. Shared Admin Schema (JBSTestOpsAI)

```sql
-- Admin-level tables (platform-wide)
CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  db_schema VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  plan VARCHAR(50) DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".platform_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  email VARCHAR(200),
  role VARCHAR(50) DEFAULT 'super_admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".platform_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".custom_solution_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES "JBSTestOpsAI".clients(id),
  website_id UUID NOT NULL,
  requirements TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_review',
  reviewed_by UUID REFERENCES "JBSTestOpsAI".platform_users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".website_runs (
  website_id UUID NOT NULL,
  run_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES "JBSTestOpsAI".clients(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (website_id, run_id)
);
```

### 2. Tenant Schema Template (applied when creating any new client)

```sql
-- Per-client tables (fully isolated)
CREATE TABLE IF NOT EXISTS "{schema}".users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  email VARCHAR(200),
  role VARCHAR(50) DEFAULT 'qa_engineer',
  preferred_model VARCHAR(20) DEFAULT 'sonnet',
  thinking_enabled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "{schema}".websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  base_url TEXT NOT NULL,
  target_url TEXT,
  auth_type VARCHAR(50),
  auth_config JSONB DEFAULT '{}',
  app_framework VARCHAR(50),
  description TEXT,
  config JSONB DEFAULT '{}',
  enabled_services JSONB DEFAULT '["web"]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "{schema}".chat_conversations (...);
CREATE TABLE IF NOT EXISTS "{schema}".chat_messages (...);
CREATE TABLE IF NOT EXISTS "{schema}".test_cases (...);
CREATE TABLE IF NOT EXISTS "{schema}".jira_connections (...);
```

### 3. Seed Encore as First Client

```sql
INSERT INTO "JBSTestOpsAI".clients (name, slug, db_schema, plan)
  VALUES ('Encore Global', 'encore-global', 'tenant_encore_global', 'enterprise');

CREATE SCHEMA IF NOT EXISTS "tenant_encore_global";
-- Run tenant template migration for tenant_encore_global

INSERT INTO "tenant_encore_global".websites (name, slug, base_url, target_url, auth_type, app_framework, description, config, enabled_services)
VALUES (
  'Navigator4', 'navigator4',
  'https://cloudapps-e2e.encoreglobal.com/navigator/',
  'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/home',
  'microsoft_sso', 'radix',
  'Cloud-based hotel & resort management platform',
  '{"defaultOffice": "1604", "officeName": "The Parker Palm Springs", "modules": ["locations", "currency", "pricing", "local-info"]}',
  '["web"]'
);

INSERT INTO "tenant_encore_global".users (username, password_hash, full_name, role) VALUES
  ('encoreadmin', '$2b$...', 'Encore Admin', 'client_admin'),
  ('encoreqa', '$2b$...', 'QA Engineer', 'qa_engineer'),
  ('encoredata', '$2b$...', 'Data Engineer', 'data_engineer');

INSERT INTO "JBSTestOpsAI".platform_users (username, password_hash, full_name, role)
  VALUES ('superadmin', '$2b$...', 'JBS Super Admin', 'super_admin');

INSERT INTO "JBSTestOpsAI".platform_settings (key, value) VALUES
  ('product_name', '"IntelliQE"'),
  ('cost_visibility', '{"default": "admin_only", "configurable_per_client": true}'),
  ('default_model', '"sonnet"');
```

### 4. Schema Provisioning Function (reusable for future clients)

```typescript
// website/backend/src/services/tenant.service.ts
async function provisionTenantSchema(clientSlug: string): Promise<void> {
  const schema = `tenant_${clientSlug.replace(/-/g, '_')}`;
  await db.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  // Run tenant template SQL with schema substitution
  // Return schema name
}
```

---

## Why This Solves the FK Problem

- `clients` table exists BEFORE Plan 34 needs it
- `platform_users` exists BEFORE Plan 34 seeds super_admin
- Tenant schemas exist BEFORE Plan 34's auth upgrade queries them
- No intermediate `JBSTestOpsAI.users` table — users go directly into tenant schemas
- Login route in Plan 34 knows: super_admin → query `platform_users`, everyone else → query `tenant_{schema}.users`

---

## Files to Create

- `website/backend/src/services/tenant.service.ts` (schema provisioning + template)
- `website/backend/src/db/migrations/001_schema_foundation.sql` (all SQL above)

## Files to Modify

- `website/backend/src/db.ts` (add schema init on startup, run migration)

---

## Verification

- [ ] `JBSTestOpsAI` schema exists with all 5 tables
- [ ] `tenant_encore_global` schema exists with all tenant tables
- [ ] Navigator4 website seeded with correct config
- [ ] 3 Encore users seeded (encoreadmin, encoreqa, encoredata)
- [ ] 1 super admin seeded in platform_users
- [ ] platform_settings has product_name, cost_visibility, default_model
- [ ] `provisionTenantSchema()` function works for creating new client schemas
- [ ] All tables use `IF NOT EXISTS` (idempotent)
