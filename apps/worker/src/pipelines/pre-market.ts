import { prisma } from "@ibo/db";
import { scoreMarketContext } from "@ibo/strategy-engine";
import { getAdapter } from "../adapters";

/**
 * Pre-market pipeline.
 * Schedule: 8:30 AM IST (03:00 UTC)
 *
 * 1. Fetch GIFT Nifty gap, Dow Futures, Gold, Crude from provider
 * 2. Fetch yesterday's FII/DII from NSE
 * 3. Score market context via strategy-engine
 * 4. Store GlobalContextSnapshot + FiiDiiSnapshot
 * 5. Check watchlist items near key levels
 * 6. Generate pre-market Digest with sections
 * 7. Log ProviderJobRun for audit
 */
export async function runPreMarketPipeline() {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const marketDate = new Date(`${dateStr}T00:00:00.000Z`);
  console.log(`[pre-market] Running pipeline for ${dateStr}`);

  const adapter = getAdapter("nse_official") ?? getAdapter("twelvedata");
  const providerKey = adapter ? (adapter as { key?: string }).key ?? "unknown" : "unknown";

  // Track provider job for audit
  let providerJobRunId: string | undefined;
  const provider = await prisma.provider.findUnique({ where: { key: providerKey } }).catch(() => null);

  if (provider) {
    const job = await prisma.providerJobRun.create({
      data: {
        providerId: provider.id,
        jobKey: "pre_market_pipeline",
        startedAt: new Date(),
        status: "running",
      },
    });
    providerJobRunId = job.id;
  }

  let jobStatus: "completed" | "partial" | "failed" = "completed";
  const warnings: string[] = [];

  // -------------------------------------------------------------------------
  // Step 1: Fetch global cues
  // -------------------------------------------------------------------------
  let giftNiftyChangePct: number | undefined;
  let dowFuturesChangePct: number | undefined;
  let goldChangePct: number | undefined;
  let crudeChangePct: number | undefined;

  if (adapter) {
    try {
      // Fetch quotes for global index/commodity proxies.
      // GIFT_NIFTY, DOWFUT, GOLD, CRUDE are symbolic — the adapter's getQuotes
      // resolves them to real ticker codes (e.g., NIFTY_GIF on NSE, ^DJI on TD).
      // Each QuoteSnapshot carries changePct from the provider.
      const quotes = await adapter.getQuotes(["GIFT_NIFTY", "DOWFUT", "GOLD", "CRUDE"]).catch(() => []);

      for (const q of quotes) {
        const pct = q.changePct;
        if (pct === undefined) continue;

        switch (q.symbol) {
          case "GIFT_NIFTY":
            giftNiftyChangePct = pct;
            break;
          case "DOWFUT":
            dowFuturesChangePct = pct;
            break;
          case "GOLD":
            goldChangePct = pct;
            break;
          case "CRUDE":
            crudeChangePct = pct;
            break;
        }
      }

      // If quotes didn't return change data, try computing from recent index series
      if (giftNiftyChangePct === undefined && adapter.supports.indices) {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const series = await adapter.getIndexSeries({
          symbol: "NIFTY 50",
          from: weekAgo.toISOString().split("T")[0],
          to: dateStr,
        }).catch(() => null);

        if (series && series.candles.length >= 2) {
          const last = series.candles[series.candles.length - 1];
          const prev = series.candles[series.candles.length - 2];
          giftNiftyChangePct = ((last.close - prev.close) / prev.close) * 100;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error fetching global cues";
      console.warn(`[pre-market] Global cues fetch failed: ${msg}`);
      warnings.push(`Global cues unavailable: ${msg}`);
      jobStatus = "partial";
    }
  } else {
    warnings.push("No data adapter available. Using placeholder values.");
    jobStatus = "partial";
  }

  // -------------------------------------------------------------------------
  // Step 2: Fetch FII/DII data
  // -------------------------------------------------------------------------
  let fiiCashNet: number | undefined;
  let diiCashNet: number | undefined;

  if (adapter) {
    try {
      const flows = await adapter.getFiiDiiFlows(dateStr);
      if (Array.isArray(flows) && flows.length > 0) {
        fiiCashNet = flows[0].fiiCashNet;
        diiCashNet = flows[0].diiCashNet;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error fetching FII/DII";
      console.warn(`[pre-market] FII/DII fetch failed: ${msg}`);
      warnings.push(`FII/DII data unavailable: ${msg}`);
      jobStatus = "partial";
    }
  }

  // -------------------------------------------------------------------------
  // Step 3: Score market context
  // -------------------------------------------------------------------------
  const context = scoreMarketContext({
    date: dateStr,
    giftNiftyChangePct,
    dowFuturesChangePct,
    goldChangePct,
    crudeChangePct,
    fiiNetCashCr: fiiCashNet,
  });

  console.log(`[pre-market] Context scored: ${context.posture} (${context.score}/5)`);

  // -------------------------------------------------------------------------
  // Step 4: Save GlobalContextSnapshot
  // -------------------------------------------------------------------------
  await prisma.globalContextSnapshot.upsert({
    where: { date: marketDate },
    create: {
      date: marketDate,
      giftNiftyChange: giftNiftyChangePct ?? null,
      dowFuturesChange: dowFuturesChangePct ?? null,
      goldChange: goldChangePct ?? null,
      crudeChange: crudeChangePct ?? null,
      marketPosture: context.posture,
      postureScore: context.score,
      narrative: context.narrative,
    },
    update: {
      giftNiftyChange: giftNiftyChangePct ?? null,
      dowFuturesChange: dowFuturesChangePct ?? null,
      goldChange: goldChangePct ?? null,
      crudeChange: crudeChangePct ?? null,
      marketPosture: context.posture,
      postureScore: context.score,
      narrative: context.narrative,
    },
  });

  // -------------------------------------------------------------------------
  // Step 5: Save FiiDiiSnapshot
  // -------------------------------------------------------------------------
  await prisma.fiiDiiSnapshot.upsert({
    where: { date: marketDate },
    create: {
      date: marketDate,
      fiiCashNet: fiiCashNet ?? null,
      diiCashNet: diiCashNet ?? null,
      narrative: buildFiiDiiNarrative(fiiCashNet, diiCashNet),
    },
    update: {
      fiiCashNet: fiiCashNet ?? null,
      diiCashNet: diiCashNet ?? null,
      narrative: buildFiiDiiNarrative(fiiCashNet, diiCashNet),
    },
  });

  // -------------------------------------------------------------------------
  // Step 6: Check watchlist items near key levels
  // -------------------------------------------------------------------------
  let watchlistAlerts = "No watchlist alerts available.";
  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
      where: { isActive: true },
      include: {
        instrument: true,
      },
    });

    if (watchlistItems.length > 0) {
      const alertLines: string[] = [];

      for (const item of watchlistItems) {
        // Fetch latest indicator snapshot for this instrument
        const latestIndicator = await prisma.indicatorSnapshot.findFirst({
          where: { instrumentId: item.instrumentId, timeframe: "D1" },
          orderBy: { ts: "desc" },
        });

        if (!latestIndicator) continue;

        const close = latestIndicator.bbMiddle
          ? Number(latestIndicator.bbMiddle)
          : undefined;
        const bbUpper = latestIndicator.bbUpper
          ? Number(latestIndicator.bbUpper)
          : undefined;
        const bbLower = latestIndicator.bbLower
          ? Number(latestIndicator.bbLower)
          : undefined;
        const sma44 = latestIndicator.sma44
          ? Number(latestIndicator.sma44)
          : undefined;
        const sma200 = latestIndicator.sma200
          ? Number(latestIndicator.sma200)
          : undefined;

        // Check proximity to key levels (within 2%)
        const symbol = item.instrument.symbol;
        const alerts: string[] = [];

        if (close && bbUpper && close >= bbUpper * 0.98) {
          alerts.push("near/above upper BB");
        }
        if (close && bbLower && close <= bbLower * 1.02) {
          alerts.push("near/below lower BB");
        }
        if (close && sma44 && Math.abs(close - sma44) / sma44 < 0.02) {
          alerts.push("at 44 SMA");
        }
        if (close && sma200 && Math.abs(close - sma200) / sma200 < 0.02) {
          alerts.push("at 200 SMA");
        }

        if (alerts.length > 0) {
          alertLines.push(`- **${symbol}**: ${alerts.join(", ")}`);
        }
      }

      if (alertLines.length > 0) {
        watchlistAlerts = alertLines.join("\n");
      } else {
        watchlistAlerts = "No watchlist items near key levels today.";
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.warn(`[pre-market] Watchlist alert check failed: ${msg}`);
    watchlistAlerts = `Watchlist check unavailable: ${msg}`;
  }

  // -------------------------------------------------------------------------
  // Step 7: Generate pre-market Digest
  // -------------------------------------------------------------------------
  const digestTitle = `Pre-Market Digest — ${dateStr}`;
  const digestSummary = buildDigestSummary(context, fiiCashNet, diiCashNet, warnings);

  const digest = await prisma.digest.upsert({
    where: {
      digestType_marketDate: {
        digestType: "pre_market",
        marketDate,
      },
    },
    create: {
      digestType: "pre_market",
      marketDate,
      title: digestTitle,
      summary: digestSummary,
      posture: context.posture,
      metricsJson: {
        score: context.score,
        giftNiftyChangePct,
        dowFuturesChangePct,
        goldChangePct,
        crudeChangePct,
        fiiCashNet,
        diiCashNet,
      },
      sections: {
        create: [
          {
            key: "global_cues",
            title: "Global Cues",
            bodyMarkdown: buildGlobalCuesSection(
              giftNiftyChangePct,
              dowFuturesChangePct,
              goldChangePct,
              crudeChangePct,
              warnings,
            ),
            sortOrder: 1,
          },
          {
            key: "fii_dii",
            title: "FII/DII Flows",
            bodyMarkdown: buildFiiDiiSection(fiiCashNet, diiCashNet, warnings),
            sortOrder: 2,
          },
          {
            key: "market_posture",
            title: "Market Posture",
            bodyMarkdown: buildPostureSection(context),
            sortOrder: 3,
          },
          {
            key: "watchlist_alerts",
            title: "Watchlist Alerts",
            bodyMarkdown: watchlistAlerts,
            sortOrder: 4,
          },
        ],
      },
    },
    update: {
      title: digestTitle,
      summary: digestSummary,
      posture: context.posture,
      metricsJson: {
        score: context.score,
        giftNiftyChangePct,
        dowFuturesChangePct,
        goldChangePct,
        crudeChangePct,
        fiiCashNet,
        diiCashNet,
      },
    },
  });

  // If updating, replace sections
  const existingDigest = await prisma.digest.findUnique({
    where: {
      digestType_marketDate: { digestType: "pre_market", marketDate },
    },
    include: { sections: true },
  });
  if (existingDigest && existingDigest.sections.length > 0) {
    // Digest was updated — refresh sections via delete + create
    await prisma.digestSection.deleteMany({ where: { digestId: existingDigest.id } });
    await prisma.digestSection.createMany({
      data: [
        {
          digestId: existingDigest.id,
          key: "global_cues",
          title: "Global Cues",
          bodyMarkdown: buildGlobalCuesSection(
            giftNiftyChangePct,
            dowFuturesChangePct,
            goldChangePct,
            crudeChangePct,
            warnings,
          ),
          sortOrder: 1,
        },
        {
          digestId: existingDigest.id,
          key: "fii_dii",
          title: "FII/DII Flows",
          bodyMarkdown: buildFiiDiiSection(fiiCashNet, diiCashNet, warnings),
          sortOrder: 2,
        },
        {
          digestId: existingDigest.id,
          key: "market_posture",
          title: "Market Posture",
          bodyMarkdown: buildPostureSection(context),
          sortOrder: 3,
        },
        {
          digestId: existingDigest.id,
          key: "watchlist_alerts",
          title: "Watchlist Alerts",
          bodyMarkdown: watchlistAlerts,
          sortOrder: 4,
        },
      ],
    });
  }

  console.log(`[pre-market] Digest saved: ${digest.id}`);

  // -------------------------------------------------------------------------
  // Step 8: Log ProviderJobRun for audit
  // -------------------------------------------------------------------------
  if (providerJobRunId) {
    await prisma.providerJobRun.update({
      where: { id: providerJobRunId },
      data: {
        finishedAt: new Date(),
        status: jobStatus,
        detailJson: {
          dateStr,
          posture: context.posture,
          score: context.score,
          warnings,
          digestId: digest.id,
        },
      },
    });
  }

  console.log(`[pre-market] Pipeline complete. Status: ${jobStatus}`);
  if (warnings.length > 0) {
    console.warn(`[pre-market] Warnings:\n  ${warnings.join("\n  ")}`);
  }

  return context;
}

// =============================================================================
// Helper functions
// =============================================================================

function formatPct(val: number | undefined): string {
  if (val === undefined) return "N/A";
  const sign = val >= 0 ? "+" : "";
  return `${sign}${val.toFixed(2)}%`;
}

function formatCr(val: number | undefined): string {
  if (val === undefined) return "N/A";
  const sign = val >= 0 ? "+" : "";
  return `${sign}${val.toLocaleString("en-IN")} Cr`;
}

function buildGlobalCuesSection(
  gift?: number,
  dow?: number,
  gold?: number,
  crude?: number,
  warnings: string[] = [],
): string {
  const dataAvailable = gift !== undefined || dow !== undefined || gold !== undefined || crude !== undefined;

  if (!dataAvailable) {
    const reason = warnings.find((w) => w.includes("Global cues")) ?? "Data provider returned no data.";
    return `> **Warning**: ${reason}\n\nGlobal cue data is not available for this session. Pipeline will use neutral assumptions.`;
  }

  const lines = [
    `| Indicator | Change | Signal |`,
    `|-----------|--------|--------|`,
    `| GIFT Nifty | ${formatPct(gift)} | ${gift !== undefined ? (gift > 0.3 ? "Favorable gap-up" : gift < -0.3 ? "Negative gap-down" : "Neutral") : "N/A"} |`,
    `| Dow Futures | ${formatPct(dow)} | ${dow !== undefined ? (dow > 0 ? "Positive" : "Negative") : "N/A"} |`,
    `| Gold | ${formatPct(gold)} | ${gold !== undefined ? (gold < 1.0 ? "Stable (no fear)" : "Risk-off signal") : "N/A"} |`,
    `| Crude | ${formatPct(crude)} | ${crude !== undefined ? (crude < 2.0 ? "Stable" : "Inflationary pressure") : "N/A"} |`,
  ];

  return lines.join("\n");
}

function buildFiiDiiSection(fiiNet?: number, diiNet?: number, warnings: string[] = []): string {
  if (fiiNet === undefined && diiNet === undefined) {
    const reason = warnings.find((w) => w.includes("FII/DII")) ?? "Data not available.";
    return `> **Warning**: ${reason}\n\nFII/DII flow data is not available for this session.`;
  }

  const fiiLabel = fiiNet !== undefined ? (fiiNet >= 0 ? "Net Buyer" : "Net Seller") : "Unknown";
  const diiLabel = diiNet !== undefined ? (diiNet >= 0 ? "Net Buyer" : "Net Seller") : "Unknown";

  const lines = [
    `| Participant | Net Flow | Stance |`,
    `|-------------|----------|--------|`,
    `| FII/FPI | ${formatCr(fiiNet)} | ${fiiLabel} |`,
    `| DII | ${formatCr(diiNet)} | ${diiLabel} |`,
  ];

  if (fiiNet !== undefined && diiNet !== undefined) {
    const totalFlow = fiiNet + diiNet;
    lines.push("", `**Combined flow**: ${formatCr(totalFlow)}`);

    if (fiiNet < -500 && diiNet > 500) {
      lines.push("\n*Pattern: DII absorbing FII selling — watch for support holding.*");
    } else if (fiiNet > 500 && diiNet > 0) {
      lines.push("\n*Pattern: Both buying — strong inflow day.*");
    } else if (fiiNet < -500 && diiNet < 0) {
      lines.push("\n*Pattern: Both selling — risk-off environment.*");
    }
  }

  return lines.join("\n");
}

function buildPostureSection(context: {
  posture: string;
  score: number;
  narrative: string;
}): string {
  const emoji =
    context.posture === "favorable"
      ? "GREEN"
      : context.posture === "hostile"
        ? "RED"
        : "AMBER";

  const lines = [
    `**Status**: ${emoji} — ${context.posture.toUpperCase()}`,
    `**Score**: ${context.score}/5`,
    "",
    "### Factor Breakdown",
    "",
    context.narrative,
    "",
    "### Implications",
    "",
  ];

  if (context.posture === "favorable") {
    lines.push(
      "- Swing setups can be acted upon with normal position sizing.",
      "- Fresh entries on breakout strategies are valid.",
    );
  } else if (context.posture === "mixed") {
    lines.push(
      "- Reduce position size to 50-75% of normal.",
      "- Prefer only high-confluence setups (confluence score >= 0.7).",
      "- Avoid aggressive breakout entries; wait for confirmation closes.",
    );
  } else {
    lines.push(
      "- Avoid new entries. Capital preservation mode.",
      "- Only act on month-end investment strategies if BB monthly signals present.",
      "- Review existing positions for stop-loss tightening.",
    );
  }

  return lines.join("\n");
}

function buildFiiDiiNarrative(fiiNet?: number, diiNet?: number): string {
  if (fiiNet === undefined && diiNet === undefined) {
    return "FII/DII data not available.";
  }

  const parts: string[] = [];
  if (fiiNet !== undefined) {
    parts.push(`FII ${fiiNet >= 0 ? "bought" : "sold"} ${formatCr(Math.abs(fiiNet))} net`);
  }
  if (diiNet !== undefined) {
    parts.push(`DII ${diiNet >= 0 ? "bought" : "sold"} ${formatCr(Math.abs(diiNet))} net`);
  }
  return parts.join(". ") + ".";
}

function buildDigestSummary(
  context: { posture: string; score: number },
  fiiNet?: number,
  diiNet?: number,
  warnings: string[] = [],
): string {
  const parts = [
    `Market posture: ${context.posture.toUpperCase()} (${context.score}/5).`,
  ];

  if (fiiNet !== undefined) {
    parts.push(`FII: ${formatCr(fiiNet)}.`);
  }
  if (diiNet !== undefined) {
    parts.push(`DII: ${formatCr(diiNet)}.`);
  }
  if (warnings.length > 0) {
    parts.push(`${warnings.length} data warning(s).`);
  }

  return parts.join(" ");
}
