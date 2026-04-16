import { prisma } from "@ibo/db";
import type { Prisma } from "@ibo/db";
import { buildIndicatorSet, evaluateScreener, evaluateStrategy, scoreMarketContext, type DataContext } from "@ibo/strategy-engine";
import type { Candle, ScreenerDSL, StrategyDSL } from "@ibo/types";
import { nseCalendar } from "@ibo/utils";

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function runPreMarketPipelineCore() {
  const today = new Date();
  const todayStr = toDateKey(today);
  const todayDate = new Date(todayStr);
  const warnings: string[] = [];

  let giftNiftyChangePct: number | undefined;
  let dowFuturesChangePct: number | undefined;
  let goldChangePct: number | undefined;
  let crudeChangePct: number | undefined;
  let fiiNetCashCr: number | undefined;

  const latestFii = await prisma.fiiDiiSnapshot.findFirst({ orderBy: { date: "desc" } });
  if (latestFii?.fiiCashNet) fiiNetCashCr = Number(latestFii.fiiCashNet);
  else warnings.push("No FII/DII data");

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
      summary: `Posture ${context.posture.toUpperCase()} (${context.score}/5). ${warnings.length} warning(s).`,
      posture: context.posture,
    },
    create: {
      digestType: "pre_market",
      marketDate: todayDate,
      title: `Pre-Market Brief — ${todayStr}`,
      summary: `Posture ${context.posture.toUpperCase()} (${context.score}/5). ${warnings.length} warning(s).`,
      posture: context.posture,
      sections: {
        create: [
          {
            key: "global_cues",
            title: "Global Cues",
            bodyMarkdown: [
              `- **GIFT Nifty**: ${context.giftNiftyChange ?? "N/A"}`,
              `- **Dow Futures**: ${context.dowFuturesChange ?? "N/A"}`,
              `- **Gold**: ${context.goldChange ?? "N/A"}`,
              `- **Crude Oil**: ${context.crudeChange ?? "N/A"}`,
            ].join("\n"),
            sortOrder: 0,
          },
          {
            key: "fii_dii",
            title: "FII/DII Activity",
            bodyMarkdown:
              fiiNetCashCr !== undefined
                ? `FII net cash: ₹${fiiNetCashCr.toLocaleString("en-IN")} Cr ${fiiNetCashCr > 0 ? "(buying)" : "(selling)"}`
                : "No FII/DII data available.",
            sortOrder: 1,
          },
          { key: "market_posture", title: "Market Posture", bodyMarkdown: context.narrative, sortOrder: 2 },
          { key: "watchlist_alerts", title: "Watchlist", bodyMarkdown: watchlistMd, sortOrder: 3 },
        ],
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
}

export async function runPostClosePipelineCore() {
  const todayStr = toDateKey(new Date());
  const todayDate = new Date(todayStr);

  let totalStrategyMatches = 0;
  let totalScreenerHits = 0;
  const matchLines: string[] = [];

  const instruments = await prisma.instrument.findMany({ where: { isActive: true }, take: 500 });
  const contexts = new Map<string, { ctx: DataContext; symbol: string; name: string }>();

  for (const inst of instruments) {
    const candles = await prisma.candle.findMany({
      where: { instrumentId: inst.id, timeframe: "D1" },
      orderBy: { ts: "asc" },
      take: 250,
    });
    if (candles.length < 20) continue;

    const series: Candle[] = candles.map((c) => ({
      ts: c.ts,
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
      volume: Number(c.volume ?? 0),
      deliveryPct: c.deliveryPct ? Number(c.deliveryPct) : undefined,
    }));

    const ind = buildIndicatorSet(series);
    const last = series[series.length - 1];

    const ctx: DataContext = {
      "daily.open": last.open,
      "daily.high": last.high,
      "daily.low": last.low,
      "daily.close": last.close,
      "daily.volume": last.volume,
      "daily.rsi14": ind.rsi14,
      "daily.sma_13": ind.sma13,
      "daily.sma_34": ind.sma34,
      "daily.sma_44": ind.sma44,
      "daily.sma_50": ind.sma50,
      "daily.sma_200": ind.sma200,
      "daily.ema_9": ind.ema9,
      "daily.ema_15": ind.ema15,
      "daily.bb_upper_20_2": ind.bbUpper,
      "daily.bb_middle_20": ind.bbMiddle,
      "daily.bb_lower_20_2": ind.bbLower,
      "daily.supertrend_10_3": ind.superTrendDir,
      "daily.atr_14": ind.atr14,
      "daily.volume_ratio_20": ind.relativeVolume,
    };
    contexts.set(inst.id, { ctx, symbol: inst.symbol, name: inst.companyName });

    await prisma.indicatorSnapshot.upsert({
      where: { instrumentId_timeframe_ts: { instrumentId: inst.id, timeframe: "D1", ts: todayDate } },
      update: {
        rsi14: ind.rsi14,
        sma13: ind.sma13,
        sma34: ind.sma34,
        sma44: ind.sma44,
        sma50: ind.sma50,
        sma200: ind.sma200,
        ema9: ind.ema9,
        ema15: ind.ema15,
        bbUpper: ind.bbUpper,
        bbMiddle: ind.bbMiddle,
        bbLower: ind.bbLower,
        superTrend: ind.superTrend,
        superTrendDir: ind.superTrendDir,
        atr14: ind.atr14,
        relativeVolume: ind.relativeVolume,
      },
      create: {
        instrumentId: inst.id,
        timeframe: "D1",
        ts: todayDate,
        rsi14: ind.rsi14,
        sma13: ind.sma13,
        sma34: ind.sma34,
        sma44: ind.sma44,
        sma50: ind.sma50,
        sma200: ind.sma200,
        ema9: ind.ema9,
        ema15: ind.ema15,
        bbUpper: ind.bbUpper,
        bbMiddle: ind.bbMiddle,
        bbLower: ind.bbLower,
        superTrend: ind.superTrend,
        superTrendDir: ind.superTrendDir,
        atr14: ind.atr14,
        relativeVolume: ind.relativeVolume,
      },
    });
  }

  const strategies = await prisma.strategy.findMany({
    where: { status: "active" },
    include: { versions: { where: { isActive: true }, take: 1 } },
  });

  for (const strat of strategies) {
    const activeVersion = strat.versions[0];
    if (!activeVersion) continue;
    const dsl = activeVersion.normalizedDsl as unknown as StrategyDSL | undefined;
    if (!dsl?.filters) continue;

    const run = await prisma.strategyRun.create({
      data: {
        strategyVersionId: activeVersion.id,
        runAt: new Date(),
        runScope: "daily",
        marketDate: todayDate,
        status: "running",
      },
    });

    for (const [instId, { ctx, symbol }] of contexts) {
      const result = evaluateStrategy(dsl, symbol, todayStr, ctx);
      if (result.allPassed) {
        totalStrategyMatches++;
        matchLines.push(`${symbol} → ${strat.name}`);
        await prisma.strategyResult.create({
          data: {
            strategyId: strat.id,
            strategyRunId: run.id,
            instrumentId: instId,
            marketDate: todayDate,
            matched: true,
            confluenceScore: result.softScore,
            confidence: result.softScore > 0.8 ? "high" : result.softScore > 0.5 ? "medium" : "low",
            ruleResults: result.conditions as unknown as Prisma.InputJsonValue,
            explanation: result.explanation,
          },
        });
      }
    }

    await prisma.strategyRun.update({ where: { id: run.id }, data: { status: "completed" } });
  }

  const screeners = await prisma.screener.findMany({
    where: { isExternalReference: false },
    include: { versions: { where: { isActive: true }, take: 1 } },
  });

  for (const scr of screeners) {
    const dsl = scr.versions[0]?.expressionDsl as unknown as ScreenerDSL | undefined;
    if (!dsl) continue;

    const run = await prisma.screenerRun.create({
      data: { screenerId: scr.id, runAt: new Date(), marketDate: todayDate, scope: "daily", status: "running" },
    });

    for (const [instId, { ctx, symbol }] of contexts) {
      const result = evaluateScreener(dsl, symbol, ctx);
      if (result.passed) {
        totalScreenerHits++;
        await prisma.screenerResult.create({
          data: {
            screenerRunId: run.id,
            instrumentId: instId,
            marketDate: todayDate,
            matched: true,
            metricsJson: result.conditions as unknown as Prisma.InputJsonValue,
          },
        });
      }
    }

    await prisma.screenerRun.update({ where: { id: run.id }, data: { status: "completed" } });
  }

  const digest = await prisma.digest.upsert({
    where: { digestType_marketDate: { digestType: "post_close", marketDate: todayDate } },
    update: {
      title: `Post-Close Summary — ${todayStr}`,
      summary: `${totalStrategyMatches} strategy match(es), ${totalScreenerHits} screener hit(s) across ${contexts.size} instruments.`,
    },
    create: {
      digestType: "post_close",
      marketDate: todayDate,
      title: `Post-Close Summary — ${todayStr}`,
      summary: `${totalStrategyMatches} strategy match(es), ${totalScreenerHits} screener hit(s) across ${contexts.size} instruments.`,
      sections: {
        create: [
          { key: "market_summary", title: "Market Summary", bodyMarkdown: `Evaluated **${contexts.size}** instruments.`, sortOrder: 0 },
          { key: "strategy_matches", title: "Strategy Matches", bodyMarkdown: matchLines.length > 0 ? matchLines.map((m) => `- ${m}`).join("\n") : "No matches today.", sortOrder: 1 },
          { key: "screener_highlights", title: "Screener Highlights", bodyMarkdown: `**${totalScreenerHits}** hits across ${screeners.length} screeners.`, sortOrder: 2 },
        ],
      },
    },
  });

  return {
    digestId: digest.id,
    marketDate: todayStr,
    instruments: contexts.size,
    strategyMatches: totalStrategyMatches,
    screenerHits: totalScreenerHits,
  };
}

export async function runMonthEndPipelineCore(force = false) {
  const today = new Date();
  if (!force && !nseCalendar.isMonthEnd(today)) {
    return { status: "skipped", reason: "not_month_end", marketDate: toDateKey(today) };
  }

  const todayStr = toDateKey(today);
  const todayDate = new Date(todayStr);

  const investStrats = await prisma.strategy.findMany({
    where: { status: "active", family: "investment" },
    include: { versions: { where: { isActive: true }, take: 1 } },
  });

  const instruments = await prisma.instrument.findMany({ where: { isActive: true }, take: 500 });
  const bbHits: string[] = [];
  const mbbHits: string[] = [];
  let evaluated = 0;

  for (const inst of instruments) {
    const monthly = await prisma.candle.findMany({
      where: { instrumentId: inst.id, timeframe: "MN1" },
      orderBy: { ts: "asc" },
      take: 60,
    });
    if (monthly.length < 20) continue;
    evaluated++;

    const series: Candle[] = monthly.map((c) => ({
      ts: c.ts,
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
      volume: Number(c.volume ?? 0),
      deliveryPct: c.deliveryPct ? Number(c.deliveryPct) : undefined,
    }));

    const ind = buildIndicatorSet(series);
    const last = series[series.length - 1];

    const ctx: DataContext = {
      "monthly.open": last.open,
      "monthly.high": last.high,
      "monthly.low": last.low,
      "monthly.close": last.close,
      "monthly.volume": last.volume,
      "monthly.rsi14": ind.rsi14,
      "monthly.bb_upper_20_2": ind.bbUpper,
      "monthly.bb_middle_20": ind.bbMiddle,
      "monthly.sma_200": ind.sma200,
    };

    for (const strat of investStrats) {
      const version = strat.versions[0];
      if (!version) continue;

      const dsl = version.normalizedDsl as unknown as StrategyDSL | undefined;
      if (!dsl?.filters) continue;

      const evalResult = evaluateStrategy(dsl, inst.symbol, todayStr, ctx);
      if (!evalResult.allPassed) continue;

      const line = `**${inst.symbol}** — RSI ${ind.rsi14?.toFixed(1) ?? "?"}, Close ₹${last.close.toFixed(0)}`;
      if (strat.key === "investment_bb_monthly") bbHits.push(line);
      else if (strat.key === "investment_mbb") mbbHits.push(line);

      await prisma.strategyResult.create({
        data: {
          strategyId: strat.id,
          instrumentId: inst.id,
          marketDate: todayDate,
          matched: true,
          confluenceScore: evalResult.softScore,
          confidence: evalResult.softScore > 0.8 ? "high" : "medium",
          ruleResults: evalResult.conditions as unknown as Prisma.InputJsonValue,
          explanation: evalResult.explanation,
        },
      });
    }
  }

  const digest = await prisma.digest.upsert({
    where: { digestType_marketDate: { digestType: "month_end", marketDate: todayDate } },
    update: { summary: `${evaluated} evaluated. BB: ${bbHits.length}, MBB: ${mbbHits.length}.` },
    create: {
      digestType: "month_end",
      marketDate: todayDate,
      title: `Month-End Review — ${todayStr}`,
      summary: `${evaluated} evaluated. BB: ${bbHits.length}, MBB: ${mbbHits.length}.`,
      sections: {
        create: [
          {
            key: "bb_breakout",
            title: "Monthly BB Breakout",
            bodyMarkdown: bbHits.length > 0 ? bbHits.map((h) => `- ${h}`).join("\n") : "No BB breakout candidates this month.",
            sortOrder: 0,
          },
          {
            key: "mbb_dips",
            title: "MBB Mean-Reversion",
            bodyMarkdown: mbbHits.length > 0 ? mbbHits.map((h) => `- ${h}`).join("\n") : "No MBB dip candidates.",
            sortOrder: 1,
          },
        ],
      },
    },
  });

  return { status: "completed", digestId: digest.id, evaluated, bbBreakouts: bbHits.length, mbbDips: mbbHits.length };
}

function startOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

function endOfWeek(start: Date): Date {
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return end;
}

export async function runWeeklySummaryPipelineCore() {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(weekStart);

  const [strategyMatches, screenerHits, confluence, watchlistChanges, providerRuns] = await Promise.all([
    prisma.strategyResult.count({ where: { matched: true, marketDate: { gte: weekStart, lte: weekEnd } } }),
    prisma.screenerResult.count({ where: { matched: true, marketDate: { gte: weekStart, lte: weekEnd } } }),
    prisma.confluenceResult.findMany({
      where: { marketDate: { gte: weekStart, lte: weekEnd } },
      include: { instrument: { select: { symbol: true } } },
      orderBy: { overlapCount: "desc" },
      take: 15,
    }),
    prisma.watchlistItem.findMany({
      where: { addedAt: { gte: weekStart, lte: weekEnd } },
      include: { instrument: { select: { symbol: true } } },
      orderBy: { addedAt: "desc" },
    }),
    prisma.providerJobRun.findMany({
      where: { startedAt: { gte: weekStart, lte: weekEnd } },
      include: { provider: true },
      orderBy: { startedAt: "desc" },
      take: 100,
    }),
  ]);

  const providerSummary = providerRuns.reduce<Record<string, { completed: number; failed: number }>>((acc, run) => {
    if (!acc[run.provider.key]) acc[run.provider.key] = { completed: 0, failed: 0 };
    if (run.status === "completed") acc[run.provider.key].completed += 1;
    if (run.status === "failed") acc[run.provider.key].failed += 1;
    return acc;
  }, {});

  const digest = await prisma.digest.upsert({
    where: { digestType_marketDate: { digestType: "week_end", marketDate: weekEnd } },
    update: {
      title: `Weekly Summary — ${toDateKey(weekStart)} to ${toDateKey(weekEnd)}`,
      summary: `${strategyMatches} strategy matches, ${screenerHits} screener hits this week.`,
      metricsJson: { strategyMatches, screenerHits } as Prisma.InputJsonValue,
    },
    create: {
      digestType: "week_end",
      marketDate: weekEnd,
      title: `Weekly Summary — ${toDateKey(weekStart)} to ${toDateKey(weekEnd)}`,
      summary: `${strategyMatches} strategy matches, ${screenerHits} screener hits this week.`,
      metricsJson: { strategyMatches, screenerHits } as Prisma.InputJsonValue,
      sections: {
        create: [
          {
            key: "strategy_matches",
            title: "Strategy Match Count",
            bodyMarkdown: `Total matched records: **${strategyMatches}**`,
            sortOrder: 0,
          },
          {
            key: "screener_hits",
            title: "Screener Hit Count",
            bodyMarkdown: `Total screener hits: **${screenerHits}**`,
            sortOrder: 1,
          },
          {
            key: "confluence",
            title: "Top Confluence Candidates",
            bodyMarkdown: confluence.length
              ? confluence.map((row) => `- ${row.instrument.symbol}: overlap ${row.overlapCount}`).join("\n")
              : "No confluence records.",
            sortOrder: 2,
          },
          {
            key: "watchlist_changes",
            title: "Watchlist Additions/Removals",
            bodyMarkdown: watchlistChanges.length
              ? watchlistChanges.map((item) => `- ${item.instrument.symbol} (${item.isActive ? "active" : "inactive"})`).join("\n")
              : "No watchlist changes.",
            sortOrder: 3,
          },
          {
            key: "provider_health",
            title: "Provider Health",
            bodyMarkdown: Object.entries(providerSummary).length
              ? Object.entries(providerSummary).map(([key, val]) => `- ${key}: completed ${val.completed}, failed ${val.failed}`).join("\n")
              : "No provider runs this week.",
            sortOrder: 4,
          },
        ],
      },
    },
  });

  return {
    digestId: digest.id,
    weekStart: toDateKey(weekStart),
    weekEnd: toDateKey(weekEnd),
    strategyMatches,
    screenerHits,
  };
}
