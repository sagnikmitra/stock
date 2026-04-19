import type { PrismaClient } from "@prisma/client";

interface ScreenerSeed {
  key: string;
  name: string;
  description: string;
  linkedStrategyKey?: string;
  isExternalReference: boolean;
  externalUrl?: string;
  tags: string[];
  expressionDsl?: Record<string, unknown>;
}

const screeners: ScreenerSeed[] = [
  {
    key: "investment_bb_internal",
    name: "Investment BB Internal",
    description:
      "Monthly BB breakout internal screener. Session-6 normalized investment scan: monthly high above upper BB, RSI support, and liquidity gate.",
    linkedStrategyKey: "investment_bb_monthly",
    isExternalReference: false,
    tags: ["investment", "monthly", "bollinger", "internal", "session6"],
    expressionDsl: {
      canonicalVersionTag: "bb-monthly-breakout.v2.normalized-active",
      filters: [
        { field: "monthly.high", operator: ">", valueRef: "monthly.bbUpper", kind: "hard", label: "Monthly high > upper BB" },
        { field: "monthly.rsi14", operator: ">=", value: 50, kind: "hard", label: "Monthly RSI >= 50" },
        { field: "daily.volume", operator: ">=", value: 100000, kind: "hard", label: "Daily volume >= 1L" },
      ],
    },
  },
  {
    key: "mbb_candidate",
    name: "MBB Candidate",
    description:
      "Heuristic MBB candidate scan from Session-6 investment flow. Near middle BB on monthly with trend context; requires manual chart confirmation.",
    linkedStrategyKey: "investment_mbb",
    isExternalReference: false,
    tags: ["investment", "monthly", "mbb", "candidate", "session6"],
    expressionDsl: {
      canonicalVersionTag: "mbb.v1.heuristic",
      filters: [
        { field: "monthly.close", operator: "<=", valueRef: "monthly.bbMiddle", kind: "hard", label: "Close near/below MBB" },
        { field: "monthly.rsi14", operator: ">=", value: 40, kind: "soft", label: "Monthly RSI supportive" },
      ],
    },
  },
  {
    key: "trend_continuation_internal",
    name: "Trend Continuation Internal",
    description:
      "Session-9 trend continuation internal screener: monthly strength + daily trend continuation stack.",
    linkedStrategyKey: "swing_trend_continuation",
    isExternalReference: false,
    tags: ["swing", "trend", "internal", "session9"],
    expressionDsl: {
      canonicalVersionTag: "trend-continuation.v1.initial",
      filters: [
        { field: "monthly.rsi14", operator: ">=", value: 60, kind: "hard", label: "Monthly RSI >= 60" },
        { field: "daily.close", operator: ">", valueRef: "daily.superTrend", kind: "hard", label: "Close above super trend" },
        { field: "daily.candleColor", operator: "==", value: "green", kind: "soft", label: "Green daily confirmation" },
      ],
    },
  },
  {
    key: "ema_9_15_supertrend_4h_internal",
    name: "EMA 9/15 + SuperTrend 4H Internal",
    description:
      "Session-9 fast swing internal screener on 4H: EMA stack and supertrend alignment.",
    linkedStrategyKey: "swing_ema_9_15_st_4h",
    isExternalReference: false,
    tags: ["swing", "h4", "ema", "supertrend", "internal", "session9"],
    expressionDsl: {
      canonicalVersionTag: "ema-9-15-supertrend-4h.v1",
      filters: [
        { field: "h4.ema9", operator: ">", valueRef: "h4.ema15", kind: "hard", label: "EMA 9 > EMA 15" },
        { field: "h4.close", operator: ">", valueRef: "h4.ema15", kind: "hard", label: "Close above EMA15" },
        { field: "h4.superTrendDir", operator: "==", value: "up", kind: "hard", label: "SuperTrend up" },
      ],
    },
  },
  {
    key: "sma_13_34_internal",
    name: "SMA 13/34 Internal",
    description:
      "Session-9 SMA crossover internal screener: 13 over 34 with long-trend support.",
    linkedStrategyKey: "swing_sma_13_34_200",
    isExternalReference: false,
    tags: ["swing", "sma", "crossover", "internal", "session9"],
    expressionDsl: {
      canonicalVersionTag: "sma-13-34-200.v1",
      filters: [
        { field: "daily.sma13", operator: ">", valueRef: "daily.sma34", kind: "hard", label: "SMA13 > SMA34" },
        { field: "daily.sma34", operator: ">", valueRef: "daily.sma200", kind: "hard", label: "SMA34 > SMA200" },
      ],
    },
  },
  {
    key: "sma_44_internal",
    name: "SMA 44 Internal",
    description:
      "Session-9 44-SMA trend-respect internal screener.",
    linkedStrategyKey: "swing_sma_44",
    isExternalReference: false,
    tags: ["swing", "sma", "support", "internal", "session9"],
    expressionDsl: {
      canonicalVersionTag: "sma-44.v1",
      filters: [
        { field: "daily.low", operator: "<=", valueRef: "daily.sma44", kind: "hard", label: "Touch 44 SMA" },
        { field: "daily.close", operator: ">=", valueRef: "daily.sma44", kind: "hard", label: "Close >= 44 SMA" },
      ],
    },
  },
  {
    key: "rsi_above_80_internal",
    name: "RSI Above 80 Internal",
    description:
      "Internal momentum extension screener used for breakout momentum watchlist refinement.",
    isExternalReference: false,
    tags: ["momentum", "rsi", "internal"],
    expressionDsl: {
      filters: [{ field: "daily.rsi14", operator: ">", value: 80, kind: "hard", label: "RSI > 80" }],
    },
  },
  {
    key: "nse_52_week_high_internal",
    name: "NSE 52-Week High Internal",
    description:
      "Reference-linked internal view of 52-week-high candidates (NSE high/low board).",
    isExternalReference: false,
    tags: ["breakout", "52w", "internal", "reference_linked"],
    expressionDsl: {
      filters: [
        { field: "derived.closeAbove52WeekHigh", operator: "==", value: true, kind: "hard", label: "Close above 52W high" },
      ],
      referenceLinks: ["https://www.nseindia.com/market-data/live-market-action/new-high-low"],
    },
  },
  {
    key: "breakout_quality_internal",
    name: "Breakout Quality Internal",
    description:
      "Session-9 breakout quality internal screener with body, volume, and resistance clearance checks.",
    linkedStrategyKey: "swing_breakout",
    isExternalReference: false,
    tags: ["breakout", "quality", "internal", "session9"],
    expressionDsl: {
      canonicalVersionTag: "breakout.v1.canonical",
      filters: [
        { field: "daily.candleBodyPct", operator: ">=", value: 70, kind: "hard", label: "Body >= 70%" },
        { field: "daily.relativeVolume", operator: ">", value: 1.5, kind: "hard", label: "Volume > 1.5x" },
        { field: "derived.closeAboveResistancePct", operator: ">=", value: 1, kind: "hard", label: ">=1% above resistance" },
      ],
    },
  },
  {
    key: "btst_top_gainers_volume_shockers_internal",
    name: "BTST Top Gainers + Volume Shockers Internal",
    description:
      "Session-9 BTST internal candidate screener combining top gainer and volume-shocker behavior.",
    linkedStrategyKey: "swing_btst",
    isExternalReference: false,
    tags: ["btst", "volume", "gainers", "internal", "session9"],
    expressionDsl: {
      canonicalVersionTag: "btst.v1.canonical",
      filters: [
        { field: "derived.isTopGainer", operator: "==", value: true, kind: "hard", label: "Top gainer" },
        { field: "derived.isVolumeShocker", operator: "==", value: true, kind: "hard", label: "Volume shocker" },
        { field: "daily.deliveryPct", operator: ">=", value: 45, kind: "hard", label: "Delivery >=45%" },
      ],
    },
  },
  {
    key: "buying_in_dips_candidate",
    name: "Buying In Dips Candidate",
    description:
      "Session-7 canonical dip candidate screener with monthly strength and daily dip-resolution structure.",
    linkedStrategyKey: "swing_buying_the_dips",
    isExternalReference: false,
    tags: ["swing", "dip", "candidate", "internal", "session7"],
    expressionDsl: {
      canonicalVersionTag: "buying-in-dips.v1.canonical",
      filters: [
        { field: "monthly.rsi14", operator: ">=", value: 60, kind: "hard", label: "Monthly RSI >= 60" },
        { field: "derived.dailyDipInUptrend", operator: "==", value: true, kind: "hard", label: "Controlled dip" },
      ],
    },
  },
  {
    key: "cross_strategy_candidate",
    name: "Cross Strategy Candidate",
    description:
      "Session-7 cross strategy candidate screener (lower BB touch + trendline break + VWAP reclaim + green candle).",
    linkedStrategyKey: "swing_cross",
    isExternalReference: false,
    tags: ["swing", "cross", "candidate", "internal", "session7"],
    expressionDsl: {
      canonicalVersionTag: "cross-strategy.v1.canonical",
      filters: [
        { field: "derived.lowerBbTouch", operator: "==", value: true, kind: "hard", label: "Lower BB touch" },
        { field: "derived.trendlineBreakUp", operator: "==", value: true, kind: "hard", label: "Trendline break up" },
        { field: "daily.close", operator: ">", valueRef: "daily.vwap", kind: "hard", label: "Close above VWAP" },
        { field: "daily.candleColor", operator: "==", value: "green", kind: "hard", label: "Green candle" },
      ],
    },
  },
  {
    key: "abc_strategy_candidate",
    name: "ABC Strategy Candidate",
    description:
      "Session-8 ABC strategy candidate screener (A=50SMA, B=lower BB interaction, C=green confirmation candle).",
    linkedStrategyKey: "swing_abc",
    isExternalReference: false,
    tags: ["swing", "abc", "candidate", "internal", "session8"],
    expressionDsl: {
      canonicalVersionTag: "abc-strategy.v1.canonical",
      filters: [
        { field: "derived.nearSma50", operator: "==", value: true, kind: "hard", label: "Near 50 SMA" },
        { field: "derived.lowerBbInteraction", operator: "==", value: true, kind: "hard", label: "Lower BB interaction" },
        { field: "daily.candleColor", operator: "==", value: "green", kind: "hard", label: "Green candle" },
      ],
    },
  },
  {
    key: "sideways_support_reversal_internal",
    name: "Sideways Support Reversal Internal",
    description:
      "drr-screener gap screener: support-reversal entry inside sideways regime. Entry = support + 15% of support-resistance band. NOT the same as +1% breakout entry.",
    linkedStrategyKey: "swing_sideways_support_reversal",
    isExternalReference: false,
    tags: ["swing", "sideways", "support", "reversal", "internal", "drr-screener"],
    expressionDsl: {
      canonicalVersionTag: "sideways-support-reversal.v1.canonical",
      filters: [
        { field: "derived.regimeIsSideways", operator: "==", value: true, kind: "hard", label: "Sideways regime" },
        { field: "derived.nearSupport", operator: "==", value: true, kind: "hard", label: "At support zone" },
        { field: "daily.deliveryPct", operator: ">=", value: 45, kind: "hard", label: "Delivery >= 45%" },
        { field: "daily.volume", operator: ">", valueRef: "daily.volumeSma20", kind: "hard", label: "Volume > 20D avg" },
        { field: "daily.close", operator: ">", valueRef: "daily.ema5", kind: "hard", label: "Close above 5 EMA" },
      ],
    },
  },
  {
    key: "twenty_day_channel_breakout_internal",
    name: "20-Day Channel Breakout Internal",
    description:
      "drr-screener gap screener: true Donchian-style 20-day high breakout with body/volume/delivery/resistance gates. Uses RELAXED delivery 35% variant; strict variant uses 45%.",
    linkedStrategyKey: "swing_twenty_day_channel_breakout",
    isExternalReference: false,
    tags: ["swing", "breakout", "donchian", "20day", "channel", "internal", "drr-screener"],
    expressionDsl: {
      canonicalVersionTag: "twenty-day-channel-breakout.v1.canonical",
      filters: [
        { field: "daily.close", operator: ">", valueRef: "derived.donchianHigh20", kind: "hard", label: "Close > 20D highest high" },
        { field: "daily.candleBodyPct", operator: ">=", value: 65, kind: "hard", label: "Body >= 65%" },
        { field: "daily.relativeVolume20", operator: ">=", value: 1.5, kind: "hard", label: "Volume >= 1.5x 20D" },
        { field: "daily.deliveryPct", operator: ">=", value: 35, kind: "hard", label: "Delivery >= 35%" },
        { field: "derived.closeAboveResistancePct", operator: ">=", value: 1, kind: "hard", label: ">=1% above resistance" },
      ],
    },
  },
  {
    key: "chartink_volume_shockers",
    name: "Chartink Volume Shockers",
    description: "External reference screener for unusual volume activity.",
    isExternalReference: true,
    externalUrl: "https://chartink.com/screener/volume-shockers",
    tags: ["external", "chartink", "volume", "reference_linked"],
  },
  {
    key: "chartink_52w_high",
    name: "Chartink 52-Week High Breakout",
    description: "External reference screener for 52-week highs.",
    isExternalReference: true,
    externalUrl: "https://chartink.com/screener/52-week-high-breakout",
    tags: ["external", "chartink", "breakout", "reference_linked"],
  },
];

