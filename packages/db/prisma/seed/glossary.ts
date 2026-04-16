import type { PrismaClient } from "@prisma/client";

type GlossarySeed = {
  key: string;
  title: string;
  category: "indicator" | "concept" | "strategy_element" | "market_data";
  definition: string;
  linkedStrategyKeys?: string[];
};

const glossary: GlossarySeed[] = [
  { key: "rsi", title: "RSI", category: "indicator", definition: "Relative Strength Index tracks momentum on a 0-100 scale. It is used for trend confirmation and exhaustion context.", linkedStrategyKeys: ["swing_trend_continuation"] },
  { key: "sma", title: "SMA", category: "indicator", definition: "Simple Moving Average smooths prices across fixed lookback windows. It helps identify trend direction and support zones." },
  { key: "ema", title: "EMA", category: "indicator", definition: "Exponential Moving Average weights recent prices more. It reacts faster than SMA for short-term trend shifts." },
  { key: "bollinger_bands", title: "Bollinger Bands", category: "indicator", definition: "Bands around a moving average show volatility expansion and contraction. Breakouts above upper band can signal momentum continuation.", linkedStrategyKeys: ["investment_bb_monthly"] },
  { key: "vwap", title: "VWAP", category: "indicator", definition: "Volume Weighted Average Price marks average traded price weighted by volume. Traders use it for intraday bias and reclaim checks." },
  { key: "super_trend", title: "Super Trend", category: "indicator", definition: "Super Trend is an ATR-based trend-following overlay. It is commonly used for trend direction and trailing stop placement." },
  { key: "divergence", title: "Divergence", category: "concept", definition: "Divergence appears when indicator direction differs from price direction. It can hint at weakening momentum before reversal." },
  { key: "support_resistance", title: "Support/Resistance", category: "concept", definition: "Support and resistance are zones where demand/supply repeatedly react. They are zones, not exact prices." },
  { key: "order_blocks", title: "Order Blocks", category: "strategy_element", definition: "Order blocks represent institutional accumulation/distribution zones. They can align with structure-based entries." },
  { key: "demand_supply_zones", title: "Demand/Supply Zones", category: "strategy_element", definition: "Demand and supply zones are broader liquidity areas around prior imbalances. Entries near these zones require risk controls." },
  { key: "month_end_review", title: "Month-End Review", category: "strategy_element", definition: "Month-end review aligns investment setups to higher timeframe closes. It helps avoid daily noise in portfolio decisions." },
  { key: "scanner_discipline", title: "Scanner Discipline", category: "strategy_element", definition: "Scanner discipline means running the same process repeatedly without overfitting. Consistency matters more than indicator overload." },
  { key: "two_percent_risk_rule", title: "2% Risk Rule", category: "strategy_element", definition: "Cap per-trade risk to around 2% of capital. Position size should be derived from stop distance and risk budget." },
  { key: "three_r_expectation", title: "3R Expectation", category: "strategy_element", definition: "3R expectation targets reward at least three times risk. It helps maintain favorable expectancy over many trades." },
  { key: "alpha", title: "Alpha", category: "market_data", definition: "Alpha measures excess return versus benchmark. Positive alpha indicates outperformance adjusted for baseline index move." },
  { key: "beta", title: "Beta", category: "market_data", definition: "Beta measures sensitivity to benchmark movement. Beta near 1 tracks market-like volatility; higher beta implies amplified moves." },
  { key: "fii_fpi", title: "FII/FPI", category: "market_data", definition: "Foreign investor flow data provides institutional risk appetite context. Persistent net buying/selling often influences broad market tone." },
  { key: "gift_nifty", title: "GIFT Nifty", category: "market_data", definition: "GIFT Nifty gives early indication of expected index open. It is one context input, not a standalone trade signal." },
  { key: "delivery_percentage", title: "Delivery Percentage", category: "market_data", definition: "Delivery percentage shows proportion of traded quantity taken for delivery. Higher delivery can indicate stronger positional participation." },
  { key: "liquidity", title: "Liquidity", category: "market_data", definition: "Liquidity is ease of entering/exiting without major slippage. Thin liquidity increases execution risk and stop-loss noise." },
  { key: "volatility", title: "Volatility", category: "market_data", definition: "Volatility captures magnitude of price fluctuations. Position sizing and stop placement should adapt to volatility regime." },
  { key: "dbr_rbr_rbd_dbd", title: "DBR/RBR/RBD/DBD", category: "strategy_element", definition: "These structure labels classify rally-base/drop transitions. They are used for demand/supply and continuation context mapping." },
  { key: "position_sizing", title: "Position Sizing", category: "strategy_element", definition: "Position sizing translates risk limits into quantity. Correct sizing is core to survival across losing streaks." },
  { key: "stop_loss_hunting", title: "Stop-Loss Hunting", category: "concept", definition: "Stop-loss hunting describes price sweeping obvious stop zones before reversal. Wider structural stops can reduce premature exits." },
  { key: "trailing_stop", title: "Trailing Stop", category: "strategy_element", definition: "Trailing stop moves with price to protect open profit. It balances trend capture with drawdown control." },
  { key: "candle_anatomy", title: "Candle Anatomy", category: "concept", definition: "Candle anatomy includes open/high/low/close, body, and wick behavior. Body and wick relationships signal conviction or rejection." },
  { key: "macd", title: "MACD", category: "indicator", definition: "MACD compares fast and slow EMAs to track momentum phase. Signal cross and histogram slope provide trend context." },
  { key: "atr", title: "ATR", category: "indicator", definition: "Average True Range estimates typical movement range. ATR helps normalize stops and breakout expectations." },
  { key: "adx", title: "ADX", category: "indicator", definition: "Average Directional Index measures trend strength. Rising ADX supports continuation bias in directional systems." },
  { key: "fibonacci_retracement", title: "Fibonacci Retracement", category: "indicator", definition: "Fibonacci retracement levels (23.6/38.2/50/61.8/78.6) mark pullback zones. They are context levels, not guaranteed reversal points." },
];

export async function seedGlossary(prisma: PrismaClient) {
  console.log("  📘 Seeding glossary concepts...");
  for (const item of glossary) {
    await prisma.knowledgeConcept.upsert({
      where: { key: item.key },
      update: {
        title: item.title,
        category: item.category,
        definition: item.definition,
        linkedStrategyKeys: item.linkedStrategyKeys ?? [],
      },
      create: {
        key: item.key,
        title: item.title,
        category: item.category,
        definition: item.definition,
        linkedStrategyKeys: item.linkedStrategyKeys ?? [],
      },
    });
  }
}

