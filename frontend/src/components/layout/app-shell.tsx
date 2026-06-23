"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LogOut, ChevronDown, CheckCircle, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLang, LANG_META, Lang } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const nav = [
    { href: "/dashboard", label: t.nav_dashboard },
    { href: "/exposure", label: t.nav_exposure },
    { href: "/resources", label: t.nav_resources },
    { href: "/admin", label: t.nav_admin },
    { href: "/ai-safety", label: t.nav_ai_safety },
  ];

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (!user) return null;

  const meta = LANG_META[lang];

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <header className="border-b border-white/5 bg-black/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-base flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#ff5722] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-extrabold tracking-tight">LeakGuard</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
                    active
                      ? "bg-[#ff5722]/15 text-[#ff5722]"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all text-xs font-medium"
                aria-label="Change language"
              >
                <span className="text-sm leading-none">{meta.flag}</span>
                <span className="hidden sm:inline">{meta.label}</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", langOpen && "rotate-180")} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden z-50">
                  {(Object.entries(LANG_META) as [Lang, (typeof LANG_META)[Lang]][]).map(([code, info]) => (
                    <button
                      key={code}
                      onClick={() => { setLang(code); setLangOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors",
                        lang === code ? "bg-[#ff5722]/15 text-[#ff5722] font-semibold" : "text-neutral-300 hover:bg-white/5"
                      )}
                      dir={info.dir}
                    >
                      <span className="text-base">{info.flag}</span>
                      <span>{info.label}</span>
                      {lang === code && <CheckCircle className="ml-auto w-3 h-3 text-[#ff5722]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right hidden sm:block leading-tight">
              <div className="text-xs font-semibold text-neutral-200">{user.name}</div>
              <div className="text-[10px] text-neutral-500">{user.role}</div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              title={t.nav_logout}
              onClick={() => { logout(); router.push("/login"); }}
              className="text-neutral-500 hover:text-rose-400 hover:bg-rose-400/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>

            <button
              className="md:hidden p-2 text-neutral-400 hover:text-white"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 px-4 py-3 space-y-1">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2.5 rounded-xl text-sm transition-colors",
                    active ? "bg-[#ff5722]/15 text-[#ff5722]" : "text-neutral-400 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">{children}</main>
    </div>
  );
}
