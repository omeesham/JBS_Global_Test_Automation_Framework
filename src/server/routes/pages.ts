/**
 * Page CRUD routes (Plan 53D)
 */

import type { FastifyInstance } from 'fastify';
import {
  createPage,
  getPage,
  listPages,
  getPageTree,
  updatePage,
  deletePage,
  getPageStageStatuses,
  upsertPageStageStatus,
  getArtifactsByPageId,
  updateArtifactVersioned,
  softDeleteArtifact,
  createArtifactDirect,
} from '../db/queries';
import type { Artifact } from '../../orchestrator/types';
import { broadcastSSE } from './events';

export function registerPageRoutes(app: FastifyInstance) {
  // List pages with stage statuses
  app.get<{ Querystring: { clientId?: string; module?: string } }>('/api/pages', async (req, reply) => {
    const pages = await listPages(app.db, req.query.clientId || undefined);
    if (req.query.module) {
      reply.send(pages.filter(p => p.module === req.query.module));
    } else {
      reply.send(pages);
    }
  });

  // Register a new page
  app.post<{ Body: { client_id?: string; module: string; page_slug: string; display_name: string; target_url?: string; parent_page_id?: string; metadata?: Record<string, unknown> } }>('/api/pages', async (req, reply) => {
    const { module, page_slug, display_name } = req.body;
    if (!module || !page_slug || !display_name) {
      return reply.code(400).send({ error: 'module, page_slug, and display_name are required' });
    }
    const page = await createPage(app.db, req.body);
    reply.code(201).send(page);
  });

  // Page tree structure
  app.get<{ Querystring: { clientId?: string } }>('/api/pages/tree', async (req, reply) => {
    const tree = await getPageTree(app.db, req.query.clientId || undefined);
    reply.send(tree);
  });

  // Page detail + stages + artifacts per stage
  app.get<{ Params: { id: string } }>('/api/pages/:id', async (req, reply) => {
    const page = await getPage(app.db, req.params.id);
    if (!page) return reply.code(404).send({ error: 'Page not found' });

    const [stages, artifacts] = await Promise.all([
      getPageStageStatuses(app.db, page.id),
      getArtifactsByPageId(app.db, page.id),
    ]);

    reply.send({ ...page, stages, artifacts });
  });

  // Update page metadata
  app.put<{ Params: { id: string }; Body: { display_name?: string; target_url?: string; metadata?: Record<string, unknown>; sort_order?: number } }>('/api/pages/:id', async (req, reply) => {
    const updated = await updatePage(app.db, req.params.id, req.body);
    if (!updated) return reply.code(404).send({ error: 'Page not found' });
    reply.send(updated);
  });

  // Delete page (cascades via FK)
  app.delete<{ Params: { id: string } }>('/api/pages/:id', async (req, reply) => {
    const deleted = await deletePage(app.db, req.params.id);
    if (!deleted) return reply.code(404).send({ error: 'Page not found' });
    reply.send({ deleted: true });
  });

  // Stage statuses for a page
  app.get<{ Params: { id: string } }>('/api/pages/:id/stages', async (req, reply) => {
    const stages = await getPageStageStatuses(app.db, req.params.id);
    reply.send(stages);
  });

  // Grant explore-without-reqs
  app.post<{ Params: { id: string }; Body: { permittedBy: string; stageId?: string } }>('/api/pages/:id/permit-explore', async (req, reply) => {
    const { permittedBy, stageId } = req.body;
    if (!permittedBy) return reply.code(400).send({ error: 'permittedBy is required' });
    const stage = await upsertPageStageStatus(app.db, req.params.id, stageId || 'requirements', {
      explore_without_reqs: true,
      explore_permitted_by: permittedBy,
    });
    reply.send(stage);
  });

  // --- Artifact Mutations ---

  // Create artifact directly (for user-supplied requirements, etc.)
  app.post<{ Body: { runId: string; name: string; type: string; content: string; pageId?: string } }>('/api/artifacts', async (req, reply) => {
    const { runId, name, type, content, pageId } = req.body;
    if (!runId || !name || !type || !content) {
      return reply.code(400).send({ error: 'runId, name, type, and content are required' });
    }
    const artifact = await createArtifactDirect(app.db, runId, name, type, content, pageId);
    reply.code(201).send(artifact);
  });

  // Update artifact content (creates version)
  app.put<{ Params: { id: string }; Body: { content: string; editedBy: string } }>('/api/artifacts/:id', async (req, reply) => {
    const { content, editedBy } = req.body;
    if (!content || !editedBy) return reply.code(400).send({ error: 'content and editedBy are required' });
    try {
      const newVersion = await updateArtifactVersioned(app.db, req.params.id, content, editedBy);
      // Emit artifact_updated SSE event
      if (newVersion.run_id) {
        broadcastSSE(newVersion.run_id, {
          type: 'artifact_updated', runId: newVersion.run_id, artifactId: req.params.id,
          action: 'edited', timestamp: new Date().toISOString(), visibility: 'public',
        });
      }
      reply.send(newVersion);
    } catch (err) {
      reply.code(404).send({ error: (err as Error).message });
    }
  });

  // Soft-delete artifact
  app.delete<{ Params: { id: string }; Body: { deletedBy: string } }>('/api/artifacts/:id', async (req, reply) => {
    const deleted = await softDeleteArtifact(app.db, req.params.id, req.body.deletedBy || 'unknown');
    if (!deleted) return reply.code(404).send({ error: 'Artifact not found' });
    // Emit artifact_updated SSE event for delete — look up run_id
    const { rows: [art] } = await app.db.query<{ run_id: string }>('SELECT run_id FROM artifacts WHERE id = $1', [req.params.id]);
    if (art?.run_id) {
      broadcastSSE(art.run_id, {
        type: 'artifact_updated', runId: art.run_id, artifactId: req.params.id,
        action: 'deleted', timestamp: new Date().toISOString(), visibility: 'public',
      });
    }
    reply.send({ deleted: true });
  });

  // Artifact version history
  app.get<{ Params: { id: string } }>('/api/artifacts/:id/versions', async (req, reply) => {
    // Walk the replaced_by chain backwards to find all versions
    const versions: Artifact[] = [];
    let currentId: string | null = req.params.id;

    // Find the root (oldest version) first by walking back — with cycle detection
    const findRoot = async (id: string, visited = new Set<string>()): Promise<string> => {
      if (visited.has(id) || visited.size > 100) return id;
      visited.add(id);
      const { rows } = await app.db.query<{ id: string }>('SELECT id FROM artifacts WHERE replaced_by = $1', [id]);
      if (rows[0]) return findRoot(rows[0].id, visited);
      return id;
    };

    const rootId = await findRoot(req.params.id);

    // Now walk forward from root
    currentId = rootId;
    while (currentId) {
      const result: { rows: Artifact[] } = await app.db.query<Artifact>('SELECT * FROM artifacts WHERE id = $1', [currentId]);
      const row: Artifact | undefined = result.rows[0];
      if (!row) break;
      versions.push(row);
      currentId = row.replaced_by;
    }

    reply.send(versions);
  });
}
