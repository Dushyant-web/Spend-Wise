"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { PaymentModeItem } from "@/types/analytics";
import { formatINR } from "@/lib/utils";

const MODE_COLORS: Record<string, string> = {
  upi: "#6C63FF",
  cash: "#00D4AA",
  card: "#FF6B6B",
  netbanking: "#FFB347",
};

const MODE_ICONS: Record<string, string> = {
  upi: "📲",
  cash: "💵",
  card: "💳",
  netbanking: "🏦",
};

interface Props {
  data: PaymentModeItem[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface-dark border border-white/10 rounded-xl px-3 py-2 text-sm shadow-lg">
      <p className="text-white font-medium capitalize">{d.mode}</p>
      <p className="text-gray-400">{formatINR(d.amount)}</p>
      <p className="text-gray-500">{d.percentage}%</p>
    </div>
  );
}

export default function PaymentModeChart({ data }: Props) {
  if (!data.length) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-40 h-40 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={2}
              dataKey="amount"
            >
              {data.map((item) => (
                <Cell key={item.mode} fill={MODE_COLORS[item.mode] ?? "#6B7280"} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 w-full space-y-2">
        {data.map((item) => (
          <div key={item.mode} className="flex items-center gap-2">
            <span className="text-base">{MODE_ICONS[item.mode] ?? "💳"}</span>
            <span className="text-sm text-gray-300 capitalize flex-1">{item.mode}</span>
            <span className="text-sm text-white font-medium tabular-nums">{formatINR(item.amount)}</span>
            <span className="text-xs text-gray-500 w-10 text-right">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
