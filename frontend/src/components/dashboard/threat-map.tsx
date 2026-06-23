"use client";

import dynamic from "next/dynamic";

export const ThreatMap = dynamic(
  () => import("./threat-map-inner").then((mod) => mod.ThreatMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 bg-[#111] rounded-lg animate-pulse flex items-center justify-center text-neutral-600 text-sm">
        Cargando mapa...
      </div>
    ),
  }
);

export type { ThreatMapItem } from "./threat-map-inner";
