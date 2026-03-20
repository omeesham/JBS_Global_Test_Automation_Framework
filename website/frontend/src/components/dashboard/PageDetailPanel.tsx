import { useState, useEffect } from 'react';
import { X, ExternalLink, Play, Download, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { getPageDetail, createPipelineRun, deleteArtifact, downloadArtifacts } from '@/services/encoreApi';
import type { PageStageStatus } from '@/services/encoreApi';
import { useClient } from '@/contexts/ClientContext';
import { useActivePipeline } from '@/contexts/ActivePipelineContext';
import { STAGE_ARTIFACT_TYPES } from '@/constants/artifact-types';

const STAGE_ORDER = ['requirements', 'planning', 'generation', 'healing', 'audit'];
const STAGE_LABELS: Record<string, string> = {
  requirements: 'Discover', planning: 'Planner', generation: 'Generator', healing: 'Healer', audit: 'Audit',
};
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
  running: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Running' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
  not_started: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Not Started' },
};

interface PageDetailPanelProps {
  pageId: string;
  onClose: () => void;
}

export default function PageDetailPanel({ pageId, onClose }: PageDetailPanelProps) {
  const { client } = useClient();
  const { startPipelineForPage } = useActivePipeline();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getPageDetail(pageId)
      .then(setPage)
      .catch((err) => console.error('[PageDetailPanel] Failed to load page:', err?.message))
      .finally(() => setLoading(false));
  }, [pageId]);

  const getStageStatus = (stageId: string): PageStageStatus | undefined => {
    return page?.stages?.find((s: PageStageStatus) => s.stage_id === stageId);
  };

  const getNextStage = (): string | null => {
    for (const s of STAGE_ORDER) {
      const status = getStageStatus(s);
      if (!status || status.status === 'not_started' || status.status === 'failed') return s;
    }
    return null;
  };

  const handleRunNext = async () => {
    const next = getNextStage();
    if (!next || !page) return;
    try {
      const { runId } = await createPipelineRun({
        feature: page.display_name,
        module: page.module,
        intent: `Run ${next} for ${page.display_name}`,
        clientId: client?.id,
        startStage: next,
        pageId: page.id,
      } as any);
      startPipelineForPage(runId, 'auto', page.id, page.display_name);
    } catch (err) {
      console.error('[PageDetailPanel] Run next failed:', (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-40 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) return null;

  const stageArtifacts = (stageId: string) => {
    const types = STAGE_ARTIFACT_TYPES[stageId] || [];
    if (types.length === 0) return page.artifacts || [];
    return (page.artifacts || []).filter((a: any) =>
      types.some(t => (a.type || '').toLowerCase().includes(t) || (a.name || '').toLowerCase().includes(t))
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-40 flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{page.display_name}</h3>
          {page.target_url && (
            <a href={page.target_url} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-600 hover:underline flex items-center gap-1 mt-0.5">
              {page.target_url.slice(0, 40)}... <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
      </div>

      {/* Stage Stepper */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {STAGE_ORDER.map((stageId, idx) => {
          const status = getStageStatus(stageId);
          const style = STATUS_STYLES[status?.status || 'not_started'] || STATUS_STYLES.not_started!;
          const isExpanded = expandedStage === stageId;

          return (
            <div key={stageId} className="relative">
              {/* Connector line */}
              {idx < STAGE_ORDER.length - 1 && (
                <div className="absolute left-3 top-8 w-0.5 h-6 bg-gray-200" />
              )}

              <button onClick={() => setExpandedStage(isExpanded ? null : stageId)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${style.bg} ${style.text}`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-800">{STAGE_LABELS[stageId]}</span>
                  <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.label}</span>
                </div>
                {status?.last_completed_at && (
                  <span className="text-[10px] text-gray-400">{new Date(status.last_completed_at).toLocaleDateString()}</span>
                )}
              </button>

              {/* Explore without reqs warning */}
              {status?.explore_without_reqs && (
                <div className="ml-9 px-2 py-1 rounded-lg bg-amber-50 text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Exploring without formal requirements — permitted by {status.explore_permitted_by}
                </div>
              )}

              {/* Artifacts (when expanded) */}
              {isExpanded && (
                <div className="ml-9 mt-1 space-y-1">
                  {stageArtifacts(stageId).length > 0 ? (
                    stageArtifacts(stageId).map((art: any) => (
                      <div key={art.id} className="flex items-center justify-between px-2 py-1 rounded-lg bg-gray-50 text-xs">
                        <span className="text-gray-700 truncate">{art.name}</span>
                        <div className="flex gap-1">
                          <button className="p-1 hover:bg-gray-200 rounded" title="View"><Eye className="w-3 h-3 text-gray-500" /></button>
                          <button className="p-1 hover:bg-gray-200 rounded" title="Delete" onClick={() => { if (window.confirm('Delete this artifact? This cannot be undone.')) deleteArtifact(art.id, 'user'); }}>
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 px-2">No artifacts yet</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-gray-200 space-y-2">
        {getNextStage() && (
          <button onClick={handleRunNext} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700">
            <Play className="w-4 h-4" /> Run {STAGE_LABELS[getNextStage()!]}
          </button>
        )}
        {page.artifacts?.length > 0 && (() => {
          // Find most recent completed stage with a run
          const latestRunId = page.stages
            ?.filter((s: PageStageStatus) => s.last_run_id)
            .sort((a: PageStageStatus, b: PageStageStatus) => new Date(b.last_completed_at || 0).getTime() - new Date(a.last_completed_at || 0).getTime())
            [0]?.last_run_id;
          return latestRunId ? (
            <button onClick={() => downloadArtifacts(latestRunId)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
              <Download className="w-4 h-4" /> Download Artifacts
            </button>
          ) : null;
        })()}
      </div>
    </div>
  );
}