export async function seedScreeners(prisma: PrismaClient) {
  console.log("  🔍 Seeding screeners...");

  for (const screenerSeed of screeners) {
    const linkedStrategy = screenerSeed.linkedStrategyKey
      ? await prisma.strategy.findUnique({ where: { key: screenerSeed.linkedStrategyKey } })
      : null;

    const screener = await prisma.screener.upsert({
      where: { key: screenerSeed.key },
      update: {
        name: screenerSeed.name,
        description: screenerSeed.description,
        linkedStrategyId: linkedStrategy?.id ?? null,
        isExternalReference: screenerSeed.isExternalReference,
        externalUrl: screenerSeed.externalUrl ?? null,
        tags: screenerSeed.tags,
        expressionDsl: screenerSeed.expressionDsl ?? undefined,
      },
      create: {
        key: screenerSeed.key,
        name: screenerSeed.name,
        description: screenerSeed.description,
        linkedStrategyId: linkedStrategy?.id ?? null,
        isExternalReference: screenerSeed.isExternalReference,
        externalUrl: screenerSeed.externalUrl ?? null,
        tags: screenerSeed.tags,
        expressionDsl: screenerSeed.expressionDsl ?? undefined,
      },
    });

    if (screenerSeed.expressionDsl) {
      await prisma.screenerVersion.upsert({
        where: { screenerId_version: { screenerId: screener.id, version: 1 } },
        update: { expressionDsl: screenerSeed.expressionDsl, isActive: true },
        create: {
          screenerId: screener.id,
          version: 1,
          isActive: true,
          expressionDsl: screenerSeed.expressionDsl,
        },
      });
    }
  }
}

