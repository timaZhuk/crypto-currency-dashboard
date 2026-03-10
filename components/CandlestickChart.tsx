"use client";

import {
  getCandlestickConfig,
  getChartConfig,
  PERIOD_BUTTONS,
  PERIOD_CONFIG,
} from "@/constants";
import React, { useEffect, useRef, useState, useTransition } from "react";
import {
  BarSeries,
  CandlestickSeries,
  createChart,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";
import { fetcher } from "@/lib/coingecko.actions";
import { convertOHLCData } from "@/lib/utils";

const CandlestickChart = ({
  children,
  data,
  coinId,
  height = 360,
  initialPeriod = "daily",
}: CandlestickChartProps) => {
  //--- store chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  //---- store ref accros renders
  const chartRef = useRef<IChartApi | null>(null);

  // universal ref for interchange bars and candle  charts
  const seriesRef = useRef<
    ISeriesApi<"Candlestick"> | ISeriesApi<"Bar"> | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(initialPeriod);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [isPending, startTransition] = useTransition();
  const [bars, setBars] = useState(false);

  //Toggle change the bar/candle charts
  function changeGraphSereies() {
    setBars((prev) => !prev);
  }

  const fetchOHLCData = async (selectedPeriod: Period) => {
    try {
      const config = PERIOD_CONFIG[selectedPeriod];

      const newData = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
        vs_currency: "usd",
        days: config.days, // Можно строкой или числом
        // precision: 'full' можно оставить, если он вам критичен
      });

      setOhlcData(newData ?? []);
    } catch (error) {
      console.error("Failed to fetch OHLCData", error);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;
    startTransition(async () => {
      setPeriod(newPeriod);
      await fetchOHLCData(newPeriod);
    });
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;
    const showTime = ["daily", "weekly", "monthly"].includes(period);
    //-------creating chart
    const chart = createChart(container, {
      ...getChartConfig(height, showTime),
      width: container.clientWidth,
    });
    //-------creating series of bars/candles
    const series = bars
      ? chart.addSeries(BarSeries, {
          upColor: "#26a69a", // Цвет бара, если Close > Open
          downColor: "#ef5350", // Цвет бара, если Close < Open
          thinBars: true, // Сделать бары тонкими (эстетичнее)
        })
      : chart.addSeries(CandlestickSeries, getCandlestickConfig());
    //---------------
    series.setData(convertOHLCData(ohlcData));
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;
    const observer = new ResizeObserver((entries) => {
      if (!entries) return;
      chart.applyOptions({ width: entries[0].contentRect.width });
    });

    observer.observe(container);

    //--to prevent memeory leaks
    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height, bars, ohlcData, period]);

  return (
    <div id="candlestick-chart">
      <div className="chart-header">
        <div className="flex-1">{children}</div>

        <div className="button-group">
          <span className="text-sm mx-2 font-media text-purple-100/50">
            Period:
          </span>
          {PERIOD_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              className={
                period === value ? "config-button-active" : "config-button"
              }
              onClick={() => handlePeriodChange(value)}
              disabled={loading}
            >
              {label}
            </button>
          ))}
          <div>
            <button onClick={() => changeGraphSereies()}>
              {bars ? "BarChart" : "CandleChart"}
            </button>
          </div>
        </div>
      </div>
      <div ref={chartContainerRef} className="chart" style={{ height }}></div>
    </div>
  );
};

export default CandlestickChart;
