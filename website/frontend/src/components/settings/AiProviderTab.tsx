import { useState, useEffect, useCallback } from 'react';
import {
  getAiConfigs,
  saveAiConfig,
  deleteAiConfig,
  validateAiApiKey,
  getAiUsage,
  getAiWorkers,
  healthCheckAi,
} from '@/services/api';

interface AiConfig {
  id: string;
  clientId: string;
  clientName?: string;
  clientSlug?: string;
  executionMode: string;
  cliWorkerId: string | null;
  cliAccountEmail: string | null;
  cliAuthStatus: string;
  apiKeyHint: string | null;
  apiStatus: string;
  apiMonthlyBudgetUsd: number | null;
  apiCurrentMonthUsd: number;
  preferredModel: string;
  maxConcurrentTasks: number;
  lastHealthCheck: string | null;
  healthError: string | null;
}

interface WorkerInfo {
  workerId: string;
  clientId: string | null;
  workerType: string;
  status: string;
  lastHeartbeat: string | null;
}

const MODE_LABELS: Record<string, string> = {
  cli: 'CLI Only',
  api: 'API Only',
  cli_with_api_overflow: 'CLI + API Overflow',
};

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-100 text-green-800',
  authenticated: 'bg-green-100 text-green-800',
  valid: 'bg-green-100 text-green-800',
  offline: 'bg-gray-100 text-gray-600',
  not_configured: 'bg-gray-100 text-gray-600',
  busy: 'bg-yellow-100 text-yellow-800',
  rate_limited: 'bg-orange-100 text-orange-800',
  expired: 'bg-red-100 text-red-800',
  invalid: 'bg-red-100 text-red-800',
  error: 'bg-red-100 text-red-800',
};

