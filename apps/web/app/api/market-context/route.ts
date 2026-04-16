import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import { scoreMarketContext } from "@ibo/strategy-engine";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 10);

  const [contexts, fiiDii, breadth] = await Promise.all([
    prisma.globalContextSnapshot.findMany({
      orderBy: { date: "desc" },
      take: limit,
    }),
    prisma.fiiDiiSnapshot.findMany({
      orderBy: { date: "desc" },
      take: limit,
    }),
    prisma.marketBreadthSnapshot.findMany({
      orderBy: { date: "desc" },
      take: limit,
    }),
  ]);

  const fiiByDate = new Map(
    fiiDii.map((flow) => [
      flow.date.toISOString().split("T")[0],
      {
        fiiCashNet: flow.fiiCashNet ? Number(flow.fiiCashNet) : undefined,
        diiCashNet: flow.diiCashNet ? Number(flow.diiCashNet) : undefined,
      },
    ]),
  );

  const contextsWithBreakdown = contexts.map((row) => {
    const date = row.date.toISOString().split("T")[0];
    const flow = fiiByDate.get(date);

    const projected = scoreMarketContext({
      date,
      giftNiftyChangePct: row.giftNiftyChange ? Number(row.giftNiftyChange) : undefined,
      dowIndexChangePct: row.dowIndexChange ? Number(row.dowIndexChange) : undefined,
      dowFuturesChangePct: row.dowFuturesChange ? Number(row.dowFuturesChange) : undefined,
      goldChangePct: row.goldChange ? Number(row.goldChange) : undefined,
      crudeChangePct: row.crudeChange ? Number(row.crudeChange) : undefined,
      fiiNetCashCr: flow?.fiiCashNet,
    });

    return {
      date,
      posture: row.marketPosture,
      score: row.postureScore ? Number(row.postureScore) : null,
      giftNiftyChange: row.giftNiftyChange ? Number(row.giftNiftyChange) : null,
      dowFuturesChange: row.dowFuturesChange ? Number(row.dowFuturesChange) : null,
      goldChange: row.goldChange ? Number(row.goldChange) : null,
      crudeChange: row.crudeChange ? Number(row.crudeChange) : null,
      narrative: row.narrative,
      breakdown: projected.breakdown,
    };
  });

  const latestContext = contextsWithBreakdown[0] ?? null;
  const latestFii = fiiDii[0]
    ? {
        date: fiiDii[0].date.toISOString().split("T")[0],
        fiiCashNet: fiiDii[0].fiiCashNet ? Number(fiiDii[0].fiiCashNet) : null,
        diiCashNet: fiiDii[0].diiCashNet ? Number(fiiDii[0].diiCashNet) : null,
      }
    : null;
  const latestBreadth = breadth[0]
    ? {
        date: breadth[0].date.toISOString().split("T")[0],
        advances: breadth[0].advances,
        declines: breadth[0].declines,
        new52WeekHighs: breadth[0].new52WeekHighs,
        new52WeekLows: breadth[0].new52WeekLows,
      }
    : null;

  return NextResponse.json({
    data: {
      latest: {
        globalContext: latestContext,
        fiiDii: latestFii,
        breadth: latestBreadth,
      },
      contexts: contextsWithBreakdown,
      fiiDii: fiiDii.map((f) => ({
        date: f.date.toISOString().split("T")[0],
        fiiCashNet: f.fiiCashNet ? Number(f.fiiCashNet) : null,
        diiCashNet: f.diiCashNet ? Number(f.diiCashNet) : null,
      })),
      breadth: breadth.map((b) => ({
        date: b.date.toISOString().split("T")[0],
        advances: b.advances,
        declines: b.declines,
        new52WeekHighs: b.new52WeekHighs,
        new52WeekLows: b.new52WeekLows,
      })),
    },
  });
}
