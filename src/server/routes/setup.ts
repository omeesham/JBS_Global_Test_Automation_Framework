/**
 * Client Setup / Onboarding routes (Plan 53E)
 */

import * as crypto from 'crypto';
import type { FastifyInstance } from 'fastify';
import { createPipelineRun, createWorkerTask } from '../db/queries';
import { loadPipelineDefinitionForClient } from '../../orchestrator/orchestrator';

// ── Encryption helpers ──

function getEncryptionKey(): Buffer {
  const key = process.env.SETUP_ENCRYPTION_KEY;
  if (!key) throw new Error('SETUP_ENCRYPTION_KEY not configured');
  // Derive 32-byte key from env var
  return crypto.createHash('sha256').update(key).digest();
}

function encryptCredentials(plaintext: string): { iv: string; authTag: string; ciphertext: string } {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return { iv: iv.toString('hex'), authTag, ciphertext };
}

function decryptCredentials(encrypted: { iv: string; authTag: string; ciphertext: string }): string {
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(encrypted.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
  let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');
  return plaintext;
}

export { decryptCredentials };

export function registerSetupRoutes(app: FastifyInstance) {
  // Initiate client setup
  app.post<{ Body: { clientId: string; homeUrl: string; authType?: 'sso' | 'basic'; credentials?: Record<string, string>; maxPages?: number; maxDepth?: number; initiatedBy: string } }>('/api/setup/initiate', async (req, reply) => {
    const { clientId, homeUrl, authType, credentials, maxPages, maxDepth, initiatedBy } = req.body;
    if (!clientId || !homeUrl || !initiatedBy) {
      return reply.code(400).send({ error: 'clientId, homeUrl, and initiatedBy are required' });
    }

    const pool = app.db;

    // Encrypt credentials if provided
    let authConfig: Record<string, unknown> | null = null;
    if (credentials && authType) {
      try {
        const encrypted = encryptCredentials(JSON.stringify(credentials));
        authConfig = { ...encrypted, type: authType };
      } catch (err) {
        return reply.code(500).send({ error: (err as Error).message });
      }
    }

    const setupConfig = {
      maxPages: maxPages || 100,
      maxDepth: maxDepth || 3,
      timeout: 600,
    };

    // Create discovery pipeline run
    const run = await createPipelineRun(pool, {
      feature: 'discovery',
      module: 'setup',
      intent: `Discover pages for ${homeUrl}`,
      clientId,
      targetUrl: homeUrl,
    });

    // Upsert client_setup record
    await pool.query(
      `INSERT INTO client_setup (client_id, status, home_url, auth_config, setup_config, setup_run_id, initiated_by)
       VALUES ($1, 'discovering', $2, $3, $4, $5, $6)
       ON CONFLICT (client_id) DO UPDATE SET
         status = 'discovering', home_url = $2, auth_config = COALESCE($3, client_setup.auth_config),
         setup_config = $4, setup_run_id = $5, initiated_by = $6`,
      [clientId, homeUrl, authConfig ? JSON.stringify(authConfig) : null, JSON.stringify(setupConfig), run.id, initiatedBy]
    );

    // Queue discovery worker task
    const definition = await loadPipelineDefinitionForClient(pool, clientId);
    const reqStage = definition.stages.find(s => s.id === 'requirements' && s.enabled);
    if (!reqStage) {
      return reply.code(500).send({ error: 'Requirements stage not found or disabled in pipeline definition. Cannot run discovery.' });
    }
    {
      await createWorkerTask(pool, run.id, 'requirements', [
        `Pipeline Stage: Discovery (setup)`,
        `Feature: discovery`,
        `Module: setup`,
        `Intent: Discover all pages and build page tree for ${homeUrl}`,
        `Target URL: ${homeUrl}`,
        `Max Pages: ${setupConfig.maxPages}`,
        `Max Depth: ${setupConfig.maxDepth}`,
        '',
        reqStage.description,
      ].join('\n'), { feature: 'discovery', module: 'setup', intent: `Discover pages for ${homeUrl}`, targetUrl: homeUrl, setupConfig }, clientId);
    }

    reply.code(201).send({ setupId: run.id, status: 'discovering' });
  });

  // Check setup status
  app.get<{ Querystring: { clientId: string } }>('/api/setup/status', async (req, reply) => {
    const { clientId } = req.query;
    if (!clientId) return reply.code(400).send({ error: 'clientId is required' });

    const { rows } = await app.db.query(
      'SELECT * FROM client_setup WHERE client_id = $1',
      [clientId]
    );
    if (!rows[0]) return reply.send({ status: 'not_started' });
    reply.send(rows[0]);
  });

  // Store/update credentials
  app.post<{ Body: { clientId: string; authType: 'sso' | 'basic'; credentials: Record<string, string> } }>('/api/setup/credentials', async (req, reply) => {
    const { clientId, authType, credentials } = req.body;
    if (!clientId || !authType || !credentials) {
      return reply.code(400).send({ error: 'clientId, authType, and credentials are required' });
    }

    try {
      const encrypted = encryptCredentials(JSON.stringify(credentials));
      const authConfig = { ...encrypted, type: authType };
      await app.db.query(
        'UPDATE client_setup SET auth_config = $1 WHERE client_id = $2',
        [JSON.stringify(authConfig), clientId]
      );
      reply.send({ stored: true });
    } catch (err) {
      reply.code(500).send({ error: (err as Error).message });
    }
  });

  // Re-discover pages
  app.post<{ Body: { clientId: string; initiatedBy: string } }>('/api/setup/rediscover', async (req, reply) => {
    const { clientId, initiatedBy } = req.body;
    if (!clientId || !initiatedBy) {
      return reply.code(400).send({ error: 'clientId and initiatedBy are required' });
    }

    const pool = app.db;
    const { rows } = await pool.query('SELECT * FROM client_setup WHERE client_id = $1', [clientId]);
    if (!rows[0]) return reply.code(404).send({ error: 'No setup found for this client' });

    const setup = rows[0] as { home_url: string; setup_config: Record<string, unknown> };

    const run = await createPipelineRun(pool, {
      feature: 'rediscovery',
      module: 'setup',
      intent: `Re-discover pages for ${setup.home_url}`,
      clientId,
      targetUrl: setup.home_url,
    });

    await pool.query(
      'UPDATE client_setup SET status = $1, setup_run_id = $2, initiated_by = $3 WHERE client_id = $4',
      ['discovering', run.id, initiatedBy, clientId]
    );

    reply.send({ setupId: run.id, status: 'discovering' });
  });
}
