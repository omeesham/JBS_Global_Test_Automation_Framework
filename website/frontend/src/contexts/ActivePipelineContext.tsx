import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { subscribeToPipelineEvents, listPipelineRuns, getClientPipelineDefinition } from '@/services/encoreApi';
import { buildInitialStages, upsertStage } from '@/utils/pipeline-stages';
import type { PipelineStageState, ActivityMessage } from '@/hooks/usePipelineSSE';
import type { PipelineDefinition } from '@/types';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type PendingAction = null | 'approval_required' | 'triage_required';

interface ActivePipelineState {
  runId: string | null;
  stages: PipelineStageState[];
  activityMessages: ActivityMessage[];
  isActive: boolean;
  pipelineStatus: string | null;
  pendingAction: PendingAction;
  /** Client-side pipeline mode preference */
  pipelineMode: 'auto' | 'manual';
  /** Pipeline definition captured at run start (frozen for the run's lifetime) */
  pipelineDefinition: PipelineDefinition | null;
}

interface ActivePipelineContextValue extends ActivePipelineState {
  /** Start watching a new pipeline run */
  startPipeline: (runId: string, mode?: 'auto' | 'manual', definition?: PipelineDefinition | null) => void;
  /** Stop watching */
  stopPipeline: () => void;
  /** Set pipeline mode */
  setPipelineMode: (mode: 'auto' | 'manual') => void;
  /** Clear pending action (after user handles approval/triage) */
  clearPendingAction: () => void;
}

const ActivePipelineContext = createContext<ActivePipelineContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function ActivePipelineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ActivePipelineState>({
    runId: null,
    stages: [],
    activityMessages: [],
    isActive: false,
    pipelineStatus: null,
    pendingAction: null,
    pipelineMode: 'auto',
    pipelineDefinition: null,
  });

  const esRef = useRef<EventSource | null>(null);

  /** Subscribe to SSE events for a pipeline run */
  const subscribeToRun = useCallback((runId: string, definition?: PipelineDefinition | null) => {
    esRef.current?.close();

    const initial = buildInitialStages(definition);
    // Mark first stage as running
    if (initial.length > 0) {
      initial[0] = { ...initial[0]!, status: 'running', detail: 'In progress...' };
    }

    setState(prev => ({
      ...prev,
      runId,
      stages: initial,
      activityMessages: [],
      isActive: true,
      pipelineStatus: 'running',
      pendingAction: null,
      pipelineDefinition: definition || null,
    }));

    const es = subscribeToPipelineEvents(runId, (event) => {
      if (event.type === 'stage_start') {
        setState(prev => ({
          ...prev,
          stages: upsertStage(prev.stages, event.stage!, {
            status: 'running', detail: 'In progress...', startedAt: Date.now(),
          }),
        }));
      } else if (event.type === 'stage_complete') {
        setState(prev => ({
          ...prev,
          stages: upsertStage(prev.stages, event.stage!, {
            status: 'completed', detail: 'Done',
          }),
        }));
      } else if (event.type === 'agent_progress') {
        if (event.stage && event.message) {
          setState(prev => ({
            ...prev,
            stages: upsertStage(prev.stages, event.stage!, { detail: event.message! }),
            activityMessages: [
              ...prev.activityMessages.slice(-49),
              { stage: event.stage!, message: event.message!, timestamp: event.timestamp || new Date().toISOString() },
            ],
          }));
        }
      } else if (event.type === 'triage_required') {
        setState(prev => ({
          ...prev,
          pendingAction: 'triage_required',
          pipelineStatus: 'awaiting_triage',
        }));
      } else if (event.type === 'approval_required') {
        setState(prev => ({
          ...prev,
          pendingAction: 'approval_required',
          pipelineStatus: 'awaiting_approval',
        }));
      } else if (event.type === 'pipeline_complete') {
        es.close();
        esRef.current = null;
        setState(prev => ({
          ...prev,
          isActive: false,
          pipelineStatus: 'completed',
          pendingAction: null,
        }));
      } else if (event.type === 'error') {
        es.close();
        esRef.current = null;
        setState(prev => ({
          ...prev,
          isActive: false,
          pipelineStatus: 'failed',
          pendingAction: null,
        }));
      }
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setState(prev => ({ ...prev, isActive: false, pipelineStatus: 'error' }));
    };

    esRef.current = es;
  }, []);

  const startPipeline = useCallback((runId: string, mode: 'auto' | 'manual' = 'auto', definition?: PipelineDefinition | null) => {
    setState(prev => ({ ...prev, pipelineMode: mode }));
    subscribeToRun(runId, definition);
  }, [subscribeToRun]);

  const stopPipeline = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    setState(prev => ({ ...prev, isActive: false, runId: null, stages: [], activityMessages: [], pipelineStatus: null, pendingAction: null, pipelineDefinition: null }));
  }, []);

  const setPipelineMode = useCallback((mode: 'auto' | 'manual') => {
    setState(prev => ({ ...prev, pipelineMode: mode }));
  }, []);

  const clearPendingAction = useCallback(() => {
    setState(prev => ({ ...prev, pendingAction: null }));
  }, []);

  // On mount: check if there's an already-running pipeline to resume watching
  // Only poll when user is authenticated (token exists in sessionStorage)
  useEffect(() => {
    const token = sessionStorage.getItem('intelliqe_token');
    if (!token) return;

    listPipelineRuns('running')
      .then(async (runs) => {
        if (runs.length > 0) {
          const latest = runs[0]!;
          // Try to fetch client definition for the resumed run
          let definition: PipelineDefinition | null = null;
          try {
            const resp = await getClientPipelineDefinition(latest.clientId || undefined);
            definition = resp.definition;
          } catch (err) { console.warn('[ActivePipeline] Failed to fetch client definition, using defaults:', err); }
          subscribeToRun(latest.id, definition);
        }
      })
      .catch(() => {});

    return () => { esRef.current?.close(); };
  }, [subscribeToRun]);

  return (
    <ActivePipelineContext.Provider
      value={{
        ...state,
        startPipeline,
        stopPipeline,
        setPipelineMode,
        clearPendingAction,
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
