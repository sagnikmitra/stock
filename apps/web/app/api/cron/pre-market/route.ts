import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import { scoreMarketContext } from "@ibo/strategy-engine";
import { acquireCronLock, releaseCronLock, withRetries } from "../_scheduler";
import { buildDigestSummary, shouldRenderDegradedMode } from "../_helpers";

/**
 * Pre-market cron — runs at 8:30 AM IST (03:00 UTC)
 * Scores market context from latest provider data and generates digest.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "1";
  const retryAttempts = Number(searchParams.get("attempts") ?? 2);
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayDate = new Date(todayStr);

  const lock = await acquireCronLock({
    jobKey: "pre_market",
    marketDate: todayStr,
    force,
  });

  if (!lock.canRun) {
    return NextResponse.json({
      data: {
        status: "skipped",
        reason: lock.reason,
        marketDate: todayStr,
      },
    });
  }

  try {
    const result = await withRetries(async () => {
      const warnings: string[] = [];

      let giftNiftyChangePct: number | undefined;
      let dowFuturesChangePct: number | undefined;
      let goldChangePct: number | undefined;
      let crudeChangePct: number | undefined;
      let fiiNetCashCr: number | undefined;

      const latestFii = await prisma.fiiDiiSnapshot.findFirst({ orderBy: { date: "desc" } });
      if (latestFii?.fiiCashNet) {
        fiiNetCashCr = Number(latestFii.fiiCashNet);
      } else {
        warnings.push("No FII/DII data");
      }

      const prevCtx = await prisma.globalContextSnapshot.findFirst({ orderBy: { date: "desc" } });
      if (prevCtx) {
        giftNiftyChangePct = prevCtx.giftNiftyChange ? Number(prevCtx.giftNiftyChange) : undefined;
        dowFuturesChangePct = prevCtx.dowFuturesChange ? Number(prevCtx.dowFuturesChange) : undefined;
        goldChangePct = prevCtx.goldChange ? Number(prevCtx.goldChange) : undefined;
        crudeChangePct = prevCtx.crudeChange ? Number(prevCtx.crudeChange) : undefined;
      } else {
        warnings.push("No prior global context data");
      }

      const context = scoreMarketContext({
        date: todayStr,
        giftNiftyChangePct,
        dowFuturesChangePct,
        goldChangePct,
        crudeChangePct,
        fiiNetCashCr,
      });

      await prisma.globalContextSnapshot.upsert({
        where: { date: todayDate },
        update: {
          marketPosture: context.posture,
          postureScore: context.score,
          narrative: context.narrative,
          giftNiftyChange: context.giftNiftyChange,
          dowFuturesChange: context.dowFuturesChange,
          goldChange: context.goldChange,
          crudeChange: context.crudeChange,
        },
        create: {
          date: todayDate,
          marketPosture: context.posture,
          postureScore: context.score,
          narrative: context.narrative,
          giftNiftyChange: context.giftNiftyChange,
          dowFuturesChange: context.dowFuturesChange,
          goldChange: context.goldChange,
          crudeChange: context.crudeChange,
        },
      });

      let watchlistMd = "No active watchlist items.";
      const items = await prisma.watchlistItem.findMany({
        where: { isActive: true },
        include: { instrument: { select: { symbol: true } } },
        take: 30,
      });
      if (items.length > 0) {
        const syms = items.map((i) => i.instrument.symbol);
        watchlistMd = `**${syms.length} on watchlist**: ${syms.slice(0, 15).join(", ")}${syms.length > 15 ? "…" : ""}`;
      }

      const digest = await prisma.digest.upsert({
        where: { digestType_marketDate: { digestType: "pre_market", marketDate: todayDate } },
        update: {
          title: `Pre-Market Brief — ${todayStr}`,
          summary: buildDigestSummary({
            posture: context.posture,
            score: context.score,
            warnings,
          }),
          posture: context.posture,
        },
        create: {
          digestType: "pre_market",
          marketDate: todayDate,
          title: `Pre-Market Brief — ${todayStr}`,
          summary: buildDigestSummary({
            posture: context.posture,
            score: context.score,
            warnings,
          }),
          posture: context.posture,
          sections: {
            create: [
              { key: "global_cues", title: "Global Cues", bodyMarkdown: formatCues(context), sortOrder: 0 },
              {
                key: "fii_dii",
                title: "FII/DII Activity",
                bodyMarkdown: fiiNetCashCr !== undefined
                  ? `FII net cash: ₹${fiiNetCashCr.toLocaleString("en-IN")} Cr ${fiiNetCashCr > 0 ? "(buying)" : "(selling)"}`
                  : "No FII/DII data available.",
                sortOrder: 1,
              },
              { key: "market_posture", title: "Market Posture", bodyMarkdown: context.narrative, sortOrder: 2 },
              {
                key: "context_breakdown",
                title: "Context Score Breakdown",
                bodyMarkdown: (context.breakdown ?? [])
                  .map(
                    (factor) =>
                      `- **${factor.label}**: ${factor.status.toUpperCase()} (${factor.contribution >= 0 ? "+" : ""}${factor.contribution}) — ${factor.reason}`,
                  )
                  .join("\n"),
                sortOrder: 3,
              },
              { key: "watchlist_alerts", title: "Watchlist", bodyMarkdown: watchlistMd, sortOrder: 4 },
            ],
          },
        },
      });

      await prisma.auditEvent.create({
        data: {
          actor: "system",
          action: "digest_degraded_mode",
          entityType: "Digest",
          entityId: digest.id,
          details: {
          marketDate: todayStr,
          degraded: shouldRenderDegradedMode(warnings),
          warnings,
          missingFactors: (context.breakdown ?? [])
            .filter((factor) => factor.status === "missing")
            .map((factor) => factor.key),
        },
      },
    });

      return {
        digestId: digest.id,
        marketDate: todayStr,
        posture: context.posture,
        score: context.score,
        warnings,
      };
    }, Number.isFinite(retryAttempts) && retryAttempts > 0 ? retryAttempts : 2);

    await releaseCronLock({
      lockKey: lock.lockKey,
      status: "completed",
      details: {
        marketDate: todayStr,
      },
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    await releaseCronLock({
      lockKey: lock.lockKey,
      status: "failed",
      details: {
        marketDate: todayStr,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

function formatCues(c: { giftNiftyChange?: number; dowFuturesChange?: number; goldChange?: number; crudeChange?: number }) {
  const fmt = (v?: number) => v !== undefined ? `${v >= 0 ? "+" : ""}${v.toFixed(2)}%` : "N/A";
  return [
    `- **GIFT Nifty**: ${fmt(c.giftNiftyChange)}`,
    `- **Dow Futures**: ${fmt(c.dowFuturesChange)}`,
    `- **Gold**: ${fmt(c.goldChange)}`,
    `- **Crude Oil**: ${fmt(c.crudeChange)}`,
  ].join("\n");
}
