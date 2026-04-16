import { runPreMarketPipelineCore } from "@ibo/pipelines";

/**
 * Compatibility wrapper.
 * Pipeline implementation is centralized in @ibo/pipelines.
 */
export async function runPreMarketPipeline() {
  return runPreMarketPipelineCore();
}
