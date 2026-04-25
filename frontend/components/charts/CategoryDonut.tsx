"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CategoryBreakdownItem } from "@/types/analytics";
import { formatINR } from "@/lib/utils";

const COLORS = [
  "#6C63FF", "#00D4AA", "#FF6B6B", "#FFB347", "#4ECDC4",
  "#A78BFA", "#34D399", "#F472B6", "#60A5FA", "#FBBF24",
];

interface Props {
  data: CategoryBreakdownItem[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface-dark border border-white/10 rounded-xl px-3 py-2 text-sm shadow-lg">
      <p className="text-white font-medium">{d.emoji} {d.category}</p>
      <p className="text-gray-400">{formatINR(d.amount)}</p>
      <p className="text-gray-500">{d.percentage}% · {d.count} txns</p>
    </div>
  );
}

export default function CategoryDonut({ data }: Props) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-64 text-gray-500 text-sm">No data this month</div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center">
      <div className="w-full lg:w-64 h-64 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={2}
              dataKey="amount"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 w-full space-y-2">
        {data.slice(0, 6).map((item, i) => (
          <div key={item.category} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-sm text-gray-300 flex-1 truncate capitalize">
              {item.emoji} {item.category}
            </span>
            <span className="text-sm text-white font-medium tabular-nums">
              {formatINR(item.amount)}
            </span>
            <span className="text-xs text-gray-500 w-10 text-right">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
