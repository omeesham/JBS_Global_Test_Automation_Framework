import pool from '../db.js';

export interface CreateConversationParams {
  username: string;
  title?: string;
}

export interface SaveMessageParams {
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
}

export async function createConversation(params: CreateConversationParams) {
  const { rows } = await pool.query(
    `INSERT INTO "JBSTestOpsAI".conversations (username, title) VALUES ($1, $2) RETURNING id, created_at`,
    [params.username, params.title || null]
  );
  return { id: rows[0].id, createdAt: rows[0].created_at };
}

export async function saveMessage(params: SaveMessageParams) {
  const { rows } = await pool.query(
    `INSERT INTO "JBSTestOpsAI".messages (conversation_id, role, content, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING id, created_at`,
    [params.conversationId, params.role, params.content, params.metadata ? JSON.stringify(params.metadata) : null]
  );
  // Update the conversation's updated_at timestamp
  await pool.query(
    `UPDATE "JBSTestOpsAI".conversations SET updated_at = NOW() WHERE id = $1`,
    [params.conversationId]
  );
  return { id: rows[0].id, createdAt: rows[0].created_at };
}

export async function getConversationsByUser(username: string) {
  const { rows } = await pool.query(
    `SELECT id, username, title, created_at, updated_at
     FROM "JBSTestOpsAI".conversations
     WHERE username = $1
     ORDER BY updated_at DESC
     LIMIT 50`,
    [username]
  );
  return rows;
}

export async function getMessagesByConversation(conversationId: string) {
  const { rows } = await pool.query(
    `SELECT id, role, content, metadata, created_at
     FROM "JBSTestOpsAI".messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId]
  );
  return rows;
}
