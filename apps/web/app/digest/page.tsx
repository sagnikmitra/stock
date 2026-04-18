import Link from "next/link";
import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

const digestBadgeVariant = (type: string) => {
  switch (type) {
    case "pre_market":
      return "investment" as const;
    case "post_close":
      return "swing" as const;
    case "month_end":
      return "ambiguity" as const;
    default:
      return "muted" as const;
  }
};

export default async function DigestListPage() {
  const digests = await prisma.digest.findMany({
    orderBy: [{ marketDate: "desc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { sections: true, mentions: true } },
    },
  });

  return (
    <>
      <Card className="mb-6 bg-gradient-to-r from-white/92 to-cyan-50/55">
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
          <CardDescription>
            Educational analytics only. Digests summarize rule matches and market context, not guaranteed returns or buy/sell advice.
          </CardDescription>
        </CardHeader>
      </Card>

      {digests.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-400">
            No digests found. Trigger cron pipelines to generate digest history.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {digests.map((digest) => {
            const marketDate = digest.marketDate.toISOString().split("T")[0];
            return (
              <Link key={digest.id} href={`/digest/${marketDate}`}>
                <Card className="h-full border-slate-200/70 bg-white/86">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={digestBadgeVariant(digest.digestType)}>
                      {digest.digestType.replace(/_/g, " ")}
                    </Badge>
                    <Badge variant="muted">{marketDate}</Badge>
                    {digest.posture ? (
                      <Badge
                        variant={
                          digest.posture === "favorable"
                            ? "favorable"
                            : digest.posture === "hostile"
                              ? "hostile"
                              : "mixed"
                        }
                      >
                        {digest.posture}
                      </Badge>
                    ) : null}
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">{digest.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{digest.summary}</p>
                  <div className="mt-3 flex gap-3 text-xs text-slate-400">
                    <span>{digest._count.sections} sections</span>
                    <span>{digest._count.mentions} mentions</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
