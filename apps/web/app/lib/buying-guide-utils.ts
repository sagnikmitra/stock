import type {
  BuyingGuide,
  BuyingGuideBasket,
  BuyingGuideStock,
  PriceRange,
  TradeStatus,
} from "@/types/buying-guide";

export function getTradeStatus(stock: BuyingGuideStock): TradeStatus {
  const price = stock.latest_price;
  const [buyLow, buyHigh] = stock.limit_buy_zone;
  const sl = stock.stop_loss?.hard_sl;
  const breakout = stock.breakout_entry_above;
  const avoidAbove = stock.avoid_chasing_above;

  if (sl && price < sl) return "Invalidated";
  if (price >= buyLow && price <= buyHigh) return "Near Buy Zone";
  if (avoidAbove && price > avoidAbove) return "Do Not Chase";
  if (breakout && price >= breakout) return "Breakout Watch";
  if (price < buyLow) return "Below Buy Zone";
  return "Wait";
}

export function getDistanceFromBuyZone(stock: BuyingGuideStock): number {
  const price = stock.latest_price;
  const [low, high] = stock.limit_buy_zone;

  if (price >= low && price <= high) return 0;
  if (price < low) return ((low - price) / price) * 100;
  return ((price - high) / high) * 100;
}

export function getEntryReference(stock: BuyingGuideStock): number {
  return stock.risk_reward_from_mid_entry?.mid_entry ?? midpoint(stock.limit_buy_zone);
}

export function getRiskPerShare(stock: BuyingGuideStock, entry = getEntryReference(stock)): number {
  const hardSl = stock.stop_loss?.hard_sl;
  if (!hardSl) return 0;
  return Math.max(0, entry - hardSl);
}

export function getRewardToRisk(stock: BuyingGuideStock, target?: number): number {
  if (!target) return 0;
  const entry = getEntryReference(stock);
  const risk = getRiskPerShare(stock, entry);
  if (risk <= 0) return 0;
  return (target - entry) / risk;
}

export function getSetupScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (score >= 70) return "text-cyan-800 bg-cyan-50 border-cyan-200";
  if (score >= 60) return "text-amber-800 bg-amber-50 border-amber-200";
  return "text-rose-800 bg-rose-50 border-rose-200";
}

export function getRiskGradeColor(riskGrade: string): string {
  const normalized = riskGrade.toLowerCase();
  if (normalized.includes("low") && !normalized.includes("high")) {
    return "text-emerald-800 bg-emerald-50 border-emerald-200";
  }
  if (normalized.includes("high") || normalized.includes("event")) {
    return "text-rose-800 bg-rose-50 border-rose-200";
  }
  if (normalized.includes("medium")) {
    return "text-amber-800 bg-amber-50 border-amber-200";
  }
  return "text-slate-700 bg-slate-50 border-slate-200";
}

export function getStatusColor(status: TradeStatus | string): string {
  switch (status) {
    case "Near Buy Zone":
      return "text-emerald-800 bg-emerald-50 border-emerald-200";
    case "Breakout Watch":
      return "text-cyan-800 bg-cyan-50 border-cyan-200";
    case "Do Not Chase":
    case "Invalidated":
      return "text-rose-800 bg-rose-50 border-rose-200";
    case "Below Buy Zone":
      return "text-blue-800 bg-blue-50 border-blue-200";
    default:
      return "text-slate-700 bg-slate-50 border-slate-200";
  }
}

export function getVerdictLabel(verdict: string): string {
  return verdict
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getBasketMembership(symbol: string, guide: BuyingGuide): string[] {
  const baskets: Array<[string, BuyingGuideBasket | undefined]> = [
    ["Best Trades", guide.highest_conviction_basket],
    ["Defensive", guide.defensive_basket],
    ["Conditional", guide.conditional_basket],
  ];

  return baskets.flatMap(([label, basket]) => (basket?.stocks.includes(symbol) ? [label] : []));
}

export function getStocksBySymbols(guide: BuyingGuide, symbols?: string[]): BuyingGuideStock[] {
  const watchlist = guide.final_watchlist ?? [];
  if (!symbols?.length) return [];
  const lookup = new Map(watchlist.map((stock) => [stock.symbol, stock]));
  return symbols.map((symbol) => lookup.get(symbol)).filter(Boolean) as BuyingGuideStock[];
}

export function getRiskRewardQuality(value: number): string {
  if (value >= 2.5) return "text-emerald-800 bg-emerald-50 border-emerald-200";
  if (value >= 1.5) return "text-cyan-800 bg-cyan-50 border-cyan-200";
  if (value >= 1) return "text-amber-800 bg-amber-50 border-amber-200";
  return "text-rose-800 bg-rose-50 border-rose-200";
}

export function formatCurrencyINR(value?: number, compact = false): string {
  if (value === undefined || Number.isNaN(value)) return "n/a";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value >= 1000 || compact ? 0 : 2,
  }).format(value);
}

export function formatNumberIN(value?: number, digits = 2): string {
  if (value === undefined || Number.isNaN(value)) return "n/a";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatRange(range?: PriceRange, currency = true): string {
  if (!range) return "n/a";
  const [low, high] = range;
  if (currency) return `${formatCurrencyINR(low)}-${formatCurrencyINR(high)}`;
  return `${formatNumberIN(low, 0)}-${formatNumberIN(high, 0)}`;
}

export function normalizeLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function getMarketMode(bias?: string, score?: number): string {
  const normalized = bias?.replaceAll("_", " ").toLowerCase() ?? "";
  if (normalized.includes("no fresh") || (score !== undefined && score < 30)) return "No Fresh Longs";
  if (normalized.includes("defensive") || (score !== undefined && score < 40)) return "Defensive";
  if (normalized.includes("selective") || (score !== undefined && score < 55)) return "Selective Long Only";
  return "Aggressive";
}

export function getRiskSeverity(risk: string, impact: string): "High" | "Medium" | "Watch" {
  const text = `${risk} ${impact}`.toLowerCase();
  if (text.includes("shock") || text.includes("breakdown") || text.includes("sharp") || text.includes("high")) {
    return "High";
  }
  if (text.includes("avoid") || text.includes("negative") || text.includes("risk")) return "Medium";
  return "Watch";
}

export function getAvoidAction(reason: string): string {
  const normalized = reason.toLowerCase();
  if (normalized.includes("reversal")) return "Wait for reversal";
  if (normalized.includes("reclaim")) return "Needs reclaim";
  if (normalized.includes("volatile") || normalized.includes("slippage")) return "Too volatile";
  if (normalized.includes("result") || normalized.includes("event")) return "Event risk";
  return "Avoid fresh longs";
}

export function midpoint([low, high]: PriceRange): number {
  return (low + high) / 2;
}
