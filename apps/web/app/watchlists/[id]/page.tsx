import { prisma } from "@ibo/db";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WatchlistDetailPage({ params }: Props) {
  const { id } = await params;

  const watchlist = await prisma.watchlist.findUnique({
    where: { id },
    include: {
      items: {
        where: { isActive: true },
        include: { instrument: true },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!watchlist) notFound();

  // Fetch latest quotes for all instruments in this watchlist
  const instrumentIds = watchlist.items.map((item) => item.instrumentId);
  const latestQuotes =
    instrumentIds.length > 0
      ? await prisma.quoteSnapshot.findMany({
          where: { instrumentId: { in: instrumentIds } },
          orderBy: { ts: "desc" },
          distinct: ["instrumentId"],
        })
      : [];

  const quoteMap = new Map(latestQuotes.map((q) => [q.instrumentId, q]));

  return (
    <>
      <PageHeader
        title={watchlist.name}
        description={watchlist.description ?? `${watchlist.kind} watchlist`}
      >
        <Link
          href="/watchlists"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          All Watchlists
        </Link>
      </PageHeader>

      <div className="mb-4">
        <Badge variant="muted">{watchlist.kind}</Badge>
      </div>

      {watchlist.items.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase text-slate-400">
                  <th className="px-3 py-2">Symbol</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2 text-right">Latest Price</th>
                  <th className="px-3 py-2 text-right">Change %</th>
                  <th className="px-3 py-2">Added</th>
                  <th className="px-3 py-2">Tags</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.items.map((item) => {
                  const quote = quoteMap.get(item.instrumentId);
                  const changePct = quote?.changePct ? Number(quote.changePct) : null;
                  const isPositive = changePct !== null && changePct >= 0;
                  const tags = (item.tagsJson as string[] | null) ?? [];

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="px-3 py-2">
                        <Link
                          href={`/stocks/${item.instrument.symbol}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          {item.instrument.symbol}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {item.instrument.companyName}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {quote ? Number(quote.ltp).toFixed(2) : "—"}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-mono ${
                          changePct !== null
                            ? isPositive
                              ? "text-green-600"
                              : "text-red-600"
                            : "text-slate-400"
                        }`}
                      >
                        {changePct !== null
                          ? `${isPositive ? "+" : ""}${changePct.toFixed(2)}%`
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {item.addedAt.toISOString().split("T")[0]}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="muted">
                              {tag}
                            </Badge>
                          ))}
                        </div>
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
            This watchlist has no items yet.
          </p>
        </Card>
      )}
    </>
  );
}
