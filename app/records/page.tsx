"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuStatCard } from "@/components/ui/NeuStatCard";
import { VDOTChart } from "@/components/charts/VDOTChart";
import { Nav } from "@/components/Nav";
import { formatTime, formatDate } from "@/lib/utils";
import { predictRaceTime } from "@/lib/metrics/vdot";

const DISPLAY_ORDER = ["400m", "1k", "1 mile", "5k", "10k", "Half-Marathon", "Marathon"];

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/records")
      .then((r) => r.json())
      .then((data) => {
        if (data.error === "Unauthorized") {
          router.push("/");
          return;
        }
        setRecords(data.records ?? {});
        setLoading(false);
      });
  }, [router]);

  const bestVDOT =
    Object.values(records)
      .flatMap((r: any) => r.history ?? [])
      .reduce((best: number, h: any) => Math.max(best, h.vdot ?? 0), 0) || null;

  const selectedRecord = selected ? records[selected] : null;

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
      <h1 className="text-2xl font-bold text-neu-text mb-2">Personal Records</h1>
      {bestVDOT && (
        <p className="text-xs text-neu-text-muted mb-6">
          Best VDOT: <span className="font-bold text-indigo-600">{bestVDOT.toFixed(1)}</span>
        </p>
      )}

      {/* PR Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {DISPLAY_ORDER.map((name) => {
          const rec = records[name];
          if (!rec?.pb) return null;
          const isSelected = selected === name;
          return (
            <div
              key={name}
              onClick={() => setSelected(isSelected ? null : name)}
              className={`rounded-2xl p-3 cursor-pointer transition-all ${
                isSelected ? "neu-inset" : "neu-raised"
              }`}
            >
              <p className="text-xs font-semibold text-neu-text-muted mb-1">{name}</p>
              <p className="text-xl font-bold text-neu-text">
                {formatTime(rec.pb.elapsedTime)}
              </p>
              <p className="text-[11px] text-neu-text-muted mt-0.5">
                {formatDate(rec.pb.startDate)}
              </p>
              {rec.pb.vdot && (
                <p className="text-[11px] text-indigo-500 mt-0.5">
                  VDOT {rec.pb.vdot.toFixed(1)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(records).length === 0 && (
        <div className="neu-inset rounded-2xl p-8 text-center text-neu-text-muted text-sm mb-6">
          No records yet. Sync your activities to see personal bests.
        </div>
      )}

      {/* Selected distance progression */}
      {selectedRecord && selected && (
        <NeuCard className="mb-6">
          <h2 className="text-sm font-semibold text-neu-text mb-1">
            {selected} Progression
          </h2>
          <p className="text-xs text-neu-text-muted mb-3">
            {selectedRecord.history?.length} efforts recorded
          </p>
          <VDOTChart
            data={selectedRecord.history?.map((h: any) => ({
              startDate: h.startDate,
              vdot: h.vdot,
            })) ?? []}
            distanceName={selected}
          />
        </NeuCard>
      )}

      {/* Race Predictions */}
      {bestVDOT && (
        <NeuCard inset>
          <h2 className="text-sm font-semibold text-neu-text mb-3">
            Race Predictions (VDOT {bestVDOT.toFixed(1)})
          </h2>
          <div className="space-y-2">
            {[
              { name: "5k", meters: 5000 },
              { name: "10k", meters: 10000 },
              { name: "Half Marathon", meters: 21097 },
              { name: "Marathon", meters: 42195 },
            ].map(({ name, meters }) => {
              const predicted = predictRaceTime(bestVDOT, meters);
              return (
                <div
                  key={name}
                  className="flex justify-between items-center py-1.5 border-b border-[var(--neu-shadow-dark)] border-opacity-20 last:border-0"
                >
                  <span className="text-xs text-neu-text">{name}</span>
                  <span className="text-xs font-bold text-indigo-600">
                    {formatTime(Math.round(predicted))}
                  </span>
                </div>
              );
            })}
          </div>
        </NeuCard>
      )}

      <Nav />
    </div>
  );
}
