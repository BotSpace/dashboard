"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import type { DashboardOverview } from "@/shared/types/api";

type Distribution = DashboardOverview["distribution"];

const COLORS = ["#ededed", "#8f8f8f", "#525252", "#262626"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{payload[0].name}</p>
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

const ZERO_DISTRIBUTION: Distribution = { private: 0, group: 0, channel: 0, other: 0 };

export function AnalyticsDonut({ distribution }: AnalyticsDonutProps) {
  const dist = distribution ?? ZERO_DISTRIBUTION;
  const total = dist.private + dist.group + dist.channel + dist.other;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/40">
          <PieChartIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Analitika ma&apos;lumoti yo&apos;q</p>
      </div>
    );
  }

  const chartData = buildChartData(dist);
  const centerLabel = formatCompact(total);

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
          <span className="text-xl font-semibold tabular-nums">{centerLabel}</span>
          <span className="text-[10px] text-muted-foreground">Jami foydalanuvchi</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-sm"
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
