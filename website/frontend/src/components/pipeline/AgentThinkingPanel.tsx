import { useMemo, useState, useEffect, useCallback } from 'react';
import { X, Clock, CheckCircle2, XCircle, AlertTriangle, Hourglass, Bot, Square } from 'lucide-react';
import type { PipelineStageState, ActivityMessage } from '@/hooks/usePipelineSSE';
import { cancelPipelineRun } from '@/services/encoreApi';
import AgentActivityFeed from './AgentActivityFeed';
import '@/styles/pipeline-animations.css';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface AgentThinkingPanelProps {
  stageId: string;
  stages: PipelineStageState[];
  activityMessages: ActivityMessage[];
  onClose: () => void;
  showCost?: boolean;
  runId?: string;
}

/* ------------------------------------------------------------------ */
/* Stage metadata for display                                          */
/* ------------------------------------------------------------------ */

const STAGE_DISPLAY: Record<string, { name: string; description: string }> = {
  requirements: { name: 'Requirements', description: 'Exploring the UI and mapping selectors' },
  planning:     { name: 'Planner',      description: 'Creating test case definitions' },
  generation:   { name: 'Generator',    description: 'Generating Playwright test scripts' },
  healing:      { name: 'Healer',       description: 'Fixing broken tests automatically' },
  audit:        { name: 'Audit',        description: 'Quality checking all specifications' },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function AgentThinkingPanel({
  stageId,
  stages,
  activityMessages,
  onClose,
  showCost = false,
  runId,
}: AgentThinkingPanelProps) {
  const stage = stages.find(s => s.key === stageId);
  const display = STAGE_DISPLAY[stageId] || { name: stageId, description: '' };
  const [stopping, setStopping] = useState(false);

  const handleStop = useCallback(async () => {
    if (!runId || stopping) return;
    setStopping(true);
    try {
      await cancelPipelineRun(runId);
    } catch { /* ignore */ }
    setStopping(false);
  }, [runId, stopping]);

  // Filter activity messages to this stage
  const stageMessages = useMemo(
    () => activityMessages.filter(m => m.stage === stageId),
    [activityMessages, stageId],
  );

  // Elapsed time — ticks every second while running
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!stage?.startedAt || stage.status !== 'running') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [stage?.startedAt, stage?.status]);

  const elapsed = stage?.startedAt
    ? Math.floor((now - stage.startedAt) / 1000)
    : undefined;
  const elapsedStr = elapsed !== undefined
    ? elapsed >= 60
      ? `${Math.floor(elapsed / 60)}m ${(elapsed % 60).toString().padStart(2, '0')}s`
      : `${elapsed}s`
    : undefined;

  // Status icon
  const StatusBadge = () => {
    if (!stage) return null;
    switch (stage.status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-semibold">
            <Bot className="w-3 h-3 animate-pulse" /> Running
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">
            <Hourglass className="w-3 h-3" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold">
            <XCircle className="w-3 h-3" /> {stage.status}
          </span>
        );
    }
  };

  return (
    <div className="w-[320px] md:w-[320px] max-md:fixed max-md:inset-0 max-md:w-full max-md:z-50 max-md:bg-black/30 flex-shrink-0 pipeline-panel-enter">
      <div className="h-full max-md:ml-auto max-md:w-[320px] bg-white border-l border-[#EDE9FE] flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDE9FE] bg-[#FAFAFE]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#1E1B4B] truncate">{display.name}</h3>
              <StatusBadge />
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5 truncate">{display.description}</p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {stage?.status === 'running' && runId && (
              <button
                onClick={handleStop}
                disabled={stopping}
                className="p-1 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                title="Stop agent"
              >
                <Square className={`w-4 h-4 ${stopping ? 'animate-pulse' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {(elapsedStr || (showCost && stage)) && (
          <div className="flex items-center gap-3 px-4 py-2 border-b border-[#EDE9FE] text-[10px] text-gray-500">
            {elapsedStr && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {elapsedStr}
              </span>
            )}
            {stageMessages.length > 0 && (
              <span>{stageMessages.length} messages</span>
            )}
          </div>
        )}

        {/* Body — content depends on stage status */}
        <div className="flex-1 overflow-hidden">
          {stage?.status === 'running' && (
            <AgentActivityFeed messages={stageMessages} />
          )}

          {stage?.status === 'completed' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Stage Complete</span>
              </div>

              {/* Last few activity messages as summary */}
              {stageMessages.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Summary</p>
                  {stageMessages.slice(-5).map((msg, i) => (
                    <div key={i} className="bg-[#F5F3FF] rounded-lg px-3 py-1.5">
                      <p className="text-xs text-gray-700">{msg.message}</p>
                      <span className="text-[9px] text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {stageMessages.length === 0 && (
                <p className="text-xs text-gray-400">No activity messages recorded for this stage.</p>
              )}
            </div>
          )}

          {stage?.status === 'pending' && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Hourglass className="w-8 h-8 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">Queued</p>
              <p className="text-xs text-gray-400 mt-1">Waiting for previous stages to complete before starting.</p>
            </div>
          )}

          {!stage && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <AlertTriangle className="w-8 h-8 text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">Stage not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
