import { useState, useEffect } from 'react';
import { CheckCircle2, Pencil, RotateCcw, ChevronDown, ChevronUp, FileText, Code, Shield, Wrench, Search } from 'lucide-react';
import { getPipelineRunDetail, approvePipelineRun, rejectPipelineRun, updateArtifact } from '@/services/encoreApi';
import { useActivePipeline } from '@/contexts/ActivePipelineContext';
import { STAGE_ARTIFACT_TYPES } from '@/constants/artifact-types';

interface ArtifactPreviewCardProps {
  runId?: string | null;
}

interface ArtifactData {
  id: string;
  name: string;
  type: string;
  content: string | null;
}

const STAGE_ICONS: Record<string, React.ElementType> = {
  requirements: Search,
  planning: FileText,
  generation: Code,
  healing: Wrench,
  audit: Shield,
};

export default function ArtifactPreviewCard({ runId: propRunId }: ArtifactPreviewCardProps) {
  const { runId: contextRunId, clearPendingAction } = useActivePipeline();
  const activeRunId = propRunId || contextRunId;

  const [artifacts, setArtifacts] = useState<ArtifactData[]>([]);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedArtifact, setExpandedArtifact] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [decided, setDecided] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    if (!activeRunId) return;
    getPipelineRunDetail(activeRunId)
      .then(run => {
        const stageId = (run as any).stage || '';
        setCurrentStage(stageId);
        // Filter artifacts by current stage — match by type or stage metadata
        const allArts = ((run as any).artifacts || []) as ArtifactData[];
        const stageTypes = STAGE_ARTIFACT_TYPES[stageId] || [];
        const filtered = stageTypes.length > 0
          ? allArts.filter(a => stageTypes.some(t => a.type.toLowerCase().includes(t) || a.name.toLowerCase().includes(t)))
          : allArts;
        const arts = filtered.length > 0 ? filtered : allArts; // fallback to all if no match
        setArtifacts(arts);
        if (arts.length === 1) setExpandedArtifact(arts[0]!.id);
      })
      .catch((err) => console.error('[ArtifactPreviewCard] Failed to load run detail:', err?.message))
      .finally(() => setLoading(false));
  }, [activeRunId]);

  const handleApprove = async () => {
    if (!activeRunId) return;
    setActionLoading(true);
    try {
      await approvePipelineRun(activeRunId);
      setDecided('approved');
      clearPendingAction();
    } catch (err) {
      console.error('[ArtifactPreviewCard] Approve failed:', (err as Error).message);
    }
    setActionLoading(false);
  };

  const [editError, setEditError] = useState<string | null>(null);

  const handleEdit = async (artifactId: string) => {
    if (!editContent.trim()) return;
    setActionLoading(true);
    setEditError(null);
    try {
      await updateArtifact(artifactId, editContent, 'user');
      setEditingId(null);
      // Auto-approve after edit
      await handleApprove();
    } catch (err) {
      setEditError(`Failed to save: ${(err as Error).message}`);
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!activeRunId) return;
    setActionLoading(true);
    try {
      await rejectPipelineRun(activeRunId, rejectReason || undefined);
      setDecided('rejected');
      clearPendingAction();
    } catch (err) {
      console.error('[ArtifactPreviewCard] Reject failed:', (err as Error).message);
    }
    setActionLoading(false);
  };

  if (decided === 'approved') {
    return (
      <div className="pipeline-card-enter bg-emerald-50 rounded-2xl border border-emerald-200 px-5 py-4 max-w-2xl">
        <div className="flex items-center gap-2 text-emerald-700 font-medium">
          <CheckCircle2 className="w-5 h-5" />
          Approved — pipeline continuing
        </div>
      </div>
    );
  }

  if (decided === 'rejected') {
    return (
      <div className="pipeline-card-enter bg-amber-50 rounded-2xl border border-amber-200 px-5 py-4 max-w-2xl">
        <div className="flex items-center gap-2 text-amber-700 font-medium">
          <RotateCcw className="w-5 h-5" />
          Re-running stage with feedback
        </div>
      </div>
    );
  }

  const StageIcon = STAGE_ICONS[currentStage] || FileText;

  return (
    <div className="pipeline-card-enter pipeline-awaiting-action bg-white rounded-2xl border-2 border-violet-300 shadow-sm max-w-2xl">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-violet-700 font-semibold">
          <StageIcon className="w-5 h-5" />
          {currentStage ? `${currentStage.charAt(0).toUpperCase() + currentStage.slice(1)} Complete` : 'Stage Complete'} — Review Required
        </div>
      </div>

      {/* Artifacts */}
      {loading ? (
        <div className="px-5 py-4 flex items-center gap-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin" />
          Loading artifacts...
        </div>
      ) : (
        <div className="px-5 py-3 space-y-2 max-h-[400px] overflow-y-auto">
          {artifacts.map(art => (
            <div key={art.id} className="rounded-xl border border-gray-200">
              <button
                onClick={() => setExpandedArtifact(expandedArtifact === art.id ? null : art.id)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-800">{art.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{art.type}</span>
                  {expandedArtifact === art.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>
              {expandedArtifact === art.id && art.content && (
                <div className="border-t border-gray-100">
                  {editingId === art.id ? (
                    <div className="p-3 space-y-2">
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
                        rows={10}
                      />
                      {editError && <p className="text-xs text-red-500">{editError}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(art.id)} disabled={actionLoading} className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 disabled:opacity-50">
                          Save & Approve
                        </button>
                        <button onClick={() => { setEditingId(null); setEditError(null); }} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs hover:bg-gray-50">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <pre className="font-mono text-xs bg-gray-50 p-3 overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                      {art.content.slice(0, 5000)}{art.content.length > 5000 ? '\n...(truncated)' : ''}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
          {artifacts.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">No artifacts produced for this stage</p>
          )}
        </div>
      )}

      {/* Reject input */}
      {rejectMode && (
        <div className="px-5 pb-3">
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="What should the agent change?"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
            rows={2}
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-5 pb-4 flex gap-2">
        <button onClick={handleApprove} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 disabled:opacity-50">
          <CheckCircle2 className="w-4 h-4" /> Approve & Continue
        </button>
        {!rejectMode ? (
          <>
            <button onClick={() => { if (artifacts.length > 0) { setEditingId(artifacts[0]!.id); setEditContent(artifacts[0]!.content || ''); } }}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => setRejectMode(true)} className="px-3 py-2.5 rounded-xl border border-amber-300 text-amber-700 text-sm hover:bg-amber-50">
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button onClick={handleReject} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 disabled:opacity-50">
            <RotateCcw className="w-4 h-4" /> Re-run Stage
          </button>
        )}
      </div>
    </div>
  );
}
