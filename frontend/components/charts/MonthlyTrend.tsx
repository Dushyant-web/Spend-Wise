"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import type { MonthlyTrendItem } from "@/types/analytics";
import { formatINRCompact } from "@/lib/utils";

interface Props {
  data: MonthlyTrendItem[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-dark border border-white/10 rounded-xl px-3 py-2 text-sm shadow-lg space-y-1">
      <p className="text-gray-400 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === "total" ? "Spent" : "Budget"}: ₹{p.value?.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

export default function MonthlyTrend({ data }: Props) {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#6B7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6B7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatINRCompact}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="total" fill="#6C63FF" radius={[4, 4, 0, 0]} name="total" />
        <Line
          type="monotone"
          dataKey="budget"
          stroke="#00D4AA"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 3"
          name="budget"
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
