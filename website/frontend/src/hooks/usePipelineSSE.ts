import { useState, useRef, useCallback, useEffect } from 'react';
import { subscribeToPipelineEvents } from '@/services/encoreApi';
import { buildInitialStages, upsertStage } from '@/utils/pipeline-stages';

export interface PipelineStageState {
  key: string;
  name: string;
  status: 'pending' | 'running' | 'completed';
  detail: string;
  startedAt?: number;
}

export interface ActivityMessage {
  stage: string;
  message: string;
  timestamp: string;
}

interface UsePipelineSSEOptions {
  onComplete?: (event: { runId?: string; totalTests?: number }) => void;
  onError?: (message: string) => void;
  onTriageRequired?: (event: { runId?: string; failureCount?: number }) => void;
  /** Custom initial stages (from client pipeline definition). Falls back to default 5-stage. */
  initialStages?: PipelineStageState[];
}

export function usePipelineSSE(options?: UsePipelineSSEOptions) {
  const [stages, setStages] = useState<PipelineStageState[]>([]);
  const [activityMessages, setActivityMessages] = useState<ActivityMessage[]>([]);
  const [isActive, setIsActive] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const stopWatch = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    setIsActive(false);
  }, []);

  const startWatch = useCallback((runId: string) => {
    // Close any existing connection
    esRef.current?.close();

    const base = optionsRef.current?.initialStages ?? buildInitialStages();
    const initial = base.map((s, i) =>
      i === 0 ? { ...s, status: 'running' as const, detail: 'In progress...' } : { ...s },
    );
    setStages(initial);
    setActivityMessages([]);
    setIsActive(true);

    const es = subscribeToPipelineEvents(runId, (event) => {
      if (event.type === 'stage_start') {
        setStages(prev => upsertStage(prev, event.stage!, {
          status: 'running', detail: 'In progress...', startedAt: Date.now(),
        }));
      } else if (event.type === 'stage_complete') {
        setStages(prev => upsertStage(prev, event.stage!, {
          status: 'completed', detail: 'Done',
        }));
      } else if (event.type === 'agent_progress') {
        // Live activity messages from worker — update stage detail + add to activity feed
        if (event.stage && event.message) {
          setStages(prev => upsertStage(prev, event.stage!, { detail: event.message! }));
          setActivityMessages(prev => [
            ...prev.slice(-49), // Keep last 50 messages
            { stage: event.stage!, message: event.message!, timestamp: event.timestamp || new Date().toISOString() },
          ]);
        }
      } else if (event.type === 'triage_required') {
        // Pipeline paused for triage — notify UI but keep connection open
        optionsRef.current?.onTriageRequired?.({ runId: event.runId, failureCount: (event as any).failureCount });
      } else if (event.type === 'pipeline_complete') {
        es.close();
        esRef.current = null;
        setIsActive(false);
        optionsRef.current?.onComplete?.({ runId: event.runId, totalTests: (event as any).totalTests });
      } else if (event.type === 'error') {
        es.close();
        esRef.current = null;
        setIsActive(false);
        optionsRef.current?.onError?.(event.message || 'Pipeline failed');
      }
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setIsActive(false);
      optionsRef.current?.onError?.('Lost connection to the testing process.');
    };

    esRef.current = es;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      esRef.current?.close();
    };
  }, []);

  return { stages, activityMessages, isActive, startWatch, stopWatch };
}
