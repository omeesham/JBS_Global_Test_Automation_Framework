import { useState } from 'react';
import { X, Play, FlaskConical, Zap, ShieldCheck } from 'lucide-react';
import { useClient } from '@/contexts/ClientContext';
import { useWebsite } from '@/contexts/WebsiteContext';
import { createPipelineRun } from '@/services/encoreApi';
import { trackWebsiteRun } from '@/services/api';
import type { ExecutionMode, PipelineDefinition } from '@/types';

interface RunPipelineModalProps {
  open: boolean;
  onClose: () => void;
  onRunStarted: (runId: string) => void;
  pipelineDefinition?: PipelineDefinition;
}

export default function RunPipelineModal({ open, onClose, onRunStarted, pipelineDefinition }: RunPipelineModalProps) {
  const { client } = useClient();
  const { website, websites } = useWebsite();

  const [selectedWebsiteId, setSelectedWebsiteId] = useState(website?.id || '');
  const [feature, setFeature] = useState('');
  const [module, setModule] = useState('');
  const [intent, setIntent] = useState('');
  const [targetUrl, setTargetUrl] = useState(website?.url || '');
  const [priority, setPriority] = useState('medium');
  const [startStage, setStartStage] = useState('');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('full-auto');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync targetUrl when website selection changes
  const handleWebsiteChange = (id: string) => {
    setSelectedWebsiteId(id);
    const w = websites.find(w => w.id === id);
    if (w) setTargetUrl(w.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feature.trim() || !module.trim() || !intent.trim()) {
      setError('Feature, module, and intent are required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const { runId } = await createPipelineRun({
        feature: feature.trim(),
        module: module.trim(),
        intent: intent.trim(),
        targetUrl: targetUrl.trim() || undefined,
        priority,
        clientId: client?.id,
        dryRun: executionMode === 'dry-run',
        startStage: startStage || undefined,
        executionMode,
      });

      // Track website-run association
      if (selectedWebsiteId) {
        trackWebsiteRun(selectedWebsiteId, runId).catch(() => {});
      }

      onRunStarted(runId);
      onClose();

      // Reset form
      setFeature('');
      setModule('');
      setIntent('');
      setExecutionMode('full-auto');
    } catch {
      setError('Failed to start pipeline. Is the backend running?');
    }
    setSubmitting(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-[#DDD6FE] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EDE9FE] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="text-sm font-semibold text-[#1E1B4B]">Run Pipeline</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#F5F3FF] hover:bg-[#EDE9FE] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Website */}
          {websites.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[#1E1B4B] mb-1">Website</label>
              <select
                value={selectedWebsiteId}
                onChange={e => handleWebsiteChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#DDD6FE] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
              >
                <option value="">Select website...</option>
                {websites.map(w => (
                  <option key={w.id} value={w.id}>{w.name} — {w.url}</option>
                ))}
              </select>
            </div>
          )}

          {/* Feature */}
          <div>
            <label className="block text-xs font-medium text-[#1E1B4B] mb-1">Feature *</label>
            <input
              type="text"
              value={feature}
              onChange={e => setFeature(e.target.value)}
              placeholder="e.g., Login, Locations, Currency"
              className="w-full px-3 py-2 text-xs border border-[#DDD6FE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
              required
            />
          </div>

          {/* Module */}
          <div>
            <label className="block text-xs font-medium text-[#1E1B4B] mb-1">Module *</label>
            <input
              type="text"
              value={module}
              onChange={e => setModule(e.target.value)}
              placeholder="e.g., locations, documents, settings"
              className="w-full px-3 py-2 text-xs border border-[#DDD6FE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
              required
            />
          </div>

          {/* Intent */}
          <div>
            <label className="block text-xs font-medium text-[#1E1B4B] mb-1">What to test *</label>
            <textarea
              value={intent}
              onChange={e => setIntent(e.target.value)}
              placeholder="Describe what you want to test..."
              rows={3}
              className="w-full px-3 py-2 text-xs border border-[#DDD6FE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 resize-none"
              required
            />
          </div>

          {/* Target URL */}
          <div>
            <label className="block text-xs font-medium text-[#1E1B4B] mb-1">Target URL</label>
            <input
              type="text"
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              placeholder="Auto-filled from website"
              className="w-full px-3 py-2 text-xs border border-[#DDD6FE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
            />
          </div>

          {/* Start Stage */}
          <div>
            <label className="block text-xs font-medium text-[#1E1B4B] mb-1">Start at Stage</label>
            <select
              value={startStage}
              onChange={e => setStartStage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#DDD6FE] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
            >
              <option value="">Auto-detect (recommended)</option>
              {pipelineDefinition?.stages?.filter(s => s.enabled).map(s => (
                <option key={s.id} value={s.id}>{s.name} — {s.description || s.id}</option>
              )) || (
                <>
                  <option value="requirements">Requirements — explore UI from scratch</option>
                  <option value="planning">Planning — create/refresh test cases</option>
                  <option value="generation">Generation — generate specs from existing test cases</option>
                  <option value="audit">Audit — audit existing specs</option>
                </>
              )}
            </select>
            <p className="text-[10px] text-[#9CA3AF] mt-1">Auto-detect scans existing artifacts to pick the right stage</p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-[#1E1B4B] mb-1">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#DDD6FE] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Execution Mode */}
          <div>
            <label className="block text-xs font-medium text-[#1E1B4B] mb-2">Execution Mode</label>
            <div className="space-y-2">
              <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${executionMode === 'full-auto' ? 'border-[#7C3AED] bg-[#F5F3FF]' : 'border-[#E5E7EB] hover:border-[#DDD6FE]'}`}>
                <input type="radio" name="executionMode" value="full-auto" checked={executionMode === 'full-auto'} onChange={() => setExecutionMode('full-auto')} className="sr-only" />
                <Zap className={`w-4 h-4 flex-shrink-0 ${executionMode === 'full-auto' ? 'text-[#7C3AED]' : 'text-[#9CA3AF]'}`} />
                <div>
                  <span className="text-xs font-medium text-[#1E1B4B]">Full Auto</span>
                  <p className="text-[10px] text-[#6B7280]">Pipeline runs end-to-end without stopping</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${executionMode === 'approve-per-stage' ? 'border-[#7C3AED] bg-[#F5F3FF]' : 'border-[#E5E7EB] hover:border-[#DDD6FE]'}`}>
                <input type="radio" name="executionMode" value="approve-per-stage" checked={executionMode === 'approve-per-stage'} onChange={() => setExecutionMode('approve-per-stage')} className="sr-only" />
                <ShieldCheck className={`w-4 h-4 flex-shrink-0 ${executionMode === 'approve-per-stage' ? 'text-[#7C3AED]' : 'text-[#9CA3AF]'}`} />
                <div>
                  <span className="text-xs font-medium text-[#1E1B4B]">Approve Per Stage</span>
                  <p className="text-[10px] text-[#6B7280]">Pauses between stages for your review</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${executionMode === 'dry-run' ? 'border-[#7C3AED] bg-[#F5F3FF]' : 'border-[#E5E7EB] hover:border-[#DDD6FE]'}`}>
                <input type="radio" name="executionMode" value="dry-run" checked={executionMode === 'dry-run'} onChange={() => setExecutionMode('dry-run')} className="sr-only" />
                <FlaskConical className={`w-4 h-4 flex-shrink-0 ${executionMode === 'dry-run' ? 'text-[#7C3AED]' : 'text-[#9CA3AF]'}`} />
                <div>
                  <span className="text-xs font-medium text-[#1E1B4B]">Dry Run</span>
                  <p className="text-[10px] text-[#6B7280]">Validates config without executing agents</p>
                </div>
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#C4B5FD] text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            {submitting ? 'Starting...' : 'Run Pipeline'}
          </button>
        </form>
      </div>
    </div>
  );
}
