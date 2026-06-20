"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { ThreatMap } from "@/components/dashboard/threat-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { api, Threat, ConsultedScan, DarkWebItem, DashboardKpis, ChartData, CrackedLeak, HackreadArticle } from "@/lib/api";

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
  const [cracked, setCracked] = useState<CrackedLeak[]>([]);
  const [hackread, setHackread] = useState<HackreadArticle[]>([]);
  const [crackedPage, setCrackedPage] = useState(1);
  const [hackreadPage, setHackreadPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    Promise.all([
      api.dashboardKpis(),
      api.dashboardCharts(),
      api.threats(),
      api.consulted(),
      api.darkweb(),
      api.breachesRecent(),
      api.crackedLeaks().catch(() => []),
      api.hackreadNews().catch(() => []),
    ]).then(([k, c, t, cons, dw, br, cr, hr]) => {
      setKpis(k);
      setCharts(c);
      setThreats(t);
      setConsulted(cons);
      setDarkweb(dw.items);
      setCracked(cr);
      setHackread(hr);
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

        {threats.length > 0 && (
          <Card className="mt-4">
            <CardHeader><CardTitle>Mapa de incidentes (Leaflet)</CardTitle></CardHeader>
            <CardContent><ThreatMap threats={threats} /></CardContent>
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

        <Card className="mt-6 overflow-x-auto">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              Live Monitor: Cracked Forum (Other Leaks)
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="text-slate-500 border-b border-slate-800">
                <tr>
                  {["Título de Hilo", "Autor", "Publicado", "Respuestas", "Vistas"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!cracked.length && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-500">
                      Cargando hilos recientes o sesión expirada...
                    </td>
                  </tr>
                )}
                {cracked.slice((crackedPage - 1) * itemsPerPage, crackedPage * itemsPerPage).map((item, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-semibold text-cyan-400">
                      {item.title}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{item.author}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{item.date}</td>
                    <td className="px-4 py-3 font-mono text-center text-slate-400">{item.replies}</td>
                    <td className="px-4 py-3 font-mono text-center text-slate-400">{item.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cracked.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-xs">
                <span className="text-slate-400">
                  Mostrando <strong className="text-cyan-400">{(crackedPage - 1) * itemsPerPage + 1}</strong> a <strong className="text-cyan-400">{Math.min(crackedPage * itemsPerPage, cracked.length)}</strong> de <strong className="text-cyan-400">{cracked.length}</strong> hilos
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={crackedPage === 1}
                    onClick={() => setCrackedPage((prev) => Math.max(prev - 1, 1))}
                    className="px-3 py-1 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded transition-colors border border-slate-800"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1 text-slate-400 font-mono">
                    Pág. {crackedPage} de {Math.ceil(cracked.length / itemsPerPage) || 1}
                  </span>
                  <button
                    disabled={crackedPage === (Math.ceil(cracked.length / itemsPerPage) || 1)}
                    onClick={() => setCrackedPage((prev) => Math.min(prev + 1, Math.ceil(cracked.length / itemsPerPage) || 1))}
                    className="px-3 py-1 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded transition-colors border border-slate-800"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 overflow-x-auto">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              Live Monitor: Hackread News
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="text-slate-500 border-b border-slate-800">
                <tr>
                  {["Título del Artículo", "Autor", "Publicado", "Categoría"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!hackread.length && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-500">
                      Cargando noticias de Hackread o sesión expirada...
                    </td>
                  </tr>
                )}
                {hackread.slice((hackreadPage - 1) * itemsPerPage, hackreadPage * itemsPerPage).map((item, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-semibold text-cyan-400">
                      {item.title}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{item.author}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{item.date}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{item.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hackread.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-xs">
                <span className="text-slate-400">
                  Mostrando <strong className="text-cyan-400">{(hackreadPage - 1) * itemsPerPage + 1}</strong> a <strong className="text-cyan-400">{Math.min(hackreadPage * itemsPerPage, hackread.length)}</strong> de <strong className="text-cyan-400">{hackread.length}</strong> artículos
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={hackreadPage === 1}
                    onClick={() => setHackreadPage((prev) => Math.max(prev - 1, 1))}
                    className="px-3 py-1 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded transition-colors border border-slate-800"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1 text-slate-400 font-mono">
                    Pág. {hackreadPage} de {Math.ceil(hackread.length / itemsPerPage) || 1}
                  </span>
                  <button
                    disabled={hackreadPage === (Math.ceil(hackread.length / itemsPerPage) || 1)}
                    onClick={() => setHackreadPage((prev) => Math.min(prev + 1, Math.ceil(hackread.length / itemsPerPage) || 1))}
                    className="px-3 py-1 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded transition-colors border border-slate-800"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader><CardTitle>Filtraciones consultadas</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2 max-h-64 overflow-y-auto">
              {!consulted.length && <p className="text-slate-500">Sin consultas aún.</p>}
              {consulted.map((s, i) => (
                <div key={i} className="flex justify-between border-b border-slate-800/40 py-2">
                  <div className="flex flex-col truncate pr-2">
                    <span className="truncate text-slate-200 font-medium">
                      {s.query && s.query !== s.searchType ? s.query : s.searchType}
                    </span>
                    {s.query && s.query !== s.searchType && (
                      <span className="text-[10px] text-slate-500">{s.searchType}</span>
                    )}
                  </div>
                  <span className="font-mono text-cyan-400 self-center">{s.riskScore}%</span>
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
