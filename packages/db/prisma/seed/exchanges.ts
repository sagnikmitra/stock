import type { PrismaClient } from "@prisma/client";

export async function seedExchanges(prisma: PrismaClient) {
  console.log("  📊 Seeding exchanges...");

  const exchanges = [
    { code: "NSE", name: "National Stock Exchange of India", country: "IN", timezone: "Asia/Kolkata" },
    { code: "BSE", name: "Bombay Stock Exchange", country: "IN", timezone: "Asia/Kolkata" },
  ];

  for (const ex of exchanges) {
    await prisma.exchange.upsert({
      where: { code: ex.code },
      update: { name: ex.name },
      create: ex,
    });
  }

  const indices = [
    { symbol: "NIFTY 50", name: "Nifty 50", exchangeCode: "NSE" },
    { symbol: "NIFTY BANK", name: "Nifty Bank", exchangeCode: "NSE" },
    { symbol: "NIFTY MIDCAP 100", name: "Nifty Midcap 100", exchangeCode: "NSE" },
    { symbol: "SENSEX", name: "S&P BSE Sensex", exchangeCode: "BSE" },
  ];

  for (const idx of indices) {
    const exchange = await prisma.exchange.findUnique({ where: { code: idx.exchangeCode } });
    if (!exchange) continue;
    await prisma.index.upsert({
      where: { symbol: idx.symbol },
      update: { name: idx.name },
      create: { symbol: idx.symbol, name: idx.name, exchangeId: exchange.id },
    });
  }
}
