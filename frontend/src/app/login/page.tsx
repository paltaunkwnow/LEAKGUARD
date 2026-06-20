"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";
import { breachTypeToToast, useToast } from "@/contexts/toast-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { login, register, demo, user, loading } = useAuth();
  const { show } = useToast();
  const { refresh } = useNotifications();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    router.replace("/dashboard");
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const breachAlert =
        tab === "login" ? await login(email, password) : await register(email, password, name || "Analyst");
      if (breachAlert) {
        show(breachAlert.message, breachTypeToToast(breachAlert.type));
      }
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    await demo();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2 text-cyan-400"><Shield className="w-8 h-8" /></div>
          <CardTitle>LeakGuard Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button variant={tab === "login" ? "default" : "outline"} className="flex-1" onClick={() => setTab("login")}>Login</Button>
            <Button variant={tab === "register" ? "default" : "outline"} className="flex-1" onClick={() => setTab("register")}>Registro</Button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {tab === "register" && (
              <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Procesando..." : tab === "login" ? "Ingresar" : "Crear cuenta"}
            </Button>
          </form>
          <Button variant="outline" className="w-full mt-3" onClick={handleDemo}>Demo bypass (sin registro)</Button>
          <Link href="/" className="block text-center text-sm text-slate-500 mt-4 hover:text-cyan-400">← Volver al inicio</Link>
        </CardContent>
      </Card>
    </div>
  );
}
