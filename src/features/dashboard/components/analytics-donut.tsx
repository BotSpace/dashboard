"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DONUT_DATA } from "./mock-data";

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

export function AnalyticsDonut() {
  return (
    <div className="flex flex-col gap-4">
      {/* Donut chart */}
      <div className="relative flex h-44 items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DONUT_DATA}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={76}
              dataKey="value"
              strokeWidth={0}
              paddingAngle={2}
            >
              {DONUT_DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">2.4M</span>
          <span className="text-[10px] text-muted-foreground">Jami xabarlar</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {DONUT_DATA.map((item) => (
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
