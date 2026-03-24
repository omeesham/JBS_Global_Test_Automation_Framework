import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { subscribeToPipelineEvents, listPipelineRuns, getClientPipelineDefinition } from '@/services/encoreApi';
import { buildInitialStages, upsertStage } from '@/utils/pipeline-stages';
import type { PipelineStageState, ActivityMessage } from '@/hooks/usePipelineSSE';
import type { PipelineDefinition } from '@/types';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type PendingAction = null | 'approval_required' | 'triage_required';

const MAX_SSE_SUBSCRIPTIONS = 10;

interface ActiveRunState {
  runId: string;
  pageId?: string;
  pageName?: string;
  mode: 'auto' | 'manual';
  stages: PipelineStageState[];
  activityMessages: ActivityMessage[];
  status: string | null;
  pendingAction: PendingAction;
  definition: PipelineDefinition | null;
}

interface ActivePipelineState {
  // === EXISTING (backwards-compat — computed from focusedRun) ===
  runId: string | null;
  stages: PipelineStageState[];
  activityMessages: ActivityMessage[];
  isActive: boolean;
  pipelineStatus: string | null;
  pendingAction: PendingAction;
  pipelineMode: 'auto' | 'manual';
  pipelineDefinition: PipelineDefinition | null;

  // === NEW (multi-run) ===
  activeRuns: Map<string, ActiveRunState>;
  focusedRunId: string | null;
  pendingCount: number;
}

interface ActivePipelineContextValue extends ActivePipelineState {
  startPipeline: (runId: string, mode?: 'auto' | 'manual', definition?: PipelineDefinition | null) => void;
  stopPipeline: () => void;
  setPipelineMode: (mode: 'auto' | 'manual') => void;
  clearPendingAction: () => void;
  focusRun: (runId: string) => void;
  startPipelineForPage: (runId: string, mode: 'auto' | 'manual', pageId: string, pageName: string) => void;
}

