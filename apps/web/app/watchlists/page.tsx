import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PageHeader } from "../components/ui/page-header";
import { EducationalDisclaimer } from "../components/ui/educational-disclaimer";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WatchlistsPage() {
  const watchlists = await prisma.watchlist.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Watchlists"
        description="Track and organize stocks across manual and strategy-generated lists"
      />
      <EducationalDisclaimer className="mb-4" />

      {watchlists.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {watchlists.map((wl) => (
            <Link key={wl.id} href={`/watchlists/${wl.id}`}>
              <Card className="transition-colors hover:border-brand-200">
                <CardHeader>
                  <CardTitle>{wl.name}</CardTitle>
                  {wl.description && <CardDescription>{wl.description}</CardDescription>}
                </CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="muted">{wl.kind}</Badge>
                  <span className="text-sm font-semibold text-slate-600">
                    {wl._count.items} {wl._count.items === 1 ? "item" : "items"}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">
            No watchlists found. Create a watchlist to start tracking stocks.
          </p>
        </Card>
      )}
    </>
  );
}
