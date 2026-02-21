import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  refreshSessionIfNeeded,
  fetchActivityDetail,
} from "@/lib/strava/client";
import { classifyRunType } from "@/lib/metrics/runType";
import { computeCardiacEfficiency } from "@/lib/metrics/cardiacEfficiency";
import { computeTRIMP } from "@/lib/metrics/trimp";
import { computePaceDecoupling } from "@/lib/metrics/decoupling";
import { bestVDOTFromEfforts } from "@/lib/metrics/vdot";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const stravaId = parseInt(id, 10);
  if (isNaN(stravaId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const token = await refreshSessionIfNeeded(session);
    const userMaxHr = session.maxHr ?? 190;
    const userRestHr = session.restingHr ?? 50;

    const detail = await fetchActivityDetail(token, stravaId);

    const splits =
      detail.splits_metric?.map((s) => ({
        distance: s.distance,
        movingTime: s.moving_time,
        averageSpeed: s.average_speed,
        averageHeartrate: s.average_heartrate,
        averageCadence: s.average_cadence,
      })) ?? null;

    const runType = classifyRunType({
      avgHr: detail.average_heartrate ?? null,
      maxHr: detail.max_heartrate ?? null,
      distance: detail.distance,
      movingTime: detail.moving_time,
      stravaType: detail.sport_type,
      splits,
      userMaxHr,
    });

    const cardiacEfficiency =
      runType === "easy" || runType === "long"
        ? computeCardiacEfficiency(
            detail.distance,
            detail.moving_time,
            detail.average_heartrate ?? null
          )
        : null;

    const trimp = computeTRIMP(
      detail.moving_time,
      detail.average_heartrate ?? null,
      userMaxHr,
      userRestHr
    );

    const paceDecoupling = computePaceDecoupling(splits, detail.distance);

    const bestEfforts = detail.best_efforts
      ?.filter((e) => e.distance >= 400)
      .map((e) => ({
        id: e.id,
        name: e.name,
        elapsedTime: e.elapsed_time,
        distance: e.distance,
        startDate: e.start_date,
      })) ?? [];

    const vdot = bestVDOTFromEfforts(
      bestEfforts.map((e) => ({
        distance: e.distance,
        elapsedTime: e.elapsedTime,
      }))
    );

    const activity = {
      id: detail.id,
      name: detail.name,
      startDate: detail.start_date,
      distance: detail.distance,
      movingTime: detail.moving_time,
      avgHr: detail.average_heartrate
        ? Math.round(detail.average_heartrate)
        : null,
      maxHr: detail.max_heartrate ? Math.round(detail.max_heartrate) : null,
      avgCadence: detail.average_cadence
        ? Math.round(detail.average_cadence)
        : null,
      totalElevationGain: detail.total_elevation_gain,
      mapPolyline: detail.map?.summary_polyline ?? null,
      runType,
      cardiacEfficiency,
      trimp,
      paceDecoupling,
      vdot,
      splits,
    };

    return NextResponse.json({ activity, bestEfforts });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("404")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
