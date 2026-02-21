"use client";

import { useEffect, useRef } from "react";

interface RouteData {
  polyline: string;
  date: Date | string;
}

interface Props {
  routes: RouteData[];
  center?: [number, number];
  zoom?: number;
  singleRoute?: boolean;
}

export function RouteHeatmap({
  routes,
  center,
  zoom = 13,
  singleRoute = false,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || routes.length === 0) return;

    // Dynamically import Leaflet (client-only)
    import("leaflet").then((L) => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      // Decode polyline
      const decodePolyline = (encoded: string): [number, number][] => {
        const points: [number, number][] = [];
        let index = 0;
        let lat = 0;
        let lng = 0;

        while (index < encoded.length) {
          let shift = 0;
          let result = 0;
          let byte: number;
          do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
          } while (byte >= 0x20);
          const dlat = result & 1 ? ~(result >> 1) : result >> 1;
          lat += dlat;

          shift = 0;
          result = 0;
          do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
          } while (byte >= 0x20);
          const dlng = result & 1 ? ~(result >> 1) : result >> 1;
          lng += dlng;

          points.push([lat / 1e5, lng / 1e5]);
        }

        return points;
      };

      // Decode all routes and find center
      const allLines: { points: [number, number][]; date: Date }[] = [];
      const now = new Date();

      for (const route of routes) {
        if (!route.polyline) continue;
        const points = decodePolyline(route.polyline);
        if (points.length > 1) {
          allLines.push({ points, date: new Date(route.date) });
        }
      }

      if (allLines.length === 0) return;

      // Find map center
      let mapCenter: [number, number];
      if (center) {
        mapCenter = center;
      } else {
        const allPoints = allLines.flatMap((l) => l.points);
        const avgLat = allPoints.reduce((s, p) => s + p[0], 0) / allPoints.length;
        const avgLng = allPoints.reduce((s, p) => s + p[1], 0) / allPoints.length;
        mapCenter = [avgLat, avgLng];
      }

      const map = L.map(mapRef.current!, {
        center: mapCenter,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Add attribution in corner
      L.control.attribution({ prefix: false }).addTo(map);

      // Draw polylines with recency-based opacity
      for (const line of allLines) {
        const daysSince =
          (now.getTime() - line.date.getTime()) / (1000 * 60 * 60 * 24);
        const opacity = singleRoute ? 0.85 : Math.max(0.15, 1 - daysSince / 365);

        L.polyline(line.points, {
          color: "#6366f1",
          weight: singleRoute ? 4 : 2.5,
          opacity,
        }).addTo(map);
      }

      // Fit to routes if multiple
      if (!singleRoute && allLines.length > 1) {
        const allPoints = allLines.flatMap((l) => l.points);
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [20, 20] });
      }

      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [routes, center, zoom, singleRoute]);

  if (routes.length === 0) {
    return (
      <div className="neu-inset rounded-2xl flex items-center justify-center h-48 text-neu-text-muted text-sm">
        No routes to display
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={mapRef}
        className="rounded-2xl overflow-hidden"
        style={{ height: "100%", minHeight: "300px" }}
      />
    </>
  );
}
