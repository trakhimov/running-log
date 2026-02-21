import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  refreshSessionIfNeeded,
  fetchAllActivities,
} from "@/lib/strava/client";
import { classifyRunType } from "@/lib/metrics/runType";
import { computeCardiacEfficiency } from "@/lib/metrics/cardiacEfficiency";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") ?? "60");

  try {
    const token = await refreshSessionIfNeeded(session);
    const userMaxHr = session.maxHr ?? 190;

    const runs = await fetchAllActivities(token);

    const ceData = runs
      .filter((act) => act.average_heartrate)
      .map((act) => {
        const runType = classifyRunType({
          avgHr: act.average_heartrate ?? null,
          maxHr: act.max_heartrate ?? null,
          distance: act.distance,
          movingTime: act.moving_time,
          stravaType: act.sport_type,
          splits: null,
          userMaxHr,
        });

        if (runType !== "easy" && runType !== "long") return null;

        const cardiacEfficiency = computeCardiacEfficiency(
          act.distance,
          act.moving_time,
          act.average_heartrate ?? null
        );

        if (cardiacEfficiency === null) return null;

        return {
          id: act.id,
          startDate: act.start_date,
          cardiacEfficiency,
          runType,
          distance: act.distance,
          avgHr: Math.round(act.average_heartrate!),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      // Sort oldest first for charting, then take the last `limit` entries
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      .slice(-limit);

    return NextResponse.json({ data: ceData });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
