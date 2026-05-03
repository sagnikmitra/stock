import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type VercelConfig = {
  crons?: Array<{ path: string; schedule: string }>;
};

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "../../..");

function readVercelConfig(relativePath: string): VercelConfig {
  return JSON.parse(readFileSync(path.join(repoRoot, relativePath), "utf8")) as VercelConfig;
}

function cronPaths(config: VercelConfig): string[] {
  return (config.crons ?? []).map((cron) => cron.path).sort();
}

test("root and web Vercel cron configs stay aligned", () => {
  const rootConfig = readVercelConfig("vercel.json");
  const webConfig = readVercelConfig("apps/web/vercel.json");

  assert.deepEqual(cronPaths(webConfig), cronPaths(rootConfig));
});

test("all configured cron paths exist and use Vercel-compatible five-field schedules", () => {
  const webConfig = readVercelConfig("apps/web/vercel.json");
  assert.ok(webConfig.crons?.length, "Expected at least one cron job");

  for (const cron of webConfig.crons ?? []) {
    const routePath = path.join(repoRoot, "apps/web/app", cron.path, "route.ts");
    assert.equal(existsSync(routePath), true, `${cron.path} route is missing`);

    const fields = cron.schedule.split(/\s+/);
    assert.equal(fields.length, 5, `${cron.path} must use a five-field cron expression`);
    assert.equal(/[A-Za-z]/.test(cron.schedule), false, `${cron.path} uses unsupported alpha/special cron syntax`);

    const dayOfMonth = fields[2];
    const dayOfWeek = fields[4];
    assert.equal(
      dayOfMonth !== "*" && dayOfWeek !== "*",
      false,
      `${cron.path} cannot set both day-of-month and day-of-week on Vercel`,
    );
  }
});
