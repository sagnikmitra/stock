"use client";

import { useEffect, useRef } from "react";
import { createChart, LineSeries, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";

type IndicatorPoint = {
  time: string;
  value: number;
};

type Props = {
  data: IndicatorPoint[];
  label: string;
  overbought?: number;
  oversold?: number;
};

function ts(value: string): UTCTimestamp {
  return Math.floor(new Date(value).getTime() / 1000) as UTCTimestamp;
}

export function IndicatorChart({ data, label, overbought, oversold }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const dark = document.documentElement.classList.contains("dark");
    const chart = createChart(rootRef.current, {
      height: 200,
      autoSize: true,
      layout: {
        background: { color: dark ? "#0f172a" : "#ffffff" },
        textColor: dark ? "#cbd5e1" : "#334155",
      },
      rightPriceScale: { borderColor: dark ? "#334155" : "#cbd5e1" },
      timeScale: { borderColor: dark ? "#334155" : "#cbd5e1" },
      grid: {
        vertLines: { color: dark ? "#1e293b" : "#e2e8f0" },
        horzLines: { color: dark ? "#1e293b" : "#e2e8f0" },
      },
    });
    const series = chart.addSeries(LineSeries, { color: "#0ea5e9", lineWidth: 2 });
    chartRef.current = chart;
    seriesRef.current = series;
    return () => chart.remove();
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;
    seriesRef.current.setData(data.map((point) => ({ time: ts(point.time), value: point.value })));
    if (overbought !== undefined) {
      seriesRef.current.createPriceLine({ price: overbought, color: "#dc2626", lineWidth: 1, axisLabelVisible: true, title: "OB" });
    }
    if (oversold !== undefined) {
      seriesRef.current.createPriceLine({ price: oversold, color: "#16a34a", lineWidth: 1, axisLabelVisible: true, title: "OS" });
    }
    chartRef.current.timeScale().fitContent();
  }, [data, overbought, oversold]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="border-b border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">{label}</div>
      <div ref={rootRef} className="w-full" />
    </div>
  );
}

