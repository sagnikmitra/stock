import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import type { Prisma } from "@ibo/db";
import { getAdapter } from "../../../../../worker/src/adapters";

type Action = "sync" | "healthcheck";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const providerKey = String(body.providerKey ?? "");
  const action = String(body.action ?? "") as Action;

  if (!providerKey || (action !== "sync" && action !== "healthcheck")) {
    return NextResponse.json(
      { error: "providerKey and action(sync|healthcheck) required" },
      { status: 400 },
    );
  }

  const provider = await prisma.provider.findUnique({ where: { key: providerKey } });
  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const adapter = getAdapter(providerKey);
  if (!adapter) {
    return NextResponse.json({ error: `No adapter registered for providerKey=${providerKey}` }, { status: 400 });
  }

  const job = await prisma.providerJobRun.create({
    data: {
      providerId: provider.id,
      jobKey: `manual_${action}`,
      startedAt: new Date(),
      status: "running",
    },
  });

  try {
    let detailJson: Record<string, unknown> = {};

    if (action === "healthcheck") {
      const health = await adapter.healthcheck();
      detailJson = { action, health };
    } else {
      // Keep manual sync lightweight: pull live quotes for active symbols as sync touchpoint.
      const symbols = (
        await prisma.instrument.findMany({
          where: { isActive: true },
          select: { symbol: true },
          take: 100,
        })
      ).map((item) => item.symbol);

      const quotes = symbols.length > 0 ? await adapter.getQuotes(symbols) : [];
      detailJson = {
        action,
        requestedSymbols: symbols.length,
        receivedQuotes: quotes.length,
        ts: new Date().toISOString(),
      };
    }

    await prisma.providerJobRun.update({
      where: { id: job.id },
      data: {
        status: "completed",
        finishedAt: new Date(),
        detailJson: detailJson as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      data: {
        providerKey,
        action,
        status: "completed",
        providerJobRunId: job.id,
        detail: detailJson,
      },
    });
  } catch (error) {
    await prisma.providerJobRun.update({
      where: { id: job.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        detailJson: {
          action,
          error: error instanceof Error ? error.message : "Unknown sync error",
        },
      },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Provider sync failed" },
      { status: 500 },
    );
  }
}
