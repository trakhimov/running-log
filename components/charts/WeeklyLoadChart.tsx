"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeekData {
  week: string;
  trimp: number;
  distanceKm: number;
  label: string;
}

interface Props {
  data: WeekData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="neu-raised rounded-xl p-3 text-xs">
      <p className="font-semibold text-neu-text mb-1">w/c {d.label}</p>
      <p className="text-neu-text-muted">
        TRIMP: <span className="text-indigo-600 font-bold">{Math.round(d.trimp)}</span>
      </p>
      <p className="text-neu-text-muted">
        Distance: {d.distanceKm} km
      </p>
    </div>
  );
};

export function WeeklyLoadChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="neu-inset rounded-2xl p-8 text-center text-neu-text-muted">
        No load data yet.
      </div>
    );
  }

  const maxTrimp = Math.max(...data.map((d) => d.trimp), 1);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--neu-shadow-dark)" opacity={0.4} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={40}
        />
        <YAxis
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
        <Bar
          dataKey="trimp"
          fill="#6366f1"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
