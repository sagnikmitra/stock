import Link from "next/link";
import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { PageHeader } from "../components/ui/page-header";
import { EducationalDisclaimer } from "../components/ui/educational-disclaimer";

export const revalidate = 30;

const PAGE_SIZE = 60;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function StocksPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const skip = (pageNumber - 1) * PAGE_SIZE;

  const [instruments, total] = await Promise.all([
    prisma.instrument.findMany({
      where: { isActive: true },
      select: {
        id: true,
        symbol: true,
        companyName: true,
        sector: true,
        industry: true,
      },
      orderBy: { symbol: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.instrument.count({ where: { isActive: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const prevPage = pageNumber > 1 ? pageNumber - 1 : null;
  const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

  return (
    <>
      <PageHeader
        title="Stocks"
        description="Universe browser for all tracked symbols with sector-level context."
      />
      <EducationalDisclaimer className="mb-4" />

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/88 p-3 text-sm text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <p>
          Showing page {pageNumber} of {totalPages} ({total} stocks)
        </p>
        <div className="flex items-center gap-2">
          {prevPage ? (
            <Link
              href={`/stocks?page=${prevPage}`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
            >
              Previous
            </Link>
          ) : null}
          {nextPage ? (
            <Link
              href={`/stocks?page=${nextPage}`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
            >
              Next
            </Link>
          ) : null}
        </div>
      </div>

      {instruments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {instruments.map((instrument) => (
            <Link key={instrument.id} href={`/stocks/${instrument.symbol}`}>
              <Card className="h-full border-slate-200/70 bg-white/86">
                <CardHeader>
                  <CardTitle>{instrument.symbol}</CardTitle>
                  <CardDescription>{instrument.companyName}</CardDescription>
                </CardHeader>
                <p className="text-sm text-slate-500">
                  {[instrument.sector, instrument.industry].filter(Boolean).join(" / ") || "Sector unknown"}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">
            No instruments found. Run seed and market pipelines to populate stocks.
          </p>
        </Card>
      )}
    </>
  );
}
