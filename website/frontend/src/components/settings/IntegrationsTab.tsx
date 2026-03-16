import { useState, useEffect, useCallback } from 'react';
import { Link2, Unlink, Loader2, CheckCircle2, AlertCircle, Puzzle } from 'lucide-react';
import { connectJira, getJiraStatus, disconnectJira } from '@/services/api';

interface Props {
  username: string;
}

interface JiraState {
  connected: boolean;
  baseUrl: string;
  email: string;
  loading: boolean;
  error: string | null;
}

export default function IntegrationsTab({ username }: Props) {
  const [jira, setJira] = useState<JiraState>({
    connected: false,
    baseUrl: '',
    email: '',
    loading: true,
    error: null,
  });

  const [form, setForm] = useState({ url: '', email: '', token: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const status = await getJiraStatus(username);
      setJira({
        connected: status.connected,
        baseUrl: status.baseUrl ?? '',
        email: status.email ?? '',
        loading: false,
        error: null,
      });
    } catch {
      setJira((s) => ({ ...s, loading: false, error: 'Could not fetch JIRA status.' }));
    }
  }, [username]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnect = async () => {
    if (!form.url || !form.email || !form.token) return;
    setSubmitting(true);
    setJira((s) => ({ ...s, error: null }));
    try {
      await connectJira(username, form.url, form.email, form.token);
      setForm({ url: '', email: '', token: '' });
      await fetchStatus();
    } catch {
      setJira((s) => ({ ...s, error: 'Failed to connect JIRA. Check your credentials.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    setSubmitting(true);
    try {
      await disconnectJira(username);
      await fetchStatus();
    } catch {
      setJira((s) => ({ ...s, error: 'Failed to disconnect JIRA.' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (jira.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#1E1B4B] mb-1">Integrations</h3>
        <p className="text-sm text-gray-500">Connect external tools to pull requirements automatically.</p>
      </div>

      {/* JIRA Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EDE9FE]">
              <Link2 className="h-5 w-5 text-[#7C3AED]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E1B4B]">JIRA</p>
              <p className="text-xs text-gray-500">Import stories and requirements</p>
            </div>
          </div>
          {jira.connected && (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </span>
          )}
        </div>

        {jira.error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {jira.error}
          </div>
        )}

        {jira.connected ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-[#F5F3FF] p-3 text-sm text-[#1E1B4B] space-y-1">
              <p><span className="font-medium">URL:</span> {jira.baseUrl}</p>
              <p><span className="font-medium">Email:</span> {jira.email}</p>
            </div>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="url"
              placeholder="JIRA URL (e.g. https://company.atlassian.net)"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
            />
            <input
              type="email"
              placeholder="JIRA Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
            />
            <input
              type="password"
              placeholder="API Token"
              value={form.token}
              onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
            />
            <button
              type="button"
              onClick={handleConnect}
              disabled={submitting || !form.url || !form.email || !form.token}
              className="flex items-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white hover:bg-[#6D28D9] disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Connect
            </button>
          </div>
        )}
      </div>

      {/* Coming Soon */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-[#F5F3FF]/50 p-6 text-center">
        <Puzzle className="mx-auto h-8 w-8 text-[#DDD6FE]" />
        <p className="mt-2 text-sm font-medium text-[#1E1B4B]">More integrations coming soon</p>
        <p className="text-xs text-gray-400 mt-1">Confluence, Azure DevOps, GitHub Issues, and more.</p>
      </div>
    </div>
  );
}
