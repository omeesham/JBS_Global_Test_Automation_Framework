import { useState, useEffect } from 'react';
import { Play, Zap, Bot, Shield, Wrench, Search, Workflow, X } from 'lucide-react';
import { createPipelineRun, listPages, batchRunPipeline } from '@/services/encoreApi';
import type { Page } from '@/services/encoreApi';
import { useActivePipeline } from '@/contexts/ActivePipelineContext';
import { useClient } from '@/contexts/ClientContext';
import { useWebsite } from '@/contexts/WebsiteContext';
import '@/styles/pipeline-animations.css';

/* ------------------------------------------------------------------ */
/* Stage definitions for the manual mode selector pills               */
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
/* Stage status squares for page selector                             */
/* ------------------------------------------------------------------ */

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-500',
  running: 'bg-violet-500',
  failed: 'bg-red-500',
  not_started: 'bg-gray-300',
};

function StageSquares({ stages }: { stages?: Array<{ stage_id: string; status: string }> }) {
  const stageOrder = ['requirements', 'planning', 'generation', 'healing', 'audit'];
  const statusMap = new Map(stages?.map(s => [s.stage_id, s.status]) || []);
  return (
    <div className="flex gap-0.5">
      {stageOrder.map(s => (
        <div key={s} className={`w-2 h-2 rounded-sm ${STATUS_COLORS[statusMap.get(s) || 'not_started'] || 'bg-gray-300'}`} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface PipelineLaunchCardProps {
  onStarted?: (runId: string) => void;
  onClose?: () => void;
  onNeedsRequirements?: (pageId: string, runId: string) => void;
}

export default function PipelineLaunchCard({ onStarted, onClose, onNeedsRequirements }: PipelineLaunchCardProps) {
  const { startPipeline, startPipelineForPage } = useActivePipeline();
  const { client } = useClient();
  const { website } = useWebsite();

  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [pages, setPages] = useState<Page[]>([]);
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pages for the page selector
  useEffect(() => {
    if (client?.id) {
      listPages(client.id).then(setPages).catch(() => {});
    }
  }, [client?.id]);

  const handleStart = async () => {
    if (!intent.trim()) {
      setError('Tell us what you want to test');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (mode === 'auto' && selectedPageId === '__all__' && pages.length > 0) {
        // Batch run for all pages
        const result = await batchRunPipeline({
          pageIds: pages.map(p => p.id),
          targetStage: 'requirements',
          mode: 'auto',
          intent: intent.trim(),
          clientId: client?.id,
        });
        if (result.started.length > 0) {
          const first = result.started[0];
          const page = pages.find(p => p.id === first.pageId);
          startPipelineForPage(first.runId, 'auto', first.pageId, page?.display_name || 'Batch');
        }
        if (result.skipped.length > 0) {
          setError(`${result.started.length} started, ${result.skipped.length} skipped: ${result.skipped.map(s => s.reason).join('; ')}`);
        }
        onStarted?.(result.batchId);
      } else {
        const resp = await createPipelineRun({
          feature: website?.name || 'default',
          module: 'chat-launch',
          intent: intent.trim(),
          priority: 'medium',
          targetUrl: website?.url,
          clientId: client?.id,
          dryRun: false,
          startStage: mode === 'manual' ? (selectedStage || undefined) : undefined,
          ...(selectedPageId && selectedPageId !== '__all__' ? { pageId: selectedPageId } : {}),
        } as any);

        // Handle requirements gate
        if ((resp as any).needsRequirements) {
          onNeedsRequirements?.((resp as any).pageId, resp.runId);
          return;
        }

        const { runId } = resp;
        if (selectedPageId && selectedPageId !== '__all__') {
          const page = pages.find(p => p.id === selectedPageId);
          startPipelineForPage(runId, mode, selectedPageId, page?.display_name || 'Page');
        } else {
          startPipeline(runId, mode);
        }
        onStarted?.(runId);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to start pipeline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pipeline-card-enter bg-white rounded-2xl border border-violet-200 shadow-sm overflow-hidden max-w-3xl w-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Workflow className="w-5 h-5 text-violet-600" />
            Run Test Pipeline
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Configure and launch your testing pipeline</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1 -mt-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mode toggle */}
      <div className="px-5 pb-4">
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          <button
            onClick={() => setMode('auto')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'auto' ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Auto Pilot
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'manual' ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
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

      {/* Page selector (both modes) */}
      {pages.length > 0 && (
        <div className="px-5 pb-4">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
            Page
          </label>
          <select
            value={selectedPageId}
            onChange={e => setSelectedPageId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value="">Any page</option>
            {mode === 'auto' && <option value="__all__">All Pages (batch)</option>}
            {pages.map(p => (
              <option key={p.id} value={p.id}>{p.display_name}</option>
            ))}
          </select>
          {selectedPageId && selectedPageId !== '__all__' && (
            <div className="mt-1.5 flex items-center gap-2">
              <StageSquares stages={pages.find(p => p.id === selectedPageId)?.stages as any} />
              <span className="text-xs text-gray-400">Stage progress</span>
            </div>
          )}
        </div>
      )}

      {/* Stage selector — manual mode only */}
      {mode === 'manual' && (
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
      )}

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
              {selectedPageId === '__all__' ? 'Start All Pages' : `Start ${mode === 'manual' && selectedStage ? STAGES.find(s => s.id === selectedStage)?.label : 'Pipeline'}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
