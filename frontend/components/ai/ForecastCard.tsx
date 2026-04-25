"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { MonthForecast } from "@/types/prediction";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatINR, formatINRCompact } from "@/lib/utils";
import { TrendingUp, Target, AlertCircle } from "lucide-react";

interface Props {
  forecast: MonthForecast;
  dataMonths: number;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 70 ? "text-secondary bg-secondary/10 border-secondary/20" :
    pct >= 40 ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" :
    "text-gray-400 bg-white/5 border-white/10";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>
      {pct}% confidence
    </span>
  );
}

export default function ForecastCard({ forecast, dataMonths }: Props) {
  const { data: analytics } = useAnalytics();

  // Build a simple chart: historical bars + forecast bar
  const trend = analytics?.monthly_trend ?? [];
  const chartData = [
    ...trend.map((m) => ({
      label: m.label,
      actual: m.total,
      predicted: null as number | null,
    })),
    {
      label: forecast.label,
      actual: null as number | null,
      predicted: forecast.predicted_total,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Hero number */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">Predicted spend for {forecast.label}</p>
          <p className="text-4xl font-bold text-white">
            {formatINR(forecast.predicted_total)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Range: {formatINR(forecast.lower_bound)} – {formatINR(forecast.upper_bound)}
          </p>
        </div>
        <ConfidenceBadge confidence={forecast.confidence} />
      </div>

      {dataMonths < 2 && (
        <div className="flex items-center gap-2 bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-3 py-2 text-xs text-yellow-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Add more expenses to improve prediction accuracy (currently using {dataMonths} month{dataMonths !== 1 ? "s" : ""} of data).
        </div>
      )}

      {/* Trend chart */}
      {chartData.length > 1 && (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={formatINRCompact} width={48} />
            <Tooltip
              contentStyle={{ background: "#13131A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "#9CA3AF" }}
              formatter={(v: any, name: string) => [formatINR(v), name === "actual" ? "Actual" : "Forecast"]}
            />
            <Area type="monotone" dataKey="actual" stroke="#6C63FF" strokeWidth={2} fill="url(#gradActual)" dot={false} connectNulls={false} />
            <Area type="monotone" dataKey="predicted" stroke="#00D4AA" strokeWidth={2} strokeDasharray="5 3" fill="url(#gradPred)" dot={{ fill: "#00D4AA", r: 4 }} connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
