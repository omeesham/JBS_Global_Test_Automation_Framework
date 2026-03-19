import { useState } from 'react';
import { X, MessageSquare, Download, StopCircle, FileText, Clock, DollarSign, GitBranch, List } from 'lucide-react';
import type { PipelineRun, PipelineDefinition } from '@/types';
import type { PipelineStageState, ActivityMessage } from '@/hooks/usePipelineSSE';
import { useAuth } from '@/contexts/AuthContext';
import { downloadArtifacts } from '@/services/encoreApi';
import StageTimeline from '../pipeline/StageTimeline';
import PipelineProgress from '../chat/PipelineProgress';
import AgentActivityFeed from '../pipeline/AgentActivityFeed';
import PipelineGraph from '../pipeline/PipelineGraph';

interface Props {
  run: PipelineRun | null;
  onClose: () => void;
  liveStages?: PipelineStageState[];
  activityMessages?: ActivityMessage[];
  pipelineDefinition?: PipelineDefinition;
}

export default function RunDetailDrawer({ run, onClose, liveStages, activityMessages, pipelineDefinition }: Props) {
  if (!run) return null;

  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'client_admin';
  const isRunning = run.status === 'running';
  const [downloading, setDownloading] = useState(false);
  const [view, setView] = useState<'graph' | 'timeline'>('graph');

  const handleDownload = async () => {
    if (run.artifacts.length === 0 || downloading) return;
    setDownloading(true);
    try {
      await downloadArtifacts(run.id);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };
  const date = new Date(run.createdAt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white border-l border-[#DDD6FE] shadow-2xl shadow-purple-500/10 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#EDE9FE]">
        <div>
          <h3 className="text-sm font-semibold text-[#1E1B4B]">{run.feature}</h3>
          <p className="text-[10px] text-[#6B7280] mt-0.5">{run.module} &middot; {run.id.slice(0, 8)}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-[#F5F3FF] hover:bg-[#EDE9FE] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-[#6B7280]" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Summary row — cost card only visible to admins (defense-in-depth, server enforces too) */}
        <div className={`grid gap-3 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <div className="bg-[#F5F3FF] rounded-lg p-3 text-center">
            <Clock className="w-4 h-4 text-[#7C3AED] mx-auto mb-1" />
            <p className="text-[10px] text-[#6B7280]">Started</p>
            <p className="text-xs font-semibold text-[#1E1B4B]">{date}</p>
          </div>
          {isAdmin && (
            <div className="bg-[#F5F3FF] rounded-lg p-3 text-center">
              <DollarSign className="w-4 h-4 text-[#7C3AED] mx-auto mb-1" />
              <p className="text-[10px] text-[#6B7280]">Total Cost</p>
              <p className="text-xs font-semibold text-[#1E1B4B]">${run.totalCost.toFixed(2)}</p>
            </div>
          )}
          <div className="bg-[#F5F3FF] rounded-lg p-3 text-center">
            <FileText className="w-4 h-4 text-[#7C3AED] mx-auto mb-1" />
            <p className="text-[10px] text-[#6B7280]">Artifacts</p>
            <p className="text-xs font-semibold text-[#1E1B4B]">{run.artifacts.length}</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-[#F5F3FF] rounded-lg w-fit">
          <button
            onClick={() => setView('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === 'graph' ? 'bg-white text-[#1E1B4B] shadow-sm' : 'text-[#6B7280] hover:text-[#1E1B4B]'
            }`}
          >
            <GitBranch className="w-3 h-3" />
            Graph
          </button>
          <button
            onClick={() => setView('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === 'timeline' ? 'bg-white text-[#1E1B4B] shadow-sm' : 'text-[#6B7280] hover:text-[#1E1B4B]'
            }`}
          >
            <List className="w-3 h-3" />
            Timeline
          </button>
        </div>

        {/* Pipeline Visualization */}
        {view === 'graph' ? (
          <>
            <PipelineGraph
              liveStages={isRunning ? liveStages : undefined}
              stageResults={!isRunning ? run.stages : undefined}
              pipelineStatus={run.status}
              currentStage={run.stages?.length ? undefined : undefined}
              showCost={isAdmin}
              pipelineDefinition={pipelineDefinition}
            />
            {/* Agent Activity Feed — live messages from worker */}
            {isRunning && activityMessages && activityMessages.length > 0 && (
              <AgentActivityFeed messages={activityMessages} />
            )}
          </>
        ) : isRunning && liveStages && liveStages.length > 0 ? (
          <>
            <PipelineProgress stages={liveStages} />
            {activityMessages && activityMessages.length > 0 && (
              <AgentActivityFeed messages={activityMessages} />
            )}
          </>
        ) : (
          <>
            {/* Stage Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-[#1E1B4B] mb-3">Stage Timeline</h4>
              <StageTimeline stages={run.stages} />
            </div>

            {/* Stage Details */}
            <div>
              <h4 className="text-xs font-semibold text-[#1E1B4B] mb-3">Stage Details</h4>
              <div className="space-y-2">
                {run.stages.map((stage, i) => (
                  <div key={i} className="bg-[#F5F3FF] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#1E1B4B] capitalize">{stage.stage.replace(/_/g, ' ')}</span>
                      {isAdmin && (
                        <span className="text-[10px] text-[#6B7280]">${stage.cost.toFixed(3)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[#6B7280]">
                      <span>{stage.agent}</span>
                      <span>&middot;</span>
                      <span>{stage.model}</span>
                      <span>&middot;</span>
                      <span>{stage.duration}s</span>
                      {stage.attempts > 1 && (
                        <>
                          <span>&middot;</span>
                          <span className="text-amber-600">{stage.attempts} attempts</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {run.stages.length === 0 && (
                  <p className="text-xs text-[#6B7280] text-center py-4">No stages executed yet</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Artifacts */}
        {run.artifacts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[#1E1B4B] mb-3">Artifacts</h4>
            <div className="space-y-1.5">
              {run.artifacts.map((artifact) => (
                <div key={artifact.id} className="flex items-center justify-between py-2 px-3 bg-[#F5F3FF] rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span className="text-xs text-[#1E1B4B]">{artifact.name}</span>
                  </div>
                  <span className="text-[10px] text-[#6B7280] uppercase">{artifact.artifactType}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 p-4 border-t border-[#EDE9FE]">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium rounded-lg transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          View in Chat
        </button>
        <button
          onClick={handleDownload}
          disabled={run.artifacts.length === 0 || downloading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#1E1B4B] text-xs font-medium rounded-lg border border-[#DDD6FE] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading ? 'Downloading...' : 'Download'}
        </button>
        {isRunning && (
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg border border-red-200 transition-colors">
            <StopCircle className="w-3.5 h-3.5" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
