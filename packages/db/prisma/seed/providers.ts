import type { PrismaClient } from "@prisma/client";

export async function seedProviders(prisma: PrismaClient) {
  console.log("  🔌 Seeding providers...");

  const providers = [
    {
      key: "nse_official",
      name: "NSE Official Reports",
      type: "official_exchange_reports" as const,
      baseUrl: "https://www.nseindia.com",
      isEnabled: true,
    },
    {
      key: "indian_stock_market_api",
      name: "Indian Stock Market API (0xramm)",
      type: "market_data_vendor" as const,
      baseUrl: "https://nse-api-ruby.vercel.app",
      isEnabled: true,
    },
    {
      key: "kite",
      name: "Zerodha Kite Connect",
      type: "broker_api" as const,
      baseUrl: "https://api.kite.trade",
      isEnabled: false,
    },
    {
      key: "upstox",
      name: "Upstox Developer API",
      type: "broker_api" as const,
      baseUrl: "https://api.upstox.com/v2",
      isEnabled: false,
    },
    {
      key: "twelvedata",
      name: "Twelve Data",
      type: "market_data_vendor" as const,
      baseUrl: "https://api.twelvedata.com",
      isEnabled: false,
    },
    {
      key: "fmp",
      name: "Financial Modeling Prep",
      type: "market_data_vendor" as const,
      baseUrl: "https://financialmodelingprep.com/api/v3",
      isEnabled: false,
    },
    {
      key: "eodhd",
      name: "EOD Historical Data",
      type: "market_data_vendor" as const,
      baseUrl: "https://eodhd.com/api",
      isEnabled: false,
    },
    {
      key: "manual_import",
      name: "Manual CSV / Admin Import",
      type: "manual_import" as const,
      isEnabled: true,
    },
  ];

  for (const p of providers) {
    await prisma.provider.upsert({
      where: { key: p.key },
      update: { name: p.name, isEnabled: p.isEnabled },
      create: p,
    });
  }
}
