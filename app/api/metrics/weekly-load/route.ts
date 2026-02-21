import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  refreshSessionIfNeeded,
  fetchAllActivities,
} from "@/lib/strava/client";
import { computeTRIMP } from "@/lib/metrics/trimp";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await refreshSessionIfNeeded(session);
    const userMaxHr = session.maxHr ?? 190;
    const userRestHr = session.restingHr ?? 50;

    // Fetch last 12 weeks using `after` Unix timestamp
    const weeksBack = 12;
    const since = Math.floor(Date.now() / 1000) - weeksBack * 7 * 24 * 60 * 60;

    const runs = await fetchAllActivities(token, since);

    // Group by ISO week
    const weeklyData = new Map<
      string,
      { trimp: number; distance: number; label: string }
    >();

    for (const act of runs) {
      const trimp = computeTRIMP(
        act.moving_time,
        act.average_heartrate ?? null,
        userMaxHr,
        userRestHr
      );
      if (trimp === null) continue;

      const date = new Date(act.start_date);
      const weekKey = getISOWeekKey(date);
      const label = getWeekLabel(date);
      const existing = weeklyData.get(weekKey) ?? {
        trimp: 0,
        distance: 0,
        label,
      };
      existing.trimp += trimp;
      existing.distance += act.distance;
      weeklyData.set(weekKey, existing);
    }

    const sorted = Array.from(weeklyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, data]) => ({
        week,
        ...data,
        distanceKm: Math.round(data.distance / 100) / 10,
      }));

    return NextResponse.json({ data: sorted });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getISOWeekKey(date: Date): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getWeekLabel(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}
