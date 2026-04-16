import { NextResponse } from "next/server";
import { computePositionSize } from "@ibo/strategy-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { portfolioSize, entryPrice, stopLossPrice, riskPct } = body;

    if (typeof portfolioSize !== "number" || portfolioSize <= 0) {
      return NextResponse.json(
        { error: "'portfolioSize' must be a positive number" },
        { status: 400 },
      );
    }

    if (typeof entryPrice !== "number" || entryPrice <= 0) {
      return NextResponse.json(
        { error: "'entryPrice' must be a positive number" },
        { status: 400 },
      );
    }

    if (typeof stopLossPrice !== "number" || stopLossPrice <= 0) {
      return NextResponse.json(
        { error: "'stopLossPrice' must be a positive number" },
        { status: 400 },
      );
    }

    if (riskPct !== undefined && (typeof riskPct !== "number" || riskPct <= 0 || riskPct > 100)) {
      return NextResponse.json(
        { error: "'riskPct' must be a number between 0 and 100 (exclusive)" },
        { status: 400 },
      );
    }

    const result = computePositionSize({
      portfolioSize,
      entryPrice,
      stopLossPrice,
      riskPct,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("POST /api/position-size error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
