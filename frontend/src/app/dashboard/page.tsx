"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Filter, X, ChevronDown, AlertTriangle, TrendingUp, Shield, Users, Activity, Globe, CheckCircle2, KeyRound } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { ThreatMap } from "@/components/dashboard/threat-map";
import { SecurityTips } from "@/components/dashboard/security-tips";
import { IntelSources } from "@/components/dashboard/intel-sources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { api, Threat, ConsultedScan, DarkWebItem, DashboardKpis, ChartData, CrackedLeak, HackreadArticle } from "@/lib/api";
import { useLang } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

/* ─── KPI Card ─────────────────────────────────────────────────── */
function Kpi({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <Card className="relative overflow-hidden group hover:border-white/10 transition-colors">
      <CardContent className="pt-5 pb-4">
        <div className={cn("text-2xl font-black font-mono mb-1", color)}>{value}</div>
        <div className="text-xs text-neutral-500 leading-tight">{label}</div>
        <div className={cn("absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity", color)}>
          <Icon className="w-10 h-10" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Select Filter ─────────────────────────────────────────────── */
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-white/10 bg-[#111] text-neutral-200 text-sm focus:outline-none focus:border-[#ff5722] hover:border-white/20 transition-colors cursor-pointer"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────────────────── */
function Pagination({
  page, total, perPage, onChange, prevLabel, nextLabel, pageLabel, ofLabel,
}: {
  page: number; total: number; perPage: number; onChange: (p: number) => void;
  prevLabel: string; nextLabel: string; pageLabel: string; ofLabel: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/8 text-xs">
      <span className="text-neutral-500 font-mono">{pageLabel} {page} {ofLabel} {totalPages}</span>
      <div className="flex gap-1.5">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1.5 rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-300 transition-colors text-xs"
        >{prevLabel}</button>
        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1.5 rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-300 transition-colors text-xs"
        >{nextLabel}</button>
      </div>
    </div>
  );
}

/* ─── Flag lookup (best-effort) ─────────────────────────────────── */
const COUNTRY_CODES: Record<string, string> = {
  Argentina: "AR", Chile: "CL", Bolivia: "BO", Brazil: "BR",
  Colombia: "CO", Mexico: "MX", Peru: "PE", Uruguay: "UY",
  "United States": "US", "United Kingdom": "GB", Canada: "CA",
  Germany: "DE", Singapore: "SG", Australia: "AU",
  Venezuela: "VE", Ecuador: "EC", Paraguay: "PY",
};

function countryFlag(c: string) { return COUNTRY_CODES[c] ?? "GL"; }

/* ─── Status badge colors ────────────────────────────────────────── */
const STATUS_DOT: Record<string, string> = {
  Critical: "bg-rose-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
};

/* ─── Dashboard Page ────────────────────────────────────────────── */
export default function DashboardPage() {
  const { t } = useLang();
  const { user, breachAlert, clearBreachAlert } = useAuth();
  const [showAlertModal, setShowAlertModal] = useState(false);

  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [consulted, setConsulted] = useState<ConsultedScan[]>([]);
  const [darkweb, setDarkweb] = useState<DarkWebItem[]>([]);
  const [recent, setRecent] = useState<Array<{ name: string; year: string }>>([]);
  const [cracked, setCracked] = useState<CrackedLeak[]>([]);
  const [hackread, setHackread] = useState<HackreadArticle[]>([]);

  // Filters
  const [countryFilter, setCountryFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [threatPage, setThreatPage] = useState(1);
  const [crackedPage, setCrackedPage] = useState(1);
  const [hackreadPage, setHackreadPage] = useState(1);
  const PER_PAGE = 5;
  const MINI_PER_PAGE = 3;

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.dashboardKpis(),
      api.dashboardCharts(),
      api.threats(),
      api.consulted(),
      api.darkweb(),
      api.breachesRecent(),
      api.crackedLeaks().catch(() => []),
      api.hackreadNews().catch(() => []),
    ]).then(([k, c, thr, cons, dw, br, cr, hr]) => {
      setKpis(k);
      setCharts(c);
      setThreats(thr);
      setConsulted(cons);
      setDarkweb(dw.items);
      setCracked(cr);
      setHackread(hr);
      const list = Array.isArray(br.breaches)
        ? br.breaches
        : (br.breaches as { exposedBreaches?: unknown[] })?.exposedBreaches || [];
      setRecent(
        (list as Array<Record<string, unknown>>).slice(0, 10).map((item) => ({
          name: String(item.breachID || item.breach_name || "—"),
          year: String(item.breachedDate || item.breach_date || "—").slice(0, 10),
        }))
      );
    });
  }, [user]);

  // Derived filter options
  const countries = useMemo(() => Array.from(new Set(threats.map((t) => t.country))).sort(), [threats]);
  const sectors = useMemo(() => Array.from(new Set(threats.map((t) => t.sector))).sort(), [threats]);
  const statuses = useMemo(() => Array.from(new Set(threats.map((t) => t.status))), [threats]);

  // Filtered threats
  const filtered = useMemo(() => {
    return threats.filter((t) => {
      if (countryFilter && t.country !== countryFilter) return false;
      if (sectorFilter && t.sector !== sectorFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      return true;
    });
  }, [threats, countryFilter, sectorFilter, statusFilter]);

  const hasFilters = countryFilter || sectorFilter || statusFilter;

  const clearFilters = () => {
    setCountryFilter("");
    setSectorFilter("");
    setStatusFilter("");
    setThreatPage(1);
  };

  const pagedThreats = filtered.slice((threatPage - 1) * PER_PAGE, threatPage * PER_PAGE);
  const pagedCracked = cracked.slice((crackedPage - 1) * MINI_PER_PAGE, crackedPage * MINI_PER_PAGE);
  const pagedHackread = hackread.slice((hackreadPage - 1) * MINI_PER_PAGE, hackreadPage * MINI_PER_PAGE);

  const kpiCards = kpis ? [
    { label: t.kpi_threats_today, value: kpis.threatsToday, icon: AlertTriangle, color: "text-rose-400" },
    { label: t.kpi_critical, value: kpis.critical, icon: Shield, color: "text-orange-400" },
    { label: t.kpi_verified, value: kpis.verified, icon: TrendingUp, color: "text-[#ff5722]" },
    { label: t.kpi_pending, value: kpis.pending, icon: Activity, color: "text-yellow-400" },
    { label: t.kpi_actors, value: kpis.actors, icon: Users, color: "text-purple-400" },
    { label: t.kpi_sectors, value: kpis.sectors, icon: Globe, color: "text-teal-400" },
  ] : [];

  return (
    <ProtectedRoute>
      <AppShell>
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white">{t.dashboard_title}</h1>
            {breachAlert && (
              <button
                onClick={() => setShowAlertModal(true)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-300",
                  breachAlert.breachCount && breachAlert.breachCount > 0
                    ? "border-rose-500 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                    : "border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                )}
              >
                {breachAlert.breachCount && breachAlert.breachCount > 0 ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                    <span>{breachAlert.breachCount} Leaks</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Email Seguro</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {kpiCards.map((k) => (
              <Kpi key={k.label} label={k.label} value={k.value} icon={k.icon} color={k.color} />
            ))}
          </div>
        )}

        {/* Intel Sources */}
        <div className="mb-6">
          <IntelSources />
        </div>

        {/* Charts */}
        {charts && <div className="mb-6"><DashboardCharts data={charts} /></div>}

        {/* Map */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {t.map_title}
              <span className="flex h-2 w-2 relative ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              {countryFilter && (
                <span className="ml-2 text-xs text-[#ff5722] font-mono">
                  {countryFlag(countryFilter)} {countryFilter}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ThreatMap threats={threats} countryFilter={countryFilter} />
          </CardContent>
        </Card>

        {/* ── Threat Feed with Filters ── */}
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#ff5722]" />
                {t.feed_title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                <Filter className="w-3.5 h-3.5 text-neutral-500" />
                <FilterSelect
                  label={t.all_countries}
                  value={countryFilter}
                  onChange={(v) => { setCountryFilter(v); setThreatPage(1); }}
                  options={countries.map((c) => ({ value: c, label: `${countryFlag(c)} ${c}` }))}
                />
                <FilterSelect
                  label={t.all_sectors}
                  value={sectorFilter}
                  onChange={(v) => { setSectorFilter(v); setThreatPage(1); }}
                  options={sectors.map((s) => ({ value: s, label: s }))}
                />
                <FilterSelect
                  label={t.all_statuses}
                  value={statusFilter}
                  onChange={(v) => { setStatusFilter(v); setThreatPage(1); }}
                  options={statuses.map((s) => ({ value: s, label: s }))}
                />
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-neutral-200 text-xs transition-colors"
                  >
                    <X className="w-3 h-3" /> {t.clear_filters}
                  </button>
                )}
              </div>
            </div>
            {hasFilters && (
              <p className="text-xs text-neutral-500 mt-2">
                {filtered.length} {t.results_count}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="text-neutral-500 border-b border-white/8 bg-[#111]/50">
                  <tr>
                    {[t.col_date, t.col_actor, t.col_victim, t.col_country, t.col_sector, t.col_risk, t.col_status, t.col_verif].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedThreats.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-neutral-500 text-sm">
                        {t.no_results_filter}
                      </td>
                    </tr>
                  ) : (
                    pagedThreats.map((threat) => (
                      <tr key={threat.id} className="border-b border-white/8 hover:bg-[#111]/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-neutral-400 text-xs whitespace-nowrap">{threat.date}</td>
                        <td className="px-4 py-3">
                          <Link href={`/threats/${threat.id}`} className="text-[#ff5722] hover:underline font-semibold text-sm">{threat.actor}</Link>
                        </td>
                        <td className="px-4 py-3 text-neutral-300 text-sm">{threat.victim}</td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold font-mono tracking-wider text-[#ff5722] bg-[#ff5722]/10 px-1.5 py-0.5 rounded border border-[#ff5722]/20 leading-none">{countryFlag(threat.country)}</span>
                            <span className="text-neutral-400">{threat.country}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-400 text-xs">{threat.sector}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-1 font-mono font-bold text-sm",
                            threat.riskScore >= 90 ? "text-rose-400" : threat.riskScore >= 70 ? "text-orange-400" : "text-yellow-400"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[threat.status] ?? "bg-slate-400")} />
                            {threat.riskScore}
                          </span>
                        </td>
                        <td className="px-4 py-3"><Badge className={statusBadge(threat.status)}>{threat.status}</Badge></td>
                        <td className="px-4 py-3"><Badge className={statusBadge(threat.verificationStatus)}>{threat.verificationStatus}</Badge></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > PER_PAGE && (
              <Pagination
                page={threatPage}
                total={filtered.length}
                perPage={PER_PAGE}
                onChange={setThreatPage}
                prevLabel={t.prev_btn}
                nextLabel={t.next_btn}
                pageLabel={t.page_of}
                ofLabel={t.of}
              />
            )}
          </CardContent>
        </Card>

        {/* Security Tips */}
        <div className="mb-6">
          <SecurityTips />
        </div>

        {/* Cracked + Hackread */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Cracked Forum */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {t.cracked_title}
                <span className="flex h-2 w-2 relative ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="text-neutral-500 border-b border-white/8 bg-[#111]/30">
                  <tr>
                    {[t.col_thread, t.col_author, t.col_replies].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!cracked.length && (
                    <tr><td colSpan={3} className="text-center py-6 text-neutral-500">{t.loading_threads}</td></tr>
                  )}
                  {pagedCracked.map((item, i) => (
                    <tr key={i} className="border-b border-white/8 hover:bg-[#111]/60">
                      <td className="px-3 py-2.5 text-[#ff5722] font-semibold truncate max-w-[180px]" title={item.title}>{item.title}</td>
                      <td className="px-3 py-2.5 text-neutral-400 font-mono">{item.author}</td>
                      <td className="px-3 py-2.5 text-neutral-500 font-mono text-center">{item.replies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cracked.length > MINI_PER_PAGE && (
                <Pagination
                  page={crackedPage} total={cracked.length} perPage={MINI_PER_PAGE}
                  onChange={setCrackedPage} prevLabel={t.prev_btn} nextLabel={t.next_btn}
                  pageLabel={t.page_of} ofLabel={t.of}
                />
              )}
            </CardContent>
          </Card>

          {/* Hackread */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {t.hackread_title}
                <span className="flex h-2 w-2 relative ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="text-neutral-500 border-b border-white/8 bg-[#111]/30">
                  <tr>
                    {[t.col_article, t.col_category, t.col_published].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!hackread.length && (
                    <tr><td colSpan={3} className="text-center py-6 text-neutral-500">{t.loading_news}</td></tr>
                  )}
                  {pagedHackread.map((item, i) => (
                    <tr key={i} className="border-b border-white/8 hover:bg-[#111]/60">
                      <td className="px-3 py-2.5 text-[#ff5722] font-semibold truncate max-w-[180px]" title={item.title}>{item.title}</td>
                      <td className="px-3 py-2.5 text-neutral-400">{item.category}</td>
                      <td className="px-3 py-2.5 text-neutral-500 font-mono whitespace-nowrap">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hackread.length > MINI_PER_PAGE && (
                <Pagination
                  page={hackreadPage} total={hackread.length} perPage={MINI_PER_PAGE}
                  onChange={setHackreadPage} prevLabel={t.prev_btn} nextLabel={t.next_btn}
                  pageLabel={t.page_of} ofLabel={t.of}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom 3-col */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Consulted */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm">{t.consulted_title}</CardTitle>
              {!!consulted.length && (
                <button
                  onClick={async () => {
                    try {
                      await api.clearConsulted();
                      setConsulted([]);
                    } catch (err) {
                      console.error("Error clearing scans:", err);
                    }
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold border border-rose-500/20 hover:border-rose-500/50 px-2 py-0.5 rounded transition-all bg-rose-500/5 hover:bg-rose-500/10"
                >
                  {t.consulted_clear}
                </button>
              )}
            </CardHeader>
            <CardContent className="text-sm space-y-1.5 max-h-56 overflow-y-auto">
              {!consulted.length && <p className="text-neutral-500 text-xs">{t.no_consulted}</p>}
              {consulted.map((s, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/6 py-2">
                  <div className="flex flex-col truncate pr-2">
                    <span className="truncate text-neutral-200 text-xs font-medium">
                      {s.searchType}
                    </span>
                    {s.queryHashPrefix && (
                      <span className="text-[9px] text-neutral-500 font-mono">
                        {t.consulted_hash_label} #{s.queryHashPrefix}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "font-mono font-bold text-xs flex-shrink-0",
                    s.riskScore >= 70 ? "text-rose-400" : s.riskScore >= 40 ? "text-orange-400" : "text-[#ff5722]"
                  )}>{s.riskScore}%</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Dark Web */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t.darkweb_title}</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-1.5 max-h-56 overflow-y-auto">
              {darkweb.map((d, i) => (
                <div key={i} className="border-b border-white/6 py-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="text-rose-300 font-semibold">{d.forum}</span>
                  </div>
                  <div className="text-neutral-300 text-[11px] font-medium">{d.title}</div>
                  <div className="text-neutral-500 text-[10px] mt-0.5 font-mono">{d.indicator}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Breaches */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t.recent_breaches_title}</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-1.5 max-h-56 overflow-y-auto">
              {!recent.length && <p className="text-neutral-500 text-xs">{t.no_index}</p>}
              {recent.map((r, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/6 py-2">
                  <span className="truncate text-neutral-300 text-[11px] pr-2">{r.name}</span>
                  <span className="text-neutral-500 font-mono text-[10px] flex-shrink-0">{r.year}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      {/* Breach Alert Detail Modal */}
      {showAlertModal && breachAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/8 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className={cn(
              "p-6 border-b border-white/8 flex items-center justify-between",
              breachAlert.breachCount && breachAlert.breachCount > 0 ? "bg-rose-950/20" : "bg-emerald-950/20"
            )}>
              <div className="flex items-center gap-2">
                {breachAlert.breachCount && breachAlert.breachCount > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                <h3 className="font-extrabold text-white text-base">
                  {breachAlert.breachCount && breachAlert.breachCount > 0
                    ? "Alerta de Filtración de Datos"
                    : "Seguridad de Cuenta"}
                </h3>
              </div>
              <button 
                onClick={() => setShowAlertModal(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-neutral-300 leading-relaxed">
                {breachAlert.message}
              </p>

              {breachAlert.breachCount && breachAlert.breachCount > 0 && (
                <>
                  {breachAlert.mostRecent && (
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="font-semibold text-neutral-300">Más reciente:</span>
                      <span className="font-mono bg-[#0a0a0a] px-2 py-0.5 rounded border border-white/8 text-rose-300">
                        {breachAlert.mostRecent}
                      </span>
                    </div>
                  )}

                  {breachAlert.sources && breachAlert.sources.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Fuentes de filtración:</h4>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {breachAlert.sources.map((src, index) => (
                          <span 
                            key={index} 
                            className="text-xs bg-[#0a0a0a] text-neutral-300 border border-white/8 px-2.5 py-1 rounded-md"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {breachAlert.passwordRisk && (
                    <div className="bg-rose-950/20 border border-rose-800/40 rounded-lg p-3.5 flex gap-3 text-xs text-rose-300">
                      <KeyRound className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-rose-200 font-bold mb-1">Riesgo de Contraseña Reutilizada</strong>
                        Su correo ha sido expuesto en múltiples filtraciones. Se recomienda encarecidamente actualizar su contraseña y activar la verificación en dos pasos (2FA).
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-6 bg-[#111]/50 border-t border-white/8 flex justify-end">
              <button
                onClick={() => {
                  clearBreachAlert();
                  setShowAlertModal(false);
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors duration-200",
                  breachAlert.breachCount && breachAlert.breachCount > 0
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                )}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      </AppShell>
    </ProtectedRoute>
  );
}
