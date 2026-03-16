import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'intelliqe-dev-secret-change-in-production';

declare global {
  namespace Express {
    interface Request {
      tenantSchema?: string;
      clientId?: string;
      userId?: string;
      userRole?: string;
    }
  }
}

/**
 * Middleware: verify JWT from x-auth-token header and resolve tenant schema.
 *
 * JWT payload contains: userId, username, role, clientId, schema
 * Sets on req: tenantSchema, clientId, userId, userRole
 */
export default async function tenantMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Support token from query param (for SSE EventSource which can't set headers)
    const authToken = (req.headers['x-auth-token'] as string) || (req.query.token as string);

    if (!authToken) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verify and decode JWT
    let payload: { userId: string; username: string; role: string; clientId: string | null; schema: string };
    try {
      payload = jwt.verify(authToken, JWT_SECRET) as typeof payload;
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.userRole = payload.role;
    req.userId = payload.username;

    // Super admin can specify any schema via x-tenant-schema header
    if (payload.role === 'super_admin') {
      req.clientId = payload.clientId ?? undefined;
      req.tenantSchema = (req.headers['x-tenant-schema'] as string) || 'JBSTestOpsAI';
      return next();
    }

    const clientId = payload.clientId;

    // Demo/global users may have no clientId but have a schema in their JWT
    if (!clientId) {
      if (payload.schema) {
        req.tenantSchema = payload.schema;
        return next();
      }
      res.status(403).json({ error: 'Missing client identifier' });
      return;
    }

    // Look up the client's schema from DB (or fall back to JWT schema if DB is down)
    try {
      const result = await pool.query(
        'SELECT id, db_schema FROM "JBSTestOpsAI".clients WHERE id = $1',
        [clientId],
      );

      if (result.rows.length === 0) {
        // Client not found in DB — fall back to JWT schema if available
        if (payload.schema) {
          req.clientId = clientId;
          req.tenantSchema = payload.schema;
          return next();
        }
        res.status(403).json({ error: 'Unknown client' });
        return;
      }

      req.clientId = clientId;
      req.tenantSchema = result.rows[0].db_schema;
      next();
    } catch {
      // DB unavailable — fall back to JWT schema
      if (payload.schema) {
        req.clientId = clientId;
        req.tenantSchema = payload.schema;
        return next();
      }
      res.status(500).json({ error: 'Tenant resolution failed (DB unavailable)' });
    }
  } catch (err) {
    console.error('[TenantMiddleware] Error resolving tenant:', err);
    res.status(500).json({ error: 'Tenant resolution failed' });
  }
}
