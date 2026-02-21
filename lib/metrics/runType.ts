import { getHRZone, HRZone } from "./zones";

export type RunType = "easy" | "long" | "tempo" | "interval" | "race" | "unknown";

interface RunTypeInput {
  avgHr: number | null;
  maxHr: number | null;
  distance: number | null; // meters
  movingTime: number | null; // seconds
  stravaType?: string;
  splits?: Array<{ averageHeartrate?: number; distance?: number }> | null;
  userMaxHr: number;
}

export function classifyRunType(input: RunTypeInput): RunType {
  const {
    avgHr,
    maxHr,
    distance,
    movingTime,
    stravaType,
    splits,
    userMaxHr,
  } = input;

  // Race: Strava says Race, or very high HR with good distance
  if (stravaType === "Race") return "race";

  if (!avgHr || !userMaxHr) return "unknown";

  const avgZone = getHRZone(avgHr, userMaxHr);
  const maxZone = maxHr ? getHRZone(maxHr, userMaxHr) : avgZone;

  // Interval: max HR reaches zone 5
  if (maxZone === 5 && avgZone >= 3) return "interval";

  // If we have splits, compute zone distribution
  if (splits && splits.length > 0) {
    const zoneCounts: Record<HRZone, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const split of splits) {
      if (split.averageHeartrate) {
        const z = getHRZone(split.averageHeartrate, userMaxHr);
        zoneCounts[z]++;
      }
    }
    const total = Object.values(zoneCounts).reduce((a, b) => a + b, 0);
    if (total > 0) {
      const z12Pct = (zoneCounts[1] + zoneCounts[2]) / total;
      const z34Pct = (zoneCounts[3] + zoneCounts[4]) / total;
      const z5Pct = zoneCounts[5] / total;

      if (z5Pct > 0.2) return "interval";
      if (z34Pct > 0.5) return "tempo";

      if (z12Pct > 0.8) {
        const distKm = (distance ?? 0) / 1000;
        return distKm > 14 ? "long" : "easy";
      }
    }
  }

  // Fallback: classify from avg HR zone
  if (avgZone <= 2) {
    const distKm = (distance ?? 0) / 1000;
    return distKm > 14 ? "long" : "easy";
  }
  if (avgZone >= 3 && avgZone <= 4) return "tempo";
  if (avgZone === 5) return "interval";

  return "easy";
}

export const RUN_TYPE_COLORS: Record<RunType, string> = {
  easy: "#34d399",
  long: "#60a5fa",
  tempo: "#fbbf24",
  interval: "#f97316",
  race: "#ef4444",
  unknown: "#9ca3af",
};

export const RUN_TYPE_LABELS: Record<RunType, string> = {
  easy: "Easy",
  long: "Long",
  tempo: "Tempo",
  interval: "Interval",
  race: "Race",
  unknown: "Unknown",
};
