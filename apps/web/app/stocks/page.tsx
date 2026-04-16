import Link from "next/link";
import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { PageHeader } from "../components/ui/page-header";
import { EducationalDisclaimer } from "../components/ui/educational-disclaimer";

export const dynamic = "force-dynamic";

export default async function StocksPage() {
  const instruments = await prisma.instrument.findMany({
    select: {
      id: true,
      symbol: true,
      companyName: true,
      sector: true,
      industry: true,
    },
    orderBy: { symbol: "asc" },
    take: 200,
  });

  return (
    <>
      <PageHeader
        title="Stocks"
        description="Browse tracked instruments and open symbol-level market context"
      />
      <EducationalDisclaimer className="mb-4" />

      {instruments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {instruments.map((instrument) => (
            <Link key={instrument.id} href={`/stocks/${instrument.symbol}`}>
              <Card className="h-full transition-colors hover:border-brand-200">
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
