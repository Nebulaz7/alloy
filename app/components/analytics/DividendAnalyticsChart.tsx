"use client";

import React, { useState, useId, useMemo } from "react";
import { TrendingUp, Calendar, ArrowUpRight, Sparkles } from "lucide-react";

export type TimeRange = "1D" | "1W" | "1M" | "1Y" | "ALL";

export interface DataPoint {
  date: string;
  amount: number;
  label?: string;
  event?: string;
}

const mockDataByRange: Record<TimeRange, DataPoint[]> = {
  "1D": [
    { date: "09:00 AM", amount: 1395.0, label: "Market Open" },
    { date: "11:00 AM", amount: 1395.0 },
    { date: "01:00 PM", amount: 1410.5, event: "NVDAc Yield Payout" },
    { date: "03:00 PM", amount: 1410.5 },
    {
      date: "04:30 PM",
      amount: 1428.5,
      label: "Current",
      event: "AAPLc Dividend Credited",
    },
  ],
  "1W": [
    { date: "Sep 01", amount: 1240.0 },
    { date: "Sep 02", amount: 1240.0 },
    { date: "Sep 03", amount: 1290.0, event: "COINc Yield Distribution" },
    { date: "Sep 04", amount: 1320.0 },
    { date: "Sep 05", amount: 1350.0 },
    { date: "Sep 06", amount: 1395.0, event: "NVDAc Dividend Surge" },
    { date: "Sep 07", amount: 1428.5, event: "AAPLc Dividend Multiplier Jump" },
  ],
  "1M": [
    { date: "Aug 08", amount: 480.0 },
    { date: "Aug 12", amount: 510.0 },
    { date: "Aug 15", amount: 520.0 },
    { date: "Aug 18", amount: 620.0, event: "Apple Dividend Credited" },
    { date: "Aug 21", amount: 640.0 },
    { date: "Aug 24", amount: 780.0, event: "Nvidia Multiplier Surge" },
    { date: "Aug 27", amount: 890.0 },
    { date: "Aug 30", amount: 940.0 },
    { date: "Sep 02", amount: 1120.0, event: "Corporate Actions Sweep" },
    { date: "Sep 04", amount: 1260.0 },
    { date: "Sep 05", amount: 1380.0 },
    { date: "Sep 07", amount: 1428.5, event: "Latest Multiplier: 1.025x" },
  ],
  "1Y": [
    { date: "Oct 2025", amount: 120.0 },
    { date: "Dec 2025", amount: 280.0 },
    { date: "Feb 2026", amount: 460.0 },
    { date: "Apr 2026", amount: 690.0 },
    { date: "Jun 2026", amount: 980.0 },
    { date: "Aug 2026", amount: 1280.0 },
    { date: "Sep 2026", amount: 1428.5 },
  ],
  ALL: [
    { date: "2025 Q3", amount: 50.0 },
    { date: "2025 Q4", amount: 220.0 },
    { date: "2026 Q1", amount: 510.0 },
    { date: "2026 Q2", amount: 890.0 },
    { date: "2026 Q3", amount: 1428.5 },
  ],
};

interface DividendAnalyticsChartProps {
  title?: string;
  initialRange?: TimeRange;
  className?: string;
  onRangeChange?: (range: TimeRange) => void;
}

