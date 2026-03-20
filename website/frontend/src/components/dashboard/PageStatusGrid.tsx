import { useState, useEffect } from 'react';
import { Play, RefreshCw, Plus, ExternalLink } from 'lucide-react';
import { listPages, batchRunPipeline, createPipelineRun } from '@/services/encoreApi';
import type { Page } from '@/services/encoreApi';
import { useClient } from '@/contexts/ClientContext';
import { useActivePipeline } from '@/contexts/ActivePipelineContext';

const STAGE_ORDER = ['requirements', 'planning', 'generation', 'healing', 'audit'];
const STAGE_LABELS: Record<string, string> = {
  requirements: 'Discover', planning: 'Planner', generation: 'Generator', healing: 'Healer', audit: 'Audit',
};
const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-500 text-white',
  running: 'bg-violet-500 text-white animate-pulse',
  failed: 'bg-red-500 text-white',
  not_started: 'bg-gray-200 text-gray-500',
};

interface PageStatusGridProps {
  onPageClick?: (pageId: string) => void;
  onSetupRequired?: () => void;
}

export default function PageStatusGrid({ onPageClick, onSetupRequired }: PageStatusGridProps) {
  const { client } = useClient();
  const { startPipelineForPage } = useActivePipeline();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  const fetchPages = () => {
    if (!client?.id) return;
    setLoading(true);
    listPages(client.id)
      .then(setPages)
      .catch((err) => console.error('[PageStatusGrid] Failed to load pages:', err?.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPages(); }, [client?.id]);

  const toggleSelect = (id: string) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getStageStatus = (page: Page, stageId: string): string => {
    const stages = page.stages as Array<{ stage_id: string; status: string }> | undefined;
    return stages?.find(s => s.stage_id === stageId)?.status || 'not_started';
  };

  const getNextStage = (page: Page): string | null => {
    for (const s of STAGE_ORDER) {
      if (getStageStatus(page, s) === 'not_started' || getStageStatus(page, s) === 'failed') return s;
    }
    return null;
  };

  const handleRunNext = async (page: Page) => {
    const next = getNextStage(page);
    if (!next) return;
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
      console.error('[PageStatusGrid] Run next failed:', (err as Error).message);
    }
  };

  const handleBatchRun = async (targetStage: string) => {
    if (selectedPages.size === 0) return;
    setBatchLoading(true);
    try {
      await batchRunPipeline({
        pageIds: Array.from(selectedPages),
        targetStage,
        mode: 'auto',
        intent: `Batch ${targetStage}`,
        clientId: client?.id,
      });
      fetchPages();
    } catch (err) {
      console.error('[PageStatusGrid] Batch run failed:', (err as Error).message);
    }
    setBatchLoading(false);
    setSelectedPages(new Set());
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-gray-400 text-sm">Loading pages...</div>;
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-gray-500 text-sm">No pages discovered yet</p>
        <button onClick={onSetupRequired} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Setup Project
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={fetchPages} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          {selectedPages.size > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">{selectedPages.size} selected</span>
              {STAGE_ORDER.map(s => (
                <button key={s} onClick={() => handleBatchRun(s)} disabled={batchLoading}
                  className="px-2 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium hover:bg-violet-100 disabled:opacity-50">
                  {STAGE_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-8 px-3 py-2"><input type="checkbox" onChange={e => setSelectedPages(e.target.checked ? new Set(pages.map(p => p.id)) : new Set())} /></th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Page</th>
              {STAGE_ORDER.map(s => <th key={s} className="text-center px-2 py-2 font-medium text-gray-600">{STAGE_LABELS[s]}</th>)}
              <th className="text-right px-3 py-2 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="px-3 py-2"><input type="checkbox" checked={selectedPages.has(page.id)} onChange={() => toggleSelect(page.id)} /></td>
                <td className="px-3 py-2">
                  <button onClick={() => onPageClick?.(page.id)} className="text-left hover:text-violet-600 transition-colors">
                    <span className="font-medium text-gray-800">{page.display_name}</span>
                    {page.target_url && <ExternalLink className="w-3 h-3 text-gray-400 inline ml-1" />}
                  </button>
                </td>
                {STAGE_ORDER.map(s => {
                  const status = getStageStatus(page, s);
                  return (
                    <td key={s} className="text-center px-2 py-2">
                      <span className={`inline-block w-6 h-6 rounded-lg text-[10px] font-bold leading-6 ${STATUS_STYLES[status] || STATUS_STYLES.not_started}`}>
                        {status === 'completed' ? '✓' : status === 'running' ? '…' : status === 'failed' ? '✗' : '·'}
                      </span>
                    </td>
                  );
                })}
                <td className="text-right px-3 py-2">
                  {getNextStage(page) && (
                    <button onClick={() => handleRunNext(page)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium hover:bg-violet-100">
                      <Play className="w-3 h-3" /> {STAGE_LABELS[getNextStage(page)!]}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
