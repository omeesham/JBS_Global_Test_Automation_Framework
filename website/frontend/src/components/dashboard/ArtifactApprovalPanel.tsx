import { useState, useEffect } from 'react';
import { FileText, Check, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { getPipelineRunDetail, approvePipelineRun, rejectPipelineRun } from '@/services/encoreApi';
import type { PipelineRun, Artifact } from '@/types';

interface Props {
  runId: string;
  onResume?: () => void;
}

export default function ArtifactApprovalPanel({ runId, onResume }: Props) {
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPipelineRunDetail(runId)
      .then(setRun)
      .catch(() => setError('Failed to load run details'))
      .finally(() => setLoading(false));
  }, [runId]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleApprove = async () => {
    setSubmitting(true);
    setError('');
    try {
      await approvePipelineRun(runId);
      onResume?.();
    } catch {
      setError('Failed to approve. Is the backend running?');
    }
    setSubmitting(false);
  };

  const handleReject = async () => {
    setSubmitting(true);
    setError('');
    try {
      await rejectPipelineRun(runId, rejectReason || undefined);
      setShowReject(false);
      onResume?.();
    } catch {
      setError('Failed to reject. Is the backend running?');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
        <p className="text-xs text-blue-600">Loading artifacts for review...</p>
      </div>
    );
  }

  if (!run || run.artifacts.length === 0) return null;

  return (
    <div className="rounded-xl border border-blue-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-100 bg-blue-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-[#1E1B4B]">Artifact Review Required</h3>
          <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-medium">
            {run.artifacts.length} artifacts
          </span>
        </div>
        <p className="text-[10px] text-[#6B7280]">{run.feature} / {run.module}</p>
      </div>

      {/* Artifacts list */}
      <div className="divide-y divide-[#EDE9FE]">
        {run.artifacts.map((artifact: Artifact) => {
          const isExpanded = expanded.has(artifact.id);
          return (
            <div key={artifact.id} className="px-4 py-3">
              <button
                onClick={() => toggleExpand(artifact.id)}
                className="flex items-center gap-2 w-full text-left"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />}
                <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className="text-xs font-medium text-[#1E1B4B]">{artifact.name}</span>
                <span className="text-[10px] text-[#6B7280] uppercase ml-auto">{artifact.artifactType}</span>
              </button>

              {isExpanded && (
                <div className="mt-2 ml-7">
                  <pre className="bg-[#F5F3FF] rounded-lg p-3 text-[10px] text-[#374151] font-mono overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {artifact.content
                      ? String(artifact.content)
                      : 'Content not loaded — download artifact to view'}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2">
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-[#EDE9FE] space-y-2">
        {showReject ? (
          <div className="space-y-2">
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="What should be changed? (optional)"
              rows={2}
              className="w-full px-3 py-2 text-xs border border-[#DDD6FE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg border border-amber-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {submitting ? 'Re-running...' : 'Reject & Re-run Stage'}
              </button>
              <button
                onClick={() => setShowReject(false)}
                className="px-4 py-2 text-xs text-[#6B7280] hover:text-[#1E1B4B]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#C4B5FD] text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              {submitting ? 'Approving...' : 'Approve & Continue Pipeline'}
            </button>
            <button
              onClick={() => setShowReject(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg border border-amber-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
