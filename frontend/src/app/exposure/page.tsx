"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { api, ScanResult } from "@/lib/api";
import { useLang } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { 
  Globe, Mail, Phone, BrainCircuit, Search, Sparkles, ChevronDown, 
  AlertTriangle, Users, Database, ShieldAlert, CheckCircle, Wifi, 
  ArrowUpRight, Wrench
} from "lucide-react";

type Mode = "domain" | "email" | "phone";

function detectMode(q: string): Mode {
  const trimmed = q.trim();
  if (!trimmed) return "domain";
  if (trimmed.includes("@")) return "email";
  const isPhone = /^\+?[\d\s\-()]+$/.test(trimmed) && trimmed.replace(/[^\d]/g, "").length >= 7;
  if (isPhone) return "phone";
  return "domain";
}

export default function ExposurePage() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [searchTarget, setSearchTarget] = useState<"breaches" | "actors">("breaches");
  const [overrideMode, setOverrideMode] = useState<Mode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  // AI states
  const [aiResponse, setAiResponse] = useState<{ answer: string; model: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const activeMode = overrideMode || detectMode(query);

  const runScan = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setAiResponse(null);
    setAiError("");
    setResult(null);
    try {
      const data = await api.scan(query.trim(), activeMode, searchTarget);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.scan_btn);
    } finally {
      setLoading(false);
    }
  };

  const handleAiAnalyze = async () => {
    if (!result) return;
    setAiLoading(true);
    setAiError("");
    setAiResponse(null);

    let summary = "";
    let systemPrompt = "";

    if (searchTarget === "actors" && result.actorProfile) {
      const prof = result.actorProfile;
      summary = `
        Reporte de Actor de Amenaza: ${prof.name}
        Origen: ${prof.origin}
        Tipo: ${prof.sponsored}
        Descripción: ${prof.description}
        Sectores Objetivo: ${prof.targetSectors.join(", ")}
        Herramientas Comunes: ${prof.typicalTools.join(", ")}
        Riesgo: ${prof.riskScore}%
        Incidentes Relacionados Detectados: ${result.records.length}
      `;
      systemPrompt = "Analiza este reporte del actor de amenaza, evalúa el nivel de riesgo real de forma resumida, y da 3 recomendaciones de defensa y mitigación en español de forma profesional y ejecutiva.";
    } else {
      summary = `
        Consulta de exposición para: ${result.query} (Tipo de búsqueda: ${result.searchType})
        Score de riesgo: ${result.risk.score}% (${result.risk.level})
        Estadísticas:
        - Resultados totales: ${result.stats.apiTotalResults ?? result.stats.totalLogins}
        - Bases de datos comprometidas: ${result.stats.databasesWithHits}
        - Contraseñas expuestas en texto plano: ${result.stats.plaintextPasswords}
        Registros encontrados:
        ${result.records.map((r, i) => `${i + 1}. Fecha: ${r.date} | Fuente: ${r.sourceName || r.title} | Login: ${r.login} | Severidad: ${r.severity}`).join("\n")}
      `;
      systemPrompt = "Analiza este reporte de exposición, evalúa el nivel de riesgo real de forma resumida, y da 3 recomendaciones clave en español de forma profesional y ejecutiva.";
    }

    try {
      const data = await api.aiAnalyze(summary.trim(), systemPrompt);
      setAiResponse({ answer: data.answer, model: data.model });
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Error al consultar a la IA.");
    } finally {
      setAiLoading(false);
    }
  };

  const placeholders: Record<Mode, string> = {
    domain: t.ph_domain,
    email: t.ph_email,
    phone: t.ph_phone,
  };

  const modeLabels: Record<Mode, string> = {
    domain: t.mode_domain,
    email: t.mode_email,
    phone: t.mode_phone,
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="text-2xl font-bold mb-2">{t.exposure_title}</h1>
        <p className="text-neutral-400 text-sm mb-6">{t.exposure_subtitle}</p>

        {/* Search Target Toggle Buttons */}
        <div className="flex gap-1.5 mb-6 p-1 bg-[#0a0a0a]/60 border border-white/8 rounded-xl w-fit">
          <button
            onClick={() => { setSearchTarget("breaches"); setResult(null); setError(""); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200",
              searchTarget === "breaches"
                ? "bg-[#1a1a1a] text-white shadow-md shadow-black/30"
                : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            <Database className="w-3.5 h-3.5" />
            Buscar Filtraciones
          </button>
          <button
            onClick={() => { setSearchTarget("actors"); setResult(null); setError(""); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200",
              searchTarget === "actors"
                ? "bg-[#1a1a1a] text-white shadow-md shadow-black/30"
                : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Buscar Actores de Amenaza
          </button>
        </div>

        {/* Scan input block */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2 flex-col sm:flex-row">
              <div className="relative flex-1">
                <Input
                  placeholder={
                    searchTarget === "actors"
                      ? "Nombre de actor (ej. Lazarus Group, LockBit, Volt Typhoon)"
                      : placeholders[activeMode]
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runScan()}
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  {searchTarget === "actors" ? (
                    <Users className="w-4 h-4 text-purple-400" />
                  ) : (
                    <>
                      {activeMode === "domain" && <Globe className="w-4 h-4" />}
                      {activeMode === "email" && <Mail className="w-4 h-4" />}
                      {activeMode === "phone" && <Phone className="w-4 h-4" />}
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {searchTarget === "breaches" && (
                  <div className="relative">
                    <select
                      value={overrideMode || "auto"}
                      onChange={(e) => setOverrideMode(e.target.value === "auto" ? null : e.target.value as Mode)}
                      className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-white/10 bg-[#111] text-neutral-200 text-sm h-full focus:outline-none focus:border-[#ff5722] hover:border-white/20 transition-colors cursor-pointer"
                    >
                      <option value="auto">Auto (Detectar)</option>
                      <option value="domain">{t.mode_domain}</option>
                      <option value="email">{t.mode_email}</option>
                      <option value="phone">{t.mode_phone}</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                  </div>
                )}

                <Button onClick={runScan} disabled={loading} className="gap-2 bg-[#ff5722] hover:bg-[#ff6b3d] text-white font-semibold whitespace-nowrap">
                  <Search className="w-4 h-4" />
                  {loading ? t.scanning_btn : t.scan_btn}
                </Button>
              </div>
            </div>

            {searchTarget === "breaches" && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500">Modo de búsqueda:</span>
                <span className={cn(
                  "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono",
                  !overrideMode
                    ? "bg-[#ff5722]/10 border-[#ff5722]/30 text-[#ff5722]"
                    : "bg-[#0a0a0a]/40 border-white/8 text-neutral-400"
                )}>
                  {activeMode === "domain" && <Globe className="w-3 h-3" />}
                  {activeMode === "email" && <Mail className="w-3 h-3" />}
                  {activeMode === "phone" && <Phone className="w-3 h-3" />}
                  <span className="font-sans font-semibold">
                    {modeLabels[activeMode]} {!overrideMode && "(Auto-detectado)"}
                  </span>
                </span>
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <>
            {/* ─── Breach Search Results View ─── */}
            {searchTarget === "breaches" && (
              <>
                <div className="grid md:grid-cols-4 gap-3 mb-6">
                  <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-[#ff5722]">{result.risk.score}%</div><div className="text-xs text-neutral-500">{t.risk_label} {result.risk.level}</div></CardContent></Card>
                  <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{result.stats.apiTotalResults ?? result.stats.totalLogins}</div><div className="text-xs text-neutral-500">{t.indexed_logins}</div></CardContent></Card>
                  <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{result.stats.databasesWithHits}</div><div className="text-xs text-neutral-500">{t.db_hits}</div></CardContent></Card>
                  <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-400">{result.stats.plaintextPasswords}</div><div className="text-xs text-neutral-500">{t.plaintext_pwd}</div></CardContent></Card>
                </div>

                {/* OSINT Engines Consolidation Status */}
                {result.sourcesChecked && (
                  <Card className="mb-6 border-white/8 bg-[#0a0a0a]/20 overflow-hidden">
                    <CardHeader className="border-b border-white/8/80 bg-[#111]/10 py-3">
                      <CardTitle className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                        <Wifi className="w-4 h-4" />
                        Motores OSINT Automatizados en Paralelo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {result.sourcesChecked.map((src) => (
                        <a
                          key={src.name}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg border border-white/8/60 bg-[#111]/30 hover:bg-white/5/30 hover:border-white/10 transition-all group"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              {src.name}
                              <ArrowUpRight className="w-3 h-3 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                              Hits: {src.hits}
                            </div>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/20 px-2 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            OK
                          </span>
                        </a>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* ─── Threat Actor Search Results View ─── */}
            {searchTarget === "actors" && result.actorProfile && (
              <div className="grid lg:grid-cols-3 gap-6 mb-6">
                {/* Profile Card */}
                <Card className="lg:col-span-2 overflow-hidden border-purple-900/30">
                  <CardHeader className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border-b border-white/8/80">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white font-extrabold flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        Dossier: {result.actorProfile.name}
                      </CardTitle>
                      <Badge className="bg-purple-950/80 text-purple-300 border border-purple-800/40">
                        {result.actorProfile.sponsored}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between border-b border-white/8/60 pb-3 text-sm">
                      <span className="text-neutral-400 font-medium">País / Origen:</span>
                      <span className="text-white font-bold">{result.actorProfile.origin}</span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Descripción:</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed font-sans bg-[#0a0a0a]/40 border border-white/8 p-3 rounded-lg">
                        {result.actorProfile.description}
                      </p>
                    </div>

                    {/* Sectors & Tools */}
                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-[#ff5722]" />
                          Sectores Objetivo:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {result.actorProfile.targetSectors.map((sector) => (
                            <Badge key={sector} className="bg-[#ff5722]/10 text-[#ff5722] border border-[#ff5722]/15 text-[10px]">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5 text-orange-400" />
                          Herramientas & Malware:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {result.actorProfile.typicalTools.map((tool) => (
                            <Badge key={tool} className="bg-orange-950/40 text-orange-400 border border-orange-800/20 text-[10px] font-mono">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Score & External DB matches card */}
                <div className="space-y-4">
                  <Card className="border-rose-900/30">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Puntuación de Riesgo</span>
                        <Badge className="bg-red-950/80 text-red-400 border border-red-800/40">
                          {result.risk.level}
                        </Badge>
                      </div>
                      <div className="text-3xl font-black font-mono text-rose-400">{result.actorProfile.riskScore}%</div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-1">
                        Confidence Score: {result.actorProfile.confidence}%
                      </div>
                    </CardContent>
                  </Card>

                  {/* External Databases status checklist */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Bases de Datos de Actores OSINT
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5 pt-0">
                      {Object.entries(result.actorProfile.externals).map(([dbName, details]) => (
                        <div key={dbName} className="flex flex-col p-2.5 rounded-lg border border-white/8 bg-[#111]/20 text-xs">
                          <div className="flex items-center justify-between font-bold text-white mb-1">
                            <span>{dbName}</span>
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                              <CheckCircle className="w-3 h-3 text-emerald-400" /> Matches Found
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-500 leading-tight font-mono">{details}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* AI Analysis trigger card */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#111]/50 border border-white/8 p-4 rounded-xl">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Análisis con Inteligencia Artificial (Gemini)</h3>
                <p className="text-xs text-neutral-400">
                  {searchTarget === "actors" 
                    ? "Genera un perfil consolidado del actor y recomendaciones específicas contra sus firmas."
                    : "Obtén un informe inmediato y recomendaciones personalizadas analizadas por Gemini."}
                </p>
              </div>
              <Button
                onClick={handleAiAnalyze}
                disabled={aiLoading}
                className="gap-2 bg-gradient-to-r from-[#ff5722] to-orange-700 hover:from-[#ff6b3d] hover:to-orange-600 text-white font-bold text-xs shrink-0 self-end sm:self-center"
              >
                <BrainCircuit className={cn("w-4 h-4", aiLoading && "animate-spin")} />
                {aiLoading ? "Analizando..." : "Analizar con IA"}
              </Button>
            </div>

            {aiLoading && (
              <Card className="mb-6 border-[#ff5722]/30 bg-[#0a0a0a]/30 animate-pulse">
                <CardContent className="py-8 flex flex-col items-center justify-center gap-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce delay-75" />
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce delay-150" />
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce delay-225" />
                  </div>
                  <div className="text-xs text-neutral-400 font-medium">Gemini está analizando los detalles de inteligencia...</div>
                </CardContent>
              </Card>
            )}

            {aiError && (
              <Card className="mb-6 border-red-800/40 bg-red-950/10">
                <CardContent className="py-4 text-xs text-red-400 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </CardContent>
              </Card>
            )}

            {aiResponse && (
              <Card className="mb-6 border-[#ff5722]/30 bg-[#111]/60 shadow-[0_0_20px_rgba(34,211,238,0.05)] overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#ff5722]/10 to-orange-950/20 border-b border-white/8 py-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold text-[#ff5722] flex items-center gap-2 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff5722]" />
                    Informe de Inteligencia Artificial (Gemini)
                  </CardTitle>
                  <span className="text-[10px] text-neutral-500 font-mono">Modo: {aiResponse.model || "Gemini"}</span>
                </CardHeader>
                <CardContent className="pt-4 pb-5 text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {aiResponse.answer}
                </CardContent>
              </Card>
            )}

            {/* Recommendations Block */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {result.recommendations.map((rec) => (
                <Card key={rec.priority}>
                  <CardHeader><CardTitle className="text-sm font-bold">{rec.priority}</CardTitle></CardHeader>
                  <CardContent className="text-xs text-neutral-400 space-y-1">
                    {rec.items.map((item, i) => <p key={i}>• {item}</p>)}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ─── Records Table / Connected Incidents List ─── */}
            <Card className="overflow-x-auto">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  {searchTarget === "actors" ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-purple-400" />
                      <span>Incidentes y Operaciones Asociadas ({result.records.length})</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 text-[#ff5722]" />
                      <span>{t.records_label} ({result.records.length})</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs min-w-[600px]">
                  <thead className="text-neutral-500 border-b border-white/8 bg-[#111]/10">
                    {searchTarget === "actors" ? (
                      <tr>
                        <th className="px-4 py-3 text-left w-[110px]">Fecha</th>
                        <th className="px-4 py-3 text-left w-[180px]">Código</th>
                        <th className="px-4 py-3 text-left">Víctima</th>
                        <th className="px-4 py-3 text-left">Sector</th>
                        <th className="px-4 py-3 text-left w-[120px]">País</th>
                        <th className="px-4 py-3 text-left w-[100px]">Riesgo</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="px-4 py-3 text-left w-[110px]">{t.col_date}</th>
                        <th className="px-4 py-3 text-left w-[180px]">{t.col_source}</th>
                        <th className="px-4 py-3 text-left">{t.col_login}</th>
                        <th className="px-4 py-3 text-left w-[180px]">{t.col_credential}</th>
                        <th className="px-4 py-3 text-left w-[100px]">{t.col_severity}</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {searchTarget === "actors" ? (
                      result.records.map((r, i) => (
                        <tr key={i} className="border-b border-white/6 hover:bg-[#111]/40 transition-colors">
                          <td className="px-4 py-2 font-mono text-neutral-400 whitespace-nowrap">{r.date}</td>
                          <td className="px-4 py-2 font-mono text-orange-300 font-bold truncate">{r.id}</td>
                          <td className="px-4 py-2 text-neutral-200">{r.victim}</td>
                          <td className="px-4 py-2 text-neutral-400">{r.sector}</td>
                          <td className="px-4 py-2 text-neutral-400">{r.country}</td>
                          <td className="px-4 py-2"><Badge className={statusBadge(r.severity || "Low")}>{r.riskScore}</Badge></td>
                        </tr>
                      ))
                    ) : (
                      result.records.map((r, i) => (
                        <tr key={i} className="border-b border-white/6 hover:bg-[#111]/40 transition-colors">
                          <td className="px-4 py-2 font-mono text-neutral-400 whitespace-nowrap">{String(r.date)}</td>
                          <td className="px-4 py-2 truncate text-neutral-300" title={String(r.sourceName || r.title)}>{String(r.sourceName || r.title)}</td>
                          <td className="px-4 py-2 font-mono text-orange-300 truncate" title={String(r.login)}>{String(r.login)}</td>
                          <td className="px-4 py-2 font-mono text-red-400 truncate" title={String(r.credential)}>{String(r.credential)}</td>
                          <td className="px-4 py-2"><Badge className={statusBadge(String(r.severity))}>{String(r.severity)}</Badge></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
