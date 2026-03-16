import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  createConversation,
  saveMessage,
  getConversationsByUser,
  getMessagesByConversation,
} from '../services/chat.service.js';
import { chatAsk } from '../services/chatbot.service.js';

const router = Router();

// --- Per-user rate limiting for chat (in-memory, no npm package) ---
const CHAT_RATE_LIMIT = parseInt(process.env.CHAT_RATE_LIMIT || '10', 10); // requests per minute
const CHAT_RATE_WINDOW = 60_000; // 1 minute
const chatRateLimit = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of chatRateLimit) {
    if (now > entry.resetAt) chatRateLimit.delete(key);
  }
}, 5 * 60_000).unref();

function checkChatRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = chatRateLimit.get(userId);
  if (!entry || now > entry.resetAt) {
    chatRateLimit.set(userId, { count: 1, resetAt: now + CHAT_RATE_WINDOW });
    return true;
  }
  if (entry.count >= CHAT_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// POST /api/chat/conversations — Create a new conversation
router.post('/conversations', async (req: Request, res: Response) => {
  try {
    const { username, title } = req.body;
    if (!username) {
      res.status(400).json({ error: 'username is required' });
      return;
    }
    const conversation = await createConversation({ username, title });
    res.json(conversation);
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// POST /api/chat/messages — Save a message
router.post('/messages', async (req: Request, res: Response) => {
  try {
    const { conversationId, role, content, metadata } = req.body;
    if (!conversationId || !role || !content) {
      res.status(400).json({ error: 'conversationId, role, and content are required' });
      return;
    }
    const message = await saveMessage({ conversationId, role, content, metadata });
    res.json(message);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// GET /api/chat/conversations?username=admin — List conversations for a user
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const username = req.query.username as string;
    if (!username) {
      res.status(400).json({ error: 'username query param is required' });
      return;
    }
    const conversations = await getConversationsByUser(username);
    res.json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/chat/conversations/:id/messages — Get messages for a conversation
router.get('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const messages = await getMessagesByConversation(req.params.id as string);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/chat/ask — Tri-model AI chat (haiku routes, sonnet/opus responds)
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { message, conversationId, model, thinkingEnabled, websiteContext } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'message is required' });
      return;
    }
    if (message.length > 5000) {
      res.status(400).json({ error: 'Message too long (max 5000 characters)' });
      return;
    }

    // Rate limit check — per user, before spawning expensive Claude CLI
    const userId = req.userId || 'unknown';
    if (!checkChatRateLimit(userId)) {
      res.set('Retry-After', '60');
      res.status(429).json({
        error: `Rate limit exceeded (${CHAT_RATE_LIMIT} requests per minute). Please wait.`,
        retryAfter: 60,
      });
      return;
    }

    const response = await chatAsk({
      message, conversationId, model, thinkingEnabled, websiteContext,
      userRole: req.userRole || 'qa_engineer',
      userId: req.userId || 'unknown',
      clientId: req.clientId,
      tenantSchema: req.tenantSchema || 'JBSTestOpsAI',
    });

    // Persist messages if conversationId provided
    if (conversationId) {
      try {
        await saveMessage({ conversationId, role: 'user', content: message });
        await saveMessage({ conversationId, role: 'assistant', content: response.text, metadata: { action: response.action, responseType: response.responseType } });
      } catch { /* non-fatal */ }
    }

    res.json(response);
  } catch (err) {
    console.error('Error in /api/chat/ask:', err);
    res.status(500).json({
      text: 'Something went wrong. Please try again.',
      action: 'none',
      responseType: 'text',
      error: true,
    });
  }
});

export default router;
