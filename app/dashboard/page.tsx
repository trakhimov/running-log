"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NeuStatCard } from "@/components/ui/NeuStatCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { NeuCard } from "@/components/ui/NeuCard";
import { WeeklyLoadChart } from "@/components/charts/WeeklyLoadChart";
import { Nav } from "@/components/Nav";
import { formatDistance, formatPace, formatDate } from "@/lib/utils";
import { ceTrend } from "@/lib/metrics/cardiacEfficiency";

export default function DashboardPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [weeklyLoad, setWeeklyLoad] = useState<any[]>([]);
  const [ceData, setCeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/activities?limit=5").then((r) => r.json()),
      fetch("/api/metrics/weekly-load").then((r) => r.json()),
      fetch("/api/metrics/cardiac-efficiency?limit=10").then((r) => r.json()),
    ]).then(([actData, loadData, ceRes]) => {
      if (actData.error === "Unauthorized") {
        router.push("/");
        return;
      }
      setActivities(actData.activities ?? []);
      setWeeklyLoad(loadData.data ?? []);
      setCeData(ceRes.data ?? []);
      setLoading(false);
    });
  }, [router]);

  // Compute CE stats
  const latestCE = ceData[ceData.length - 1]?.cardiacEfficiency ?? null;
  const prevCE = ceData[ceData.length - 2]?.cardiacEfficiency ?? null;
  const trend = ceTrend(latestCE, prevCE);
  const trendDir =
    trend === "improving" ? "down" : trend === "declining" ? "up" : "neutral";

  // Latest run
  const latestRun = activities[0];

  // Total weekly TRIMP
  const thisWeekTrimp = weeklyLoad[weeklyLoad.length - 1]?.trimp ?? 0;
  const lastWeekTrimp = weeklyLoad[weeklyLoad.length - 2]?.trimp ?? 0;
  const trimpTrend =
    thisWeekTrimp > lastWeekTrimp
      ? "up"
      : thisWeekTrimp < lastWeekTrimp
      ? "down"
      : "neutral";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="neu-raised rounded-2xl px-8 py-6 text-neu-text-muted animate-pulse">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neu-text">Dashboard</h1>
          <p className="text-xs text-neu-text-muted">{formatDate(new Date())}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <NeuStatCard
          label="Cardiac Efficiency"
          value={latestCE ? latestCE.toFixed(4) : "—"}
          trend={trendDir as any}
          trendLabel={trend !== "unknown" ? trend : undefined}
          trendPositive={false} // lower is better
        />
        <NeuStatCard
          label="This Week TRIMP"
          value={Math.round(thisWeekTrimp)}
          trend={trimpTrend}
          trendLabel={
            lastWeekTrimp
              ? `vs ${Math.round(lastWeekTrimp)} last wk`
              : undefined
          }
          trendPositive
        />
      </div>

      {/* Weekly Load Chart */}
      <NeuCard className="mb-6">
        <h2 className="text-sm font-semibold text-neu-text mb-3">
          Weekly Training Load (TRIMP)
        </h2>
        <WeeklyLoadChart data={weeklyLoad} />
      </NeuCard>

      {/* Latest Run */}
      {latestRun && (
        <NeuCard
          className="mb-6"
          onClick={() => router.push(`/runs/${latestRun.id}`)}
        >
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-sm font-semibold text-neu-text">Last Run</h2>
            <NeuBadge type={latestRun.runType ?? "unknown"} />
          </div>
          <p className="text-neu-text-muted text-xs mb-3">
            {formatDate(latestRun.startDate)} · {latestRun.name}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="neu-inset rounded-xl p-2 text-center">
              <p className="text-lg font-bold text-neu-text">
                {formatDistance(latestRun.distance).replace(" km", "")}
              </p>
              <p className="text-[10px] text-neu-text-muted">km</p>
            </div>
            <div className="neu-inset rounded-xl p-2 text-center">
              <p className="text-lg font-bold text-neu-text">
                {formatPace(latestRun.distance, latestRun.movingTime)}
              </p>
              <p className="text-[10px] text-neu-text-muted">/km</p>
            </div>
            <div className="neu-inset rounded-xl p-2 text-center">
              <p className="text-lg font-bold text-neu-text">
                {latestRun.avgHr ?? "—"}
              </p>
              <p className="text-[10px] text-neu-text-muted">bpm</p>
            </div>
          </div>
        </NeuCard>
      )}

      {/* Recent runs list */}
      {activities.length > 0 && (
        <NeuCard>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neu-text">Recent Runs</h2>
            <button
              onClick={() => router.push("/runs")}
              className="text-xs text-indigo-500 font-medium"
            >
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {activities.slice(1).map((act: any) => (
              <div
                key={act.id}
                onClick={() => router.push(`/runs/${act.id}`)}
                className="flex items-center justify-between py-2 border-b border-[var(--neu-shadow-dark)] border-opacity-30 last:border-0 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <NeuBadge type={act.runType ?? "unknown"} />
                  <span className="text-xs text-neu-text-muted">
                    {formatDate(act.startDate)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neu-text">
                  <span>{formatDistance(act.distance)}</span>
                  <span className="text-neu-text-muted">
                    {formatPace(act.distance, act.movingTime)}/km
                  </span>
                </div>
              </div>
            ))}
          </div>
        </NeuCard>
      )}

      {activities.length === 0 && (
        <div className="neu-inset rounded-2xl p-8 text-center text-neu-text-muted text-sm">
          No runs yet. Connect with Strava to import your activities.
        </div>
      )}

      <Nav />
    </div>
  );
}
