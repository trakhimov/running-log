"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuStatCard } from "@/components/ui/NeuStatCard";
import { CardiacEfficiencyChart } from "@/components/charts/CardiacEfficiencyChart";
import { VDOTChart } from "@/components/charts/VDOTChart";
import { Nav } from "@/components/Nav";

export default function FitnessPage() {
  const router = useRouter();
  const [ceData, setCeData] = useState<any[]>([]);
  const [records, setRecords] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/metrics/cardiac-efficiency?limit=60").then((r) => r.json()),
      fetch("/api/records").then((r) => r.json()),
    ]).then(([ceRes, recRes]) => {
      if (ceRes.error === "Unauthorized") {
        router.push("/");
        return;
      }
      setCeData(ceRes.data ?? []);
      setRecords(recRes.records ?? {});
      setLoading(false);
    });
  }, [router]);

  // Build VDOT time series from records
  const vdotData = Object.entries(records as Record<string, any>)
    .flatMap(([name, rec]: [string, any]) =>
      (rec.history ?? []).map((h: any) => ({
        startDate: h.startDate,
        vdot: h.vdot,
        distanceName: name,
      }))
    )
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

  // Current CE
  const latestCE =
    ceData.length > 0
      ? ceData[ceData.length - 1].cardiacEfficiency
      : null;

  // Best VDOT
  const bestVDOT =
    vdotData.length > 0
      ? Math.max(...vdotData.map((d) => d.vdot))
      : null;

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
      <h1 className="text-2xl font-bold text-neu-text mb-6">Fitness Trend</h1>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <NeuStatCard
          label="Current CE"
          value={latestCE ? latestCE.toFixed(4) : "—"}
          unit=""
        />
        <NeuStatCard
          label="Best VDOT"
          value={bestVDOT ? bestVDOT.toFixed(1) : "—"}
          unit=""
        />
      </div>

      {/* CE Chart */}
      <NeuCard className="mb-6">
        <h2 className="text-sm font-semibold text-neu-text mb-1">
          Cardiac Efficiency (easy runs)
        </h2>
        <p className="text-xs text-neu-text-muted mb-3">
          Lower value = faster pace at lower HR = better fitness
        </p>
        <CardiacEfficiencyChart data={ceData} />
      </NeuCard>

      {/* VDOT Chart */}
      <NeuCard className="mb-6">
        <h2 className="text-sm font-semibold text-neu-text mb-1">
          VDOT Progression
        </h2>
        <p className="text-xs text-neu-text-muted mb-3">
          Derived from best effort times at 1k, 1 mile, 5k, 10k
        </p>
        <VDOTChart data={vdotData} />
      </NeuCard>

      {/* CE explanation */}
      <NeuCard inset>
        <h3 className="text-xs font-semibold text-neu-text mb-2">
          What is Cardiac Efficiency?
        </h3>
        <p className="text-xs text-neu-text-muted leading-relaxed">
          CE = pace (min/km) ÷ average HR. A lower number means you&apos;re
          running faster at a lower heart rate — the hallmark of aerobic
          fitness. Track this over easy runs to see fitness gains that don&apos;t
          show up as faster times.
        </p>
      </NeuCard>

      <Nav />
    </div>
  );
}
