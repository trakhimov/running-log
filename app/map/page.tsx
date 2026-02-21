"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Nav } from "@/components/Nav";

const RouteHeatmap = dynamic(
  () => import("@/components/maps/RouteHeatmap").then((m) => m.RouteHeatmap),
  { ssr: false }
);

export default function MapPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Fetch all activities with polylines
    fetch("/api/activities?limit=200")
      .then((r) => r.json())
      .then((data) => {
        if (data.error === "Unauthorized") {
          router.push("/");
          return;
        }
        const withPolylines = (data.activities ?? []).filter(
          (a: any) => a.mapPolyline
        );
        setRoutes(
          withPolylines.map((a: any) => ({
            polyline: a.mapPolyline,
            date: a.startDate,
          }))
        );
        setTotal(data.activities?.length ?? 0);
        setLoading(false);
      });
  }, [router]);

  return (
    <div className="min-h-screen pb-24 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold text-neu-text">Route Map</h1>
        <p className="text-xs text-neu-text-muted mt-1">
          {routes.length} routes shown · opacity weighted by recency
        </p>
      </div>

      {/* Full-height map */}
      <div className="flex-1 px-4 pb-2 max-w-lg mx-auto w-full" style={{ minHeight: 450 }}>
        {loading ? (
          <div className="neu-inset rounded-2xl h-full flex items-center justify-center text-neu-text-muted animate-pulse">
            Loading map…
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ height: "100%", minHeight: 450 }}>
            <RouteHeatmap routes={routes} zoom={12} />
          </div>
        )}
      </div>

      <Nav />
    </div>
  );
}
