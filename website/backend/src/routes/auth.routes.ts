import { Router } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { decryptField } from '../utils/crypto.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'intelliqe-dev-secret-change-in-production';

/**
 * POST /api/auth/login
 * Tenant-aware login:
 *   1. Check platform_users (super_admin)
 *   2. If not found, check tenant schemas (client_admin, qa_engineer, data_engineer)
 *
 * Falls back to hardcoded demo users when DB is unavailable (dev convenience).
 */
router.post('/login', async (req, res) => {
  const { username, password: rawPassword } = req.body;
  if (!username || !rawPassword) {
    return res.status(400).json({ success: false, error: 'Username and password required' });
  }

  const password = decryptField(rawPassword);

  try {
    // 1. Try platform_users (super_admin)
    const platformResult = await pool.query(
      'SELECT id, username, password_hash, full_name, role FROM "JBSTestOpsAI".platform_users WHERE username = $1',
      [username]
    );

    if (platformResult.rows.length > 0) {
      const user = platformResult.rows[0];
      // Try bcrypt comparison if available, fall back to plain text for demo
      let match = false;
      try {
        const bcrypt = await (import('bcrypt' as string) as Promise<any>);
        match = await bcrypt.compare(password, user.password_hash);
      } catch {
        // bcrypt not installed — plain text comparison for dev
        match = password === user.password_hash;
      }

      if (match) {
        const payload = { userId: user.id, username: user.username, role: user.role, clientId: null, schema: 'JBSTestOpsAI' };
        return res.json({
          success: true,
          user: {
            username: user.username,
            role: user.role,
            displayName: user.full_name || user.username,
            clientId: null,
            schema: 'JBSTestOpsAI',
          },
          token: jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }),
        });
      }
    }

    // 2. Check tenant schemas
    const clients = await pool.query('SELECT id, slug, db_schema FROM "JBSTestOpsAI".clients');

    for (const client of clients.rows) {
      try {
        const tenantResult = await pool.query(
          `SELECT id, username, password_hash, full_name, role FROM "${client.db_schema}".users WHERE username = $1 AND is_active = true`,
          [username]
        );

        if (tenantResult.rows.length > 0) {
          const user = tenantResult.rows[0];
          let match = false;
          try {
            const bcrypt = await (import('bcrypt' as string) as Promise<any>);
            match = await bcrypt.compare(password, user.password_hash);
          } catch {
            match = password === user.password_hash;
          }

          if (match) {
            const payload = { userId: user.id, username: user.username, role: user.role, clientId: client.id, schema: client.db_schema };
            return res.json({
              success: true,
              user: {
                username: user.username,
                role: user.role,
                displayName: user.full_name || user.username,
                clientId: client.id,
                schema: client.db_schema,
              },
              token: jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }),
            });
          }
        }
      } catch {
        // Schema might not exist yet — skip
      }
    }

    // 3. Fall back to hardcoded demo users (dev convenience when DB is empty)
    const DEMO_USERS: Record<string, { password: string; role: string; displayName: string }> = {
      superadmin:  { password: 'SuperAdmin@2026', role: 'super_admin',  displayName: 'Super Admin' },
      encoreadmin: { password: 'EncoreAdmin@2026', role: 'client_admin', displayName: 'Encore Admin' },
      encoreqa:    { password: 'EncoreQA@2026',    role: 'qa_engineer',  displayName: 'QA Engineer' },
      encoredata:  { password: 'EncoreData@2026',  role: 'data_engineer', displayName: 'Data Engineer' },
    };

    const demo = DEMO_USERS[username];
    if (demo && demo.password === password) {
      let demoClientId: string | null = null;
      let demoSchema = 'JBSTestOpsAI';
      if (demo.role !== 'super_admin') {
        const clientRow = await pool.query(
          'SELECT id, db_schema FROM "JBSTestOpsAI".clients WHERE slug = $1', ['encore-global']
        );
        demoClientId = clientRow.rows[0]?.id ?? null;
        if (!demoClientId) console.warn('[Auth] Demo user has no client — check if migration 001 ran');
        demoSchema = clientRow.rows[0]?.db_schema ?? 'tenant_encore_global';
      }
      const payload = { userId: username, username, role: demo.role, clientId: demoClientId, schema: demoSchema };
      return res.json({
        success: true,
        user: {
          username,
          role: demo.role,
          displayName: demo.displayName,
          clientId: demoClientId,
          schema: demoSchema,
        },
        token: jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }),
      });
    }

    res.status(401).json({ success: false, error: 'Invalid credentials' });
  } catch (err) {
    // DB unavailable — try demo users only
    const DEMO_USERS: Record<string, { password: string; role: string; displayName: string }> = {
      superadmin:  { password: 'SuperAdmin@2026', role: 'super_admin',  displayName: 'Super Admin' },
      encoreadmin: { password: 'EncoreAdmin@2026', role: 'client_admin', displayName: 'Encore Admin' },
      encoreqa:    { password: 'EncoreQA@2026',    role: 'qa_engineer',  displayName: 'QA Engineer' },
      encoredata:  { password: 'EncoreData@2026',  role: 'data_engineer', displayName: 'Data Engineer' },
    };

    const demo = DEMO_USERS[username];
    if (demo && demo.password === password) {
      const demoSchema = demo.role === 'super_admin' ? 'JBSTestOpsAI' : 'tenant_encore_global';
      const payload = { userId: username, username, role: demo.role, clientId: null, schema: demoSchema };
      return res.json({
        success: true,
        user: {
          username,
          role: demo.role,
          displayName: demo.displayName,
          clientId: null,
          schema: demoSchema,
        },
        token: jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }),
      });
    }

    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

export default router;
