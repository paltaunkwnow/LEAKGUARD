"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useLang } from "@/contexts/language-context";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Map, Activity } from "lucide-react";

export type ThreatMapItem = {
  id: string;
  date: string;
  actor: string;
  victim: string;
  sector: string;
  country: string;
  riskScore: number;
  status: string;
};

type Props = { threats: ThreatMapItem[]; countryFilter?: string };

const COORDS: Record<string, [number, number]> = {
  "United States": [39.8283, -98.5795],
  "United Kingdom": [55.3781, -3.436],
  Canada: [56.1304, -106.3468],
  Singapore: [1.3521, 103.8198],
  Germany: [51.1657, 10.4515],
  Australia: [-25.2744, 133.7751],
  Argentina: [-38.4161, -63.6167],
  Chile: [-35.6751, -71.543],
  Bolivia: [-16.2902, -63.5887],
  Brazil: [-14.235, -51.9253],
  Peru: [-9.19, -75.0152],
  Colombia: [4.5709, -74.2973],
  Mexico: [23.6345, -102.5528],
  Uruguay: [-32.5228, -55.7658],
  Paraguay: [-23.4425, -58.4438],
  Venezuela: [6.4238, -66.5897],
  Ecuador: [-1.8312, -78.1834],
};

const LATAM_BREACHES: ThreatMapItem[] = [
  { id: "latam-ar-1", date: "2025-11-14", actor: "IntelBroker", victim: "RENAPER Argentina", sector: "Gobierno", country: "Argentina", riskScore: 95, status: "Critical" },
  { id: "latam-ar-2", date: "2025-08-22", actor: "Desconocido", victim: "PAMI Argentina", sector: "Salud", country: "Argentina", riskScore: 88, status: "Critical" },
  { id: "latam-ar-3", date: "2024-12-10", actor: "Rhysida", victim: "Banco Nación Argentina", sector: "Finanzas", country: "Argentina", riskScore: 82, status: "High" },
  { id: "latam-cl-1", date: "2025-09-05", actor: "Medusa Locker", victim: "Poder Judicial Chile", sector: "Justicia", country: "Chile", riskScore: 91, status: "Critical" },
  { id: "latam-cl-2", date: "2025-05-18", actor: "LockBit 3.0", victim: "Carabineros de Chile", sector: "Seguridad", country: "Chile", riskScore: 87, status: "Critical" },
  { id: "latam-cl-3", date: "2024-11-02", actor: "Desconocido", victim: "Falabella Chile", sector: "Retail", country: "Chile", riskScore: 74, status: "High" },
  { id: "latam-bo-1", date: "2025-07-30", actor: "GhostSec", victim: "Aduana Nacional Bolivia", sector: "Gobierno", country: "Bolivia", riskScore: 79, status: "High" },
  { id: "latam-bo-2", date: "2025-03-14", actor: "Desconocido", victim: "SEGIP Bolivia", sector: "Identidad", country: "Bolivia", riskScore: 83, status: "High" },
  { id: "latam-br-1", date: "2025-10-19", actor: "N4aughtySec", victim: "Receita Federal Brasil", sector: "Gobierno", country: "Brazil", riskScore: 93, status: "Critical" },
  { id: "latam-co-1", date: "2025-06-11", actor: "RansomHub", victim: "Supersalud Colombia", sector: "Salud", country: "Colombia", riskScore: 85, status: "Critical" },
  { id: "latam-mx-1", date: "2025-08-03", actor: "Scattered Spider", victim: "SAT México", sector: "Finanzas", country: "Mexico", riskScore: 89, status: "Critical" },
  { id: "latam-pe-1", date: "2025-04-22", actor: "Desconocido", victim: "Banco de la Nación Perú", sector: "Finanzas", country: "Peru", riskScore: 76, status: "High" },
];

const STATUS_COLOR: Record<string, { color: string; fill: string }> = {
  Critical: { color: "#f43f5e", fill: "#e11d48" },
  High:     { color: "#fb923c", fill: "#ea580c" },
  Medium:   { color: "#facc15", fill: "#ca8a04" },
  Low:      { color: "#22d3ee", fill: "#0891b2" },
};

