import type { FastifyInstance } from 'fastify';
import { testConnection } from '../db/client';
import { isWorkerConnected } from '../db/queries';

const startTime = Date.now();

export function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', async (_req, reply) => {
    const db = await testConnection();
    const worker = isWorkerConnected();
    const status = db ? (worker ? 'ok' : 'degraded') : 'down';

    reply.code(status === 'down' ? 503 : 200).send({
      status,
      db,
      worker,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    });
  });
}
