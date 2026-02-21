/**
 * Cardiac Efficiency (CE) = pace_min_per_km / avg_hr
 * Lower is better — faster pace at lower HR.
 * Only meaningful for easy and long runs.
 */
export function computeCardiacEfficiency(
  distanceMeters: number | null,
  movingTimeSeconds: number | null,
  avgHr: number | null
): number | null {
  if (!distanceMeters || !movingTimeSeconds || !avgHr || avgHr === 0) {
    return null;
  }
  if (distanceMeters < 1000) return null; // too short

  const paceMinPerKm = movingTimeSeconds / 60 / (distanceMeters / 1000);
  return paceMinPerKm / avgHr;
}

export function formatCardiacEfficiency(ce: number | null): string {
  if (ce === null) return "—";
  return ce.toFixed(4);
}

// Higher CE trend = improving fitness (lower value = better)
export function ceTrend(
  recent: number | null,
  previous: number | null
): "improving" | "declining" | "stable" | "unknown" {
  if (!recent || !previous) return "unknown";
  const diff = (previous - recent) / previous;
  if (diff > 0.01) return "improving"; // CE dropped by >1% (good)
  if (diff < -0.01) return "declining"; // CE rose by >1% (bad)
  return "stable";
}
