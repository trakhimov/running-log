"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatDate } from "@/lib/utils";

interface VDOTPoint {
  startDate: string;
  vdot: number;
  distanceName?: string;
}

interface Props {
  data: VDOTPoint[];
  distanceName?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="neu-raised rounded-xl p-3 text-xs">
      <p className="font-semibold text-neu-text mb-1">{formatDate(d.startDate)}</p>
      <p className="text-neu-text-muted">
        VDOT: <span className="text-emerald-600 font-bold">{d.vdot?.toFixed(1)}</span>
      </p>
      {d.distanceName && (
        <p className="text-neu-text-muted">{d.distanceName}</p>
      )}
    </div>
  );
};

export function VDOTChart({ data, distanceName }: Props) {
  if (!data.length) {
    return (
      <div className="neu-inset rounded-2xl p-8 text-center text-neu-text-muted text-sm">
        No VDOT data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--neu-shadow-dark)" opacity={0.5} />
        <XAxis
          dataKey="startDate"
          tickFormatter={(v) => new Date(v).toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          domain={["dataMin - 2", "dataMax + 2"]}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="vdot"
          stroke="#34d399"
          strokeWidth={2}
          dot={{ fill: "#34d399", r: 3 }}
          activeDot={{ r: 5 }}
          name={distanceName ?? "VDOT"}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
