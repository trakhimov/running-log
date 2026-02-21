"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { NeuButton } from "@/components/ui/NeuButton";
import { Nav } from "@/components/Nav";
import { formatDistance, formatPace, formatDate, formatDuration } from "@/lib/utils";
import { RunType } from "@/lib/metrics/runType";

const RUN_TYPE_FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "long", label: "Long" },
  { value: "tempo", label: "Tempo" },
  { value: "interval", label: "Interval" },
  { value: "race", label: "Race" },
];

export default function RunsPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });
    if (filter) params.set("runType", filter);

    fetch(`/api/activities?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error === "Unauthorized") {
          router.push("/");
          return;
        }
        setActivities(data.activities ?? []);
        setPagination(data.pagination);
        setLoading(false);
      });
  }, [page, filter, router]);

  function handleFilter(value: string) {
    setFilter(value);
    setPage(1);
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-neu-text mb-4">Run Log</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {RUN_TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilter(f.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f.value
                ? "neu-inset text-indigo-600"
                : "neu-raised text-neu-text-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="neu-raised rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="neu-inset rounded-2xl p-8 text-center text-neu-text-muted text-sm">
          No runs found.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((act: any) => (
            <NeuCard
              key={act.id}
              onClick={() => router.push(`/runs/${act.id}`)}
              className="cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-semibold text-neu-text">{act.name}</p>
                  <p className="text-[11px] text-neu-text-muted">
                    {formatDate(act.startDate)}
                  </p>
                </div>
                <NeuBadge type={act.runType ?? "unknown"} />
              </div>
              <div className="grid grid-cols-4 gap-1">
                <div className="text-center">
                  <p className="text-sm font-bold text-neu-text">
                    {act.distance ? (act.distance / 1000).toFixed(1) : "—"}
                  </p>
                  <p className="text-[9px] text-neu-text-muted">km</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-neu-text">
                    {formatPace(act.distance, act.movingTime)}
                  </p>
                  <p className="text-[9px] text-neu-text-muted">/km</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-neu-text">
                    {act.avgHr ?? "—"}
                  </p>
                  <p className="text-[9px] text-neu-text-muted">bpm</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-neu-text">
                    {act.cardiacEfficiency
                      ? act.cardiacEfficiency.toFixed(3)
                      : "—"}
                  </p>
                  <p className="text-[9px] text-neu-text-muted">CE</p>
                </div>
              </div>
            </NeuCard>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <NeuButton
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </NeuButton>
          <span className="text-xs text-neu-text-muted">
            {page} / {pagination.pages}
          </span>
          <NeuButton
            size="sm"
            disabled={page === pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </NeuButton>
        </div>
      )}

      <Nav />
    </div>
  );
}
