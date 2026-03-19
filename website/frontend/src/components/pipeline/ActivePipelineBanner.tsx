import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, X, AlertTriangle, XCircle } from 'lucide-react';
import { useActivePipeline } from '@/contexts/ActivePipelineContext';
import { cancelPipelineRun } from '@/services/encoreApi';
import PipelineGraph from './PipelineGraph';
import '@/styles/pipeline-animations.css';

/**
 * Global banner that shows the live pipeline graph on ALL pages when a pipeline is active.
 * - Chat page: expanded (hero) by default
 * - Other pages: collapsed (compact) by default
 * - Pulses amber when approval/triage is required
 */
export default function ActivePipelineBanner() {
  const {
    runId, stages, isActive, pipelineStatus, pendingAction, pipelineDefinition,
  } = useActivePipeline();
  const location = useLocation();
  const navigate = useNavigate();
  const isChat = location.pathname === '/chat';

  // On chat page, start expanded; elsewhere start collapsed
  const [expanded, setExpanded] = useState(isChat);
  const [dismissed, setDismissed] = useState(false);

  // Un-dismiss when there's a pending action
  useEffect(() => {
    if (dismissed && pendingAction) setDismissed(false);
  }, [dismissed, pendingAction]);

  // Don't show if no active pipeline or dismissed
  if (!runId || (!isActive && pipelineStatus !== 'awaiting_triage' && pipelineStatus !== 'awaiting_approval' && pipelineStatus !== 'completed')) {
    return null;
  }
  // Chat page renders its own hero graph — skip banner there when pipeline is active
  if (isChat && (isActive || pipelineStatus === 'completed' || pipelineStatus === 'failed' || pipelineStatus === 'awaiting_triage' || pipelineStatus === 'awaiting_approval')) {
    return null;
  }
  if (dismissed && !pendingAction) return null;
  // Un-dismiss when there's a pending action (via effect, not during render)

  const hasPendingAction = pendingAction !== null;
  const bannerBorder = hasPendingAction
    ? 'border-amber-400'
    : pipelineStatus === 'completed' ? 'border-emerald-400' : 'border-violet-300';
  const bannerBg = hasPendingAction
    ? 'bg-amber-50/50'
    : pipelineStatus === 'completed' ? 'bg-emerald-50/50' : 'bg-white/80';

  const handleCancel = async () => {
    if (!runId) return;
    try {
      await cancelPipelineRun(runId);
    } catch { /* ignore */ }
  };

  const handleActionClick = () => {
    if (!isChat) navigate('/chat');
  };

  return (
    <div
      className={`pipeline-banner-enter border-b-2 ${bannerBorder} ${bannerBg} ${hasPendingAction ? 'pipeline-awaiting-action' : ''}`}
    >
      {/* Header bar — always visible */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Status indicator dot */}
          <div className={`w-2.5 h-2.5 rounded-full ${
            isActive ? 'bg-violet-500 animate-pulse' :
            pipelineStatus === 'completed' ? 'bg-emerald-500' :
            hasPendingAction ? 'bg-amber-500 animate-pulse' : 'bg-gray-400'
          }`} />

          <span className="text-sm font-medium text-gray-800">
            {pipelineStatus === 'completed'
              ? 'Pipeline Complete'
              : hasPendingAction
                ? pendingAction === 'triage_required' ? 'Triage Required' : 'Review Required'
                : 'Pipeline Running'}
          </span>

          {/* Stage progress count */}
          {stages.length > 0 && (
            <span className="text-xs text-gray-500">
              {stages.filter(s => s.status === 'completed').length}/{stages.length} stages
            </span>
          )}

          {/* Pending action badge */}
          {hasPendingAction && (
            <button
              onClick={handleActionClick}
              className="px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200 transition-colors flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3" />
              {pendingAction === 'triage_required' ? 'Handle Triage' : 'Approve Stage'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Cancel button */}
          {isActive && (
            <button
              onClick={handleCancel}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Cancel pipeline"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}

          {/* Expand/collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Dismiss (only when not pending action) */}
          {!hasPendingAction && (
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Pipeline graph — shows when expanded */}
      {expanded && (
        <div className="px-4 pb-3 pipeline-card-enter">
          <PipelineGraph
            liveStages={stages}
            pipelineStatus={pipelineStatus || undefined}
            heroMode={isChat}
            compactMode={!isChat}
            pipelineDefinition={pipelineDefinition || undefined}
          />
        </div>
      )}
    </div>
  );
}