const STATUS_LABEL: Record<string, string> = {
  Critical: "CRITICAL",
  High:     "HIGH",
  Medium:   "MEDIUM",
  Low:      "LOW",
};

// Threat actors coordinates for the simulator
const ACTOR_COORDS: Record<string, [number, number]> = {
  "Lazarus Group (APT38)": [40.3399, 127.5101], // North Korea
  "LockBit 3.0 RaaS": [55.7558, 37.6173],     // Russia
  "Volt Typhoon APT": [39.9042, 116.4074],    // China
  "ShinyHunters": [48.8566, 2.3522],          // Western Europe
  "Storm-0811": [50.1109, 8.6821],            // Central Europe
  "BlackCat / ALPHV": [61.5240, 105.3188],    // Northern Russia
  "Volt Typhoon (OT targeting)": [31.2304, 121.4737], // Shanghai
};

type SimulatedAttack = {
  id: string;
  time: string;
  actor: string;
  victimCountry: string;
  victimSector: string;
  victimOrg: string;
  attackType: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  riskScore: number;
  status: string;
  color: string;
};

export function ThreatMapInner({ threats, countryFilter }: Props) {
  const { t } = useLang();
  const [mapMode, setMapMode] = useState<"incidents" | "simulator">("incidents");
  const [attacks, setAttacks] = useState<SimulatedAttack[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Remount center settings
  const getCenter = (): { center: [number, number]; zoom: number } => {
    if (countryFilter && COORDS[countryFilter]) {
      return { center: COORDS[countryFilter], zoom: 5 };
    }
    return { center: [-18, -65], zoom: 3 };
  };

  const { center, zoom } = getCenter();

  // Combine static seeded threats
  const combined = useMemo(() => {
    const apiIds = new Set(threats.map((item) => item.id));
    return [
      ...threats,
      ...LATAM_BREACHES.filter((b) => !apiIds.has(b.id)),
    ];
  }, [threats]);

  const visibleIncidents = useMemo(() => {
    return countryFilter
      ? combined.filter((item) => item.country === countryFilter)
      : combined;
  }, [combined, countryFilter]);

  // Cyber attack simulator loop using real data
  useEffect(() => {
    if (mapMode !== "simulator" || combined.length === 0) return;

    const mapThreat = (item: ThreatMapItem): SimulatedAttack => {
      const targetCountry = item.country || "Argentina";
      const toCoords = COORDS[targetCountry] || COORDS["Argentina"];

      const actorName = item.actor || "Desconocido";
      let fromCoords: [number, number] = [55.7558, 37.6173]; // Default to Russia

      const knownActorKey = Object.keys(ACTOR_COORDS).find(
        (key) => key.toLowerCase().includes(actorName.toLowerCase()) || actorName.toLowerCase().includes(key.toLowerCase())
      );
      if (knownActorKey) {
        fromCoords = ACTOR_COORDS[knownActorKey];
      } else {
        const actorKeys = Object.keys(ACTOR_COORDS);
        const randomActorKey = actorKeys[Math.floor(Math.random() * actorKeys.length)];
        fromCoords = ACTOR_COORDS[randomActorKey];
      }

      let attackType = "Credential Leak Exfiltration";
      if (item.sector === "Salud") {
        attackType = "Ransomware payload execution";
      } else if (item.sector === "Gobierno" || item.sector === "Justicia") {
        attackType = "Active Directory extraction";
      } else if (item.sector === "Finanzas") {
        attackType = "SWIFT Transaction Bypass";
      } else if (item.sector === "Energía" || item.sector === "Infraestructura") {
        attackType = "OT SCADA credential exfiltration";
      } else {
        if (item.riskScore >= 90) {
          attackType = "Ransomware payload execution";
        } else if (item.riskScore >= 80) {
          attackType = "API Configuration Leak";
        } else {
          attackType = "DDoS Flood attack";
        }
      }

      const col = STATUS_COLOR[item.status] ?? STATUS_COLOR.Low;
      const now = new Date();
      // subtract random seconds to make initial attacks look like they happened recently
      const randSecs = Math.floor(Math.random() * 300);
      const timeDate = new Date(now.getTime() - randSecs * 1000);
      const timeStr = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      return {
        id: `sim-${item.id}-${Math.random()}`,
        time: timeStr,
        actor: item.actor || "Desconocido",
        victimCountry: targetCountry,
        victimSector: item.sector || "Varios",
        victimOrg: item.victim || "Organización",
        attackType,
        fromCoords,
        toCoords,
        riskScore: item.riskScore,
        status: item.status,
        color: col.color,
      };
    };

    // Pre-populate with initial attacks
    const initialAttacks: SimulatedAttack[] = [];
    const count = Math.min(combined.length, 4);
    const shuffled = [...combined].sort(() => 0.5 - Math.random());
    for (let i = 0; i < count; i++) {
      initialAttacks.push(mapThreat(shuffled[i]));
    }
    setAttacks(initialAttacks);

    const interval = setInterval(() => {
      const randomItem = combined[Math.floor(Math.random() * combined.length)];
      const attack = mapThreat(randomItem);
      const now = new Date();
      attack.time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setAttacks((prev) => [attack, ...prev.slice(0, 7)]);
      if (tickerRef.current) {
        tickerRef.current.scrollTop = 0;
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [mapMode, combined]);

  return (
    <div className="space-y-4">
      {/* Selector controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 p-1 bg-[#0a0a0a]/60 border border-white/8 rounded-xl">
          <button
            onClick={() => setMapMode("incidents")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
              mapMode === "incidents"
                ? "bg-[#1a1a1a] text-white shadow-md shadow-black/25"
                : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            <Map className="w-3.5 h-3.5" />
            Mapa de Incidentes (LATAM)
          </button>
          <button
            onClick={() => setMapMode("simulator")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
              mapMode === "simulator"
                ? "bg-[#1a1a1a] text-white shadow-md shadow-black/25"
                : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            <Activity className="w-3.5 h-3.5 animate-pulse text-rose-500" />
            Ciberataques en Vivo
          </button>
        </div>

        <div className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase">
          {mapMode === "incidents" ? "Database Feed Mode" : "OSINT Cyber Threat Stream"}
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        key={`${countryFilter || "all"}-${mapMode}`} // remount on mode/filter change
        center={center}
        zoom={zoom}
        className="h-80 w-full rounded-lg z-0 border border-white/8/80"
        style={{ background: "#0f172a" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
        />

        {/* ── Incidents Map View ── */}
        {mapMode === "incidents" && visibleIncidents.map((item, idx) => {
          const base = COORDS[item.country];
          if (!base) return null;
          const latJ = Math.sin(idx * 1.5) * 1.0;
          const lngJ = Math.cos(idx * 1.5) * 1.0;
          const pos: [number, number] = [base[0] + latJ, base[1] + lngJ];
          const col = STATUS_COLOR[item.status] ?? STATUS_COLOR.Low;
          const radius = item.status === "Critical" ? 11 : item.status === "High" ? 8 : 6;

          return (
            <CircleMarker
              key={item.id || idx}
              center={pos}
              radius={radius}
              pathOptions={{ color: col.color, fillColor: col.fill, fillOpacity: 0.75, weight: 2 }}
            >
              <Popup>
                <div style={{ minWidth: 190, fontFamily: "sans-serif", background: "#0f172a", color: "#e2e8f0", borderRadius: 10, padding: 4 }}>
                  <div style={{ fontWeight: 700, color: "#22d3ee", borderBottom: "1px solid #1e293b", paddingBottom: 6, marginBottom: 8, fontSize: 13 }}>
                    {item.actor}
                  </div>
                  <div style={{ fontSize: 11, lineHeight: 1.9 }}>
                    <div><span style={{ color: "#94a3b8" }}>{t.map_victim}:</span> <strong style={{ color: "#fff" }}>{item.victim}</strong></div>
                    <div><span style={{ color: "#94a3b8" }}>{t.col_country}:</span> {item.country}</div>
                    <div><span style={{ color: "#94a3b8" }}>{t.col_sector}:</span> {item.sector}</div>
                    <div><span style={{ color: "#94a3b8" }}>{t.map_date}:</span> <span style={{ fontFamily: "monospace", color: "#cbd5e1" }}>{item.date}</span></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 6, borderTop: "1px solid #1e293b", fontSize: 10 }}>
                    <span style={{ background: "#1e293b", color: "#94a3b8", padding: "2px 7px", borderRadius: 4, fontFamily: "monospace", fontWeight: 700 }}>
                      {t.map_risk}: {item.riskScore}
                    </span>
                    <span style={{ fontWeight: 700, color: col.color }}>
                      {STATUS_LABEL[item.status] || item.status}
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* ── Cyber Attack Simulator View ── */}
        {mapMode === "simulator" && attacks.map((attack) => (
          <div key={attack.id}>
            {/* Origin Attacker Node */}
            <CircleMarker
              center={attack.fromCoords}
              radius={5}
              pathOptions={{ color: "#a855f7", fillColor: "#a855f7", fillOpacity: 0.9, weight: 1 }}
            >
              <Popup>
                <div className="text-xs p-1 text-neutral-200">
                  <strong className="text-purple-400">Origen de Amenaza (Actor)</strong>
                  <div className="mt-1 font-mono">{attack.actor}</div>
                </div>
              </Popup>
            </CircleMarker>

            {/* Destination Target Node */}
            <CircleMarker
              center={attack.toCoords}
              radius={8}
              pathOptions={{ color: attack.color, fillColor: attack.color, fillOpacity: 0.8, weight: 1.5 }}
            >
              <Popup>
                <div className="text-xs p-1 text-neutral-200">
                  <strong className="text-rose-400">Objetivo del Ataque (Víctima)</strong>
                  <div className="mt-1 font-mono">Organización: {attack.victimOrg}</div>
                  <div className="font-mono">País: {attack.victimCountry}</div>
                  <div className="font-mono">Sector: {attack.victimSector}</div>
                  <div className="font-mono">Ataque: {attack.attackType}</div>
                </div>
              </Popup>
            </CircleMarker>

            {/* Simulated Vector Path Line */}
            <Polyline
              positions={[attack.fromCoords, attack.toCoords]}
              pathOptions={{
                color: attack.color,
                weight: 1.5,
                opacity: 0.6,
                dashArray: "6, 8",
              }}
            />
          </div>
        ))}
      </MapContainer>

      {/* Attack stream log ticker for the simulator */}
      {mapMode === "simulator" && (
        <Card className="border-white/8 bg-[#0a0a0a]/40 overflow-hidden">
          <CardHeader className="py-2.5 px-4 border-b border-white/8/80 bg-[#111]/10 flex flex-row items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Flujo de Amenazas Detectadas en Tiempo Real</span>
          </CardHeader>
          <CardContent className="p-0">
            <div 
              ref={tickerRef} 
              className="max-h-28 overflow-y-auto divide-y divide-white/6 font-mono text-[10px] p-2 space-y-1.5 scrollbar-thin"
            >
              {attacks.map((attack) => (
                <div key={attack.id} className="flex flex-wrap items-center justify-between py-1.5 px-2 hover:bg-[#111]/30 transition-colors">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-neutral-500">[{attack.time}]</span>
                    <span className="text-purple-400 font-bold truncate max-w-[120px]" title={attack.actor}>{attack.actor}</span>
                    <span className="text-neutral-400">compromete a</span>
                    <span className="text-rose-400 font-bold truncate max-w-[140px]" title={attack.victimOrg}>{attack.victimOrg}</span>
                    <span className="text-neutral-400">({attack.victimSector})</span>
                    <span className="text-neutral-500">en</span>
                    <span className="text-white font-bold">{attack.victimCountry}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 mt-1 sm:mt-0">
                    <span className="text-neutral-400 text-[9px] bg-[#111] border border-white/8/60 px-1.5 py-0.2 rounded">
                      {attack.attackType}
                    </span>
                    <span 
                      className="font-bold px-1.5 py-0.2 rounded text-[9px]"
                      style={{ backgroundColor: `${attack.color}15`, color: attack.color, border: `1px solid ${attack.color}30` }}
                    >
                      {attack.riskScore}% RISK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
