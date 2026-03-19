import { useEffect, useState } from 'react';
import { BarChart3, Building2, Users, DollarSign, Activity, Settings2, RotateCcw } from 'lucide-react';
import api from '@/services/api';
import { getPipelineDefinition, updatePipelineDefinition } from '@/services/encoreApi';
import type { PipelineDefinition } from '@/types';

interface Props {
  role: string;
}

interface PlatformStats {
  totalClients: number;
  totalUsers: number;
  totalRuns: number;
  totalCost: number;
}

interface ClientUsage {
  client_id: string;
  name: string;
  total_runs: number;
  total_cost: number;
  last_run_at: string | null;
}

export default function SuperAdminPanel({ role }: Props) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [usage, setUsage] = useState<ClientUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [pipelineDef, setPipelineDef] = useState<PipelineDefinition | null>(null);
  const [savingToggle, setSavingToggle] = useState(false);
  const [toggleError, setToggleError] = useState('');

  useEffect(() => {
    if (role !== 'super_admin') return;
    Promise.allSettled([
      api.get('/admin/platform-stats').then(r => r.data),
      api.get('/admin/client-usage').then(r => r.data),
      getPipelineDefinition(),
    ]).then(([statsRes, usageRes, defRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (usageRes.status === 'fulfilled') setUsage(usageRes.value);
      if (defRes.status === 'fulfilled') setPipelineDef(defRes.value);
    }).finally(() => setLoading(false));
  }, [role]);

  const toggleApprovalMode = async (stageId: string) => {
    if (!pipelineDef || savingToggle) return;
    setSavingToggle(true);
    setToggleError('');
    const updated = {
      ...pipelineDef,
      stages: pipelineDef.stages.map(s =>
        s.id === stageId
          ? { ...s, approvalMode: s.approvalMode === 'manual' ? 'auto' as const : 'manual' as const }
          : s,
      ),
    };
    try {
      const saved = await updatePipelineDefinition(updated);
      setPipelineDef(saved);
    } catch {
      setToggleError('Failed to save — check backend connection');
    }
    setSavingToggle(false);
  };

  const resetAllToAuto = async () => {
    if (!pipelineDef || savingToggle) return;
    setSavingToggle(true);
    setToggleError('');
    const updated = {
      ...pipelineDef,
      stages: pipelineDef.stages.map(s => ({ ...s, approvalMode: 'auto' as const })),
    };
    try {
      const saved = await updatePipelineDefinition(updated);
      setPipelineDef(saved);
    } catch {
      setToggleError('Failed to save — check backend connection');
    }
    setSavingToggle(false);
  };

  if (role !== 'super_admin') return null;

  const cards = [
    { label: 'Clients', icon: Building2, value: stats?.totalClients ?? '—' },
    { label: 'Users', icon: Users, value: stats?.totalUsers ?? '—' },
    { label: 'Total Runs', icon: Activity, value: stats?.totalRuns ?? '—' },
    { label: 'Total Cost', icon: DollarSign, value: stats?.totalCost != null ? `$${stats.totalCost.toFixed(2)}` : '—' },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-[#1E1B4B]">Super Admin</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C3AED] text-white font-medium">Admin Only</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-5 flex flex-col items-center justify-center min-h-[120px]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center mb-3">
              <card.icon className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <p className="text-xl font-bold text-[#1E1B4B]">{loading ? '...' : card.value}</p>
            <p className="text-[10px] text-[#6B7280] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Client Usage Table */}
      {usage.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-[#7C3AED]" />
            <h4 className="text-sm font-semibold text-[#1E1B4B]">Client Usage</h4>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] text-[#6B7280] uppercase tracking-wider border-b border-[#DDD6FE]/40">
                <th className="pb-2">Client</th>
                <th className="pb-2">Runs</th>
                <th className="pb-2">Cost</th>
                <th className="pb-2">Last Run</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((u) => (
                <tr key={u.client_id} className="border-b border-[#DDD6FE]/20 last:border-0">
                  <td className="py-2 text-[#1E1B4B] font-medium">{u.name}</td>
                  <td className="py-2 text-[#6B7280]">{u.total_runs}</td>
                  <td className="py-2 text-[#6B7280]">${(u.total_cost ?? 0).toFixed(2)}</td>
                  <td className="py-2 text-[#6B7280] text-xs">{u.last_run_at ? new Date(u.last_run_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Stage Approval Mode Toggles */}
      {pipelineDef && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-[#7C3AED]" />
              <h4 className="text-sm font-semibold text-[#1E1B4B]">Pipeline Approval Mode</h4>
            </div>
            <button
              onClick={resetAllToAuto}
              disabled={savingToggle}
              className="flex items-center gap-1 text-[10px] text-[#6B7280] hover:text-[#1E1B4B]"
            >
              <RotateCcw className="w-3 h-3" /> Reset All
            </button>
          </div>
          <p className="text-[10px] text-[#9CA3AF] mb-3">
            Manual stages pause the pipeline for your review before proceeding. Changes apply to new runs only.
          </p>
          {toggleError && (
            <p className="text-[10px] text-red-600 bg-red-50 rounded-lg px-3 py-1.5 mb-3">{toggleError}</p>
          )}
          <div className="space-y-2">
            {pipelineDef.stages.map(stage => {
              const isManual = stage.approvalMode === 'manual';
              return (
                <div key={stage.id} className="flex items-center justify-between py-2 px-3 bg-[#F5F3FF] rounded-lg">
                  <div>
                    <span className="text-xs font-medium text-[#1E1B4B]">{stage.name}</span>
                    <span className="text-[10px] text-[#6B7280] ml-2">{stage.model}</span>
                  </div>
                  <button
                    onClick={() => toggleApprovalMode(stage.id)}
                    disabled={savingToggle}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      isManual ? 'bg-[#7C3AED]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        isManual ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
