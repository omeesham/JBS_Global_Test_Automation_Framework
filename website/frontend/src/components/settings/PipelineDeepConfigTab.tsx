import { useState, useEffect } from 'react';
import { Loader2, Save, AlertCircle, CheckCircle2, Layers } from 'lucide-react';
import { getPipelineDefinition, updatePipelineDefinition } from '@/services/encoreApi';
import type { PipelineDefinition, StageDefinition } from '@/types';

const STAGE_LABELS: Record<string, string> = {
  requirements: 'Requirements',
  planning: 'Planning',
  generation: 'Generation',
  healing: 'Healing',
  audit: 'Audit',
};

export default function PipelineDeepConfigTab() {
  const [config, setConfig] = useState<PipelineDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const def = await getPipelineDefinition();
        setConfig(def);
      } catch {
        setError('Failed to load pipeline configuration.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateStage = (stageId: string, patch: Partial<StageDefinition>) => {
    if (!config) return;
    setConfig({
      ...config,
      stages: config.stages.map((s) => (s.id === stageId ? { ...s, ...patch } : s)),
    });
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updatePipelineDefinition(config);
      setConfig(updated);
      setSuccess(true);
    } catch {
      setError('Failed to save pipeline configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error ?? 'Pipeline configuration is unavailable.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1E1B4B] mb-1">Pipeline Deep Configuration</h3>
        <p className="text-sm text-gray-500">Full technical control over every pipeline stage.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Configuration saved successfully.
        </div>
      )}

      {/* Stage Cards */}
      <div className="space-y-4">
        {config.stages.map((stage) => (
          <div
            key={stage.id}
            className={`rounded-xl border bg-white p-5 space-y-4 transition-opacity ${
              stage.enabled ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}
          >
            {/* Stage header with toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDE9FE]">
                  <Layers className="h-5 w-5 text-[#6366F1]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1E1B4B]">
                    {STAGE_LABELS[stage.id] ?? stage.name}
                  </p>
                  <p className="text-xs text-gray-500">{stage.description}</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={stage.enabled}
                onClick={() => updateStage(stage.id, { enabled: !stage.enabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                  stage.enabled ? 'bg-[#7C3AED]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform ${
                    stage.enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Stage controls grid */}
            {stage.enabled && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Model */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
                  <select
                    value={stage.model}
                    onChange={(e) => updateStage(stage.id, { model: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs bg-white focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
                  >
                    {config.models.available.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Max Turns */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max Turns</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={stage.maxTurns}
                    onChange={(e) => updateStage(stage.id, { maxTurns: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
                  />
                </div>

                {/* Budget Cap */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Budget Cap ($)</label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={stage.budgetCap}
                    onChange={(e) => updateStage(stage.id, { budgetCap: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
                  />
                </div>

                {/* Retries */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Retries</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={stage.retries}
                    onChange={(e) => updateStage(stage.id, { retries: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
                  />
                </div>

                {/* Timeout */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={stage.timeoutSeconds}
                    onChange={(e) => updateStage(stage.id, { timeoutSeconds: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[#7C3AED] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6D28D9] disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Configuration
        </button>
      </div>
    </div>
  );
}
