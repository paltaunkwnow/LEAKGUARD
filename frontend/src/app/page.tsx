"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Shield, Radar, Lock, Brain, Map, Activity, Users,
  Eye, ChevronDown, AlertTriangle, Wifi, Globe,
  Key, RefreshCw, Mail, MousePointer, Smartphone,
  CheckCircle, ExternalLink,
  LockOpen, Database, Building, ClipboardList, CloudLightning, Radio, Search, MessageSquare,
  Github,
} from "lucide-react";
import { useLang, LANG_META, Lang } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const ShapeBlur = dynamic(() => import("@/components/ui/shape-blur"), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

/* ─── Animated Canvas Background ─────────────────────────────── */
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

    const LINES = Array.from({ length: 45 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 0.3 + Math.random() * 0.9,
      type: Math.floor(Math.random() * 5),
      opacity: 0.05 + Math.random() * 0.15,
      size: 14 + Math.random() * 10,
      drift: (Math.random() - 0.5) * 0.2,
    }));

    // Binary rain particles
    const BINARY = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 0.8 + Math.random() * 2,
      char: Math.random() > 0.5 ? "1" : "0",
      opacity: 0.04 + Math.random() * 0.08,
      size: 9 + Math.random() * 8,
      timer: Math.floor(Math.random() * 30),
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Binary rain
      BINARY.forEach((p) => {
        p.timer++;
        if (p.timer > 20) {
          p.char = Math.random() > 0.5 ? "1" : "0";
          p.timer = 0;
        }
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = "#00F5FF";
        ctx.font = `${p.size}px JetBrains Mono, monospace`;
        ctx.fillText(p.char, p.x, p.y);
        p.y += p.speed;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });

      // Falling icons (drawn as vectors)
      LINES.forEach((p) => {
        ctx.strokeStyle = "#00F5FF";
        ctx.fillStyle = "#00F5FF";
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = p.opacity;

        if (p.type === 0) {
          // Shield
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size / 2);
          ctx.quadraticCurveTo(p.x + p.size / 2, p.y - p.size / 2, p.x + p.size / 2, p.y);
          ctx.quadraticCurveTo(p.x + p.size / 2, p.y + p.size / 2, p.x, p.y + p.size);
          ctx.quadraticCurveTo(p.x - p.size / 2, p.y + p.size / 2, p.x - p.size / 2, p.y);
          ctx.quadraticCurveTo(p.x - p.size / 2, p.y - p.size / 2, p.x, p.y - p.size / 2);
          ctx.closePath();
          ctx.stroke();
        } else if (p.type === 1) {
          // Lock
          // Shackle
          ctx.beginPath();
          ctx.arc(p.x, p.y - p.size / 6, p.size / 3, Math.PI, 0);
          ctx.lineTo(p.x + p.size / 3, p.y + p.size / 6);
          ctx.lineTo(p.x - p.size / 3, p.y + p.size / 6);
          ctx.stroke();
          // Body
          ctx.strokeRect(p.x - p.size / 2, p.y + p.size / 6, p.size, p.size * 0.6);
          // Keyhole dot
          ctx.beginPath();
          ctx.arc(p.x, p.y + p.size / 2.5, p.size / 10, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 2) {
          // Key
          ctx.beginPath();
          ctx.arc(p.x - p.size / 3, p.y, p.size / 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.size * 0.7, p.y);
          ctx.lineTo(p.x + p.size * 0.7, p.y + p.size / 3);
          ctx.moveTo(p.x + p.size * 0.5, p.y);
          ctx.lineTo(p.x + p.size * 0.5, p.y + p.size / 3);
          ctx.stroke();
        } else if (p.type === 3) {
          // Radar/Target
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(p.x - p.size / 1.5, p.y);
          ctx.lineTo(p.x + p.size / 1.5, p.y);
          ctx.moveTo(p.x, p.y - p.size / 1.5);
          ctx.lineTo(p.x, p.y + p.size / 1.5);
          ctx.stroke();
        } else if (p.type === 4) {
          // Hexagon
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            ctx.lineTo(p.x + (p.size / 2) * Math.cos(angle), p.y + (p.size / 2) * Math.sin(angle));
          }
          ctx.closePath();
          ctx.stroke();
        }

        p.y += p.speed;
        p.x += p.drift;
        if (p.y > canvas.height + p.size) {
          p.y = -p.size;
          p.x = Math.random() * canvas.width;
        }
      });

      ctx.globalAlpha = 1;
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
      style={{ opacity: 0.6 }}
    />
  );
}

