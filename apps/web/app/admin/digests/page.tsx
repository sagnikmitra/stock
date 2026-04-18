import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import Link from "next/link";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

const digestTypeVariant = (type: string) => {
  switch (type) {
    case "pre_market":
      return "investment" as const;
    case "post_close":
      return "swing" as const;
    case "strategy":
      return "favorable" as const;
    case "week_end":
      return "mixed" as const;
    case "month_end":
      return "ambiguity" as const;
    case "ad_hoc":
      return "muted" as const;
    default:
      return "default" as const;
  }
};

export default async function AdminDigestsPage() {
  const digests = await prisma.digest.findMany({
    include: {
      _count: { select: { sections: true, mentions: true } },
    },
    orderBy: { marketDate: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Admin: Digests"
        description="View all generated market digests, sections, and stock mentions"
      />

      {digests.length > 0 ? (
        <div className="space-y-4">
          {digests.map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/digest/${d.marketDate.toISOString().split("T")[0]}`}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    {d.title}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {d.marketDate.toISOString().split("T")[0]}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={digestTypeVariant(d.digestType)}>
                    {d.digestType.replace(/_/g, " ")}
                  </Badge>
                  {d.posture && (
                    <Badge
                      variant={
                        d.posture === "favorable"
                          ? "favorable"
                          : d.posture === "hostile"
                            ? "hostile"
                            : "mixed"
                      }
                    >
                      {d.posture}
                    </Badge>
                  )}
                </div>
              </div>

              <p className="mt-2 text-sm text-slate-600">{d.summary}</p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <p className="text-slate-400">Sections</p>
                  <p className="font-semibold">{d._count.sections}</p>
                </div>
                <div>
                  <p className="text-slate-400">Stock Mentions</p>
                  <p className="font-semibold">{d._count.mentions}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">
            No digests generated yet. Run the pre-market or post-close cron to generate your first digest.
          </p>
        </Card>
      )}
    </>
  );
}
