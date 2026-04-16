import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { PostureIndicator } from "../../components/ui/posture-indicator";
import { PageHeader } from "../../components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function GlobalCuesPage() {
  const contexts = await prisma.globalContextSnapshot.findMany({
    orderBy: { date: "desc" },
    take: 10,
  });

  return (
    <>
      <PageHeader
        title="Global Cues"
        description="GIFT Nifty, Dow Futures, Gold, Crude, FII/DII — market posture scoring"
      />

      {contexts.length > 0 ? (
        <div className="space-y-4">
          {contexts.map((ctx) => (
            <Card key={ctx.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {ctx.date.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-500">{ctx.narrative}</p>
                </div>
                <PostureIndicator
                  posture={(ctx.marketPosture ?? "mixed") as "favorable" | "mixed" | "hostile"}
                  score={ctx.postureScore ? Number(ctx.postureScore) : 0}
                />
              </div>
              <div className="mt-3 grid grid-cols-5 gap-3 text-center text-xs">
                <Metric label="GIFT Nifty" value={ctx.giftNiftyChange} suffix="%" />
                <Metric label="Dow Futures" value={ctx.dowFuturesChange} suffix="%" />
                <Metric label="Gold" value={ctx.goldChange} suffix="%" />
                <Metric label="Crude" value={ctx.crudeChange} suffix="%" />
                <Metric label="Score" value={ctx.postureScore} suffix="/5" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">
            No market context data. Connect a data provider and run the pre-market cron.
          </p>
        </Card>
      )}
    </>
  );
}

function Metric({ label, value, suffix }: { label: string; value: unknown; suffix?: string }) {
  const numVal = value != null ? Number(value) : null;
  return (
    <div>
      <p className="text-slate-400">{label}</p>
      <p className="font-semibold text-slate-700">
        {numVal != null ? `${numVal > 0 ? "+" : ""}${numVal.toFixed(2)}${suffix ?? ""}` : "—"}
      </p>
    </div>
  );
}
