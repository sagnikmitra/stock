import { BaseAdapter } from "./base";
import type {
  SymbolMaster,
  QuoteSnapshot,
  CandleSeries,
  CandleRequest,
  IndexRequest,
  FiiDiiFlow,
  MarketBreadth,
  AdapterHealth,
} from "@ibo/types";
import { ProviderType, Timeframe } from "@ibo/types";

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/csv,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: "https://www.nseindia.com/",
  Connection: "keep-alive",
};

function ddmmyyyy(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = dt.getUTCFullYear();
  return `${dd}${mm}${yyyy}`;
}

function splitCsvLine(line: string): string[] {
  return line.split(",").map((c) => c.trim());
}

export interface BhavcopyRow {
  symbol: string;
  series: string;
  date: string;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  close: number;
  lastPrice: number;
  avgPrice: number;
  totalQty: number;
  turnoverLacs: number;
  noOfTrades: number;
  deliveryQty: number;
  deliveryPct: number;
}

export class NseBhavcopyAdapter extends BaseAdapter {
  readonly name = "NSE Security-Wise Bhavcopy";
  readonly providerType = ProviderType.OFFICIAL_EXCHANGE;
  readonly supports = {
    eodCandles: true,
    intradayCandles: false,
    quotes: false,
    indices: false,
    fundamentals: false,
    fiiDii: false,
    mutualFunds: false,
    marketBreadth: false,
  };

  private baseUrl = "https://archives.nseindia.com/products/content";
  private warmupUrl = "https://www.nseindia.com/";
  private cookies: string | null = null;
  private cookieTs = 0;
  private readonly cookieTtlMs = 4 * 60 * 1000;

  constructor() {
    super();
    this.setRateLimit(10, 60_000);
  }

  private async refreshCookies(force = false): Promise<void> {
    if (!force && this.cookies && Date.now() - this.cookieTs < this.cookieTtlMs) return;
    try {
      const res = await fetch(this.warmupUrl, { method: "GET", headers: BROWSER_HEADERS });
      const raw = res.headers.get("set-cookie");
      if (raw) {
        this.cookies = raw.split(/,(?=[A-Za-z0-9_.-]+=)/).map((c) => c.split(";")[0]).join("; ");
        this.cookieTs = Date.now();
      }
    } catch {
      // warmup best-effort
    }
  }

