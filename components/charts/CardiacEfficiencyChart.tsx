"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatDate } from "@/lib/utils";

interface CEDataPoint {
  startDate: string;
  cardiacEfficiency: number;
  runType: string;
  distance: number;
  avgHr: number;
}

interface Props {
  data: CEDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="neu-raised rounded-xl p-3 text-xs">
      <p className="font-semibold text-neu-text mb-1">
        {formatDate(d.startDate)}
      </p>
      <p className="text-neu-text-muted">
        CE: <span className="text-indigo-600 font-bold">{d.cardiacEfficiency?.toFixed(4)}</span>
      </p>
      <p className="text-neu-text-muted">
        Avg HR: {d.avgHr} bpm
      </p>
      <p className="text-neu-text-muted capitalize">
        {d.runType}
      </p>
    </div>
  );
};

export function CardiacEfficiencyChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="neu-inset rounded-2xl p-8 text-center text-neu-text-muted">
        No data yet — sync some easy runs to see your cardiac efficiency trend.
      </div>
    );
  }

  // Compute rolling 4-run average for trend line
  const withAvg = data.map((d, i) => {
    const window = data.slice(Math.max(0, i - 3), i + 1);
    const avg = window.reduce((s, w) => s + w.cardiacEfficiency, 0) / window.length;
    return { ...d, rollingAvg: avg };
  });

  // Format x-axis label
  const formatXAxis = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={withAvg} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--neu-shadow-dark)" opacity={0.5} />
        <XAxis
          dataKey="startDate"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.toFixed(3)}
          width={44}
          reversed // lower CE = better, show improving trend going up visually
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="cardiacEfficiency"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: "#6366f1", r: 3 }}
          activeDot={{ r: 5 }}
          name="CE"
        />
        <Line
          type="monotone"
          dataKey="rollingAvg"
          stroke="#f97316"
          strokeWidth={2}
          strokeDasharray="4 2"
          dot={false}
          name="4-run avg"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
