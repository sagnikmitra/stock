import YahooFinance from "yahoo-finance2";
const yf = new YahooFinance();
try { yf.suppressNotices?.(["yahooSurvey","ripHistorical"]); } catch(e){}
try {
  const r = await yf.chart("RELIANCE.NS", { period1: "2025-04-19", period2: "2026-04-19", interval: "1d" });
  console.log("quotes len:", r?.quotes?.length);
  console.log("first:", JSON.stringify(r?.quotes?.[0]));
} catch (e) {
  console.error("ERR:", e.message);
}
