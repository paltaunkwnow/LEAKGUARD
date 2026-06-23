"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { api, Threat } from "@/lib/api";
import { useLang } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";

export default function ThreatDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useLang();
  const { user } = useAuth();
  const [threat, setThreat] = useState<Threat | null>(null);

  useEffect(() => {
    if (user && id) {
      api.threat(id).then(setThreat).catch(() => setThreat(null));
    }
  }, [id, user]);

  if (!threat) {
    return (
      <ProtectedRoute>
        <AppShell><p className="text-neutral-400">{t.loading_threads.split(" ")[0]}...</p></AppShell>
      </ProtectedRoute>
    );
  }

  const why = (threat.whyCritical || {}) as Record<string, boolean>;
  const actions = (threat.actions || {}) as Record<string, string>;
  const evidence = (threat.evidence || {}) as Record<string, string>;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <h1 className="text-2xl font-bold">{threat.actor}</h1>
          <Badge className={statusBadge(threat.status)}>{threat.status}</Badge>
          <Badge className={statusBadge(threat.verificationStatus)}>{threat.verificationStatus}</Badge>
          <span className="text-neutral-500 font-mono">{threat.id}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card><CardContent className="pt-6"><div className="text-3xl font-bold text-red-400">{threat.riskScore}</div><div className="text-sm text-neutral-500">{t.col_risk}</div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-3xl font-bold text-purple-400">{threat.confidence}%</div><div className="text-sm text-neutral-500">{t.col_conf}</div></CardContent></Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>{t.col_victim}</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2 text-neutral-300">
              <p><strong>{t.col_victim}:</strong> {threat.victim}</p>
              <p><strong>{t.col_sector}:</strong> {threat.sector}</p>
              <p><strong>{t.col_country}:</strong> {threat.country}</p>
              <p><strong>{t.col_date}:</strong> {threat.date}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Why Critical</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              {Object.entries(why).map(([k, v]) => (
                <p key={k} className={v ? "text-green-400" : "text-neutral-600"}>{v ? "✓" : "✗"} {k}</p>
              ))}
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Impacto</CardTitle></CardHeader>
            <CardContent className="text-sm text-neutral-300 space-y-3">
              <p><strong>Negocio:</strong> {String(threat.businessImpact)}</p>
              <p><strong>Técnico:</strong> {String(threat.technicalImpact)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Acciones</CardTitle></CardHeader>
            <CardContent className="text-sm text-neutral-400 space-y-2">
              <p><strong className="text-red-400">Inmediato:</strong> {actions.immediate}</p>
              <p><strong className="text-orange-400">24h:</strong> {actions.hours24}</p>
              <p><strong className="text-yellow-400">7d:</strong> {actions.days7}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Evidencia</CardTitle></CardHeader>
            <CardContent className="text-sm text-neutral-400 space-y-2 font-mono">
              <p>{evidence.source}</p>
              <pre className="bg-[#111] p-3 rounded text-xs overflow-x-auto">{evidence.extracted}</pre>
              <p className="font-sans">{evidence.summary}</p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