  async fetchCsv(marketDate: string): Promise<string | null> {
    await this.waitForRateLimit();
    await this.refreshCookies();
    const url = `${this.baseUrl}/sec_bhavdata_full_${ddmmyyyy(marketDate)}.csv`;
    const headers = { ...BROWSER_HEADERS, ...(this.cookies ? { Cookie: this.cookies } : {}) };
    const res = await fetch(url, { method: "GET", headers, redirect: "follow" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Bhavcopy ${marketDate} HTTP ${res.status}`);
    return await res.text();
  }

  parseCsv(csv: string): BhavcopyRow[] {
    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];
    const headerCells = splitCsvLine(lines[0]!).map((h) => h.toUpperCase().replace(/\s+/g, ""));
    const colIdx = (names: string[]): number => {
      for (const n of names) {
        const idx = headerCells.indexOf(n);
        if (idx >= 0) return idx;
      }
      return -1;
    };
    const iSym = colIdx(["SYMBOL"]);
    const iSer = colIdx(["SERIES"]);
    const iDate = colIdx(["DATE1", "DATE"]);
    const iPrev = colIdx(["PREV_CLOSE"]);
    const iOpen = colIdx(["OPEN_PRICE", "OPEN"]);
    const iHigh = colIdx(["HIGH_PRICE", "HIGH"]);
    const iLow = colIdx(["LOW_PRICE", "LOW"]);
    const iLast = colIdx(["LAST_PRICE", "LAST"]);
    const iClose = colIdx(["CLOSE_PRICE", "CLOSE"]);
    const iAvg = colIdx(["AVG_PRICE"]);
    const iQty = colIdx(["TTL_TRD_QNTY", "TOT_TRD_QTY"]);
    const iTurnover = colIdx(["TURNOVER_LACS", "TOT_TRD_VAL"]);
    const iTrades = colIdx(["NO_OF_TRADES"]);
    const iDelivQ = colIdx(["DELIV_QTY"]);
    const iDelivP = colIdx(["DELIV_PER"]);

    if (iSym < 0 || iClose < 0) return [];

    const out: BhavcopyRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = splitCsvLine(lines[i]!);
      if (cells.length < headerCells.length) continue;
      const series = (cells[iSer] ?? "").toUpperCase();
      if (series !== "EQ" && series !== "BE" && series !== "BZ") continue;
      const dateRaw = (cells[iDate] ?? "").trim();
      const dateIso = parseNseDate(dateRaw);
      if (!dateIso) continue;
      const symbol = (cells[iSym] ?? "").toUpperCase();
      if (!symbol) continue;
      const num = (idx: number) => {
        if (idx < 0) return NaN;
        const v = (cells[idx] ?? "").replace(/[^0-9.+-]/g, "");
        const n = Number(v);
        return Number.isFinite(n) ? n : NaN;
      };
      const close = num(iClose);
      if (!Number.isFinite(close)) continue;
      out.push({
        symbol,
        series,
        date: dateIso,
        prevClose: num(iPrev),
        open: num(iOpen),
        high: num(iHigh),
        low: num(iLow),
        close,
        lastPrice: num(iLast),
        avgPrice: num(iAvg),
        totalQty: num(iQty),
        turnoverLacs: num(iTurnover),
        noOfTrades: num(iTrades),
        deliveryQty: num(iDelivQ),
        deliveryPct: num(iDelivP),
      });
    }
    return out;
  }

  async fetchBhavcopy(marketDate: string): Promise<BhavcopyRow[] | null> {
    const csv = await this.fetchCsv(marketDate);
    if (!csv) return null;
    return this.parseCsv(csv);
  }

  async getSymbols(): Promise<SymbolMaster[]> {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await this.findMostRecentBhavcopy(today, 7);
    if (!rows) return [];
    const dedup = new Map<string, SymbolMaster>();
    for (const r of rows) {
      if (!dedup.has(r.symbol)) {
        dedup.set(r.symbol, { symbol: r.symbol, companyName: r.symbol, exchange: "NSE" });
      }
    }
    return Array.from(dedup.values()).sort((a, b) => a.symbol.localeCompare(b.symbol));
  }

  async getQuotes(_symbols: string[]): Promise<QuoteSnapshot[]> {
    return [];
  }

  async getHistoricalCandles(input: CandleRequest): Promise<CandleSeries> {
    return { symbol: input.symbol, timeframe: input.timeframe, candles: [] };
  }

  async getIndexSeries(input: IndexRequest): Promise<CandleSeries> {
    return { symbol: input.symbol, timeframe: Timeframe.D1, candles: [] };
  }

  async getFiiDiiFlows(_date: string): Promise<FiiDiiFlow[]> {
    return [];
  }

  async getMarketBreadth(_date: string): Promise<MarketBreadth | null> {
    return null;
  }

  async healthcheck(): Promise<AdapterHealth> {
    const start = Date.now();
    try {
      const rows = await this.findMostRecentBhavcopy(new Date().toISOString().slice(0, 10), 7);
      return {
        provider: this.name,
        healthy: !!rows && rows.length > 0,
        latencyMs: Date.now() - start,
        lastSuccessAt: new Date().toISOString(),
        message: rows ? `${rows.length} rows` : "no recent file",
      };
    } catch (e) {
      return {
        provider: this.name,
        healthy: false,
        latencyMs: Date.now() - start,
        lastFailureAt: new Date().toISOString(),
        message: e instanceof Error ? e.message : String(e),
      };
    }
  }

  async findMostRecentBhavcopy(fromDate: string, lookbackDays = 5): Promise<BhavcopyRow[] | null> {
    const start = new Date(fromDate);
    for (let i = 0; i < lookbackDays; i++) {
      const probe = new Date(start);
      probe.setUTCDate(probe.getUTCDate() - i);
      const iso = probe.toISOString().slice(0, 10);
      try {
        const rows = await this.fetchBhavcopy(iso);
        if (rows && rows.length > 0) return rows;
      } catch {
        // keep walking
      }
    }
    return null;
  }
}

function parseNseDate(raw: string): string | null {
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(raw.trim());
  if (!m) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  const months: Record<string, number> = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
  };
  const dd = Number(m[1]);
  const mon = months[m[2]!.toUpperCase()];
  const yyyy = Number(m[3]);
  if (mon === undefined) return null;
  const d = new Date(Date.UTC(yyyy, mon, dd));
  return d.toISOString().slice(0, 10);
}
