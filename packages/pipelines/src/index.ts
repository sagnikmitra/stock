import { prisma } from "@ibo/db";
import type { Prisma } from "@ibo/db";
import { buildIndicatorSet, evaluateScreener, evaluateStrategy, scoreMarketContext, type DataContext } from "@ibo/strategy-engine";
import type { Candle, ScreenerDSL, StrategyDSL } from "@ibo/types";
import { nseCalendar } from "@ibo/utils";

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function pctChange(current: number, previous: number): number {
  if (!Number.isFinite(previous) || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function simpleMovingAverage(values: number[], period: number): number | undefined {
  if (values.length < period || period <= 0) return undefined;
  const window = values.slice(-period);
  const sum = window.reduce((acc, value) => acc + value, 0);
  return sum / period;
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
  let diiNetCashCr: number | undefined;

  const latestFii = await prisma.fiiDiiSnapshot.findFirst({ orderBy: { date: "desc" } });
  if (latestFii) {
    if (latestFii.fiiCashNet !== null) fiiNetCashCr = Number(latestFii.fiiCashNet);
    if (latestFii.diiCashNet !== null) diiNetCashCr = Number(latestFii.diiCashNet);
    if (fiiNetCashCr === undefined && diiNetCashCr === undefined) warnings.push("No FII/DII data");
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
    diiNetCashCr,
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
              fiiNetCashCr !== undefined || diiNetCashCr !== undefined
                ? [
                    fiiNetCashCr !== undefined
                      ? `- FII net cash: ₹${fiiNetCashCr.toLocaleString("en-IN")} Cr ${fiiNetCashCr > 0 ? "(buying)" : "(selling)"}`
                      : "- FII net cash: N/A",
                    diiNetCashCr !== undefined
                      ? `- DII net cash: ₹${diiNetCashCr.toLocaleString("en-IN")} Cr ${diiNetCashCr > 0 ? "(buying)" : "(selling)"}`
                      : "- DII net cash: N/A",
                  ].join("\n")
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
  const btstGate = nseCalendar.isBtstEligible(todayDate);

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
    const prevInd = buildIndicatorSet(series.slice(0, -1));
    const last = series[series.length - 1];
    const prev = series[series.length - 2] ?? last;
    const recent20 = series.slice(-20);
    const prior20 = series.slice(-21, -1);
    const recent22 = series.slice(-22);
    const recent252 = series.slice(-252);
    const resistance20 = recent20.length > 0 ? Math.max(...recent20.map((c) => c.high)) : last.high;
    const donchianHigh20 = prior20.length > 0 ? Math.max(...prior20.map((c) => c.high)) : resistance20;
    const support20 = prior20.length > 0 ? Math.min(...prior20.map((c) => c.low)) : last.low;
    const high52Week = recent252.length > 0 ? Math.max(...recent252.map((c) => c.high)) : last.high;
    const rangePct20 = support20 > 0 ? (resistance20 - support20) / support20 : 0;
    const candleRange = Math.max(last.high - last.low, 0.0001);
    const candleBodyPct = (Math.abs(last.close - last.open) / candleRange) * 100;
    const candleColor = last.close >= last.open ? "green" : "red";
    const relativeVolume = ind.relativeVolume ?? 0;
    const closeSeries = series.map((c) => c.close);
    const volumeSeries = series.map((c) => c.volume);
    const ema5 = simpleMovingAverage(closeSeries, 5);
    const volumeSma20 = simpleMovingAverage(volumeSeries, 20);
    const dayChangePct = pctChange(last.close, prev.close);
    const closeAboveResistancePct = resistance20 > 0 ? pctChange(last.close, resistance20) : 0;
    const closeAbove52WeekHigh = high52Week > 0 ? last.close >= high52Week * 0.995 : false;
    const nearSupport = support20 > 0 ? Math.abs(last.close - support20) / support20 <= 0.03 : false;
    const regimeIsSideways = rangePct20 <= 0.12;
    const lowerBbTouch = ind.bbLower !== undefined ? last.low <= ind.bbLower * 1.01 : false;
    const lowerBbInteraction = ind.bbLower !== undefined ? last.low <= ind.bbLower * 1.02 : false;
    const sma50 = ind.sma50 ?? last.close;
    const sma44 = ind.sma44 ?? last.close;
    const sma200 = ind.sma200 ?? last.close;
    const nearSma50 = sma50 > 0 ? Math.abs(last.close - sma50) / sma50 <= 0.02 : false;
    const trendlineBreakUp = sma50 > 0 ? last.open <= sma50 && last.close > sma50 : last.close > last.open;
    const dailyDipInUptrend =
      sma50 > 0
        ? last.close >= sma50 && last.low <= (ind.sma34 ?? sma50)
        : last.close >= prev.close;
    const bullishResolution = last.close > prev.close && candleColor === "green";
    const primaryTrendNotBearish = ind.sma200 !== undefined ? last.close >= ind.sma200 : true;
    const vwapApprox = (last.high + last.low + last.close) / 3;
    const prevDayVolume = prev.volume;
    const notPreHolidayOrExpiry = btstGate.eligible;
    const priceAboveSuperTrend = ind.superTrend !== undefined ? last.close >= ind.superTrend : last.close >= sma50;
    const sma13CrossAboveSma34 =
      ind.sma13 !== undefined &&
      ind.sma34 !== undefined &&
      prevInd.sma13 !== undefined &&
      prevInd.sma34 !== undefined
        ? ind.sma13 > ind.sma34 && prevInd.sma13 <= prevInd.sma34
        : false;
    const primaryUptrend = last.close >= sma44 && sma44 >= sma200;
    const reclaimAfterPullback = prev.close <= sma44 && last.close > sma44;
    const consolidationWindow = series.slice(-120);
    const consolidationCeiling = consolidationWindow.length > 0 ? Math.max(...consolidationWindow.map((c) => c.high)) : last.high;
    const consolidationFloor = consolidationWindow.length > 0 ? Math.min(...consolidationWindow.map((c) => c.low)) : last.low;
    const longConsolidationDetected =
      consolidationFloor > 0 ? (consolidationCeiling - consolidationFloor) / consolidationFloor <= 0.35 : false;
    const alphaApprox = recent20.length >= 2 ? pctChange(last.close, recent20[0].close) : dayChangePct;
    const betaApprox = recent20.length >= 2 ? Math.max(0, Math.min(1, Math.abs(dayChangePct) / 4)) : 0.8;

    const ctx: DataContext = {
      "daily.open": last.open,
      "daily.high": last.high,
      "daily.low": last.low,
      "daily.close": last.close,
      "daily.volume": last.volume,
      "daily.rsi14": ind.rsi14,
      "daily.rsi_14": ind.rsi14,
      "daily.sma_13": ind.sma13,
      "daily.sma13": ind.sma13,
      "daily.sma_34": ind.sma34,
      "daily.sma34": ind.sma34,
      "daily.sma_44": ind.sma44,
      "daily.sma44": ind.sma44,
      "daily.sma_50": ind.sma50,
      "daily.sma50": ind.sma50,
      "daily.sma_200": ind.sma200,
      "daily.sma200": ind.sma200,
      "daily.ema_9": ind.ema9,
      "daily.ema9": ind.ema9,
      "daily.ema_15": ind.ema15,
      "daily.ema15": ind.ema15,
      "daily.ema5": ema5,
      "daily.bb_upper_20_2": ind.bbUpper,
      "daily.bbUpper": ind.bbUpper,
      "daily.bb_middle_20": ind.bbMiddle,
      "daily.bbMiddle": ind.bbMiddle,
      "daily.bb_lower_20_2": ind.bbLower,
      "daily.bbLower": ind.bbLower,
      "daily.supertrend_10_3": ind.superTrendDir,
      "daily.superTrend": ind.superTrend,
      "daily.superTrendDir": ind.superTrendDir,
      "daily.atr_14": ind.atr14,
      "daily.volume_ratio_20": ind.relativeVolume,
      "daily.relativeVolume": ind.relativeVolume,
      "daily.relativeVolume20": ind.relativeVolume,
      "daily.volumeSma20": volumeSma20,
      "daily.deliveryPct": last.deliveryPct,
      "daily.candleBodyPct": candleBodyPct,
      "daily.candleColor": candleColor,
      "daily.vwap": vwapApprox,

      // Screener compatibility aliases for 4H and monthly source fields
      "h4.ema9": ind.ema9,
      "h4.ema15": ind.ema15,
      "h4.close": last.close,
      "h4.superTrendDir": ind.superTrendDir,
      "h4.candleColor": candleColor,

      "monthly.high": recent22.length > 0 ? Math.max(...recent22.map((c) => c.high)) : last.high,
      "monthly.close": last.close,
      "monthly.rsi14": ind.rsi14,
      "monthly.bbUpper": ind.bbUpper,
      "monthly.bbMiddle": ind.bbMiddle,
      "instrument.marketCapBucket": inst.marketCapBucket ?? "large_cap",

      // Derived helpers used by candidate and confluence screeners
      "derived.closeAbove52WeekHigh": closeAbove52WeekHigh,
      "derived.closeAboveResistancePct": closeAboveResistancePct,
      "derived.donchianHigh20": donchianHigh20,
      "derived.nearSupport": nearSupport,
      "derived.regimeIsSideways": regimeIsSideways,
      "derived.isTopGainer": dayChangePct >= 2,
      "derived.isVolumeShocker": relativeVolume >= 1.8,
      "derived.dailyDipInUptrend": dailyDipInUptrend,
      "derived.lowerBbTouch": lowerBbTouch,
      "derived.lowerBbInteraction": lowerBbInteraction,
      "derived.trendlineBreakUp": trendlineBreakUp,
      "derived.nearSma50": nearSma50,
      "derived.bullishResolution": bullishResolution,
      "derived.primaryTrendNotBearish": primaryTrendNotBearish,
      "derived.candleBodyPct": candleBodyPct,
      "derived.prevDayVolume": prevDayVolume,
      "derived.notPreHolidayOrExpiry": notPreHolidayOrExpiry,
      "derived.priceAboveSuperTrend": priceAboveSuperTrend,
      "derived.sma13CrossAboveSma34": sma13CrossAboveSma34,
      "derived.primaryUptrend": primaryUptrend,
      "derived.reclaimAfterPullback": reclaimAfterPullback,
      "derived.consolidationCeiling": consolidationCeiling,
      "derived.longConsolidationDetected": longConsolidationDetected,
      "derived.alpha": alphaApprox,
      "derived.beta": betaApprox,
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
