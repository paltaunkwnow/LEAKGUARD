"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api, Threat, AuditEntry } from "@/lib/api";
import { useNotifications } from "@/contexts/notifications-context";
import { useToast } from "@/contexts/toast-context";

export default function AdminPage() {
  const { show } = useToast();
  const { refresh } = useNotifications();
  const [queue, setQueue] = useState<{ pending: number; verified: number; rejected: number; incidents: Threat[] } | null>(null);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [selected, setSelected] = useState<Threat | null>(null);
  const [reason, setReason] = useState("");

  const load = () => {
    api.adminQueue().then(setQueue);
    api.audits().then(setAudits).catch(() => setAudits([]));
  };

  useEffect(() => { load(); }, []);

  const verify = async (action: string) => {
    if (!selected || !reason.trim()) return;
    await api.verifyThreat(selected.id, action, reason);
    show(`Incidente ${selected.id} auditado: ${action}`, "success");
    await refresh();
    setReason("");
    setSelected(null);
    load();
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="text-2xl font-bold mb-6">Admin Panel — Verificación humana</h1>

        {queue && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-yellow-400">{queue.pending}</div><div className="text-xs text-slate-500">Pendientes</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-400">{queue.verified}</div><div className="text-xs text-slate-500">Verificadas</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-400">{queue.rejected}</div><div className="text-xs text-slate-500">Rechazadas</div></CardContent></Card>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="overflow-x-auto">
            <CardHeader><CardTitle>Cola de incidentes</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  {queue?.incidents.map((t) => (
                    <tr key={t.id} className={`border-b border-slate-800/40 cursor-pointer hover:bg-slate-900/50 ${selected?.id === t.id ? "bg-cyan-950/30" : ""}`} onClick={() => setSelected(t)}>
                      <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                      <td className="px-4 py-3">{t.victim}</td>
                      <td className="px-4 py-3"><Badge className={statusBadge(t.verificationStatus)}>{t.verificationStatus}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Revisión</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {selected ? (
                <>
                  <p className="text-sm">{selected.actor} → {selected.victim}</p>
                  <Input placeholder="Motivo de verificación/rechazo" value={reason} onChange={(e) => setReason(e.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={() => verify("verify")} className="flex-1">Verificar</Button>
                    <Button variant="destructive" onClick={() => verify("reject")} className="flex-1">Rechazar</Button>
                  </div>
                </>
              ) : (
                <p className="text-slate-500 text-sm">Selecciona un incidente de la cola.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader><CardTitle>Audit Log (PostgreSQL)</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {audits.map((a, i) => (
              <div key={i} className="border-b border-slate-800/40 py-2">
                <span className="text-slate-500 font-mono text-xs">{a.timestamp}</span> — <strong>{a.analyst}</strong> [{a.action}]: {a.reason}
              </div>
            ))}
          </CardContent>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}