/* ─── Animated Counter ─────────────────────────────────────────── */
function AnimCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        let start = 0;
        const step = target / 60;
        const interval = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(interval); }
          else setCount(Math.floor(start));
        }, 16);
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Language Switcher ─────────────────────────────────────────── */
function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-sm font-medium backdrop-blur"
      >
        <span className="text-xs font-bold font-mono tracking-wider text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/30">{LANG_META[lang].flag}</span>
        <span className="hidden sm:inline">{LANG_META[lang].label}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur shadow-2xl overflow-hidden z-50">
          {(Object.entries(LANG_META) as [Lang, typeof LANG_META[Lang]][]).map(([code, info]) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors",
                lang === code ? "bg-cyan-500/20 text-cyan-400 font-semibold" : "text-slate-300 hover:bg-white/5"
              )}
            >
              <span className="text-xs font-bold font-mono tracking-wider text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/30">{info.flag}</span>
              <span>{info.label}</span>
              {lang === code && <CheckCircle className="ml-auto w-3.5 h-3.5 text-cyan-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Intel Sources Data ─────────────────────────────────────────── */
const INTEL_SOURCES = [
  { name: "Have I Been Pwned", desc: "Email & domain breach DB", icon: LockOpen, statusKey: "source_status_live" as const, url: "https://haveibeenpwned.com", iconColor: "text-emerald-400" },
  { name: "XposedOrNot", desc: "Massive breach database", icon: Database, statusKey: "source_status_live" as const, url: "https://xposedornot.com", iconColor: "text-blue-400" },
  { name: "CISA KEV", desc: "Known exploited vulnerabilities", icon: Building, statusKey: "source_status_public" as const, url: "https://cisa.gov/known-exploited-vulnerabilities-catalog", iconColor: "text-purple-400" },
  { name: "NVD / NIST", desc: "CVE vulnerability database", icon: ClipboardList, statusKey: "source_status_public" as const, url: "https://nvd.nist.gov", iconColor: "text-pink-400" },
  { name: "GreyNoise", desc: "Malicious IP intelligence", icon: CloudLightning, statusKey: "source_status_configured" as const, url: "https://greynoise.io", iconColor: "text-yellow-400" },
  { name: "Shodan", desc: "Exposed devices & services", icon: Radio, statusKey: "source_status_configured" as const, url: "https://shodan.io", iconColor: "text-cyan-400" },
  { name: "LeakIX", desc: "Exposed services scanner", icon: Search, statusKey: "source_status_public" as const, url: "https://leakix.net", iconColor: "text-amber-400" },
  { name: "IntelligenceX", desc: "OSINT & darkweb search", icon: Eye, statusKey: "source_status_configured" as const, url: "https://intelx.io", iconColor: "text-rose-400" },
  { name: "Cracked Forums", desc: "Underground leak monitor", icon: MessageSquare, statusKey: "source_status_live" as const, url: "#", iconColor: "text-teal-400" },
];

const STATUS_COLOR: Record<string, string> = {
  source_status_live: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  source_status_configured: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  source_status_public: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

/* ─── Main Landing Page ──────────────────────────────────────────── */
export default function LandingPage() {
  const { t } = useLang();

  const features = [
    { icon: Radar, title: t.feat_exposure_title, desc: t.feat_exposure_desc, color: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/20", iconColor: "text-cyan-400" },
    { icon: Lock, title: t.feat_creds_title, desc: t.feat_creds_desc, color: "from-purple-500/20 to-purple-500/5", border: "border-purple-500/20", iconColor: "text-purple-400" },
    { icon: Brain, title: t.feat_ai_title, desc: t.feat_ai_desc, color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/20", iconColor: "text-violet-400" },
    { icon: Map, title: t.feat_map_title, desc: t.feat_map_desc, color: "from-rose-500/20 to-rose-500/5", border: "border-rose-500/20", iconColor: "text-rose-400" },
    { icon: Activity, title: t.feat_monitor_title, desc: t.feat_monitor_desc, color: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/20", iconColor: "text-orange-400" },
    { icon: Users, title: t.feat_admin_title, desc: t.feat_admin_desc, color: "from-teal-500/20 to-teal-500/5", border: "border-teal-500/20", iconColor: "text-teal-400" },
  ];

  const recommendations = [
    { icon: Smartphone, title: t.rec_1_title, desc: t.rec_1_desc, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
    { icon: Key, title: t.rec_2_title, desc: t.rec_2_desc, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { icon: Mail, title: t.rec_3_title, desc: t.rec_3_desc, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
    { icon: MousePointer, title: t.rec_4_title, desc: t.rec_4_desc, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { icon: RefreshCw, title: t.rec_5_title, desc: t.rec_5_desc, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
  ];

  return (
    <div className="min-h-screen bg-[#040B14] text-slate-100 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <CyberCanvas />

      {/* ── Sticky Header ── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#040B14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">LeakGuard</span>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitcher />
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-sm font-semibold hover:bg-cyan-400/25 hover:border-cyan-400/50 transition-all backdrop-blur"
            >
              {t.landing_login_btn}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative z-10 pt-40 pb-24 px-4 text-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold mb-8 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_2px_rgba(244,63,94,0.6)]" />
          {t.landing_hero_badge}
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {t.landing_hero_title.split(" ").slice(0, 4).join(" ")}
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
            {t.landing_hero_title.split(" ").slice(4).join(" ")}
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-3 leading-relaxed">{t.landing_hero_sub1}</p>
        <p className="text-slate-500 text-base max-w-xl mx-auto mb-10">{t.landing_hero_sub2}</p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="group px-8 py-4 rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 font-bold text-base hover:bg-cyan-400/25 hover:border-cyan-400/50 hover:text-white transition-all hover:scale-105 backdrop-blur flex items-center gap-2"
          >
            <Eye className="w-5 h-5" />
            {t.landing_access_btn}
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-slate-300 font-semibold text-base hover:bg-white/10 hover:text-white transition-all backdrop-blur flex items-center gap-2"
          >
            <Globe className="w-5 h-5" />
            {t.landing_demo_btn}
          </Link>
        </div>

        {/* ShapeBlur interactive background (ReactBits) */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ zIndex: 0 }}>
          <ShapeBlur
            className="w-full h-full"
            variation={0}
            shapeSize={1.2}
            roundness={0.4}
            borderSize={0.05}
            circleSize={0.3}
            circleEdge={0.5}
          />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: 12400000, suffix: "+", label: t.landing_stats_breaches, color: "text-rose-400" },
            { value: 47, suffix: "+", label: t.landing_stats_countries, color: "text-cyan-400" },
            { value: 9, suffix: "", label: t.landing_stats_sources, color: "text-purple-400" },
            { value: 248, suffix: "", label: t.landing_stats_alerts, color: "text-orange-400" },
          ].map((s, i) => (
            <div key={i} className="text-center p-6 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur hover:border-white/10 transition-colors">
              <div className={cn("text-3xl md:text-4xl font-black mb-2 font-mono", s.color)}>
                <AnimCounter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-slate-500 text-xs leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.landing_features_title}</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, border, iconColor }) => (
              <div
                key={title}
                className={cn(
                  "group p-6 rounded-2xl border bg-gradient-to-br backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
                  color, border
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", iconColor)}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recommendations ── */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-b from-transparent via-slate-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" /> Security Tips
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.landing_rec_title}</h2>
            <p className="text-slate-500 max-w-xl mx-auto">{t.landing_rec_subtitle}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto rounded-full mt-4" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <div key={i} className={cn("p-6 rounded-2xl border backdrop-blur hover:scale-[1.02] transition-all", bg)}>
                <div className={cn("flex items-center gap-3 mb-3", color)}>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-bold text-white">{title}</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
            {/* Extra tip card */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur flex flex-col justify-center items-center text-center hover:scale-[1.02] transition-all">
              <AlertTriangle className="w-10 h-10 text-yellow-400 mb-3" />
              <p className="text-slate-300 font-semibold text-sm">
                {t.landing_hero_sub2}
              </p>
              <Link href="/login" className="mt-4 text-xs text-cyan-400 hover:underline flex items-center gap-1">
                {t.landing_access_btn} <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Intelligence Sources ── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4">
              <Wifi className="w-3.5 h-3.5" /> Data Sources
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.landing_sources_title}</h2>
            <p className="text-slate-500 max-w-xl mx-auto">{t.landing_sources_subtitle}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 mx-auto rounded-full mt-4" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEL_SOURCES.map((src) => (
              <div
                key={src.name}
                className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/3 hover:bg-white/6 hover:border-white/10 transition-all group"
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-white/5">
                  <src.icon className={cn("w-5 h-5", src.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{src.name}</span>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full border", STATUS_COLOR[src.statusKey])}>
                      ● {src.statusKey === "source_status_live" ? "LIVE" : src.statusKey === "source_status_configured" ? "API" : "PUBLIC"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{src.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-rose-500/10 backdrop-blur relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 animate-pulse" />
            <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-6 relative z-10" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 relative z-10">{t.landing_cta_title}</h2>
            <p className="text-slate-400 mb-8 relative z-10">{t.landing_cta_subtitle}</p>
            <div className="flex gap-4 justify-center flex-wrap relative z-10">
              <Link
                href="/login"
                className="px-8 py-4 rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 font-bold hover:bg-cyan-400/25 hover:border-cyan-400/50 hover:text-white hover:scale-105 transition-all backdrop-blur"
              >
                {t.landing_access_btn}
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-slate-300 font-semibold hover:bg-white/10 hover:text-white transition-all"
              >
                {t.landing_demo_btn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-4 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-500 text-sm mb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-500" />
            <span>LeakGuard © 2026 — Threat Intelligence & OSINT Platform</span>
          </div>
          <span className="hidden sm:inline text-white/10">|</span>
          <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-all">
            {t.footer_terms}
          </Link>
        </div>

        {/* Contributors Section */}
        <div className="flex flex-col items-center gap-3 mt-6 mb-4">
          <span className="text-slate-500 flex items-center gap-1.5 text-xs">
            <Github className="w-3.5 h-3.5 text-slate-400" /> Contributors
          </span>
          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              { user: 'paltaunkwnow' },
              { user: 'emilio-garcia-ie' },
              { user: 'invertilo' },
              { user: 'fernandocastedo' },
            ].map(({ user }) => (
              <a
                key={user}
                href={`https://github.com/${user}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group"
              >
                <img
                  src={`https://github.com/${user}.png?size=64`}
                  alt={user}
                  width={44}
                  height={44}
                  style={{ borderRadius: '50%', border: '2px solid rgba(0,245,255,0.25)', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLImageElement).style.borderColor = 'rgba(0,245,255,0.8)';
                    (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLImageElement).style.borderColor = 'rgba(0,245,255,0.25)';
                    (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
                  }}
                />
                <span className="text-xs text-slate-500 group-hover:text-cyan-400 transition-colors">
                  @{user}
                </span>
              </a>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">
          Powered by FastAPI · Next.js · PostgreSQL · FAISS · OpenAI
        </p>
      </footer>
    </div>
  );
}
