import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { PageHeader } from "../../components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function FiiDiiPage() {
  const flows = await prisma.fiiDiiSnapshot.findMany({
    orderBy: { date: "desc" },
    take: 20,
  });

  return (
    <>
      <PageHeader
        title="FII / DII Activity"
        description="Foreign & Domestic Institutional Investor net flows"
      />

      {flows.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-400">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2 text-right">FII Cash Net (Cr)</th>
                  <th className="px-3 py-2 text-right">DII Cash Net (Cr)</th>
                  <th className="px-3 py-2 text-right">FII Index Futures</th>
                  <th className="px-3 py-2 text-right">FII Index Options</th>
                </tr>
              </thead>
              <tbody>
                {flows.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-medium">{f.date.toLocaleDateString("en-IN")}</td>
                    <td className={`px-3 py-2 text-right ${Number(f.fiiCashNet ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {f.fiiCashNet != null ? Number(f.fiiCashNet).toLocaleString("en-IN") : "—"}
                    </td>
                    <td className={`px-3 py-2 text-right ${Number(f.diiCashNet ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {f.diiCashNet != null ? Number(f.diiCashNet).toLocaleString("en-IN") : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-500">
                      {f.fiiIndexFuturesNet != null ? Number(f.fiiIndexFuturesNet).toLocaleString("en-IN") : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-500">
                      {f.fiiIndexOptionsNet != null ? Number(f.fiiIndexOptionsNet).toLocaleString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">No FII/DII data available. Connect NSE data provider.</p>
        </Card>
      )}
    </>
  );
}
