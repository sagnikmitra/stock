import { runWeeklySummaryPipelineCore } from "@ibo/pipelines";

/**
 * Compatibility wrapper.
 * Pipeline implementation is centralized in @ibo/pipelines.
 */
export async function runWeeklySummaryPipeline() {
  return runWeeklySummaryPipelineCore();
}
