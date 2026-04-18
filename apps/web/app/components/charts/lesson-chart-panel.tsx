"use client";

import { useMemo } from "react";
import { IndicatorChart } from "./indicator-chart";
import { OhlcChart } from "./ohlc-chart";

type Props = {
  sectionTitle: string;
  sectionBody: string;
};

function buildTimeseries(length: number) {
  const end = new Date();
  const out: string[] = [];
  for (let i = length - 1; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    out.push(d.toISOString());
  }
  return out;
}

export function LessonChartPanel({ sectionTitle, sectionBody }: Props) {
  const lower = `${sectionTitle} ${sectionBody}`.toLowerCase();

  const showRsi = lower.includes("rsi") || lower.includes("momentum");
  const showTrend = lower.includes("sma") || lower.includes("ema") || lower.includes("supertrend");
  const showBb = lower.includes("bollinger") || lower.includes("breakout");

  const chartData = useMemo(() => {
    const times = buildTimeseries(40);
    const candles = times.map((time, index) => {
      const base = 100 + index * 0.65 + Math.sin(index / 4) * 2.2;
      const open = base + Math.sin(index / 3) * 0.8;
      const close = base + Math.cos(index / 5) * 1.1;
      const high = Math.max(open, close) + 1.25;
      const low = Math.min(open, close) - 1.15;
      return { time, open, high, low, close };
    });

    const rsi = times.map((time, index) => ({
      time,
      value: 48 + Math.sin(index / 3) * 18 + index * 0.35,
    }));

    const sma50 = candles.map((candle, index) => candle.close - 2 + index * 0.02);
    const bbMiddle = candles.map((candle) => candle.close);
    const bbUpper = candles.map((candle) => candle.close + 2.8);
    const bbLower = candles.map((candle) => candle.close - 2.8);
    const superTrend = candles.map((candle, index) => candle.low - (index % 3 === 0 ? 1 : 0.4));

    return {
      candles,
      rsi,
      sma50,
      bbUpper,
      bbMiddle,
      bbLower,
      superTrend,
    };
  }, []);

  if (!showRsi && !showTrend && !showBb) return null;

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        Visual Companion
      </p>
      {showRsi ? (
        <IndicatorChart data={chartData.rsi} label="RSI Context (Illustrative)" overbought={70} oversold={30} />
      ) : null}
      {showTrend || showBb ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="border-b border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
            Trend Structure (Illustrative)
          </div>
          <OhlcChart
            candles={chartData.candles}
            height={280}
            indicators={{
              sma50: showTrend ? chartData.sma50 : undefined,
              superTrend: showTrend ? chartData.superTrend : undefined,
              bb: showBb
                ? {
                    upper: chartData.bbUpper,
                    middle: chartData.bbMiddle,
                    lower: chartData.bbLower,
                  }
                : undefined,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

