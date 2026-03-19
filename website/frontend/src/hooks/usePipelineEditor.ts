/**
 * Pipeline editor state management — undo/redo, dirty tracking, validation.
 */

import { useState, useCallback, useRef } from 'react';
import type { PipelineDefinition, StageDefinition, PipelineValidationResult } from '@/types';
import { validatePipelineDefinition, saveClientPipelineDefinition, getClientPipelineDefinition } from '@/services/encoreApi';

const MAX_UNDO = 20;

export interface EditorState {
  definition: PipelineDefinition | null;
  version: number;
  clientId: string | null;
  isDefault: boolean;
  selectedNodeId: string | null;
  isDirty: boolean;
  validationErrors: string[];
  validationWarnings: string[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export function usePipelineEditor() {
  const [state, setState] = useState<EditorState>({
    definition: null,
    version: 0,
    clientId: null,
    isDefault: true,
    selectedNodeId: null,
    isDirty: false,
    validationErrors: [],
    validationWarnings: [],
    loading: false,
    saving: false,
    error: null,
  });

  const undoStack = useRef<PipelineDefinition[]>([]);
  const redoStack = useRef<PipelineDefinition[]>([]);

  /** Push current definition to undo stack before making a change */
  const pushUndo = useCallback(() => {
    if (state.definition) {
      undoStack.current = [...undoStack.current.slice(-(MAX_UNDO - 1)), structuredClone(state.definition)];
      redoStack.current = [];
    }
  }, [state.definition]);

  /** Load definition for a client (or default) */
  const loadClient = useCallback(async (clientId: string | null) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const result = await getClientPipelineDefinition(clientId || undefined);
      setState(s => ({
        ...s,
        definition: result.definition,
        version: result.version,
        clientId: result.clientId,
        isDefault: result.isDefault,
        isDirty: false,
        selectedNodeId: null,
        validationErrors: [],
        validationWarnings: [],
        loading: false,
      }));
      undoStack.current = [];
      redoStack.current = [];
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: (err as Error).message }));
    }
  }, []);

  /** Update definition (marks dirty, pushes undo) */
  const updateDefinition = useCallback((updater: (def: PipelineDefinition) => PipelineDefinition) => {
    setState(s => {
      if (!s.definition) return s;
      // Push to undo stack
      undoStack.current = [...undoStack.current.slice(-(MAX_UNDO - 1)), structuredClone(s.definition)];
      redoStack.current = [];
      return { ...s, definition: updater(structuredClone(s.definition)), isDirty: true };
    });
  }, []);

  /** Update a specific stage's config */
  const updateStage = useCallback((stageId: string, patch: Partial<StageDefinition>) => {
    updateDefinition(def => ({
      ...def,
      stages: def.stages.map(s => s.id === stageId ? { ...s, ...patch } : s),
    }));
  }, [updateDefinition]);

  /** Add a new stage */
  const addStage = useCallback((stage: StageDefinition) => {
    updateDefinition(def => ({ ...def, stages: [...def.stages, stage] }));
  }, [updateDefinition]);

  /** Remove a stage and all edges to/from it */
  const removeStage = useCallback((stageId: string) => {
    updateDefinition(def => ({
      ...def,
      stages: def.stages
        .filter(s => s.id !== stageId)
        .map(s => ({
          ...s,
          next: Object.fromEntries(Object.entries(s.next).filter(([, target]) => target !== stageId)),
          routing: s.routing ? {
            ...s.routing,
            rules: s.routing.rules.filter(r => r.then !== stageId),
          } : undefined,
        })),
    }));
  }, [updateDefinition]);

  /** Add an edge between stages */
  const addEdge = useCallback((sourceId: string, targetId: string, outcome: string = 'success') => {
    updateDefinition(def => ({
      ...def,
      stages: def.stages.map(s =>
        s.id === sourceId ? { ...s, next: { ...s.next, [outcome]: targetId } } : s,
      ),
    }));
  }, [updateDefinition]);

  /** Remove an edge */
  const removeEdge = useCallback((sourceId: string, outcome: string) => {
    updateDefinition(def => ({
      ...def,
      stages: def.stages.map(s => {
        if (s.id !== sourceId) return s;
        const next = { ...s.next };
        delete next[outcome];
        return { ...s, next };
      }),
    }));
  }, [updateDefinition]);

  /** Select a node for config editing */
  const selectNode = useCallback((nodeId: string | null) => {
    setState(s => ({ ...s, selectedNodeId: nodeId }));
  }, []);

  /** Undo */
  const undo = useCallback(() => {
    setState(s => {
      const prev = undoStack.current.pop();
      if (!prev || !s.definition) return s;
      redoStack.current.push(structuredClone(s.definition));
      return { ...s, definition: prev, isDirty: true };
    });
  }, []);

  /** Redo */
  const redo = useCallback(() => {
    setState(s => {
      const next = redoStack.current.pop();
      if (!next || !s.definition) return s;
      undoStack.current.push(structuredClone(s.definition));
      return { ...s, definition: next, isDirty: true };
    });
  }, []);

  /** Validate current definition */
  const validate = useCallback(async (): Promise<PipelineValidationResult> => {
    if (!state.definition) return { valid: false, errors: ['No definition loaded'], warnings: [] };
    const result = await validatePipelineDefinition(state.definition);
    setState(s => ({ ...s, validationErrors: result.errors, validationWarnings: result.warnings }));
    return result;
  }, [state.definition]);

  /** Save current definition */
  const save = useCallback(async (): Promise<boolean> => {
    if (!state.definition) return false;
    setState(s => ({ ...s, saving: true, error: null }));
    try {
      // Validate first
      const validation = await validatePipelineDefinition(state.definition);
      if (!validation.valid) {
        setState(s => ({
          ...s, saving: false,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
        }));
        return false;
      }

      const result = await saveClientPipelineDefinition(
        state.definition, state.version, state.clientId || undefined,
      );
      setState(s => ({
        ...s,
        version: result.version,
        isDirty: false,
        saving: false,
        validationErrors: [],
        validationWarnings: validation.warnings,
      }));
      return true;
    } catch (err) {
      const msg = (err as any)?.response?.data?.error || (err as Error).message;
      setState(s => ({ ...s, saving: false, error: msg }));
      return false;
    }
  }, [state.definition, state.version, state.clientId]);

  return {
    ...state,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    loadClient,
    updateDefinition,
    updateStage,
    addStage,
    removeStage,
    addEdge,
    removeEdge,
    selectNode,
    undo,
    redo,
    validate,
    save,
    pushUndo,
  };
}
