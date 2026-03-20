import { useState } from 'react';
import { Globe, FileText, Sparkles } from 'lucide-react';
import { updatePageRecord, permitExplore, createPipelineRun } from '@/services/encoreApi';
import { useAuth } from '@/contexts/AuthContext';
import { useActivePipeline } from '@/contexts/ActivePipelineContext';
import { useClient } from '@/contexts/ClientContext';

interface RequirementsGateCardProps {
  pageId: string;
  runId: string;
  hasUrl: boolean;
  onComplete?: () => void;
}

export default function RequirementsGateCard({ pageId, runId, hasUrl, onComplete }: RequirementsGateCardProps) {
  const { user } = useAuth();
  const { client } = useClient();
  const { startPipelineForPage } = useActivePipeline();
  const [url, setUrl] = useState('');
  const [requirements, setRequirements] = useState('');
  const [mode, setMode] = useState<'url' | 'write' | 'explore' | null>(hasUrl ? null : 'url');
  const [loading, setLoading] = useState(false);

  const permittedBy = `${user?.username || 'unknown'} - ${user?.role || 'user'}`;

  const handleSaveUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      await updatePageRecord(pageId, { target_url: url.trim() });
      // Re-start pipeline now that URL is set
      const { runId: newRunId } = await createPipelineRun({
        feature: 'discovery',
        module: 'requirements',
        intent: `Discover ${url}`,
        clientId: client?.id,
        startStage: 'requirements',
        pageId,
      } as any);
      startPipelineForPage(newRunId, 'auto', pageId, 'Page');
      onComplete?.();
    } catch (err) {
      console.error('[RequirementsGateCard] Save URL failed:', (err as Error).message);
    }
    setLoading(false);
  };

  const handleWriteRequirements = async () => {
    if (!requirements.trim()) return;
    setLoading(true);
    try {
      // Save as artifact via direct API call
      await fetch('/api/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, name: 'User Requirements', type: 'user_requirements', content: requirements.trim(), pageId }),
      }).catch((err) => console.error('[RequirementsGateCard] Failed to save artifact:', err?.message));
      // Start pipeline
      const { runId: newRunId } = await createPipelineRun({
        feature: 'user-requirements',
        module: 'requirements',
        intent: requirements.trim().slice(0, 200),
        clientId: client?.id,
        startStage: 'planning',
        pageId,
      } as any);
      startPipelineForPage(newRunId, 'auto', pageId, 'Page');
      onComplete?.();
    } catch (err) {
      console.error('[RequirementsGateCard] Write requirements failed:', (err as Error).message);
    }
    setLoading(false);
  };

  const handleExploreFreely = async () => {
    setLoading(true);
    try {
      await permitExplore(pageId, permittedBy);
      // Re-start pipeline
      const { runId: newRunId } = await createPipelineRun({
        feature: 'explore',
        module: 'requirements',
        intent: 'AI-driven exploration without formal requirements',
        clientId: client?.id,
        startStage: 'requirements',
        pageId,
      } as any);
      startPipelineForPage(newRunId, 'auto', pageId, 'Page');
      onComplete?.();
    } catch (err) {
      console.error('[RequirementsGateCard] Explore freely failed:', (err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="pipeline-card-enter bg-white rounded-2xl border-2 border-amber-300 shadow-sm max-w-lg">
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 text-amber-700 font-semibold">
          {!hasUrl ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          {!hasUrl ? 'Page URL Required' : 'Requirements Needed'}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {!hasUrl
            ? 'Provide the page URL so the AI agent can start exploring.'
            : 'This page has no formal requirements. Choose how to proceed:'}
        </p>
      </div>

      <div className="px-5 pb-4 space-y-3">
        {mode === 'url' && (
          <div className="space-y-2">
            <input
              type="url" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://your-app.com/page"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button onClick={handleSaveUrl} disabled={!url.trim() || loading}
              className="w-full px-4 py-2.5 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save & Start Discovery'}
            </button>
          </div>
        )}

        {hasUrl && mode === null && (
          <div className="space-y-2">
            <button onClick={() => setMode('write')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-left hover:border-violet-300 hover:bg-violet-50/50 transition-all">
              <FileText className="w-5 h-5 text-violet-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Write Requirements</p>
                <p className="text-xs text-gray-500">Provide formal requirements for this page</p>
              </div>
            </button>
            <button onClick={() => setMode('explore')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-left hover:border-amber-300 hover:bg-amber-50/50 transition-all">
              <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Let AI Explore Freely</p>
                <p className="text-xs text-gray-500">AI will discover and test based on what it finds</p>
              </div>
            </button>
          </div>
        )}

        {mode === 'write' && (
          <div className="space-y-2">
            <textarea value={requirements} onChange={e => setRequirements(e.target.value)}
              placeholder="Describe what this page should do, key features, user flows..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
              rows={4}
            />
            <div className="flex gap-2">
              <button onClick={() => setMode(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
                Back
              </button>
              <button onClick={handleWriteRequirements} disabled={!requirements.trim() || loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save & Start Pipeline'}
              </button>
            </div>
          </div>
        )}

        {mode === 'explore' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
              This will be logged as: <strong>{permittedBy}</strong> permitted exploration without formal requirements.
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
                Back
              </button>
              <button onClick={handleExploreFreely} disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 disabled:opacity-50">
                {loading ? 'Starting...' : 'Explore Freely'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
