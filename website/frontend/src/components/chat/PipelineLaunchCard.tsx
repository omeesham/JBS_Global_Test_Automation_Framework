import { useState } from 'react';
import { Play, Zap, Bot, Shield, Wrench, Search, Workflow } from 'lucide-react';
import { createPipelineRun } from '@/services/encoreApi';
import { useActivePipeline } from '@/contexts/ActivePipelineContext';
import { useClient } from '@/contexts/ClientContext';
import { useWebsite } from '@/contexts/WebsiteContext';
import '@/styles/pipeline-animations.css';

/* ------------------------------------------------------------------ */
/* Stage definitions for the selector pills                            */
/* ------------------------------------------------------------------ */

const STAGES = [
  { id: null,            label: 'Full Run', icon: Workflow, desc: 'Run all 5 agents end-to-end' },
  { id: 'requirements',  label: 'Discover',  icon: Search,   desc: 'Explore the UI & map selectors' },
  { id: 'planning',      label: 'Planner',       icon: Bot,      desc: 'Create test case definitions' },
  { id: 'generation',    label: 'Generator',     icon: Zap,      desc: 'Generate Playwright scripts' },
  { id: 'healing',       label: 'Healer',        icon: Wrench,   desc: 'Fix broken tests automatically' },
  { id: 'audit',         label: 'Audit',         icon: Shield,   desc: 'Quality check all specs' },
] as const;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface PipelineLaunchCardProps {
  onStarted?: (runId: string) => void;
}

export default function PipelineLaunchCard({ onStarted }: PipelineLaunchCardProps) {
  const { startPipeline } = useActivePipeline();
  const { client } = useClient();
  const { website } = useWebsite();

  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (!intent.trim()) {
      setError('Tell us what you want to test');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { runId } = await createPipelineRun({
        feature: website?.name || 'default',
        module: 'chat-launch',
        intent: intent.trim(),
        priority: 'medium',
        targetUrl: website?.url,
        clientId: client?.id,
        dryRun: false,
        startStage: selectedStage || undefined,
      });

      startPipeline(runId, mode);
      onStarted?.(runId);
    } catch (err) {
      setError((err as Error).message || 'Failed to start pipeline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pipeline-card-enter bg-white rounded-2xl border border-violet-200 shadow-sm overflow-hidden max-w-3xl w-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-violet-600" />
          Run Test Pipeline
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">Configure and launch your testing pipeline</p>
      </div>

      {/* Mode toggle */}
      <div className="px-5 pb-4">
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          <button
            onClick={() => setMode('auto')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'auto'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Auto Pilot
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'manual'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Manual Review
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          {mode === 'auto'
            ? 'Agents run all stages automatically — review results at the end'
            : 'Pause after each stage to review & approve before continuing'}
        </p>
      </div>

      {/* Stage selector */}
      <div className="px-5 pb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
          What to run
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {STAGES.map(({ id, label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setSelectedStage(id)}
              className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-2 py-2 sm:px-3 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all border whitespace-nowrap ${
                selectedStage === id
                  ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:bg-violet-50/50'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${selectedStage === id ? 'text-violet-600' : 'text-gray-400'}`} />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
        {selectedStage && (
          <p className="text-xs text-violet-600 mt-1.5">
            {STAGES.find(s => s.id === selectedStage)?.desc}
          </p>
        )}
      </div>

      {/* Intent input */}
      <div className="px-5 pb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
          What do you want to test?
        </label>
        <textarea
          value={intent}
          onChange={e => { setIntent(e.target.value); setError(null); }}
          placeholder="e.g., Test the login flow, navigation menu, and user profile page..."
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent placeholder:text-gray-400"
          rows={2}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* Start button */}
      <div className="px-5 pb-5">
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start {selectedStage ? STAGES.find(s => s.id === selectedStage)?.label : 'Pipeline'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
