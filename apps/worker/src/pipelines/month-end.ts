import { runMonthEndPipelineCore } from "@ibo/pipelines";

/**
 * Compatibility wrapper.
 * Pipeline implementation is centralized in @ibo/pipelines.
 */
export async function runMonthEndPipeline(force = false) {
  return runMonthEndPipelineCore(force);
}
