/**
 * Shared utilities for building pipeline stage state from definitions.
 * Eliminates duplicate INITIAL_STAGES constants across the app.
 */

import type { PipelineDefinition } from '@/types';
import type { PipelineStageState } from '@/hooks/usePipelineSSE';

/** Default 5-stage fallback when no definition is available */
const DEFAULT_STAGES: PipelineStageState[] = [
  { key: 'requirements', name: 'Analyzing Requirements', status: 'pending', detail: 'Pending' },
  { key: 'planning', name: 'Planning Tests', status: 'pending', detail: 'Pending' },
  { key: 'generation', name: 'Generating Scripts', status: 'pending', detail: 'Pending' },
  { key: 'healing', name: 'Test Healing', status: 'pending', detail: 'Pending' },
  { key: 'audit', name: 'Quality Audit', status: 'pending', detail: 'Pending' },
];

/**
 * Build initial PipelineStageState[] from a PipelineDefinition.
 * Falls back to default 5-stage array when no definition is provided.
 */
export function buildInitialStages(definition?: PipelineDefinition | null): PipelineStageState[] {
  if (!definition?.stages?.length) return DEFAULT_STAGES.map(s => ({ ...s }));

  return definition.stages
    .filter(s => s.enabled)
    .map(s => ({
      key: s.id,
      name: s.name,
      status: 'pending' as const,
      detail: 'Pending',
    }));
}

/**
 * Humanize a stage key: api_testing → Api Testing
 */
function humanize(key: string): string {
  return key
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Upsert a stage into an existing stages array.
 * If the stage exists, applies the partial update. If not, appends a new entry.
 */
export function upsertStage(
  stages: PipelineStageState[],
  key: string,
  update: Partial<PipelineStageState>,
): PipelineStageState[] {
  const idx = stages.findIndex(s => s.key === key);
  if (idx >= 0) {
    const updated = [...stages];
    updated[idx] = { ...updated[idx], ...update };
    return updated;
  }
  // Unknown stage — append with humanized name, let update override defaults
  return [
    ...stages,
    {
      key,
      name: humanize(key),
      status: 'pending' as const,
      detail: 'Pending',
      ...update,
    },
  ];
}
