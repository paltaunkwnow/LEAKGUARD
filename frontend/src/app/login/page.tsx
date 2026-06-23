"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLang, LANG_META, Lang } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { termsData } from "@/app/terms/termsData";

export default function LoginPage() {
  const { login, register, demo, user, loading } = useAuth();
  const { t, lang, setLang } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  if (!loading && user) {
    router.replace("/dashboard");
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError(lang === "es" ? "Debe aceptar los términos y condiciones." : "You must accept the terms and conditions.");
      return;
    }
    setError("");
    try {
      const breachAlert =
        tab === "login" ? await login(email, password) : await register(email, password, name || "Analyst");
      if (breachAlert) setAlert(breachAlert.message);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth_error);
    }
  };

  const handleDemo = async () => {
    await demo();
    router.push("/dashboard");
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      setShowTermsModal(true);
    } else {
      setAcceptedTerms(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative">
      {/* Language switcher - top right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-sm font-medium"
          >
            <span className="text-base">{LANG_META[lang].flag}</span>
            <span className="hidden sm:inline">{LANG_META[lang].label}</span>
            <span className={cn("text-xs transition-transform duration-200 inline-block", langOpen && "rotate-180")}>▾</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-lg border border-slate-700 bg-slate-900 shadow-xl shadow-black/40 overflow-hidden z-50">
              {(Object.entries(LANG_META) as [Lang, typeof LANG_META[Lang]][]).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setLangOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors",
                    lang === code ? "bg-cyan-950/60 text-cyan-400 font-semibold" : "text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <span className="text-base">{info.flag}</span>
                  <span>{info.label}</span>
                  {lang === code && <span className="ml-auto text-cyan-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card className="w-full max-w-md z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2 text-cyan-400"><Shield className="w-8 h-8" /></div>
          <CardTitle>{t.login_title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button variant={tab === "login" ? "default" : "outline"} className="flex-1" onClick={() => setTab("login")}>{t.login_tab}</Button>
            <Button variant={tab === "register" ? "default" : "outline"} className="flex-1" onClick={() => setTab("register")}>{t.register_tab}</Button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {tab === "register" && (
              <Input placeholder={t.name_placeholder} value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <Input type="email" placeholder={t.email_placeholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder={t.password_placeholder} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            
            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-2.5 py-1.5 px-0.5 select-none" dir={LANG_META[lang]?.dir === "rtl" ? "rtl" : "ltr"}>
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptedTerms}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20 cursor-pointer accent-cyan-500 shrink-0"
              />
              <label htmlFor="accept-terms" className="text-xs text-slate-400 leading-normal cursor-pointer">
                <span>{t.login_accept_terms_prefix}</span>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline font-bold transition-all focus:outline-none inline-block px-1"
                >
                  {t.login_accept_terms_link}
                </button>
              </label>
            </div>

            {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
            {alert && <p className="text-yellow-400 text-sm">{alert}</p>}
            <Button type="submit" className="w-full font-bold" disabled={!acceptedTerms}>
              {tab === "login" ? t.login_btn : t.register_btn}
            </Button>
          </form>
          <Button variant="outline" className="w-full mt-3" onClick={handleDemo}>{t.demo_btn}</Button>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
            <Link href="/" className="hover:text-cyan-400 transition-colors">{t.back_home}</Link>
            <Link href="/terms" className="hover:text-cyan-400 transition-colors underline">{t.footer_terms}</Link>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions Modal Overlay */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-white/10 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between" dir={LANG_META[lang]?.dir === "rtl" ? "rtl" : "ltr"}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {termsData[lang]?.title || termsData.es.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {termsData[lang]?.subtitle || termsData.es.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowTermsModal(false);
                  setAcceptedTerms(false);
                }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-sm" dir={LANG_META[lang]?.dir === "rtl" ? "rtl" : "ltr"}>
              <p className="text-slate-300 leading-relaxed text-sm">
                {termsData[lang]?.intro || termsData.es.intro}
              </p>

              <div className="space-y-6">
                {(termsData[lang]?.sections || termsData.es.sections).map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <h3 className="font-bold text-white text-sm">{section.title}</h3>
                      </div>
                      <div className="space-y-2 text-slate-300 text-xs leading-relaxed">
                        {section.content.map((p, pIdx) => (
                          <p key={pIdx}>{p}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Warning note */}
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-slate-300 text-xs leading-relaxed">
                {termsData[lang]?.footerNote || termsData.es.footerNote}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-slate-950/40 rounded-b-3xl" dir={LANG_META[lang]?.dir === "rtl" ? "rtl" : "ltr"}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowTermsModal(false);
                  setAcceptedTerms(false);
                }}
              >
                {lang === "es" ? "Cerrar" : lang === "ru" ? "Закрыть" : lang === "he" ? "סגור" : "Close"}
              </Button>
              <Button
                size="sm"
                className="bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/25 hover:border-cyan-400/50 hover:text-white transition-all"
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }}
              >
                {lang === "es" ? "Aceptar Términos" : lang === "ru" ? "Принять условия" : lang === "he" ? "אשר תנאים" : "Accept Terms"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
