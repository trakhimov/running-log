import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  refreshSessionIfNeeded,
  fetchAllActivities,
} from "@/lib/strava/client";
import { computeVDOT } from "@/lib/metrics/vdot";

interface DistanceRange {
  label: string;
  min: number; // meters
  max: number;
}

const DISTANCE_RANGES: DistanceRange[] = [
  { label: "1k", min: 900, max: 1100 },
  { label: "1 mile", min: 1550, max: 1700 },
  { label: "5k", min: 4800, max: 5400 },
  { label: "10k", min: 9500, max: 10600 },
  { label: "Half-Marathon", min: 20800, max: 21400 },
  { label: "Marathon", min: 41800, max: 42600 },
];

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await refreshSessionIfNeeded(session);
    const runs = await fetchAllActivities(token);

    // Sort chronologically for history arrays
    const chronoRuns = [...runs].sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    const records: Record<
      string,
      {
        pb: {
          elapsedTime: number;
          distance: number;
          startDate: string;
          vdot: number;
        } | null;
        history: Array<{
          elapsedTime: number;
          distance: number;
          startDate: string;
          vdot: number;
        }>;
      }
    > = {};

    for (const range of DISTANCE_RANGES) {
      const efforts = chronoRuns
        .filter(
          (a) => a.distance >= range.min && a.distance <= range.max
        )
        .map((a) => ({
          elapsedTime: a.moving_time,
          distance: a.distance,
          startDate: a.start_date,
          vdot: computeVDOT(a.distance, a.moving_time),
        }));

      const pb =
        efforts.length > 0
          ? [...efforts].sort((a, b) => a.elapsedTime - b.elapsedTime)[0]
          : null;

      records[range.label] = { pb, history: efforts };
    }

    return NextResponse.json({ records });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
