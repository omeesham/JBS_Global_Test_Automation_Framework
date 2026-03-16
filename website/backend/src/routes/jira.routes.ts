import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  testConnection,
  getStories,
  getStory,
  getCredsForUser,
  saveCredsForUser,
  deleteCredsForUser,
  getConnectionStatus,
} from '../services/jira.service.js';
import { decryptField, maskSecret } from '../utils/crypto.js';

const router = Router();

// POST /api/jira/connect — Connect to JIRA and save credentials
router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { username, baseUrl, email, apiToken: rawApiToken } = req.body;
    // Decrypt the encrypted apiToken from the client
    const apiToken = decryptField(rawApiToken);

    if (!username || !baseUrl || !email || !apiToken) {
      res.status(400).json({ error: 'username, baseUrl, email, and apiToken are required' });
      return;
    }

    const normalizedUrl = baseUrl.trim().replace(/\/$/, '');
    const fullUrl = /^https?:\/\//i.test(normalizedUrl) ? normalizedUrl : `https://${normalizedUrl}`;
    const authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`;

    const creds = { baseUrl: fullUrl, authHeader };

    // Test connection first
    const me = await testConnection(creds);

    // Save to database
    await saveCredsForUser(username, fullUrl, authHeader, me.displayName);

    // Log success without exposing secrets
    console.log(`JIRA connected: user=${username}, url=${normalizedUrl}, jiraUser=${me.displayName}`);

    res.json({ ok: true, displayName: me.displayName });
  } catch (err: any) {
    // Surface a useful error without exposing credentials
    let safeMsg = 'Failed to connect to JIRA';
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      safeMsg = 'Authentication failed — check your email and API token';
    } else if (err?.response?.data?.errorMessages?.[0]) {
      safeMsg = err.response.data.errorMessages[0];
    } else if (err?.response?.data?.message) {
      safeMsg = err.response.data.message;
    } else if (err?.code === 'ENOTFOUND' || err?.code === 'ERR_BAD_REQUEST') {
      safeMsg = `Cannot reach JIRA server — check the URL (${err.code})`;
    } else if (err?.code) {
      safeMsg = `Connection error: ${err.code}`;
    } else if (err?.message && !err?.message.includes('apiToken') && !err?.message.includes('auth')) {
      safeMsg = err.message;
    }
    console.error(`JIRA connect error: ${safeMsg}`);
    res.status(status === 401 || status === 403 ? status : 500).json({ error: safeMsg });
  }
});

// GET /api/jira/status?username=X — Check connection status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const username = req.query.username as string;
    if (!username) { res.status(400).json({ error: 'username is required' }); return; }
    const status = await getConnectionStatus(username);
    // Never expose authHeader in the response
    res.json({
      connected: status.connected,
      jiraUrl: status.jiraUrl,
      displayName: status.displayName,
      connectedAt: status.connectedAt,
    });
  } catch (err: any) {
    console.error('JIRA status error:', err.message);
    res.status(500).json({ error: 'Failed to check JIRA status' });
  }
});

// GET /api/jira/stories?username=X — List user stories
router.get('/stories', async (req: Request, res: Response) => {
  try {
    const username = req.query.username as string;
    if (!username) { res.status(400).json({ error: 'username is required' }); return; }

    const creds = await getCredsForUser(username);
    if (!creds) { res.status(400).json({ error: 'Not connected to JIRA. Connect first.' }); return; }

    const stories = await getStories(creds);
    res.json(stories);
  } catch (err: any) {
    const status = err?.response?.status;
    let safeMsg = 'Failed to fetch stories';
    if (status === 401 || status === 403) {
      safeMsg = 'JIRA authentication expired — please reconnect';
    } else if (err?.response?.data?.errorMessages?.[0]) {
      safeMsg = err.response.data.errorMessages[0];
    } else if (err?.code === 'ENOTFOUND') {
      safeMsg = 'Cannot reach JIRA server';
    } else if (err?.message && !err?.message.includes('auth')) {
      safeMsg = `JIRA error: ${err.message}`;
    }
    console.error('JIRA stories error:', safeMsg);
    res.status(status || 500).json({ error: safeMsg });
  }
});

// GET /api/jira/story/:key?username=X — Get story details
router.get('/story/:key', async (req: Request, res: Response) => {
  try {
    const username = req.query.username as string;
    const key = req.params.key as string;
    if (!username) { res.status(400).json({ error: 'username is required' }); return; }

    const creds = await getCredsForUser(username);
    if (!creds) { res.status(400).json({ error: 'Not connected to JIRA' }); return; }

    const details = await getStory(creds, key);
    res.json(details);
  } catch (err: any) {
    console.error(`JIRA story detail error [${req.params.key}]:`, err.message || 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch story details' });
  }
});

// DELETE /api/jira/disconnect?username=X — Remove JIRA connection
router.delete('/disconnect', async (req: Request, res: Response) => {
  try {
    const username = req.query.username as string;
    if (!username) { res.status(400).json({ error: 'username is required' }); return; }
    await deleteCredsForUser(username);
    console.log(`JIRA disconnected for user: ${username}`);
    res.json({ ok: true });
  } catch (err: any) {
    console.error('JIRA disconnect error:', err.message);
    res.status(500).json({ error: 'Failed to disconnect JIRA' });
  }
});

export default router;
