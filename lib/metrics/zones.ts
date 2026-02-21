export type HRZone = 1 | 2 | 3 | 4 | 5;

export function getHRZone(hr: number, maxHr: number): HRZone {
  const pct = hr / maxHr;
  if (pct < 0.6) return 1;
  if (pct < 0.7) return 2;
  if (pct < 0.8) return 3;
  if (pct < 0.9) return 4;
  return 5;
}

export function getZoneLabel(zone: HRZone): string {
  const labels: Record<HRZone, string> = {
    1: "Recovery",
    2: "Easy",
    3: "Tempo",
    4: "Threshold",
    5: "VO2max",
  };
  return labels[zone];
}

export function getZoneColor(zone: HRZone): string {
  const colors: Record<HRZone, string> = {
    1: "#60a5fa", // blue
    2: "#34d399", // green
    3: "#fbbf24", // yellow
    4: "#f97316", // orange
    5: "#ef4444", // red
  };
  return colors[zone];
}

// Classify zone from avg HR percentage
export function classifyZoneFromAvgHr(
  avgHr: number,
  maxHr: number
): HRZone {
  return getHRZone(avgHr, maxHr);
}
