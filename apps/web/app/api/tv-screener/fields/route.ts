import { NextResponse } from "next/server";
import { getTvScreenerFieldData, searchTvFields } from "@/lib/tv-screener";
import type { TvScreenerType } from "@/types/tv-screener";

export const revalidate = 3600;

const SCREENER_TYPES: TvScreenerType[] = [
  "stock",
  "crypto",
  "forex",
  "bond",
  "futures",
  "coin",
];

function parseType(value: string | null): TvScreenerType {
  return SCREENER_TYPES.includes(value as TvScreenerType)
    ? (value as TvScreenerType)
    : "stock";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = parseType(searchParams.get("type"));
  const query = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? 160);
  const data = getTvScreenerFieldData();
  const result = searchTvFields({
    type,
    query,
    category,
    limit: Number.isFinite(limit) ? limit : 160,
  });

  return NextResponse.json({
    data: {
      screenerType: type,
      screener: {
        ...data.screeners[type],
        fields: undefined,
        fieldCount: data.screeners[type].fields.length,
      },
      fields: result.fields,
      total: result.total,
      screeners: Object.entries(data.screeners).map(([key, config]) => ({
        key,
        name: config.name,
        fieldClass: config.fieldClass,
        fieldCount: config.fields.length,
        hasIndex: Boolean(config.hasIndex),
        hasMarket: Boolean(config.hasMarket),
      })),
      operators: data.operators,
      indices: data.indices,
      markets: data.markets,
      sectors: data.sectors ?? [],
      categories: data.categories,
      timeIntervals: data.timeIntervals,
    },
  });
}
