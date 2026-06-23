"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Shield, Menu, X, ChevronDown, CheckCircle } from "lucide-react";
import { useLang, LANG_META, Lang } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const { t, lang, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: "#features", label: t.landing_features_title.split(" ").slice(0, 2).join(" ") },
    { href: "#sources", label: t.landing_sources_title.split(" ").slice(0, 2).join(" ") },
    { href: "#recommendations", label: t.landing_rec_title },
    { href: "/terms", label: t.footer_terms },
  ];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const langOptions = (Object.entries(LANG_META) as [Lang, (typeof LANG_META)[Lang]][]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff5722] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">LeakGuard</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all text-xs font-medium"
              aria-label="Change language"
            >
              <span className="font-mono text-[#ff5722]">{LANG_META[lang].flag}</span>
              <span className="hidden sm:inline max-w-[5rem] truncate">{LANG_META[lang].label}</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", langOpen && "rotate-180")} />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden z-50">
                {langOptions.map(([code, info]) => (
                  <button
                    key={code}
                    onClick={() => { setLang(code); setLangOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors",
                      lang === code ? "bg-[#ff5722]/15 text-[#ff5722] font-semibold" : "text-neutral-300 hover:bg-white/5"
                    )}
                    dir={info.dir}
                  >
                    <span className="font-mono">{info.flag}</span>
                    <span>{info.label}</span>
                    {lang === code && <CheckCircle className="ml-auto w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center px-5 py-2 rounded-full bg-[#ff5722] text-white text-sm font-semibold hover:bg-[#ff6b3d] transition-colors"
          >
            {t.landing_login_btn}
          </Link>

          <button
            className="md:hidden p-2 text-neutral-400 hover:text-white"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/95 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-neutral-300 hover:text-white py-2"
            >
              {link.label}
            </a>
          ))}
          <Link href="/login" className="block text-center py-2.5 rounded-full bg-[#ff5722] text-white text-sm font-semibold">
            {t.landing_login_btn}
          </Link>
        </div>
      )}
    </header>
  );
}
