import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";

export const dynamic = "force-dynamic";

const statusVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "favorable" as const;
    case "running":
      return "investment" as const;
    case "failed":
      return "hostile" as const;
    case "partial":
      return "mixed" as const;
    case "pending":
      return "muted" as const;
    default:
      return "default" as const;
  }
};

function formatDuration(start: Date, end: Date | null): string {
  if (!end) return "In progress";
  const ms = end.getTime() - start.getTime();
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export default async function AdminJobsPage() {
  const jobRuns = await prisma.providerJobRun.findMany({
    include: { provider: true },
    orderBy: { startedAt: "desc" },
    take: 100,
  });

  return (
    <>
      <PageHeader
        title="Admin: Provider Job Runs"
        description="Monitor data provider ingestion jobs and their outcomes"
      />

      {jobRuns.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase text-slate-400">
                  <th className="px-3 py-2">Provider</th>
                  <th className="px-3 py-2">Job</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Started</th>
                  <th className="px-3 py-2">Finished</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2 text-right">Records</th>
                  <th className="px-3 py-2 text-right">Errors</th>
                </tr>
              </thead>
              <tbody>
                {jobRuns.map((job) => {
                  const detail = job.detailJson as Record<string, unknown> | null;
                  const recordsProcessed =
                    detail?.recordsProcessed !== undefined
                      ? Number(detail.recordsProcessed)
                      : null;
                  const errorCount =
                    detail?.errorCount !== undefined
                      ? Number(detail.errorCount)
                      : null;

                  return (
                    <tr
                      key={job.id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="px-3 py-2 font-medium text-slate-700">
                        {job.provider.name}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{job.jobKey}</td>
                      <td className="px-3 py-2">
                        <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {job.startedAt.toISOString().replace("T", " ").slice(0, 19)}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {job.finishedAt
                          ? job.finishedAt.toISOString().replace("T", " ").slice(0, 19)
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {formatDuration(job.startedAt, job.finishedAt)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {recordsProcessed !== null
                          ? recordsProcessed.toLocaleString()
                          : "—"}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-mono ${
                          errorCount !== null && errorCount > 0
                            ? "text-red-600"
                            : "text-slate-400"
                        }`}
                      >
                        {errorCount !== null ? errorCount : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">
            No provider job runs recorded yet. Configure a provider and trigger a data sync.
          </p>
        </Card>
      )}
    </>
  );
}
