import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { SSEEvent } from '../../orchestrator/types';

// ── Role-aware SSE connection model ──
// Each connection carries a role so we can filter admin-only events server-side.
// The website backend proxy passes ?role=admin (validated via JWT upstream).
// Direct Encore connections default to 'user' unless authenticated via worker secret.

type SSERole = 'admin' | 'user';

interface SSEConnection {
  reply: FastifyReply;
  role: SSERole;
}

// In-memory SSE connections (keyed by runId)
// Phase 1 replaces this with Redis pub/sub for cross-process support
const sseConnections = new Map<string, Set<SSEConnection>>();

export function broadcastSSE(runId: string, event: SSEEvent): void {
  const connections = sseConnections.get(runId);
  if (!connections) return;

  const isAdminOnly = event.visibility === 'admin';

  for (const conn of connections) {
    // Skip admin-only events for non-admin connections
    if (isAdminOnly && conn.role !== 'admin') continue;

    try {
      // Strip visibility field before sending — clients don't need it
      const { visibility: _vis, ...clientEvent } = event as SSEEvent & { visibility?: string };
      const data = `data: ${JSON.stringify(clientEvent)}\n\n`;
      conn.reply.raw.write(data);
    } catch {
      // Connection closed, will be cleaned up
      connections.delete(conn);
    }
  }
}

export function registerEventsRoutes(app: FastifyInstance) {
  app.get<{ Params: { runId: string }; Querystring: { role?: string; secret?: string } }>(
    '/api/events/:runId',
    async (
      req: FastifyRequest<{ Params: { runId: string }; Querystring: { role?: string; secret?: string } }>,
      reply: FastifyReply,
    ) => {
      const { runId } = req.params;

      // Resolve connection role:
      // - Website backend proxy passes ?role=admin&secret=XXX (JWT validated upstream)
      // - Direct connections with valid worker secret get admin role
      // - Everything else defaults to 'user' (public events only)
      // SECURITY: role=admin REQUIRES valid worker secret. Without it, always 'user'.
      const WORKER_SECRET = process.env.WORKER_SECRET || 'dev-secret';
      let role: SSERole = 'user';
      if (req.query.role === 'admin' && req.query.secret === WORKER_SECRET) {
        role = 'admin';
      }

      // SSE headers — resolve CORS against allowlist (multi-origin safe)
      const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim());
      const requestOrigin = req.headers.origin || '';
      const corsOrigin = allowedOrigins.includes('*')
        ? '*'
        : allowedOrigins.includes(requestOrigin)
          ? requestOrigin
          : allowedOrigins[0]; // fallback to first allowed origin

      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': corsOrigin,
      });

      // Register connection with role
      const conn: SSEConnection = { reply, role };
      if (!sseConnections.has(runId)) {
        sseConnections.set(runId, new Set());
      }
      sseConnections.get(runId)!.add(conn);

      // Send initial connected event
      reply.raw.write(`data: ${JSON.stringify({ type: 'connected', runId, role, timestamp: new Date().toISOString() })}\n\n`);

      // Keepalive every 30s
      const keepalive = setInterval(() => {
        try {
          reply.raw.write(': keepalive\n\n');
        } catch {
          clearInterval(keepalive);
        }
      }, 30000);

      // Cleanup on close
      req.raw.on('close', () => {
        clearInterval(keepalive);
        sseConnections.get(runId)?.delete(conn);
        if (sseConnections.get(runId)?.size === 0) {
          sseConnections.delete(runId);
        }
      });
    }
  );
}
