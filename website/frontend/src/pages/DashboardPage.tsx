import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Play } from 'lucide-react';
import { getAdminUsage, listPipelineRuns, getWorkerStatus, getPipelineRunDetail, getClientPipelineDefinition } from '@/services/encoreApi';
import { startWorker, stopWorker, restartWorker, getWorkerControlStatus } from '@/services/api';
import type { AdminUsage, WorkerStatus, PipelineRun, PipelineDefinition } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import { buildInitialStages } from '@/utils/pipeline-stages';
import { useActivePipeline } from '@/contexts/ActivePipelineContext';
import { usePipelineSSE } from '@/hooks/usePipelineSSE';
import RunKPIBar from '@/components/dashboard/RunKPIBar';
import RunTable from '@/components/dashboard/RunTable';
import RunDetailDrawer from '@/components/dashboard/RunDetailDrawer';
import ChartSection from '@/components/dashboard/ChartSection';
import SuperAdminPanel from '@/components/dashboard/SuperAdminPanel';
import DashboardBriefing from '@/components/dashboard/DashboardBriefing';
import WorkerIndicator from '@/components/common/WorkerIndicator';
import RunPipelineModal from '@/components/dashboard/RunPipelineModal';
import BugDiscoveryPanel from '@/components/dashboard/BugDiscoveryPanel';
import TriagePanel from '@/components/dashboard/TriagePanel';
import ArtifactApprovalPanel from '@/components/dashboard/ArtifactApprovalPanel';

export default function DashboardPage() {
  const { user } = useAuth();
  const { client } = useClient();
  const activePipeline = useActivePipeline();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<AdminUsage | null>(null);
  const [worker, setWorker] = useState<WorkerStatus | null>(null);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
  const [filter, setFilter] = useState('all');
  const [showRunModal, setShowRunModal] = useState(false);
  const [workerActionLoading, setWorkerActionLoading] = useState(false);
  const [clientDefinition, setClientDefinition] = useState<PipelineDefinition | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // Fetch client pipeline definition
  useEffect(() => {
    getClientPipelineDefinition(client?.id || undefined)
      .then(resp => setClientDefinition(resp.definition))
      .catch(() => setClientDefinition(null));
  }, [client?.id]);

  const refreshWorkerStatus = useCallback(async () => {
    try {
      const status = await getWorkerControlStatus();
      setWorker(status);
    } catch { /* ignore — backend may be down */ }
  }, []);

  const refreshRuns = useCallback(async () => {
    try {
      const runsData = await listPipelineRuns();
      setRuns(runsData);
    } catch { /* ignore */ }
  }, []);

  // Pipeline SSE for live progress on dashboard
  const dynamicStages = clientDefinition ? buildInitialStages(clientDefinition) : undefined;
  const pipeline = usePipelineSSE({
    onComplete: () => {
      refreshRuns();
    },
    onError: () => {
      refreshRuns();
    },
    initialStages: dynamicStages,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageData, workerData, runsData] = await Promise.allSettled([
          getAdminUsage(),
          getWorkerStatus(),
          listPipelineRuns(),
        ]);
        if (usageData.status === 'fulfilled') setUsage(usageData.value);
        if (workerData.status === 'fulfilled') setWorker(workerData.value);
        if (runsData.status === 'fulfilled') setRuns(runsData.value);
      } catch {
        setError('Encore backend unavailable. Start the server on port 3100.');
      }
      setLoading(false);
    };
    fetchData();

    // Poll worker status every 30s
    pollRef.current = setInterval(refreshWorkerStatus, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [refreshWorkerStatus]);

  // Worker control handlers
  const handleWorkerAction = useCallback(async (action: () => Promise<unknown>) => {
    setWorkerActionLoading(true);
    try {
      await action();
      // Give the worker a moment to start/stop, then refresh
      setTimeout(refreshWorkerStatus, 2000);
    } catch (err) {
      console.error('[Dashboard] Worker action failed:', err);
    }
    setWorkerActionLoading(false);
  }, [refreshWorkerStatus]);

  const handleStartWorker = useCallback(() => handleWorkerAction(startWorker), [handleWorkerAction]);
  const handleStopWorker = useCallback(() => handleWorkerAction(stopWorker), [handleWorkerAction]);
  const handleRestartWorker = useCallback(() => handleWorkerAction(restartWorker), [handleWorkerAction]);

  const handleRunStarted = async (runId: string) => {
    // Start SSE watch for live progress (local dashboard hook)
    pipeline.startWatch(runId);
    // Sync global context so banner/chat page track the run
    activePipeline.startPipeline(runId, 'auto', clientDefinition);
    // Fetch the new run and select it to show in drawer
    try {
      const run = await getPipelineRunDetail(runId);
      setRuns(prev => [run, ...prev]);
      setSelectedRun(run);
    } catch {
      // Run may not be fully created yet, refresh after a short delay
      await refreshRuns();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        <span className="ml-3 text-sm text-[#6B7280]">Loading dashboard...</span>
      </div>
    );
  }

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1E1B4B]">Dashboard</h2>
          <p className="text-sm text-[#6B7280]">Pipeline runs and testing operations overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRunModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Run Pipeline
          </button>
          {worker && (
            <WorkerIndicator
              connected={worker.connected}
              lastHeartbeat={worker.lastHeartbeat}
              currentTask={worker.currentTask}
              isSuperAdmin={isSuperAdmin}
              onStart={handleStartWorker}
              onStop={handleStopWorker}
              onRestart={handleRestartWorker}
              actionLoading={workerActionLoading}
            />
          )}
        </div>
      </div>

      <DashboardBriefing />

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          {error}
        </div>
      )}

      <RunKPIBar usage={usage} />

      {/* Approval panel — show when any run is awaiting approval */}
      {runs.filter(r => r.status === 'awaiting_approval').map(r => (
        <ArtifactApprovalPanel key={r.id} runId={r.id} onResume={refreshRuns} />
      ))}

      {/* Triage panel — show when any run is awaiting triage */}
      {runs.filter(r => r.status === 'awaiting_triage').map(r => (
        <TriagePanel key={r.id} runId={r.id} onResume={refreshRuns} />
      ))}

      <BugDiscoveryPanel />

      <ChartSection runs={runs} />

      <RunTable
        runs={runs}
        onSelectRun={setSelectedRun}
        filter={filter}
        onFilterChange={setFilter}
      />

      <RunDetailDrawer
        run={selectedRun}
        onClose={() => setSelectedRun(null)}
        liveStages={pipeline.isActive ? pipeline.stages : undefined}
        activityMessages={pipeline.isActive ? pipeline.activityMessages : undefined}
        pipelineDefinition={clientDefinition || undefined}
      />

      {isSuperAdmin && <SuperAdminPanel role={user.role} />}

      <RunPipelineModal
        open={showRunModal}
        onClose={() => setShowRunModal(false)}
        onRunStarted={handleRunStarted}
        pipelineDefinition={clientDefinition || undefined}
      />
    </div>
  );
}
