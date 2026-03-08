"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface MetricChartProps {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  color?: string;
  height?: number;
  label?: string;
}

export function MetricChart({ data, dataKey, color = "#10b981", height = 200, label }: MetricChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(0 0% 63.9%)" }}
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
        />
        <YAxis tick={{ fontSize: 11, fill: "hsl(0 0% 63.9%)" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(0 0% 6%)",
            border: "1px solid hsl(0 0% 14.9%)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelFormatter={(v) => new Date(v).toLocaleDateString()}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 3 }}
          name={label ?? dataKey}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
