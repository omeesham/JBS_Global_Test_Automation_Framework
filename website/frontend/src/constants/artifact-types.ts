/**
 * Mapping of pipeline stage IDs to their artifact type keywords.
 * Used to filter artifacts by stage in ArtifactPreviewCard and PageDetailPanel.
 */
export const STAGE_ARTIFACT_TYPES: Record<string, string[]> = {
  requirements: ['requirements', 'user_requirements', 'discovery', 'selectors'],
  planning: ['test_cases', 'test_plan', 'planner'],
  generation: ['spec_file', 'generated_spec', 'generator'],
  healing: ['healer', 'fix_report', 'healed_spec'],
  audit: ['audit_report', 'triage_report', 'audit'],
};
