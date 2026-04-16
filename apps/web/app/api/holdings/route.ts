import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    holdings: [],
    message: "Holdings upload coming soon",
  });
}

export async function POST() {
  return NextResponse.json(
    { error: "Not Implemented", message: "Holdings upload API coming soon" },
    { status: 501 },
  );
}

