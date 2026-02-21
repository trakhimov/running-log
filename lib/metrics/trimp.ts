/**
 * TRIMP (Training Impulse) calculation
 * Formula: duration_min × HR_ratio × e^(1.92 × HR_ratio)
 * where HR_ratio = (avg_HR - rest_HR) / (max_HR - rest_HR)
 */
export function computeTRIMP(
  movingTimeSeconds: number | null,
  avgHr: number | null,
  maxHr: number, // user's max HR
  restHr: number // user's resting HR
): number | null {
  if (!movingTimeSeconds || !avgHr) return null;
  if (avgHr <= restHr || maxHr <= restHr) return null;

  const durationMin = movingTimeSeconds / 60;
  const hrRatio = (avgHr - restHr) / (maxHr - restHr);

  if (hrRatio <= 0 || hrRatio > 1) return null;

  return durationMin * hrRatio * Math.exp(1.92 * hrRatio);
}

// Aggregate TRIMP per week from activities
export function weeklyTrimp(
  activities: Array<{ startDate: Date; trimp: number | null }>
): Map<string, number> {
  const weekly = new Map<string, number>();

  for (const activity of activities) {
    if (!activity.trimp) continue;
    const date = new Date(activity.startDate);
    // ISO week key: YYYY-WNN
    const weekKey = getISOWeekKey(date);
    weekly.set(weekKey, (weekly.get(weekKey) ?? 0) + activity.trimp);
  }

  return weekly;
}

function getISOWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
