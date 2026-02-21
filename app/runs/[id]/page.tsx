"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { NeuStatCard } from "@/components/ui/NeuStatCard";
import { Nav } from "@/components/Nav";
import {
  formatDistance,
  formatPace,
  formatDate,
  formatDuration,
  formatTime,
} from "@/lib/utils";
import { decouplingLabel } from "@/lib/metrics/decoupling";

// Leaflet must be client-only
const RouteHeatmap = dynamic(
  () => import("@/components/maps/RouteHeatmap").then((m) => m.RouteHeatmap),
  { ssr: false }
);

export default function RunDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [activity, setActivity] = useState<any>(null);
  const [bestEfforts, setBestEfforts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/activities/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error === "Unauthorized") {
          router.push("/");
          return;
        }
        if (data.error === "Not found") {
          router.push("/runs");
          return;
        }
        setActivity(data.activity);
        setBestEfforts(data.bestEfforts ?? []);
        setLoading(false);
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="neu-raised rounded-2xl px-8 py-6 text-neu-text-muted animate-pulse">
          Loading…
        </div>
      </div>
    );
  }

  if (!activity) return null;

  const splits = (activity.splits as any[]) ?? [];

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="neu-raised rounded-xl w-10 h-10 flex items-center justify-center text-neu-text-muted flex-shrink-0"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-neu-text truncate">
            {activity.name}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-neu-text-muted">
              {formatDate(activity.startDate)}
            </p>
            <NeuBadge type={activity.runType ?? "unknown"} />
          </div>
        </div>
      </div>

      {/* Map */}
      {activity.mapPolyline && (
        <NeuCard className="mb-4 p-0 overflow-hidden" style={{ height: 220 }}>
          <RouteHeatmap
            routes={[{ polyline: activity.mapPolyline, date: activity.startDate }]}
            singleRoute
          />
        </NeuCard>
      )}

      {/* Primary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <NeuStatCard
          label="Distance"
          value={activity.distance ? (activity.distance / 1000).toFixed(2) : "—"}
          unit="km"
        />
        <NeuStatCard
          label="Pace"
          value={formatPace(activity.distance, activity.movingTime)}
          unit="/km"
        />
        <NeuStatCard
          label="Time"
          value={formatDuration(activity.movingTime)}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <NeuStatCard
          label="Avg HR"
          value={activity.avgHr ?? "—"}
          unit="bpm"
        />
        <NeuStatCard
          label="Max HR"
          value={activity.maxHr ?? "—"}
          unit="bpm"
        />
        <NeuStatCard
          label="Cadence"
          value={activity.avgCadence ?? "—"}
          unit="spm"
        />
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {activity.cardiacEfficiency && (
          <NeuStatCard
            label="Cardiac Efficiency"
            value={activity.cardiacEfficiency.toFixed(4)}
          />
        )}
        {activity.trimp && (
          <NeuStatCard
            label="TRIMP"
            value={Math.round(activity.trimp)}
          />
        )}
        {activity.vdot && (
          <NeuStatCard
            label="VDOT"
            value={activity.vdot.toFixed(1)}
          />
        )}
        {activity.paceDecoupling !== null && activity.paceDecoupling !== undefined && (
          <NeuStatCard
            label="Pace Decoupling"
            value={`${activity.paceDecoupling.toFixed(1)}%`}
          />
        )}
        {activity.totalElevationGain !== null && (
          <NeuStatCard
            label="Elevation"
            value={Math.round(activity.totalElevationGain ?? 0)}
            unit="m"
          />
        )}
      </div>

      {/* Pace Decoupling */}
      {activity.paceDecoupling !== null && activity.paceDecoupling !== undefined && (
        <NeuCard inset className="mb-4">
          <p className="text-xs font-semibold text-neu-text mb-1">Aerobic Decoupling</p>
          <p className="text-sm text-indigo-600 font-bold">
            {decouplingLabel(activity.paceDecoupling)}
          </p>
          <p className="text-xs text-neu-text-muted mt-1">
            Compares second half pace/HR vs first half. Under 5% = good aerobic coupling.
          </p>
        </NeuCard>
      )}

      {/* Best Efforts */}
      {bestEfforts.length > 0 && (
        <NeuCard className="mb-4">
          <h2 className="text-sm font-semibold text-neu-text mb-3">
            Best Efforts in This Run
          </h2>
          <div className="space-y-2">
            {bestEfforts.map((e: any) => (
              <div key={e.id} className="flex justify-between items-center py-1.5 border-b border-[var(--neu-shadow-dark)] border-opacity-20 last:border-0">
                <span className="text-xs font-medium text-neu-text">{e.name}</span>
                <span className="text-xs font-bold text-indigo-600">
                  {formatTime(e.elapsedTime)}
                </span>
              </div>
            ))}
          </div>
        </NeuCard>
      )}

      {/* Splits Table */}
      {splits.length > 0 && (
        <NeuCard>
          <h2 className="text-sm font-semibold text-neu-text mb-3">
            Splits (per km)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-neu-text-muted">
                  <th className="text-left py-1 pr-3">km</th>
                  <th className="text-right py-1 pr-3">Pace</th>
                  <th className="text-right py-1 pr-3">HR</th>
                  <th className="text-right py-1">Cad</th>
                </tr>
              </thead>
              <tbody>
                {splits.map((split: any, i: number) => (
                  <tr key={i} className="border-t border-[var(--neu-shadow-dark)] border-opacity-20">
                    <td className="py-1.5 pr-3 text-neu-text-muted">{i + 1}</td>
                    <td className="py-1.5 pr-3 text-right font-medium text-neu-text">
                      {split.averageSpeed && split.averageSpeed > 0
                        ? (() => {
                            const paceSecPerM = 1 / split.averageSpeed;
                            const paceSecPerKm = paceSecPerM * 1000;
                            const m = Math.floor(paceSecPerKm / 60);
                            const s = Math.round(paceSecPerKm % 60);
                            return `${m}:${String(s).padStart(2, "0")}`;
                          })()
                        : "—"}
                    </td>
                    <td className="py-1.5 pr-3 text-right text-neu-text">
                      {split.averageHeartrate ? Math.round(split.averageHeartrate) : "—"}
                    </td>
                    <td className="py-1.5 text-right text-neu-text">
                      {split.averageCadence ? Math.round(split.averageCadence) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeuCard>
      )}

      <Nav />
    </div>
  );
}