export default function AiProviderTab() {
  const [configs, setConfigs] = useState<AiConfig[]>([]);
  const [workers, setWorkers] = useState<WorkerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [showNewConfigForm, setShowNewConfigForm] = useState(false);
  const [newClientId, setNewClientId] = useState('');
  const [formData, setFormData] = useState({
    executionMode: 'cli',
    cliAccountEmail: '',
    apiKey: '',
    monthlyBudget: '',
    preferredModel: 'sonnet',
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [configsRes, workersRes] = await Promise.all([
        getAiConfigs().catch(() => []),
        getAiWorkers().catch(() => []),
      ]);
      setConfigs(configsRes);
      setWorkers(workersRes);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI configs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (clientId: string) => {
    try {
      await saveAiConfig({
        clientId,
        executionMode: formData.executionMode,
        cliConfig: formData.cliAccountEmail ? { accountEmail: formData.cliAccountEmail } : undefined,
        apiConfig: formData.apiKey || formData.monthlyBudget ? {
          apiKey: formData.apiKey || undefined,
          monthlyBudget: formData.monthlyBudget ? parseFloat(formData.monthlyBudget) : undefined,
        } : undefined,
      });
      setEditingClient(null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleValidateKey = async (clientId: string) => {
    try {
      const result = await validateAiApiKey(clientId);
      alert(result.valid ? 'API key is valid' : `API key invalid: ${result.error}`);
      await load();
    } catch (err: any) {
      alert(`Validation error: ${err.message}`);
    }
  };

  const handleHealthCheck = async (clientId: string) => {
    try {
      const result = await healthCheckAi(clientId);
      alert(`CLI: ${result.cli}, API: ${result.api}`);
      await load();
    } catch (err: any) {
      alert(`Health check error: ${err.message}`);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Remove AI config for this client?')) return;
    try {
      await deleteAiConfig(clientId);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleViewUsage = async (clientId: string) => {
    try {
      const usage = await getAiUsage(clientId);
      alert(`Total cost: $${usage.totalCostUsd.toFixed(4)}\nInput tokens: ${usage.totalInputTokens}\nOutput tokens: ${usage.totalOutputTokens}\nRate limited: ${usage.rateLimitedCount} times`);
    } catch (err: any) {
      alert(`Usage error: ${err.message}`);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );

  if (loading) return <div className="text-center py-8 text-[#6B7280]">Loading AI configurations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1E1B4B]">AI Provider Configuration</h3>
          <p className="text-sm text-[#6B7280]">Manage AI execution mode, API keys, and worker assignments per client</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowNewConfigForm(!showNewConfigForm);
              setNewClientId('');
              setFormData({ executionMode: 'cli', cliAccountEmail: '', apiKey: '', monthlyBudget: '', preferredModel: 'sonnet' });
            }}
            className="px-3 py-1.5 text-sm bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9]"
          >
            {showNewConfigForm ? 'Cancel' : 'Add Config'}
          </button>
          <button onClick={load} className="px-3 py-1.5 text-sm bg-[#F5F3FF] text-[#7C3AED] rounded-lg hover:bg-[#EDE9FE]">
            Refresh
          </button>
        </div>
      </div>

      {/* New Config Form */}
      {showNewConfigForm && (
        <div className="border border-[#7C3AED]/30 rounded-xl p-5 bg-[#F5F3FF]/50">
          <h4 className="font-semibold text-[#1E1B4B] mb-3">Set Up AI for New Client</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-[#6B7280] mb-1">Client ID (UUID)</label>
              <input
                type="text"
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
                placeholder="Enter client UUID"
                className="w-full px-3 py-1.5 text-sm border border-[#DDD6FE] rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Execution Mode</label>
              <select
                value={formData.executionMode}
                onChange={(e) => setFormData({ ...formData, executionMode: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-[#DDD6FE] rounded-lg"
              >
                <option value="cli">CLI Only</option>
                <option value="api">API Only</option>
                <option value="cli_with_api_overflow">CLI + API Overflow</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Preferred Model</label>
              <select
                value={formData.preferredModel}
                onChange={(e) => setFormData({ ...formData, preferredModel: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-[#DDD6FE] rounded-lg"
              >
                <option value="haiku">Fast</option>
                <option value="sonnet">Balanced</option>
                <option value="opus">Powerful</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">CLI Account Email</label>
              <input type="email" value={formData.cliAccountEmail} onChange={(e) => setFormData({ ...formData, cliAccountEmail: e.target.value })} placeholder="account@example.com" className="w-full px-3 py-1.5 text-sm border border-[#DDD6FE] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">API Key</label>
              <input type="password" value={formData.apiKey} onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })} placeholder="sk-ant-..." className="w-full px-3 py-1.5 text-sm border border-[#DDD6FE] rounded-lg font-mono" />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={async () => {
                if (!newClientId.trim()) { setError('Client ID is required'); return; }
                await handleSave(newClientId.trim());
                setShowNewConfigForm(false);
              }}
              className="px-4 py-1.5 text-sm bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9]"
            >
              Create Config
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Worker Status */}
      <div className="bg-[#F5F3FF] rounded-lg p-4">
        <h4 className="text-sm font-medium text-[#1E1B4B] mb-2">Workers ({workers.length})</h4>
        {workers.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No workers registered</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {workers.map((w) => (
              <div key={w.workerId} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-sm">
                <span className={`w-2 h-2 rounded-full ${w.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="font-mono text-xs">{w.workerId}</span>
                <span className="text-[#6B7280]">{w.workerType === 'cli_dedicated' ? '(CLI)' : '(API)'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client Configs */}
      <div className="space-y-4">
        {configs.map((config) => (
          <div key={config.clientId} className="border border-[#DDD6FE]/60 rounded-xl p-5 bg-white/80">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-[#1E1B4B]">{(config as any).clientName || config.clientId}</h4>
                <p className="text-xs text-[#6B7280] font-mono">{(config as any).clientSlug || ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-lg text-xs font-medium">
                  {MODE_LABELS[config.executionMode] || config.executionMode}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* CLI Status */}
              <div>
                <span className="text-[#6B7280]">CLI Worker: </span>
                {config.cliWorkerId ? (
                  <span className="font-mono text-xs">{config.cliWorkerId}</span>
                ) : (
                  <span className="text-[#6B7280]">Not assigned</span>
                )}
                {' '}<StatusBadge status={config.cliAuthStatus} />
              </div>

              {/* API Status */}
              <div>
                <span className="text-[#6B7280]">API Key: </span>
                {config.apiKeyHint ? (
                  <span className="font-mono text-xs">{config.apiKeyHint}</span>
                ) : (
                  <span className="text-[#6B7280]">Not configured</span>
                )}
                {' '}<StatusBadge status={config.apiStatus} />
              </div>

              {/* Budget */}
              {config.apiMonthlyBudgetUsd !== null && (
                <div>
                  <span className="text-[#6B7280]">Budget: </span>
                  <span>${config.apiCurrentMonthUsd.toFixed(2)} / ${config.apiMonthlyBudgetUsd.toFixed(2)}</span>
                </div>
              )}

              {/* Model */}
              <div>
                <span className="text-[#6B7280]">Model: </span>
                <span>{config.preferredModel}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-[#DDD6FE]/40">
              <button
                onClick={() => {
                  setEditingClient(editingClient === config.clientId ? null : config.clientId);
                  setFormData({
                    executionMode: config.executionMode,
                    cliAccountEmail: config.cliAccountEmail || '',
                    apiKey: '',
                    monthlyBudget: config.apiMonthlyBudgetUsd?.toString() || '',
                    preferredModel: config.preferredModel,
                  });
                }}
                className="px-3 py-1 text-xs bg-[#F5F3FF] text-[#7C3AED] rounded-lg hover:bg-[#EDE9FE]"
              >
                Configure
              </button>
              <button onClick={() => handleHealthCheck(config.clientId)} className="px-3 py-1 text-xs bg-[#F5F3FF] text-[#7C3AED] rounded-lg hover:bg-[#EDE9FE]">
                Health Check
              </button>
              <button onClick={() => handleViewUsage(config.clientId)} className="px-3 py-1 text-xs bg-[#F5F3FF] text-[#7C3AED] rounded-lg hover:bg-[#EDE9FE]">
                Usage
              </button>
              {config.apiKeyHint && (
                <button onClick={() => handleValidateKey(config.clientId)} className="px-3 py-1 text-xs bg-[#F5F3FF] text-[#7C3AED] rounded-lg hover:bg-[#EDE9FE]">
                  Validate Key
                </button>
              )}
              <button onClick={() => handleDelete(config.clientId)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 ml-auto">
                Remove
              </button>
            </div>

            {/* Edit Form */}
            {editingClient === config.clientId && (
              <div className="mt-4 pt-4 border-t border-[#DDD6FE]/40 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Execution Mode</label>
                    <select
                      value={formData.executionMode}
                      onChange={(e) => setFormData({ ...formData, executionMode: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-[#DDD6FE] rounded-lg"
                    >
                      <option value="cli">CLI Only</option>
                      <option value="api">API Only</option>
                      <option value="cli_with_api_overflow">CLI + API Overflow</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Preferred Model</label>
                    <select
                      value={formData.preferredModel}
                      onChange={(e) => setFormData({ ...formData, preferredModel: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-[#DDD6FE] rounded-lg"
                    >
                      <option value="haiku">Fast</option>
                      <option value="sonnet">Balanced</option>
                      <option value="opus">Powerful</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">CLI Account Email</label>
                    <input
                      type="email"
                      value={formData.cliAccountEmail}
                      onChange={(e) => setFormData({ ...formData, cliAccountEmail: e.target.value })}
                      placeholder="account@example.com"
                      className="w-full px-3 py-1.5 text-sm border border-[#DDD6FE] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Monthly Budget ($)</label>
                    <input
                      type="number"
                      value={formData.monthlyBudget}
                      onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                      placeholder="50.00"
                      className="w-full px-3 py-1.5 text-sm border border-[#DDD6FE] rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-[#6B7280] mb-1">API Key (leave blank to keep current)</label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="sk-ant-..."
                      className="w-full px-3 py-1.5 text-sm border border-[#DDD6FE] rounded-lg font-mono"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingClient(null)} className="px-4 py-1.5 text-sm text-[#6B7280] hover:text-[#1E1B4B]">
                    Cancel
                  </button>
                  <button onClick={() => handleSave(config.clientId)} className="px-4 py-1.5 text-sm bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9]">
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {configs.length === 0 && (
          <div className="text-center py-8 text-[#6B7280]">
            <p>No AI provider configurations yet.</p>
            <p className="text-sm mt-1">Click "Add Config" above to set up AI for a client.</p>
          </div>
        )}
      </div>
    </div>
  );
}
