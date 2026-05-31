"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DONUT_DATA } from "./mock-data";
import type { DashboardOverview } from "@/shared/types/api";

type Distribution = DashboardOverview["distribution"];

const COLORS = ["#8b5cf6", "#3b82f6", "#d946ef", "#6b7280"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-violet-500/20 bg-[#0f0f18] px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400">{payload[0].name}</p>
      <p className="text-sm font-semibold" style={{ color: payload[0].payload.color }}>
        {payload[0].value}%
      </p>
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function buildChartData(dist: Distribution) {
  const total = dist.private + dist.group + dist.channel + dist.other;
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
  return [
    { name: "Foydalanuvchilar", value: pct(dist.private), color: COLORS[0] },
    { name: "Guruhlar", value: pct(dist.group), color: COLORS[1] },
    { name: "Kanallar", value: pct(dist.channel), color: COLORS[2] },
    { name: "Boshqalar", value: pct(dist.other), color: COLORS[3] },
  ];
}

interface AnalyticsDonutProps {
  distribution?: Distribution | null;
}

export function AnalyticsDonut({ distribution }: AnalyticsDonutProps) {
  const useReal = distribution != null;
  const chartData = useReal ? buildChartData(distribution) : DONUT_DATA;

  const total = useReal
    ? distribution.private + distribution.group + distribution.channel + distribution.other
    : null;

  const centerLabel = total !== null ? formatCompact(total) : "2.4M";

  return (
    <div className="flex flex-col gap-4">
      {/* Donut chart */}
      <div className="relative flex h-44 items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={76}
              dataKey="value"
              strokeWidth={0}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{centerLabel}</span>
          <span className="text-[10px] text-muted-foreground">Jami foydalanuvchi</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
