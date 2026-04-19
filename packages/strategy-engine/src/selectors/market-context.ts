import type {
  GlobalContext,
  MarketContextFactorBreakdown,
  MarketPosture,
} from "@ibo/types";

export interface ScoreMarketContextInput {
  date: string;
  giftNiftyChangePct?: number;
  dowIndexChangePct?: number;
  dowFuturesChangePct?: number;
  goldChangePct?: number;
  crudeChangePct?: number;
  fiiNetCashCr?: number;
  diiNetCashCr?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function summarizeDirection(value: number): "favorable" | "neutral" | "hostile" {
  if (value >= 0.3) return "favorable";
  if (value <= -0.3) return "hostile";
  return "neutral";
}

function summarizeInverseDirection(value: number): "favorable" | "neutral" | "hostile" {
  if (value <= -0.3) return "favorable";
  if (value >= 0.3) return "hostile";
  return "neutral";
}

function summarizeFiiFlow(value: number): "favorable" | "neutral" | "hostile" {
  if (value >= 1500) return "favorable";
  if (value <= -1500) return "hostile";
  return "neutral";
}

function summarizeDiiFlow(value: number): "favorable" | "neutral" | "hostile" {
  if (value >= 1500) return "favorable";
  if (value <= -1500) return "hostile";
  return "neutral";
}

function contributionForStatus(status: "favorable" | "neutral" | "hostile" | "missing") {
  if (status === "favorable") return 1;
  if (status === "hostile") return -1;
  return 0;
}

function buildFactor(
  key: MarketContextFactorBreakdown["key"],
  label: string,
  value: number | undefined,
  resolver: (v: number) => "favorable" | "neutral" | "hostile",
  reasonBuilder: (status: "favorable" | "neutral" | "hostile" | "missing", value: number | null) => string,
): MarketContextFactorBreakdown {
  if (value === undefined || Number.isNaN(value)) {
    return {
      key,
      label,
      value: null,
      status: "missing",
      contribution: 0,
      reason: reasonBuilder("missing", null),
    };
  }

  const status = resolver(value);
  return {
    key,
    label,
    value,
    status,
    contribution: contributionForStatus(status),
    reason: reasonBuilder(status, value),
  };
}

function postureFromScore(score: number): MarketPosture {
  if (score >= 3.4) return "favorable";
  if (score <= 1.6) return "hostile";
  return "mixed";
}

export function scoreMarketContext(input: ScoreMarketContextInput): GlobalContext {
  const breakdown: MarketContextFactorBreakdown[] = [
    buildFactor(
      "gift_nifty",
      "GIFT Nifty",
      input.giftNiftyChangePct,
      summarizeDirection,
      (status, value) => {
        if (status === "missing") return "Missing GIFT Nifty change; treated as neutral.";
        return `GIFT Nifty ${value! >= 0 ? "up" : "down"} ${Math.abs(value!).toFixed(2)}%.`;
      },
    ),
    buildFactor(
      "dow_futures",
      "Dow Futures",
      input.dowFuturesChangePct ?? input.dowIndexChangePct,
      summarizeDirection,
      (status, value) => {
        if (status === "missing") return "Missing Dow Futures/Index change; treated as neutral.";
        return `Dow reference ${value! >= 0 ? "up" : "down"} ${Math.abs(value!).toFixed(2)}%.`;
      },
    ),
    buildFactor(
      "gold",
      "Gold",
      input.goldChangePct,
      summarizeInverseDirection,
      (status, value) => {
        if (status === "missing") return "Missing gold cue; treated as neutral.";
        return `Gold ${value! >= 0 ? "up" : "down"} ${Math.abs(value!).toFixed(2)}% (inverse risk cue).`;
      },
    ),
    buildFactor(
      "crude",
      "Crude Oil",
      input.crudeChangePct,
      summarizeInverseDirection,
      (status, value) => {
        if (status === "missing") return "Missing crude cue; treated as neutral.";
        return `Crude ${value! >= 0 ? "up" : "down"} ${Math.abs(value!).toFixed(2)}% (inverse risk cue).`;
      },
    ),
    buildFactor(
      "fii_flow",
      "FII Cash Flow",
      input.fiiNetCashCr,
      summarizeFiiFlow,
      (status, value) => {
        if (status === "missing") return "Missing FII cash flow; treated as neutral.";
        return `FII net cash ${value! >= 0 ? "buying" : "selling"} ₹${Math.abs(value!).toLocaleString("en-IN")} Cr.`;
      },
    ),
    buildFactor(
      "dii_flow",
      "DII Cash Flow",
      input.diiNetCashCr,
      summarizeDiiFlow,
      (status, value) => {
        if (status === "missing") return "Missing DII cash flow; treated as neutral.";
        return `DII net cash ${value! >= 0 ? "buying" : "selling"} ₹${Math.abs(value!).toLocaleString("en-IN")} Cr.`;
      },
    ),
  ];

  // drr-screener rule: FII negative + DII positive => resilience override.
  // Adds a synthetic favorable factor so posture doesn't go hostile on a pure FII sell when domestic absorbs.
  const fiiNeg = typeof input.fiiNetCashCr === "number" && input.fiiNetCashCr <= -1500;
  const diiPos = typeof input.diiNetCashCr === "number" && input.diiNetCashCr >= 1500;
  if (fiiNeg && diiPos) {
    breakdown.push({
      key: "resilience_override",
      label: "FII−/DII+ resilience",
      value: (input.diiNetCashCr ?? 0) + (input.fiiNetCashCr ?? 0),
      status: "favorable",
      contribution: 1,
      reason: `FII selling ₹${Math.abs(input.fiiNetCashCr!).toLocaleString("en-IN")} Cr absorbed by DII buying ₹${(input.diiNetCashCr!).toLocaleString("en-IN")} Cr — domestic resilience override applied.`,
    });
  }

  const raw = breakdown.reduce((acc, factor) => acc + factor.contribution, 0);
  const score = Number(clamp(2.5 + raw / 2, 0, 5).toFixed(2));
  const posture = postureFromScore(score);

  const favorableCount = breakdown.filter((b) => b.status === "favorable").length;
  const hostileCount = breakdown.filter((b) => b.status === "hostile").length;
  const missingCount = breakdown.filter((b) => b.status === "missing").length;

  const narrative = [
    `Posture ${posture.toUpperCase()} with score ${score}/5 from ${breakdown.length} context factors.`,
    `${favorableCount} favorable, ${hostileCount} hostile, ${missingCount} missing.`,
    missingCount > 0
      ? "Degraded mode active: missing factors are neutralized, not guessed."
      : "All configured factors available.",
  ].join(" ");

  return {
    date: input.date,
    giftNiftyChange: input.giftNiftyChangePct,
    dowIndexChange: input.dowIndexChangePct,
    dowFuturesChange: input.dowFuturesChangePct,
    goldChange: input.goldChangePct,
    crudeChange: input.crudeChangePct,
    posture,
    score,
    narrative,
    breakdown,
  };
}
