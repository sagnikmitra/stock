import { NextResponse } from "next/server";
import { runTradingViewScreener } from "@/lib/tv-screener";
import type { TvScreenerQueryInput, TvScreenerType } from "@/types/tv-screener";

const SCREENER_TYPES: TvScreenerType[] = [
  "stock",
  "crypto",
  "forex",
  "bond",
  "futures",
  "coin",
];

function parseInput(body: unknown): TvScreenerQueryInput {
  const raw = (body ?? {}) as Partial<TvScreenerQueryInput>;
  const screenerType = SCREENER_TYPES.includes(
    raw.screenerType as TvScreenerType,
  )
    ? (raw.screenerType as TvScreenerType)
    : "stock";

  return {
    screenerType,
    market: typeof raw.market === "string" ? raw.market : "INDIA",
    index: typeof raw.index === "string" ? raw.index : undefined,
    search: typeof raw.search === "string" ? raw.search : undefined,
    fields: Array.isArray(raw.fields) ? raw.fields : [],
    selectAll: Boolean(raw.selectAll),
    filters: Array.isArray(raw.filters) ? raw.filters : [],
    sortField: typeof raw.sortField === "string" ? raw.sortField : undefined,
    sortOrder: raw.sortOrder === "asc" ? "asc" : "desc",
    limit: typeof raw.limit === "number" ? raw.limit : 100,
    offset: typeof raw.offset === "number" ? raw.offset : 0,
    dryRun: Boolean(raw.dryRun),
  };
}

export async function POST(req: Request) {
  try {
    const input = parseInput(await req.json());
    const result = await runTradingViewScreener(input);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("POST /api/tv-screener/query error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "TradingView screener request failed",
      },
      { status: 502 },
    );
  }
}