const ActivePipelineContext = createContext<ActivePipelineContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function computeFromFocused(runs: Map<string, ActiveRunState>, focusedId: string | null): Partial<ActivePipelineState> {
  const focused = focusedId ? runs.get(focusedId) : null;
  const anyActive = Array.from(runs.values()).some(r => r.status === 'running' || r.status === 'awaiting_approval' || r.status === 'awaiting_triage');
  const pendingCount = Array.from(runs.values()).filter(r => r.pendingAction !== null).length;

  return {
    runId: focused?.runId || null,
    stages: focused?.stages || [],
    activityMessages: focused?.activityMessages || [],
    isActive: anyActive,
    pipelineStatus: focused?.status || null,
    pendingAction: focused?.pendingAction || null,
    pipelineMode: focused?.mode || 'auto',
    pipelineDefinition: focused?.definition || null,
    pendingCount,
  };
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function ActivePipelineProvider({ children }: { children: ReactNode }) {
  const [activeRuns, setActiveRuns] = useState<Map<string, ActiveRunState>>(new Map());
  const [focusedRunId, setFocusedRunId] = useState<string | null>(null);
  const esRefs = useRef<Map<string, EventSource>>(new Map());
  const focusedRunIdRef = useRef<string | null>(null);
  // Keep ref in sync
  focusedRunIdRef.current = focusedRunId;

  const subscribeToRun = useCallback((runState: ActiveRunState) => {
    const { runId } = runState;

    // Cap subscriptions
    if (esRefs.current.size >= MAX_SSE_SUBSCRIPTIONS) {
      // Close oldest non-focused
      const oldest = Array.from(esRefs.current.entries()).find(([id]) => id !== focusedRunIdRef.current);
      if (oldest) {
        oldest[1].close();
        esRefs.current.delete(oldest[0]);
      }
    }

    // Close existing for this run
    esRefs.current.get(runId)?.close();

    const es = subscribeToPipelineEvents(runId, (event) => {
      setActiveRuns(prev => {
        const run = prev.get(runId);
        if (!run) return prev;
        const next = new Map(prev);

        if (event.type === 'stage_start') {
          next.set(runId, { ...run, stages: upsertStage(run.stages, event.stage!, { status: 'running', detail: 'In progress...', startedAt: Date.now() }) });
        } else if (event.type === 'stage_complete') {
          next.set(runId, { ...run, stages: upsertStage(run.stages, event.stage!, { status: 'completed', detail: 'Done' }) });
        } else if (event.type === 'agent_progress' && event.stage && event.message) {
          const prefix = run.pageName ? `[${run.pageName}] ` : '';
          next.set(runId, {
            ...run,
            stages: upsertStage(run.stages, event.stage!, { detail: event.message! }),
            activityMessages: [...run.activityMessages.slice(-49), { stage: event.stage!, message: `${prefix}${event.message!}`, timestamp: event.timestamp || new Date().toISOString() }],
          });
        } else if (event.type === 'triage_required') {
          next.set(runId, { ...run, pendingAction: 'triage_required', status: 'awaiting_triage' });
        } else if (event.type === 'approval_required') {
          next.set(runId, { ...run, pendingAction: 'approval_required', status: 'awaiting_approval' });
        } else if (event.type === 'pipeline_complete') {
          esRefs.current.get(runId)?.close();
          esRefs.current.delete(runId);
          const finalStatus = (event as Record<string, unknown>).status === 'fixme' ? 'failed' : 'completed';
          next.set(runId, { ...run, status: finalStatus, pendingAction: null });
        } else if (event.type === 'error') {
          esRefs.current.get(runId)?.close();
          esRefs.current.delete(runId);
          next.set(runId, { ...run, status: 'failed', pendingAction: null });
        }

        return next;
      });
    });

    es.onerror = () => {
      es.close();
      esRefs.current.delete(runId);
      setActiveRuns(prev => {
        const run = prev.get(runId);
        if (!run) return prev;
        const next = new Map(prev);
        next.set(runId, { ...run, status: 'error' });
        return next;
      });
    };

    esRefs.current.set(runId, es);
  }, []); // No deps — uses refs for mutable values

  const startPipeline = useCallback((runId: string, mode: 'auto' | 'manual' = 'auto', definition?: PipelineDefinition | null) => {
    const initial = buildInitialStages(definition);
    if (initial.length > 0) initial[0] = { ...initial[0]!, status: 'running', detail: 'In progress...' };

    const runState: ActiveRunState = {
      runId, mode, stages: initial, activityMessages: [], status: 'running',
      pendingAction: null, definition: definition || null,
    };

    setActiveRuns(prev => new Map(prev).set(runId, runState));
    setFocusedRunId(runId);
    subscribeToRun(runState);
  }, [subscribeToRun]);

  const startPipelineForPage = useCallback((runId: string, mode: 'auto' | 'manual', pageId: string, pageName: string) => {
    const runState: ActiveRunState = {
      runId, mode, pageId, pageName, stages: buildInitialStages(), activityMessages: [],
      status: 'running', pendingAction: null, definition: null,
    };

    setActiveRuns(prev => new Map(prev).set(runId, runState));
    setFocusedRunId(runId);
    subscribeToRun(runState);
  }, [subscribeToRun]);

  const stopPipeline = useCallback(() => {
    esRefs.current.forEach(es => es.close());
    esRefs.current.clear();
    setActiveRuns(new Map());
    setFocusedRunId(null);
  }, []);

  const setPipelineMode = useCallback((mode: 'auto' | 'manual') => {
    setActiveRuns(prev => {
      const fid = focusedRunIdRef.current;
      if (!fid) return prev;
      const run = prev.get(fid);
      if (!run) return prev;
      const next = new Map(prev);
      next.set(fid, { ...run, mode });
      return next;
    });
  }, []);

  const clearPendingAction = useCallback(() => {
    setActiveRuns(prev => {
      const fid = focusedRunIdRef.current;
      if (!fid) return prev;
      const run = prev.get(fid);
      if (!run) return prev;
      const next = new Map(prev);
      next.set(fid, { ...run, pendingAction: null });
      return next;
    });
  }, []);

  const focusRun = useCallback((runId: string) => {
    setFocusedRunId(runId);
  }, []);

  // Resume running pipelines on mount
  useEffect(() => {
    const token = sessionStorage.getItem('intelliqe_token');
    if (!token) return;

    listPipelineRuns('running')
      .then(async (runs) => {
        if (runs.length > 0) {
          const latest = runs[0]!;
          let definition: PipelineDefinition | null = null;
          try {
            const resp = await getClientPipelineDefinition(latest.clientId || undefined);
            definition = resp.definition;
          } catch { /* use defaults */ }
          startPipeline(latest.id, 'auto', definition);
        }
      })
      .catch(() => {});

    return () => { esRefs.current.forEach(es => es.close()); };
  }, [startPipeline]);

  // Compute backwards-compat state from focused run
  const computed = computeFromFocused(activeRuns, focusedRunId);

  return (
    <ActivePipelineContext.Provider
      value={{
        ...computed as ActivePipelineState,
        activeRuns,
        focusedRunId,
        startPipeline,
        stopPipeline,
        setPipelineMode,
        clearPendingAction,
        focusRun,
        startPipelineForPage,
      }}
    >
      {children}
    </ActivePipelineContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useActivePipeline() {
  const ctx = useContext(ActivePipelineContext);
  if (!ctx) throw new Error('useActivePipeline must be used within ActivePipelineProvider');
  return ctx;
}
