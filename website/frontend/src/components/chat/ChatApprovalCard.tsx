import { useState } from 'react';
import { CheckCircle2, RotateCcw, Pause, Minus } from 'lucide-react';
import { approvePipelineRun, rejectPipelineRun } from '@/services/encoreApi';
import { useActivePipeline } from '@/contexts/ActivePipelineContext';
import '@/styles/pipeline-animations.css';

/**
 * Inline chat card for manual approval gates.
 * Rendered when SSE fires `approval_required` and pipeline mode is 'manual'.
 */
interface ChatApprovalCardProps {
  onMinimize?: () => void;
}

export default function ChatApprovalCard({ onMinimize }: ChatApprovalCardProps) {
  const { runId, stages, clearPendingAction } = useActivePipeline();
  const [decision, setDecision] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [loading, setLoading] = useState(false);

  // Find the last completed stage name
  const completedStages = stages.filter(s => s.status === 'completed');
  const lastStage = completedStages[completedStages.length - 1];

  const handleApprove = async () => {
    if (!runId) return;
    setLoading(true);
    try {
      await approvePipelineRun(runId);
      setDecision('approved');
      clearPendingAction();
    } catch (err) {
      console.error('[ChatApprovalCard] Approve failed:', (err as Error).message);
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!runId) return;
    setLoading(true);
    try {
      await rejectPipelineRun(runId, rejectReason || undefined);
      setDecision('rejected');
      clearPendingAction();
    } catch (err) {
      console.error('[ChatApprovalCard] Reject failed:', (err as Error).message);
    }
    setLoading(false);
  };

  if (decision === 'approved') {
    return (
      <div className="pipeline-card-enter bg-emerald-50 rounded-2xl border border-emerald-200 px-5 py-4 max-w-lg">
        <div className="flex items-center gap-2 text-emerald-700 font-medium">
          <CheckCircle2 className="w-5 h-5" />
          Approved — pipeline continuing to next stage
        </div>
      </div>
    );
  }

  if (decision === 'rejected') {
    return (
      <div className="pipeline-card-enter bg-amber-50 rounded-2xl border border-amber-200 px-5 py-4 max-w-lg">
        <div className="flex items-center gap-2 text-amber-700 font-medium">
          <RotateCcw className="w-5 h-5" />
          Rejected — re-running {lastStage?.name || 'stage'} with feedback
        </div>
        {rejectReason && <p className="text-sm text-amber-600 mt-1">"{rejectReason}"</p>}
      </div>
    );
  }

  return (
    <div className="pipeline-card-enter pipeline-awaiting-action bg-white rounded-2xl border-2 border-amber-300 shadow-sm max-w-lg">
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700 font-semibold">
            <Pause className="w-5 h-5" />
            Stage Complete — Review Required
          </div>
          {onMinimize && (
            <button onClick={onMinimize} className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Minimize">
              <Minus className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          <strong>{lastStage?.name || 'Stage'}</strong> finished. Review the results and decide whether to continue or re-run.
        </p>
      </div>

      {showRejectInput && (
        <div className="px-5 pb-3">
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="What should be changed? (optional)"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
            rows={2}
          />
        </div>
      )}

      <div className="px-5 pb-4 flex gap-2">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          Approve & Continue
        </button>
        {!showRejectInput ? (
          <button
            onClick={() => setShowRejectInput(true)}
            className="px-4 py-2.5 rounded-xl border border-amber-300 text-amber-700 font-medium text-sm hover:bg-amber-50 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Re-run Stage
          </button>
        )}
      </div>
    </div>
  );
}
