import type { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Course Sessions
// ---------------------------------------------------------------------------

const sessions = [
  {
    key: "session_1",
    title: "Session 1 — Stock Market Foundations",
    sourceSession: "1",
    summary: "Introduction to stock market basics: what stocks are, how exchanges work (NSE/BSE), market participants, order types, and how to set up a demat + trading account.",
    bodyMarkdown: `# Session 1 — Stock Market Foundations

## Key Topics
- Stock market ecosystem: exchanges (NSE, BSE), SEBI regulation
- Market participants: retail, institutional (FII/DII), HNI
- Order types: market order, limit order, SL, SL-M
- Demat account setup and broker selection
- Trading vs investing mindset

## Core Takeaways
- Market is a transfer mechanism from impatient to patient
- Focus on cash equity segment first before derivatives
- Broker choice matters: Zerodha/Upstox for retail
`,
    confidence: "high" as const,
    sections: [
      { key: "market_basics", title: "Market Basics", body: "NSE and BSE are primary Indian exchanges. SEBI regulates. Settlement is T+1.", sortOrder: 0 },
      { key: "order_types", title: "Order Types", body: "Market, Limit, SL, SL-M. Use limit orders for disciplined entry. SL-M for stop losses.", sortOrder: 1 },
    ],
  },
  {
    key: "session_4",
    title: "Session 4 — Chart Reading & Candlestick Basics",
    sourceSession: "4",
    summary: "Introduction to technical analysis: candlestick charts, timeframes, support/resistance, basic patterns (hammer, engulfing, doji).",
    bodyMarkdown: `# Session 4 — Chart Reading & Candlestick Basics

## Key Topics
- Candlestick anatomy: open, high, low, close, body, wicks
- Timeframes: daily, weekly, monthly, 4H, 1H
- Support and resistance concept
- Key patterns: hammer, inverted hammer, engulfing, doji, morning star

## Core Takeaways
- Higher timeframes are more reliable
- Support/resistance are zones, not exact lines
- Volume confirms price action
`,
    confidence: "high" as const,
    sections: [
      { key: "candlestick_anatomy", title: "Candlestick Anatomy", body: "OHLC. Green/white = bullish (close > open). Red/black = bearish. Long wicks show rejection.", sortOrder: 0 },
      { key: "support_resistance", title: "Support & Resistance", body: "Support = demand zone, resistance = supply zone. Previous support becomes resistance after break. Zones, not lines.", sortOrder: 1 },
    ],
  },
  {
    key: "session_5",
    title: "Session 5 — Indicators: RSI, SMA, EMA",
    sourceSession: "5",
    summary: "Core indicators: RSI (14-period), SMA (13, 34, 44, 200), EMA (9, 15). How to combine indicators for confluence. Introduction to trend identification.",
    bodyMarkdown: `# Session 5 — Indicators: RSI, SMA, EMA

## Key Topics
- RSI (Relative Strength Index): 14-period default, >70 overbought, <30 oversold
- SMA: 13, 34, 44 (Arindam special), 200 (institutional benchmark)
- EMA: 9, 15 for shorter-term signals
- RSI > 80 as bullish strength (not just "overbought")
- SMA crossovers as trend signals: 13/34, price vs 200

## Core Takeaways
- 200 SMA is king: institutional benchmark for trend direction
- 44 SMA: Arindam's preferred dynamic support
- RSI > 80 can mean strength in strong uptrends, not just "sell signal"
- Always confirm indicators with price action
`,
    confidence: "high" as const,
    sections: [
      { key: "rsi", title: "RSI (Relative Strength Index)", body: "Default period 14. >70 overbought, <30 oversold. In strong uptrend, RSI > 80 shows strength. Use 55 as bullish confirmation threshold.", sortOrder: 0 },
      { key: "sma", title: "Simple Moving Average", body: "Key SMAs: 13 (fast), 34 (medium), 44 (Arindam's), 200 (institutional). 13/34 cross = swing signal. Above 200 = uptrend.", sortOrder: 1 },
      { key: "ema", title: "Exponential Moving Average", body: "9 and 15 EMA used on 4H charts. More responsive than SMA. EMA 9 > EMA 15 = short-term bullish.", sortOrder: 2 },
    ],
  },
  {
    key: "session_6",
    title: "Session 6 — Bollinger Bands & Monthly Investment Strategy",
    sourceSession: "6",
    summary: "Bollinger Bands (20,2). Monthly BB breakout strategy for long-term investment. MBB mean-reversion for adding to positions. First complete strategy with full entry/exit rules.",
    bodyMarkdown: `# Session 6 — Bollinger Bands & Monthly Investment Strategy

## Key Topics
- Bollinger Bands: 20-period SMA ± 2 standard deviations
- Upper BB breakout on monthly = strong momentum signal
- MBB (Middle BB) as support for adding to positions
- Monthly BB Breakout Strategy: full entry, stop-loss, exit rules
- Position sizing: 2% risk rule

## Core Takeaways
- Monthly timeframe filters out noise
- BB breakout + RSI + volume = high-confidence investment signal
- Entry: 1% buffer above trigger candle high
- Stop loss: Super Trend or swing low
- Trail using Super Trend on daily
`,
    confidence: "medium" as const,
    sections: [
      { key: "bollinger_bands", title: "Bollinger Bands", body: "20-period SMA center (MBB), ±2σ for upper/lower bands. Width shows volatility. Squeeze = low vol, expansion = breakout.", sortOrder: 0 },
      { key: "bb_monthly_strategy", title: "Monthly BB Breakout Strategy", body: "Evaluate last trading day of month. Monthly high > upper BB + RSI ≥ 50 + Price ≥ 100. Entry at 1% above trigger high. SL at Super Trend or swing low.", sortOrder: 1 },
    ],
  },
  {
    key: "session_7",
    title: "Session 7 — Swing Strategies: Cross, ABC, Breakout",
    sourceSession: "7",
    summary: "Multiple swing strategies: 13/34 SMA Cross, ABC correction pattern, trendline/resistance breakout. Introduction to SuperTrend indicator.",
    bodyMarkdown: `# Session 7 — Swing Strategies: Cross, ABC, Breakout

## Key Topics
- Cross Strategy: SMA 13/34 bullish crossover with 200 SMA confirmation
- ABC Correction: A-wave down, B-wave bounce, C-wave final leg down to support/Fib
- Breakout Strategy: price above resistance with volume confirmation
- SuperTrend (10,3): trend-following stop + trail mechanism
- Multiple timeframe confirmation

## Core Takeaways
- Cross is the bread-and-butter swing signal
- ABC needs patience — wait for C to complete at support zone
- Breakout needs volume > 1.5x average as confirmation
- Always define stop-loss before entry
`,
    confidence: "high" as const,
    sections: [
      { key: "cross_strategy", title: "13/34 SMA Cross Strategy", body: "SMA 13 crosses above SMA 34. Price above 200 SMA. RSI > 55. Entry above crossover candle high. SL below SMA 34 or recent swing low.", sortOrder: 0 },
      { key: "abc_pattern", title: "ABC Correction Pattern", body: "A: impulse down. B: counter-rally. C: final leg to support/Fib 61.8%. Entry when C holds support. SL below C-wave low.", sortOrder: 1 },
      { key: "breakout_strategy", title: "Breakout Strategy", body: "Price closes above resistance/trendline. Volume > 1.5x 20-day avg. RSI supportive (>60). Entry above breakout candle. SL below breakout zone.", sortOrder: 2 },
    ],
  },
  {
    key: "session_8",
    title: "Session 8 — BTST, Trend Continuation, Position Sizing",
    sourceSession: "8",
    summary: "BTST (Buy Today Sell Tomorrow) strategy, trend continuation framework, 2% risk position sizing formula, and the importance of risk management.",
    bodyMarkdown: `# Session 8 — BTST, Trend Continuation, Position Sizing

## Key Topics
- BTST: momentum-based overnight trade, close near day high, 2x+ volume
- Trend Continuation: above 200 SMA, RSI > 55, MACD positive, ADX > 20
- Position sizing: quantity = (0.02 × portfolio) / (entry − stop_loss)
- Never risk more than 2% of portfolio on a single trade
- Scaling in vs full position

## Core Takeaways
- BTST is high-risk, high-reward — strict volume filter essential
- 2% rule is non-negotiable for capital preservation
- Trend continuation = highest probability swing setup
- ADX > 20 confirms trending market (vs ranging)
`,
    confidence: "high" as const,
    sections: [
      { key: "btst", title: "BTST Strategy", body: "Buy Today Sell Tomorrow. Close > 97% of high. Volume > 2x 20-day avg. Sell next day at open or first 15-min high. Very short hold.", sortOrder: 0 },
      { key: "position_sizing", title: "2% Risk Position Sizing", body: "qty = (0.02 × portfolio_size) / (entry_price − stop_loss_price). Never risk more than 2% of total capital on one trade. Non-negotiable.", sortOrder: 1 },
    ],
  },
  {
    key: "session_9",
    title: "Session 9 — Market Context, Alpha/Beta, 4H Timeframe",
    sourceSession: "9",
    summary: "Market context engine (GIFT Nifty, Dow Futures, Gold, Crude, FII/DII). Alpha/Beta for large-cap selection. 9/15 EMA + SuperTrend on 4H timeframe.",
    bodyMarkdown: `# Session 9 — Market Context, Alpha/Beta, 4H Timeframe

## Key Topics
- Market Context scoring: GIFT Nifty, Dow YM1!, Gold, Crude, FII/DII net flow
- Alpha: excess return over benchmark (NIFTY 50). Want > 0
- Beta: volatility relative to market. Want 0.8–1.5 for large-cap
- 4H timeframe: 9/15 EMA + SuperTrend for quicker swing signals
- Favorable / Mixed / Hostile posture scoring

## Core Takeaways
- Never trade blind to global context
- FII net buy > ₹500 Cr = favorable signal
- Alpha > 0 over 1Y is minimum bar for quality stock
- 4H is bridge between daily and intraday
`,
    confidence: "high" as const,
    sections: [
      { key: "market_context", title: "Market Context Engine", body: "Score from 5 inputs: GIFT Nifty gap (>0.3% favorable), Dow Futures direction, Gold stability, Crude not spiking, FII net buy. 3+ favorable = go. <2 = caution.", sortOrder: 0 },
      { key: "alpha_beta", title: "Alpha & Beta", body: "Alpha = excess return vs NIFTY 50. Beta = volatility correlation. Alpha > 0 + Beta 0.8–1.5 = quality large-cap candidate.", sortOrder: 1 },
      { key: "ema_4h", title: "9/15 EMA + SuperTrend on 4H", body: "EMA 9 > EMA 15 = bullish. SuperTrend (10,3) green = trend confirmed. Close above both EMAs. Good for quick swing entries.", sortOrder: 2 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Knowledge Concepts
// ---------------------------------------------------------------------------

const concepts = [
  { key: "rsi", title: "RSI — Relative Strength Index", category: "indicator", definition: "Momentum oscillator (0-100). Default 14 periods. >70 overbought, <30 oversold. In strong trends, >80 shows momentum strength, not necessarily reversal.", linkedStrategyKeys: ["swing_trend_continuation", "investment_bb_monthly"] },
  { key: "sma", title: "SMA — Simple Moving Average", category: "indicator", definition: "Arithmetic mean of price over N periods. Key values: 13 (fast), 34 (medium), 44 (Arindam's), 200 (institutional). Crossovers signal trend changes.", linkedStrategyKeys: ["swing_sma_13_34_200", "swing_sma_44"] },
  { key: "ema", title: "EMA — Exponential Moving Average", category: "indicator", definition: "Weighted moving average giving more weight to recent prices. More responsive than SMA. Used on 4H with periods 9 and 15.", linkedStrategyKeys: ["swing_ema_9_15_st_4h"] },
  { key: "bollinger_bands", title: "Bollinger Bands", category: "indicator", definition: "20-period SMA center (MBB) with ±2σ bands. Measures volatility. Squeeze → low vol → breakout expected. Monthly upper BB breakout = investment signal.", linkedStrategyKeys: ["investment_bb_monthly", "investment_mbb"] },
  { key: "supertrend", title: "SuperTrend", category: "indicator", definition: "Trend-following overlay. Parameters (10,3). Green = bullish, Red = bearish. Used as trailing stop-loss and trend confirmation.", linkedStrategyKeys: ["swing_ema_9_15_st_4h", "investment_bb_monthly"] },
  { key: "macd", title: "MACD — Moving Average Convergence Divergence", category: "indicator", definition: "Difference between 12 and 26 EMA, with 9-period signal line. Histogram shows momentum. Positive histogram = bullish momentum.", linkedStrategyKeys: ["swing_trend_continuation"] },
  { key: "adx", title: "ADX — Average Directional Index", category: "indicator", definition: "Measures trend strength (not direction). >20 = trending, >40 = strong trend, <20 = ranging. Used to filter out choppy markets.", linkedStrategyKeys: ["swing_trend_continuation"] },
  { key: "support_resistance", title: "Support & Resistance", category: "pattern", definition: "Support = price zone where demand prevents further decline. Resistance = supply zone capping advance. Previous support becomes resistance after break. Treat as zones, not exact lines.", linkedStrategyKeys: ["swing_breakout", "swing_buying_the_dips"] },
  { key: "fibonacci_retracement", title: "Fibonacci Retracement", category: "pattern", definition: "Key levels: 38.2%, 50%, 61.8%. Used to identify pullback targets in ABC correction. C-wave often terminates near 61.8%.", linkedStrategyKeys: ["swing_abc"] },
  { key: "two_pct_risk", title: "2% Risk Rule", category: "principle", definition: "Never risk more than 2% of total portfolio on a single trade. Formula: quantity = (0.02 × portfolio_size) / (entry_price − stop_loss_price). Non-negotiable capital preservation rule.", linkedStrategyKeys: [] },
  { key: "market_context", title: "Market Context Scoring", category: "principle", definition: "Pre-market assessment using 5 inputs: GIFT Nifty, Dow Futures YM1!, Gold, Crude Oil, FII/DII net flow. Score ≥3 = favorable, <2 = hostile. Determines trade aggression.", linkedStrategyKeys: ["market_context_engine"] },
  { key: "alpha", title: "Alpha", category: "principle", definition: "Excess return of a stock over the benchmark (NIFTY 50). Alpha > 0 over trailing 1Y is minimum quality bar for investment-grade large-cap stock.", linkedStrategyKeys: ["screen_alpha_beta_largecap"] },
  { key: "beta", title: "Beta", category: "principle", definition: "Measure of stock volatility relative to market. Beta 1 = moves with market. Want 0.8–1.5 for large-cap portfolio. Beta > 2 = too volatile for core holdings.", linkedStrategyKeys: ["screen_alpha_beta_largecap"] },
  { key: "fii_dii", title: "FII/DII Flow", category: "principle", definition: "Foreign Institutional Investor and Domestic Institutional Investor net buy/sell data. FII net buy > ₹500 Cr = favorable. FII net sell with DII buy = mixed. Both selling = hostile.", linkedStrategyKeys: ["market_context_engine"] },
  { key: "trailing_stop", title: "Trailing Stop-Loss", category: "rule", definition: "Stop-loss that moves with price. Use SuperTrend as trailing mechanism. Never move stop-loss down (for longs). Lock in profits as trade moves in favor.", linkedStrategyKeys: ["investment_bb_monthly", "swing_trend_continuation"] },
];

export async function seedKnowledge(prisma: PrismaClient) {
  console.log("  📚 Seeding knowledge...");

  for (const s of sessions) {
    const doc = await prisma.knowledgeDocument.upsert({
      where: { key: s.key },
      update: { title: s.title, summary: s.summary, bodyMarkdown: s.bodyMarkdown },
      create: {
        key: s.key,
        title: s.title,
        sourceSession: s.sourceSession,
        summary: s.summary,
        bodyMarkdown: s.bodyMarkdown,
        confidence: s.confidence,
      },
    });

    for (const sec of s.sections) {
      const sectionKey = `${s.key}_${sec.key}`;
      const existing = await prisma.knowledgeSection.findFirst({
        where: { knowledgeDocumentId: doc.id, key: sectionKey },
      });
      if (existing) {
        await prisma.knowledgeSection.update({
          where: { id: existing.id },
          data: { title: sec.title, bodyMarkdown: sec.body, sortOrder: sec.sortOrder },
        });
      } else {
        await prisma.knowledgeSection.create({
          data: {
            knowledgeDocumentId: doc.id,
            key: sectionKey,
            title: sec.title,
            bodyMarkdown: sec.body,
            sortOrder: sec.sortOrder,
          },
        });
      }
    }
  }

  for (const c of concepts) {
    await prisma.knowledgeConcept.upsert({
      where: { key: c.key },
      update: { title: c.title, definition: c.definition },
      create: {
        key: c.key,
        title: c.title,
        category: c.category,
        definition: c.definition,
        linkedStrategyKeys: c.linkedStrategyKeys,
      },
    });
  }
}
