import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  refreshSessionIfNeeded,
  stravaFetch,
  StravaActivity,
} from "@/lib/strava/client";
import { classifyRunType } from "@/lib/metrics/runType";
import { computeCardiacEfficiency } from "@/lib/metrics/cardiacEfficiency";
import { computeTRIMP } from "@/lib/metrics/trimp";

function isRun(a: StravaActivity) {
  return (
    a.sport_type === "Run" ||
    a.type === "Run" ||
    a.sport_type === "TrailRun" ||
    a.sport_type === "VirtualRun"
  );
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const runTypeFilter = searchParams.get("runType");

  try {
    const token = await refreshSessionIfNeeded(session);
    const userMaxHr = session.maxHr ?? 190;
    const userRestHr = session.restingHr ?? 50;

    // Fetch more per page to account for non-run activities being filtered out
    const fetchPerPage = Math.min(limit * 3, 100);
    const stravaActivities = await stravaFetch<StravaActivity[]>(
      token,
      "/athlete/activities",
      { page, per_page: fetchPerPage }
    );

    const runs = stravaActivities.filter(isRun);

    let activities = runs.map((act) => {
      const runType = classifyRunType({
        avgHr: act.average_heartrate ?? null,
        maxHr: act.max_heartrate ?? null,
        distance: act.distance,
        movingTime: act.moving_time,
        stravaType: act.sport_type,
        splits: null,
        userMaxHr,
      });

      const cardiacEfficiency =
        runType === "easy" || runType === "long"
          ? computeCardiacEfficiency(
              act.distance,
              act.moving_time,
              act.average_heartrate ?? null
            )
          : null;

      const trimp = computeTRIMP(
        act.moving_time,
        act.average_heartrate ?? null,
        userMaxHr,
        userRestHr
      );

      return {
        id: act.id,
        name: act.name,
        startDate: act.start_date,
        distance: act.distance,
        movingTime: act.moving_time,
        avgHr: act.average_heartrate ? Math.round(act.average_heartrate) : null,
        maxHr: act.max_heartrate ? Math.round(act.max_heartrate) : null,
        avgCadence: act.average_cadence
          ? Math.round(act.average_cadence)
          : null,
        totalElevationGain: act.total_elevation_gain,
        mapPolyline: act.map?.summary_polyline ?? null,
        runType,
        cardiacEfficiency,
        trimp,
      };
    });

    if (runTypeFilter) {
      activities = activities.filter((a) => a.runType === runTypeFilter);
    }

    // Slice to requested limit after filtering
    const paged = activities.slice(0, limit);
    const hasMore = stravaActivities.length === fetchPerPage;

    return NextResponse.json({
      activities: paged,
      pagination: {
        page,
        limit,
        total: hasMore ? page * limit + 1 : (page - 1) * limit + paged.length,
        pages: hasMore ? page + 1 : page,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
