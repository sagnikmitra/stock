"use client";

import { useEffect, useMemo, useRef } from "react";
import { createChart, CandlestickSeries, LineSeries, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";

type CandlePoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type Props = {
  candles: CandlePoint[];
  indicators?: {
    sma50?: number[];
    bb?: { upper: number[]; middle: number[]; lower: number[] };
    superTrend?: number[];
  };
  height?: number;
};

function toTimestamp(value: string): UTCTimestamp {
  return Math.floor(new Date(value).getTime() / 1000) as UTCTimestamp;
}

export function OhlcChart({ candles, indicators, height = 360 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineRefs = useRef<ISeriesApi<"Line">[]>([]);

  const isDark = useMemo(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
    [],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { color: isDark ? "#0f172a" : "#ffffff" },
        textColor: isDark ? "#cbd5e1" : "#334155",
      },
      grid: {
        vertLines: { color: isDark ? "#1e293b" : "#e2e8f0" },
        horzLines: { color: isDark ? "#1e293b" : "#e2e8f0" },
      },
      rightPriceScale: { borderColor: isDark ? "#334155" : "#cbd5e1" },
      timeScale: { borderColor: isDark ? "#334155" : "#cbd5e1" },
      crosshair: { mode: 0 },
      autoSize: true,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderVisible: false,
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    return () => chart.remove();
  }, [height, isDark]);

  useEffect(() => {
    if (!candleSeriesRef.current || !chartRef.current) return;
    const candleData = candles.map((candle) => ({
      time: toTimestamp(candle.time),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
    candleSeriesRef.current.setData(candleData);

    for (const line of lineRefs.current) {
      chartRef.current.removeSeries(line);
    }
    lineRefs.current = [];

    const addLine = (values: number[] | undefined, color: string) => {
      if (!values || values.length !== candles.length) return;
      const line = chartRef.current!.addSeries(LineSeries, { color, lineWidth: 2 });
      line.setData(
        candles
          .map((candle, index) => ({ time: toTimestamp(candle.time), value: values[index] }))
          .filter((point) => Number.isFinite(point.value)),
      );
      lineRefs.current.push(line);
    };

    addLine(indicators?.sma50, "#2563eb");
    addLine(indicators?.bb?.upper, "#ea580c");
    addLine(indicators?.bb?.middle, "#64748b");
    addLine(indicators?.bb?.lower, "#ea580c");
    addLine(indicators?.superTrend, "#7c3aed");

    chartRef.current.timeScale().fitContent();
  }, [candles, indicators]);

  return <div ref={containerRef} className="w-full" />;
}
