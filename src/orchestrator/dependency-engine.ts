/**
 * Dependency Engine (Plan 53C)
 * Enforces stage ordering per page. Auto mode cascades missing prerequisites.
 */

import type { Pool } from 'pg';
import type { PipelineDefinition, PageStageStatus } from './types';
import { getPageStageStatuses, getPage } from '../server/db/queries';

/**
 * Returns ordered ENABLED stage IDs from the pipeline definition.
 */
export function getStageOrder(definition: PipelineDefinition): string[] {
  return definition.stages.filter(s => s.enabled).map(s => s.id);
}

/**
 * Returns all ENABLED stages BEFORE targetStage in the stage order.
 * Skips disabled stages — they're not prerequisites.
 */
export function getPrerequisites(definition: PipelineDefinition, targetStage: string): string[] {
  const order = getStageOrder(definition);
  const targetIdx = order.indexOf(targetStage);
  if (targetIdx <= 0) return [];
  return order.slice(0, targetIdx);
}

export interface PageReadiness {
  satisfied: boolean;
  missing: string[];
  failed: string[];
  inProgress: string[];
  needsRequirements: boolean;
  canAutoCascade: boolean;
}

/**
 * Check if a page is ready for a target stage.
 * Returns which prerequisites are missing, failed, or in-progress.
 */
export async function checkPageReadiness(
  pool: Pool,
  pageId: string,
  targetStage: string,
  definition: PipelineDefinition,
): Promise<PageReadiness> {
  const prerequisites = getPrerequisites(definition, targetStage);
  if (prerequisites.length === 0) {
    // First stage or no prerequisites — check if page needs a URL
    const page = await getPage(pool, pageId);
    const isFirstStage = getStageOrder(definition)[0] === targetStage;
    return {
      satisfied: true,
      missing: [],
      failed: [],
      inProgress: [],
      needsRequirements: isFirstStage && !page?.target_url,
      canAutoCascade: true,
    };
  }

  const statuses = await getPageStageStatuses(pool, pageId);
  const statusMap = new Map(statuses.map(s => [s.stage_id, s]));

  const missing: string[] = [];
  const failed: string[] = [];
  const inProgress: string[] = [];

  for (const prereq of prerequisites) {
    const status = statusMap.get(prereq);
    if (!status || status.status === 'not_started') {
      missing.push(prereq);
    } else if (status.status === 'failed') {
      failed.push(prereq);
    } else if (status.status === 'running') {
      inProgress.push(prereq);
    }
    // 'completed' = satisfied, skip
  }

  const page = await getPage(pool, pageId);
  const firstStage = getStageOrder(definition)[0];
  const needsRequirements = firstStage
    ? (missing.includes(firstStage) || !statusMap.has(firstStage)) && !page?.target_url
    : false;

  return {
    satisfied: missing.length === 0 && failed.length === 0 && inProgress.length === 0,
    missing,
    failed,
    inProgress,
    needsRequirements,
    canAutoCascade: inProgress.length === 0,
  };
}

/**
 * Build a cascade plan: ordered stages to run (missing + failed prereqs + target).
 * Returns the stages that need to execute in order to reach the target stage.
 */
export async function buildCascadePlan(
  pool: Pool,
  pageId: string,
  targetStage: string,
  definition: PipelineDefinition,
): Promise<string[]> {
  const readiness = await checkPageReadiness(pool, pageId, targetStage, definition);

  if (readiness.satisfied) {
    // All prerequisites done — just run the target
    return [targetStage];
  }

  // Build cascade: missing + failed (in stage order) + target
  const order = getStageOrder(definition);
  const needsRun = new Set([...readiness.missing, ...readiness.failed, targetStage]);
  return order.filter(s => needsRun.has(s));
}
