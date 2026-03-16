import { useState, useRef, useCallback, useEffect } from 'react';
import { subscribeToPipelineEvents } from '@/services/encoreApi';

export interface PipelineStageState {
  key: string;
  name: string;
  status: 'pending' | 'running' | 'completed';
  detail: string;
}

export interface ActivityMessage {
  stage: string;
  message: string;
  timestamp: string;
}

const INITIAL_STAGES: PipelineStageState[] = [
  { key: 'requirements', name: 'Analyzing Requirements', status: 'pending', detail: 'Pending' },
  { key: 'planning', name: 'Planning Tests', status: 'pending', detail: 'Pending' },
  { key: 'generation', name: 'Generating Scripts', status: 'pending', detail: 'Pending' },
  { key: 'execution', name: 'Running Tests', status: 'pending', detail: 'Pending' },
  { key: 'healing', name: 'Quality Checks', status: 'pending', detail: 'Pending' },
];

interface UsePipelineSSEOptions {
  onComplete?: (event: { runId?: string; totalTests?: number }) => void;
  onError?: (message: string) => void;
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

    const initial = INITIAL_STAGES.map((s, i) =>
      i === 0 ? { ...s, status: 'running' as const, detail: 'In progress...' } : s,
    );
    setStages(initial);
    setActivityMessages([]);
    setIsActive(true);

    const es = subscribeToPipelineEvents(runId, (event) => {
      if (event.type === 'stage_start') {
        setStages(prev =>
          prev.map(s => s.key === event.stage ? { ...s, status: 'running', detail: 'In progress...' } : s),
        );
      } else if (event.type === 'stage_complete') {
        setStages(prev =>
          prev.map(s => s.key === event.stage ? { ...s, status: 'completed', detail: 'Done' } : s),
        );
      } else if (event.type === 'agent_progress') {
        // Live activity messages from worker — update stage detail + add to activity feed
        if (event.stage && event.message) {
          setStages(prev =>
            prev.map(s => s.key === event.stage ? { ...s, detail: event.message! } : s),
          );
          setActivityMessages(prev => [
            ...prev.slice(-49), // Keep last 50 messages
            { stage: event.stage!, message: event.message!, timestamp: event.timestamp || new Date().toISOString() },
          ]);
        }
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
