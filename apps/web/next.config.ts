import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ibo/db", "@ibo/types", "@ibo/strategy-engine", "@ibo/pipelines", "@ibo/utils", "@ibo/config", "@ibo/ui"],
  // Vercel: allow up to 60s for cron/pipeline API routes
  serverExternalPackages: ["@prisma/client"],
};

const shouldEnableSentry = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

let exportedConfig: NextConfig = nextConfig;

if (shouldEnableSentry) {
  // Keep Sentry optional: only load package when DSN is configured.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { withSentryConfig } = require("@sentry/nextjs");
  exportedConfig = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: true,
  });
}

export default exportedConfig;