export const DividendAnalyticsChart: React.FC<DividendAnalyticsChartProps> = ({
  title = "Cumulative Dividends Earned",
  initialRange = "1M",
  className = "",
  onRangeChange,
}) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(initialRange);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<
    "ALL" | "AAPLc" | "NVDAc" | "COINc"
  >("ALL");

  const gradientId = useId();

  const data = useMemo(() => {
    return mockDataByRange[selectedRange] || mockDataByRange["1M"];
  }, [selectedRange]);

  const handleRangeSelect = (range: TimeRange) => {
    setSelectedRange(range);
    setHoveredIndex(null);
    onRangeChange?.(range);
  };

  // Dimensions for responsive SVG coordinate mapping
  const width = 600;
  const height = 240;
  const paddingX = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const minVal = useMemo(() => {
    const rawMin = Math.min(...data.map((d) => d.amount));
    return Math.max(0, rawMin * 0.9);
  }, [data]);

  const maxVal = useMemo(() => {
    const rawMax = Math.max(...data.map((d) => d.amount));
    return rawMax * 1.05;
  }, [data]);

  // Map data points to SVG coordinates
  const points = useMemo(() => {
    const count = data.length;
    return data.map((d, idx) => {
      const x = paddingX + (idx / (count - 1)) * (width - paddingX * 2);
      const ratio = (d.amount - minVal) / (maxVal - minVal || 1);
      const y =
        height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
      return { x, y, ...d };
    });
  }, [
    data,
    minVal,
    maxVal,
    width,
    height,
    paddingX,
    paddingTop,
    paddingBottom,
  ]);

  // Construct SVG Path string
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      // Smooth subtle bezier curve or crisp segments matching user's chart
      const prev = points[i - 1];
      const cpX = (prev.x + pt.x) / 2;
      return `${acc} C ${cpX.toFixed(1)} ${prev.y.toFixed(1)}, ${cpX.toFixed(1)} ${pt.y.toFixed(1)}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, "");
  }, [points]);

  // Construct Area polygon path
  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    const bottomY = height - paddingBottom;
    return `${linePath} L ${last.x.toFixed(1)} ${bottomY} L ${first.x.toFixed(1)} ${bottomY} Z`;
  }, [linePath, points, height, paddingBottom]);

  // Active display point (hovered or latest)
  const activePoint =
    hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];
  const latestAmount = points[points.length - 1]?.amount || 0;
  const startAmount = points[0]?.amount || 0;
  const deltaAmount = +(activePoint.amount - startAmount).toFixed(2);
  const deltaPct =
    startAmount > 0 ? +((deltaAmount / startAmount) * 100).toFixed(1) : 0;

  // Grid line values
  const gridLevels = [0.25, 0.5, 0.75];

  return (
    <div
      className={`bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-5 sm:p-6 space-y-4 select-none ${className}`}
    >
      {/* Header & Metric Display */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
              {title}
            </span>
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#16A34A] font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+{deltaPct}%</span>
            </span>
          </div>

          {/* Large Hero Dividend Figure */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-heading font-medium text-neutral-900 tracking-tight">
              +$
              {activePoint.amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs sm:text-sm font-medium text-[#10B981]">
              (+${deltaAmount.toFixed(2)} in {selectedRange})
            </span>
          </div>

          {/* Dynamic Event or Date label */}
          <div className="text-xs text-neutral-500 font-normal flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>{activePoint.date}</span>
            {activePoint.event && (
              <>
                <span>•</span>
                <span className="text-[#007FFF] font-medium">
                  {activePoint.event}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center bg-neutral-100/90 p-1 rounded-2xl border border-neutral-200/60 self-start sm:self-auto">
          {(["1D", "1W", "1M", "1Y", "ALL"] as TimeRange[]).map((range) => {
            const isSelected = selectedRange === range;
            return (
              <button
                key={range}
                onClick={() => handleRangeSelect(range)}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-white text-neutral-900 font-medium shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 font-normal"
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Analytics Chart Area */}
      <div className="relative w-full overflow-hidden pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoveredIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            // Find closest data point
            let closestIdx = 0;
            let minDist = Infinity;
            points.forEach((pt, i) => {
              const dist = Math.abs(pt.x - mouseX);
              if (dist < minDist) {
                minDist = dist;
                closestIdx = i;
              }
            });
            setHoveredIndex(closestIdx);
          }}
        >
          <defs>
            {/* Emerald Gradient matching user's image */}
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
            </linearGradient>

            {/* Subtle Dot Pattern in Chart Fill */}
            <pattern
              id="dot-pattern"
              x="0"
              y="0"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="0.75"
                fill="#10B981"
                fillOpacity="0.18"
              />
            </pattern>
          </defs>

          {/* Horizontal Reference Grid Lines */}
          {gridLevels.map((lvl) => {
            const y = paddingTop + lvl * (height - paddingTop - paddingBottom);
            return (
              <line
                key={lvl}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Pattern Fill Layer */}
          <path d={areaPath} fill="url(#dot-pattern)" />

          {/* Gradient Tint Fill Layer */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Main Dividend Earnings Line (Rich Emerald Green #10B981) */}
          <path
            d={linePath}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Crosshair & Scrubber Point */}
          {activePoint && (
            <g>
              {/* Vertical Dashed Guideline */}
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={height - paddingBottom}
                stroke="#10B981"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              {/* Outer Pulse Ring */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="7"
                fill="#10B981"
                fillOpacity="0.25"
              />

              {/* Inner Glowing Center Dot */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Date labels along bottom */}
          {points.map((pt, i) => {
            // Show first, middle, and last date labels to avoid crowding
            if (
              i === 0 ||
              i === Math.floor(points.length / 2) ||
              i === points.length - 1
            ) {
              return (
                <text
                  key={pt.date}
                  x={pt.x}
                  y={height - 12}
                  textAnchor={
                    i === 0
                      ? "start"
                      : i === points.length - 1
                        ? "end"
                        : "middle"
                  }
                  className="fill-neutral-400 text-[11px] font-normal"
                >
                  {pt.date}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>

      {/* Asset Source Filter Pills */}
      <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-400 font-normal">
            Filter by asset:
          </span>
          {(["ALL", "AAPLc", "NVDAc", "COINc"] as const).map((sym) => {
            const isSelected = selectedAsset === sym;
            return (
              <button
                key={sym}
                onClick={() => setSelectedAsset(sym)}
                className={`px-2.5 py-1 rounded-xl text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#E0F2FE] text-[#007FFF] font-medium border border-[#BAE6FD]"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-transparent font-normal"
                }`}
              >
                {sym === "ALL" ? "All Dividends" : sym}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-neutral-400 font-normal">
          Accrued via rebasing multipliers on Base
        </div>
      </div>
    </div>
  );
};
