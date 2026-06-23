"use client";

import Link from "next/link";
import { Shield, ArrowLeft, ShieldAlert } from "lucide-react";
import { useLang, LANG_META, Lang } from "@/contexts/language-context";
import { useEffect, useRef } from "react";
import { termsData } from "./termsData";

/* ─── Cyber Particles Background ─────────────────────────────── */
function CyberCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 0.2 + Math.random() * 0.5,
      size: 1 + Math.random() * 2,
      opacity: 0.05 + Math.random() * 0.15,
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00F5FF";

      particles.forEach((p) => {
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.y -= p.speed;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
}

export default function TermsPage() {
  const { lang, setLang } = useLang();
  const currentTerms = termsData[lang] || termsData.es;
  const isRtl = LANG_META[lang]?.dir === "rtl";

  return (
    <div className="min-h-screen bg-black text-neutral-100 overflow-x-hidden relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      <CyberCanvas />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff5722] to-orange-500 flex items-center justify-center shadow-lg shadow-[#ff5722]/20">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-[#ff5722] to-orange-500-400 bg-clip-text text-transparent">LeakGuard</span>
          </Link>

          {/* Mini Language Switcher */}
          <div className="flex gap-1.5">
            {(Object.entries(LANG_META) as [Lang, typeof LANG_META[Lang]][]).map(([code, info]) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2 py-1 rounded text-xs font-mono border transition-all ${
                  lang === code
                    ? "bg-[#ff5722]/15 text-[#ff5722] border-[#ff5722]/30 font-bold"
                    : "bg-white/5 text-neutral-400 border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                {info.flag}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-20 px-4 max-w-4xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
        <div className="mb-6">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm text-[#ff5722] hover:text-orange-300 transition-colors ${
              isRtl ? "flex-row-reverse" : ""
            }`}
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            <span>{lang === "es" ? "Volver al Inicio" : lang === "ru" ? "На главную" : lang === "he" ? "חזרה לדף הבית" : "Back to Home"}</span>
          </Link>
        </div>

        <div className="p-8 md:p-10 rounded-3xl border border-white/10 bg-[#111]/60 backdrop-blur-md relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-radial from-[#ff5722]/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className={`flex items-center gap-4 mb-6 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className="w-12 h-12 rounded-2xl bg-[#ff5722]/10 border border-[#ff5722]/20 flex items-center justify-center flex-shrink-0 text-[#ff5722] shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{currentTerms.title}</h1>
              <p className="text-neutral-400 text-sm mt-1">{currentTerms.subtitle}</p>
            </div>
          </div>

          <div className="border-b border-white/5 pb-4 mb-6">
            <span className="text-xs font-mono text-[#ff5722]/70 bg-[#ff5722]/10 px-2.5 py-1 rounded border border-[#ff5722]/20">
              {currentTerms.lastUpdated}
            </span>
          </div>

          <p className="text-neutral-300 leading-relaxed mb-8 text-base">
            {currentTerms.intro}
          </p>

          <div className="space-y-8">
            {currentTerms.sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors">
                  <div className={`flex items-center gap-3 mb-4 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#ff5722]">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <h2 className="text-lg font-bold text-white">{section.title}</h2>
                  </div>
                  <div className="space-y-3 text-neutral-300 text-sm leading-relaxed">
                    {section.content.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Warning */}
          <div className={`mt-10 p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
            <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-neutral-300 text-sm leading-relaxed font-medium">
              {currentTerms.footerNote}
            </p>
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="border-t border-white/5 py-6 px-4 text-center relative z-10 bg-black/80 backdrop-blur-md">
        <p className="text-neutral-500 text-xs">
          LeakGuard © 2026 — Threat Intelligence & OSINT Platform
        </p>
      </footer>
    </div>
  );
}
