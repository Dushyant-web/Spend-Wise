"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailySpendingItem } from "@/types/analytics";
import { formatINRCompact } from "@/lib/utils";

interface Props {
  data: DailySpendingItem[];
  showCumulative?: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-dark border border-white/10 rounded-xl px-3 py-2 text-sm shadow-lg space-y-1">
      <p className="text-gray-400">Day {label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === "cumulative" ? "Total so far" : "Today"}: ₹{p.value?.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

export default function DailySpending({ data, showCumulative = true }: Props) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="gradCumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradDaily" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: "#6B7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#6B7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatINRCompact}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        {showCumulative ? (
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="#6C63FF"
            strokeWidth={2}
            fill="url(#gradCumulative)"
            dot={false}
            name="cumulative"
          />
        ) : (
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#00D4AA"
            strokeWidth={2}
            fill="url(#gradDaily)"
            dot={false}
            name="amount"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
