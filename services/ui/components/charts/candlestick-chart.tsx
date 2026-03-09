"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { IChartApi, CandlestickData, Time } from "lightweight-charts";

export interface OhlcvData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickChartProps {
  data: OhlcvData[];
  height?: number;
  className?: string;
}

function CandlestickChartInner({
  data,
  height = 300,
  className,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    import("lightweight-charts").then(({ createChart, ColorType, CandlestickSeries }) => {
      if (cancelled || !containerRef.current) return;

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "#6b7a8d",
          fontSize: 11,
        },
        grid: {
          vertLines: { color: "rgba(42, 53, 72, 0.5)" },
          horzLines: { color: "rgba(42, 53, 72, 0.5)" },
        },
        width: containerRef.current.clientWidth,
        height,
        crosshair: {
          horzLine: { color: "#6b7a8d", style: 2 },
          vertLine: { color: "#6b7a8d", style: 2 },
        },
        rightPriceScale: {
          borderColor: "#2a3548",
        },
        timeScale: {
          borderColor: "#2a3548",
          timeVisible: true,
        },
      });

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#10b981",
        downColor: "#ef4444",
        borderDownColor: "#ef4444",
        borderUpColor: "#10b981",
        wickDownColor: "#ef4444",
        wickUpColor: "#10b981",
      });

      const chartData: CandlestickData<Time>[] = data.map((d) => ({
        time: d.time as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      candleSeries.setData(chartData);
      chart.timeScale().fitContent();

      chartRef.current = chart;
      seriesRef.current = candleSeries;
    });

    return () => {
      cancelled = true;
      chartRef.current?.remove();
      chartRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    if (!seriesRef.current) return;
    const chartData: CandlestickData<Time>[] = data.map((d) => ({
      time: d.time as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
    seriesRef.current.setData(chartData);
  }, [data]);

  useEffect(() => {
    if (!chartRef.current || !containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chartRef.current?.resize(entry.contentRect.width, height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [height]);

  return <div ref={containerRef} className={className} />;
}

export const CandlestickChart = dynamic(
  () => Promise.resolve(CandlestickChartInner),
  { ssr: false }
);
