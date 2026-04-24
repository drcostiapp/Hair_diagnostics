"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function ProgressChart({ data }: { data: { date: string; score: number }[] }) {
  return (
    <div className="card" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#0e2a37" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
