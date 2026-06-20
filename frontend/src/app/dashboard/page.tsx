"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { ThreatMap } from "@/components/dashboard/threat-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { api, Threat, ConsultedScan, DarkWebItem, DashboardKpis, ChartData } from "@/lib/api";

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold text-cyan-400 font-mono">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [consulted, setConsulted] = useState<ConsultedScan[]>([]);
  const [darkweb, setDarkweb] = useState<DarkWebItem[]>([]);
  const [recent, setRecent] = useState<Array<{ name: string; year: string; records?: string }>>([]);

  useEffect(() => {
    Promise.all([
      api.dashboardKpis(),
      api.dashboardCharts(),
      api.threats(),
      api.consulted(),
      api.darkweb(),
      api.breachesRecent(),
    ]).then(([k, c, t, cons, dw, br]) => {
      setKpis(k);
      setCharts(c);
      setThreats(t);
      setConsulted(cons);
      setDarkweb(dw.items);
      const list = Array.isArray(br.breaches) ? br.breaches : (br.breaches as { exposedBreaches?: unknown[] })?.exposedBreaches || [];
      setRecent(
        (list as Array<Record<string, unknown>>)
          .slice(0, 10)
          .map((item) => ({
            name: String(item.breachID || item.breach_name || "—"),
            year: String(item.breachedDate || item.breach_date || "—").slice(0, 10),
            records: item.exposedRecords ? `${((item.exposedRecords as number) / 1e6).toFixed(1)}M reg.` : undefined,
          }))
      );
    });
  }, []);

  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="text-2xl font-bold mb-6">Threat Intelligence Dashboard</h1>

        {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <Kpi label="Amenazas hoy" value={kpis.threatsToday} />
            <Kpi label="Críticas" value={kpis.critical} />
            <Kpi label="Verificadas" value={kpis.verified} />
            <Kpi label="Pendientes" value={kpis.pending} />
            <Kpi label="Actores" value={kpis.actors} />
            <Kpi label="Sectores" value={kpis.sectors} />
          </div>
        )}

        {charts && <DashboardCharts data={charts} />}

        {charts && (
          <Card className="mt-4">
            <CardHeader><CardTitle>Mapa de incidentes (Leaflet)</CardTitle></CardHeader>
            <CardContent><ThreatMap geo={charts.geo} /></CardContent>
          </Card>
        )}

        <Card className="mt-6 overflow-x-auto">
          <CardHeader><CardTitle>Feed de amenazas</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="text-slate-500 border-b border-slate-800">
                <tr>
                  {["Fecha", "Actor", "Víctima", "Sector", "Riesgo", "Conf.", "Estado", "Verif."].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {threats.map((t) => (
                  <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-mono text-slate-400">{t.date}</td>
                    <td className="px-4 py-3"><Link href={`/threats/${t.id}`} className="text-cyan-400 hover:underline">{t.actor}</Link></td>
                    <td className="px-4 py-3">{t.victim}</td>
                    <td className="px-4 py-3 text-slate-400">{t.sector}</td>
                    <td className="px-4 py-3 font-mono font-bold text-center">{t.riskScore}</td>
                    <td className="px-4 py-3 font-mono text-center text-slate-400">{t.confidence}%</td>
                    <td className="px-4 py-3"><Badge className={statusBadge(t.status)}>{t.status}</Badge></td>
                    <td className="px-4 py-3"><Badge className={statusBadge(t.verificationStatus)}>{t.verificationStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader><CardTitle>Filtraciones consultadas</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2 max-h-64 overflow-y-auto">
              {!consulted.length && <p className="text-slate-500">Sin consultas aún.</p>}
              {consulted.map((s, i) => (
                <div key={i} className="flex justify-between border-b border-slate-800/40 py-2">
                  <span className="truncate">{s.searchType}</span>
                  <span className="font-mono text-cyan-400">{s.riskScore}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Dark Web / Foros</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2 max-h-64 overflow-y-auto">
              {darkweb.map((d, i) => (
                <div key={i} className="border-b border-slate-800/40 py-2">
                  <div className="text-red-300 font-semibold">{d.forum}</div>
                  <div>{d.title}</div>
                  <div className="text-slate-500">{d.indicator}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Filtraciones públicas recientes</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2 max-h-64 overflow-y-auto">
              {!recent.length && <p className="text-slate-500">Índice no disponible.</p>}
              {recent.map((r, i) => (
                <div key={i} className="flex justify-between border-b border-slate-800/40 py-2">
                  <span className="truncate">{r.name}</span>
                  <span className="text-slate-500 font-mono">{r.year}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
