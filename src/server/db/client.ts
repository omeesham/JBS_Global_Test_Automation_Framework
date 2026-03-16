/**
 * Database client — works with both standard PostgreSQL and Neon.
 * Uses `pg` (node-postgres) for maximum compatibility.
 * Neon supports the standard PG wire protocol, so this works out of the box.
 */

import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const config: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

    // Neon and most cloud PG providers require SSL
    if (process.env.DATABASE_URL?.includes('neon.tech') || process.env.NODE_ENV === 'production') {
      config.ssl = { rejectUnauthorized: false };
    }

    pool = new Pool(config);

    pool.on('error', (err: Error) => {
      console.error('[DB] Unexpected pool error:', err.message);
    });
  }
  return pool;
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = await getPool().connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (err) {
    console.error('[DB] Connection test failed:', (err as Error).message);
    return false;
  }
}

export async function initializeSchema(): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');

  // ts-node: __dirname = src/server/db/ (schema.sql is co-located)
  // tsc build: __dirname = dist/server/db/ (schema.sql not copied by tsc)
  // Fallback resolves from dist/ back to src/ for compiled builds
  let schemaPath = path.join(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    schemaPath = path.join(__dirname, '../../../src/server/db/schema.sql');
  }
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`schema.sql not found at ${path.join(__dirname, 'schema.sql')} or ${schemaPath}`);
  }

  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const client = await getPool().connect();
  try {
    await client.query(schema);
    console.log('[DB] Schema initialized successfully');
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
