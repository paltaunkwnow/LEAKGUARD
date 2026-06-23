"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api, Threat, AuditEntry } from "@/lib/api";
import { useLang } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";

export default function AdminPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const [queue, setQueue] = useState<{ pending: number; verified: number; rejected: number; incidents: Threat[] } | null>(null);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [selected, setSelected] = useState<Threat | null>(null);
  const [reason, setReason] = useState("");

  const load = () => {
    if (!user) return;
    api.adminQueue().then(setQueue).catch(() => setQueue(null));
    api.audits().then(setAudits).catch(() => setAudits([]));
  };

  useEffect(() => { load(); }, [user]);

  const verify = async (action: string) => {
    if (!selected || !reason.trim()) return;
    await api.verifyThreat(selected.id, action, reason);
    setReason("");
    setSelected(null);
    load();
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="text-2xl font-bold mb-6">{t.admin_title}</h1>

        {queue && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-yellow-400">{queue.pending}</div><div className="text-xs text-neutral-500">{t.admin_pending}</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-400">{queue.verified}</div><div className="text-xs text-neutral-500">{t.admin_verified}</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-400">{queue.rejected}</div><div className="text-xs text-neutral-500">{t.admin_rejected}</div></CardContent></Card>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="overflow-x-auto">
            <CardHeader><CardTitle>{t.admin_queue_title}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  {queue?.incidents.map((threat) => (
                    <tr
                      key={threat.id}
                      className={`border-b border-white/6 cursor-pointer hover:bg-[#111]/50 ${selected?.id === threat.id ? "bg-[#ff5722]/10" : ""}`}
                      onClick={() => setSelected(threat)}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{threat.id}</td>
                      <td className="px-4 py-3">{threat.victim}</td>
                      <td className="px-4 py-3"><Badge className={statusBadge(threat.verificationStatus)}>{threat.verificationStatus}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t.col_verif}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {selected ? (
                <>
                  <p className="text-sm">{selected.actor} → {selected.victim}</p>
                  <Input placeholder={t.admin_reason_placeholder} value={reason} onChange={(e) => setReason(e.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={() => verify("verify")} className="flex-1">{t.admin_verify_btn}</Button>
                    <Button variant="destructive" onClick={() => verify("reject")} className="flex-1">{t.admin_reject_btn}</Button>
                  </div>
                </>
              ) : (
                <p className="text-neutral-500 text-sm">{t.no_consulted}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader><CardTitle>{t.admin_audits_title} (PostgreSQL)</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {audits.map((a, i) => (
              <div key={i} className="border-b border-white/6 py-2">
                <span className="text-neutral-500 font-mono text-xs">{a.timestamp}</span> — <strong>{a.analyst}</strong> [{a.action}]: {a.reason}
              </div>
            ))}
          </CardContent>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}
