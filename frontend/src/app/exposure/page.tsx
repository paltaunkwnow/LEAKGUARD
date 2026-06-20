"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { api, ScanResult } from "@/lib/api";
import { useNotifications } from "@/contexts/notifications-context";
import { useToast } from "@/contexts/toast-context";

type Mode = "domain" | "email" | "phone";

export default function ExposurePage() {
  const { show } = useToast();
  const { refresh } = useNotifications();
  const [mode, setMode] = useState<Mode>("domain");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  const runScan = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.scan(query.trim(), mode);
      setResult(data);
      const score = data.risk.score;
      show(
        `Escaneo completado — riesgo ${score}%`,
        score >= 60 ? "warning" : score < 30 ? "success" : "info"
      );
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en escaneo");
    } finally {
      setLoading(false);
    }
  };

  const placeholders: Record<Mode, string> = {
    domain: "Dominio (ej. policia.bo)",
    email: "Correo (ej. analista@empresa.com)",
    phone: "Teléfono (ej. +59171234567)",
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="text-2xl font-bold mb-2">Exposure Check</h1>
        <p className="text-slate-400 text-sm mb-6">Proxy seguro FastAPI — token OSINT nunca expuesto al navegador.</p>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2 flex-wrap">
              {(["domain", "email", "phone"] as Mode[]).map((m) => (
                <Button key={m} variant={mode === m ? "default" : "outline"} size="sm" onClick={() => setMode(m)}>
                  {m === "domain" ? "Dominio" : m === "email" ? "Email" : "Teléfono"}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder={placeholders[mode]} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runScan()} />
              <Button onClick={runScan} disabled={loading}>{loading ? "Escaneando..." : "Escanear"}</Button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <>
            <div className="grid md:grid-cols-4 gap-3 mb-6">
              <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-cyan-400">{result.risk.score}%</div><div className="text-xs text-slate-500">Riesgo {result.risk.level}</div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{result.stats.apiTotalResults ?? result.stats.totalLogins}</div><div className="text-xs text-slate-500">Logins indexados</div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{result.stats.databasesWithHits}</div><div className="text-xs text-slate-500">Bases con hits</div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-400">{result.stats.plaintextPasswords}</div><div className="text-xs text-slate-500">Contraseñas texto claro</div></CardContent></Card>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {result.recommendations.map((rec) => (
                <Card key={rec.priority}>
                  <CardHeader><CardTitle className="text-base">{rec.priority}</CardTitle></CardHeader>
                  <CardContent className="text-sm text-slate-400 space-y-1">
                    {rec.items.map((item, i) => <p key={i}>• {item}</p>)}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="overflow-x-auto">
              <CardHeader><CardTitle>Registros ({result.records.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm table-fixed">
                  <thead className="text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left w-[110px]">Fecha</th>
                      <th className="px-4 py-3 text-left w-[180px]">Fuente</th>
                      <th className="px-4 py-3 text-left">Login</th>
                      <th className="px-4 py-3 text-left w-[180px]">Credencial</th>
                      <th className="px-4 py-3 text-left w-[100px]">Severidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.records.map((r, i) => (
                      <tr key={i} className="border-b border-slate-800/40">
                        <td className="px-4 py-2 font-mono text-slate-400 text-xs whitespace-nowrap">{String(r.date)}</td>
                        <td className="px-4 py-2 truncate text-slate-300" title={String(r.sourceName || r.title)}>{String(r.sourceName || r.title)}</td>
                        <td className="px-4 py-2 font-mono text-cyan-300 truncate" title={String(r.login)}>{String(r.login)}</td>
                        <td className="px-4 py-2 font-mono text-red-400 truncate" title={String(r.credential)}>{String(r.credential)}</td>
                        <td className="px-4 py-2"><Badge className={statusBadge(String(r.severity))}>{String(r.severity)}</Badge></td>
                      </tr>
                    ))}
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
