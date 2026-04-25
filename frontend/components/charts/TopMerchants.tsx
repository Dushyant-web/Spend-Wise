"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { TopMerchantItem } from "@/types/analytics";
import { CATEGORY_MAP } from "@/lib/constants";
import { formatINR } from "@/lib/utils";

interface Props {
  data: TopMerchantItem[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface-dark border border-white/10 rounded-xl px-3 py-2 text-sm shadow-lg">
      <p className="text-white font-medium">{d.merchant}</p>
      <p className="text-gray-400">{formatINR(d.amount)}</p>
      <p className="text-gray-500">{d.count} transaction{d.count > 1 ? "s" : ""}</p>
    </div>
  );
}

export default function TopMerchants({ data }: Props) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-40 text-gray-500 text-sm">No merchant data</div>
  );

  return (
    <div className="space-y-2">
      {data.map((item, i) => {
        const cat = CATEGORY_MAP[item.category as keyof typeof CATEGORY_MAP];
        const max = data[0]?.amount || 1;
        const pct = (item.amount / max) * 100;

        return (
          <div key={item.merchant} className="flex items-center gap-3">
            <span className="text-base w-6 text-center">{cat?.emoji ?? "💰"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm text-gray-300 truncate">{item.merchant}</span>
                <span className="text-sm text-white font-medium tabular-nums ml-2 flex-shrink-0">
                  {formatINR(item.amount)}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: cat?.color ?? "#6C63FF",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
