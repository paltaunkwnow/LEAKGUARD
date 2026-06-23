"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Shield, Radar, Lock, Brain, Map, Activity, Users,
  Eye, Wifi, Globe, Key, RefreshCw, Mail,
  MousePointer, Smartphone, Github, ChevronLeft, ChevronRight,
  LockOpen, Database, Building, ClipboardList, CloudLightning, Radio, Search,
  MessageSquare, CheckCircle, ArrowRight,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroGlobe } from "@/components/landing/hero-globe";
import { useLang, LANG_META } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

/* ─── Animated Counter ─────────────────────────────────────────── */
function AnimCounter({
  target,
  suffix = "",
  millions = false,
  locale = "es",
}: {
  target: number;
  suffix?: string;
  millions?: boolean;
  locale?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const displayTarget = millions ? target / 1_000_000 : target;

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        let start = 0;
        const step = displayTarget / 60;
        const interval = setInterval(() => {
          start += step;
          if (start >= displayTarget) {
            setCount(displayTarget);
            clearInterval(interval);
          } else {
            setCount(millions ? Math.round(start * 10) / 10 : Math.floor(start));
          }
        }, 16);
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [displayTarget, millions]);

  const formatted = millions
    ? count.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : count.toLocaleString(locale);

  return (
    <span ref={ref}>
      {formatted}
      {millions ? ` M${suffix}` : suffix}
    </span>
  );
}

/* ─── Intel Sources ─────────────────────────────────────────────── */
const INTEL_SOURCES = [
  { name: "Have I Been Pwned", desc: "Email & domain breach DB", icon: LockOpen, statusKey: "source_status_live" as const, url: "https://haveibeenpwned.com", iconColor: "text-emerald-400" },
  { name: "XposedOrNot", desc: "Massive breach database", icon: Database, statusKey: "source_status_live" as const, url: "https://xposedornot.com", iconColor: "text-blue-400" },
  { name: "CISA KEV", desc: "Known exploited vulnerabilities", icon: Building, statusKey: "source_status_public" as const, url: "https://cisa.gov/known-exploited-vulnerabilities-catalog", iconColor: "text-purple-400" },
  { name: "NVD / NIST", desc: "CVE vulnerability database", icon: ClipboardList, statusKey: "source_status_public" as const, url: "https://nvd.nist.gov", iconColor: "text-pink-400" },
  { name: "GreyNoise", desc: "Malicious IP intelligence", icon: CloudLightning, statusKey: "source_status_configured" as const, url: "https://greynoise.io", iconColor: "text-yellow-400" },
  { name: "Shodan", desc: "Exposed devices & services", icon: Radio, statusKey: "source_status_configured" as const, url: "https://shodan.io", iconColor: "text-[#ff5722]" },
  { name: "LeakIX", desc: "Exposed services scanner", icon: Search, statusKey: "source_status_public" as const, url: "https://leakix.net", iconColor: "text-amber-400" },
  { name: "IntelligenceX", desc: "OSINT & darkweb search", icon: Eye, statusKey: "source_status_configured" as const, url: "https://intelx.io", iconColor: "text-rose-400" },
  { name: "Cracked Forums", desc: "Underground leak monitor", icon: MessageSquare, statusKey: "source_status_live" as const, url: "#", iconColor: "text-teal-400" },
];

const STATUS_COLOR: Record<string, string> = {
  source_status_live: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  source_status_configured: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  source_status_public: "bg-purple-500/15 text-purple-400 border-purple-500/25",
};

const TRUSTED_LOGOS = ["HIBP", "CISA", "NVD", "Shodan", "GreyNoise", "IntelX"];

/* ─── Testimonial Carousel ─────────────────────────────────────── */
function TestimonialCarousel({ items }: { items: { title: string; desc: string; icon: React.ElementType; color: string }[] }) {
  const [idx, setIdx] = useState(0);

  return (
    <div className="relative">
      <div className="rounded-2xl border border-white/8 bg-[#0a0a0a] p-8 min-h-[200px]">
        <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4", items[idx].color)}>
          {(() => { const Icon = items[idx].icon; return <Icon className="w-5 h-5" />; })()}
        </div>
        <h4 className="font-bold text-white text-lg mb-3">{items[idx].title}</h4>
        <p className="text-neutral-400 text-sm leading-relaxed">{items[idx].desc}</p>
      </div>
      <div className="flex items-center justify-center gap-4 mt-6">
        <button onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)} className="p-2 rounded-full border border-white/10 hover:bg-white/5 text-neutral-400">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-1.5">
          {items.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={cn("w-2 h-2 rounded-full transition-colors", i === idx ? "bg-[#ff5722]" : "bg-white/20")} />
          ))}
        </div>
        <button onClick={() => setIdx((i) => (i + 1) % items.length)} className="p-2 rounded-full border border-white/10 hover:bg-white/5 text-neutral-400">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Landing Page ──────────────────────────────────────────── */
export default function LandingPage() {
  const { t, lang } = useLang();

  const titleWords = t.landing_hero_title.split(" ");
  const titleMid = Math.ceil(titleWords.length / 2);
  const titleLine1 = titleWords.slice(0, titleMid).join(" ");
  const titleLine2 = titleWords.slice(titleMid).join(" ");

  const features = [
    { icon: Radar, title: t.feat_exposure_title, desc: t.feat_exposure_desc },
    { icon: Lock, title: t.feat_creds_title, desc: t.feat_creds_desc },
    { icon: Brain, title: t.feat_ai_title, desc: t.feat_ai_desc },
    { icon: Map, title: t.feat_map_title, desc: t.feat_map_desc },
    { icon: Activity, title: t.feat_monitor_title, desc: t.feat_monitor_desc },
    { icon: Users, title: t.feat_admin_title, desc: t.feat_admin_desc },
  ];

  const recommendations = [
    { icon: Smartphone, title: t.rec_1_title, desc: t.rec_1_desc, color: "text-[#ff5722]" },
    { icon: Key, title: t.rec_2_title, desc: t.rec_2_desc, color: "text-orange-400" },
    { icon: Mail, title: t.rec_3_title, desc: t.rec_3_desc, color: "text-rose-400" },
    { icon: MousePointer, title: t.rec_4_title, desc: t.rec_4_desc, color: "text-amber-400" },
    { icon: RefreshCw, title: t.rec_5_title, desc: t.rec_5_desc, color: "text-emerald-400" },
  ];

  const stats: { value: number; suffix: string; label: string; millions?: boolean }[] = [
    { value: 12400000, suffix: "+", label: t.landing_stats_breaches, millions: true },
    { value: 47, suffix: "+", label: t.landing_stats_countries },
    { value: 9, suffix: "", label: t.landing_stats_sources },
    { value: 248, suffix: "", label: t.landing_stats_alerts },
  ];

  const pricingTiers = [
    {
      name: t.landing_demo_btn,
      desc: t.landing_hero_sub2,
      price: "0",
      features: [t.feat_exposure_title, t.feat_creds_title, t.landing_stats_breaches],
      cta: t.landing_demo_btn,
      highlight: false,
    },
    {
      name: t.landing_access_btn,
      desc: t.feat_monitor_desc,
      price: "—",
      features: [t.feat_map_title, t.feat_ai_title, t.landing_stats_alerts],
      cta: t.landing_login_btn,
      highlight: true,
    },
    {
      name: t.feat_admin_title,
      desc: t.feat_admin_desc,
      price: "—",
      features: [t.kpi_verified, t.kpi_actors, t.kpi_sectors],
      cta: t.landing_login_btn,
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-neutral-100 overflow-x-hidden" dir={LANG_META[lang].dir}>
      <LandingHeader />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-8 px-4 text-center agentory-ring overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ff5722]/30 bg-[#ff5722]/10 text-[#ff5722] text-xs font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-[#ff5722] animate-pulse" />
            {t.landing_hero_badge}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight max-w-4xl mx-auto">
            <span className="text-white block">{titleLine1}</span>
            <span className="text-neutral-500 block">{titleLine2}</span>
          </h1>

          <p className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">{t.landing_hero_sub1}</p>

          <Link
            href="/login"
            className="relative z-20 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#ff5722] text-white font-semibold text-sm hover:bg-[#ff6b3d] transition-all mb-4 shadow-lg shadow-[#ff5722]/25"
          >
            {t.landing_access_btn}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative z-0 -mt-2">
          <HeroGlobe />
        </div>

        <p className="relative z-10 text-neutral-500 text-xs mt-4 font-mono tracking-wider uppercase">
          {t.landing_stats_sources} · {TRUSTED_LOGOS.join(" · ")}
        </p>
      </section>

      {/* ── Trusted By ── */}
      <section className="py-12 px-4 border-y border-white/5">
        <p className="text-center text-neutral-500 text-sm mb-8">{t.landing_sources_subtitle.split(".")[0]}</p>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-50">
          {TRUSTED_LOGOS.map((logo) => (
            <span key={logo} className="text-neutral-400 font-mono text-sm font-bold tracking-widest">{logo}</span>
          ))}
        </div>
      </section>

      {/* ── About / Built to handle ── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t.landing_features_title}
            </h2>
            <p className="text-neutral-400 leading-relaxed mb-4">{t.landing_hero_sub1}</p>
            <p className="text-neutral-500 text-sm leading-relaxed mb-8">{t.landing_hero_sub2}</p>
            <Link href="/login" className="inline-flex items-center gap-2 text-[#ff5722] text-sm font-semibold hover:underline">
              {t.landing_demo_btn} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-4">
            {features.slice(0, 3).map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group p-6 rounded-2xl border border-white/8 bg-[#0a0a0a] hover:border-[#ff5722]/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#ff5722]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#ff5722]" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 Feature Cards ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.feat_monitor_title}
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto">{t.feat_monitor_desc}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {features.slice(0, 3).map(({ icon: Icon, title, desc }) => (
              <Link key={title} href="/login" className="group p-6 rounded-2xl border border-white/8 bg-[#0a0a0a] hover:border-[#ff5722]/25 transition-all">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#ff5722]/10 transition-colors">
                  <Icon className="w-5 h-5 text-[#ff5722]" />
                </div>
                <h4 className="font-bold text-white mb-2">{title}</h4>
                <p className="text-neutral-500 text-sm leading-relaxed mb-4">{desc}</p>
                <span className="text-[#ff5722] text-xs font-semibold flex items-center gap-1">
                  {t.landing_demo_btn} <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bento Grid ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.feat_map_title}</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">{t.feat_map_desc}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:row-span-2 rounded-2xl border border-white/8 bg-[#0a0a0a] p-8 flex flex-col justify-between min-h-[320px]">
              <div>
                <p className="text-neutral-500 text-xs font-mono uppercase tracking-wider mb-2">{t.kpi_threats_today}</p>
                <p className="text-6xl font-bold text-[#ff5722] font-mono mb-4">10x</p>
                <h4 className="font-bold text-white text-lg mb-2">{features[3].title}</h4>
                <p className="text-neutral-500 text-sm leading-relaxed">{features[3].desc}</p>
              </div>
              <div className="mt-8 h-32 rounded-xl bg-gradient-to-br from-[#ff5722]/10 to-transparent border border-[#ff5722]/10 flex items-center justify-center">
                <Globe className="w-16 h-16 text-[#ff5722]/30" />
              </div>
            </div>
            {features.slice(4).map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-white/8 bg-[#0a0a0a] p-6">
                <div className="w-9 h-9 rounded-lg bg-[#ff5722]/10 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-[#ff5722]" />
                </div>
                <h4 className="font-bold text-white mb-2">{title}</h4>
                <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials / Recommendations ── */}
      <section id="recommendations" className="py-24 px-4 bg-gradient-to-b from-transparent via-[#0a0a0a] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ff5722]/25 bg-[#ff5722]/10 text-[#ff5722] text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" /> {t.tips_title}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.landing_rec_title}</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">{t.landing_rec_subtitle}</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <TestimonialCarousel items={recommendations} />
            <div className="grid sm:grid-cols-2 gap-4">
              {recommendations.map(({ icon: Icon, title, desc, color }, i) => (
                <div key={i} className="p-5 rounded-2xl border border-white/8 bg-[#0a0a0a]">
                  <div className={cn("flex items-center gap-2 mb-2", color)}>
                    <Icon className="w-4 h-4" />
                    <span className="font-semibold text-white text-sm">{title}</span>
                  </div>
                  <p className="text-neutral-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.landing_cta_title}</h2>
          <p className="text-neutral-500 max-w-xl mx-auto mb-14">{t.landing_cta_subtitle}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/8 bg-[#0a0a0a]">
                <div className="text-3xl md:text-4xl font-black font-mono text-[#ff5722] mb-2">
                  <AnimCounter target={s.value} suffix={s.suffix} millions={s.millions} locale={lang} />
                </div>
                <div className="text-neutral-500 text-xs leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.landing_features_title}</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">{t.landing_rec_subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "rounded-2xl border p-8 flex flex-col",
                  tier.highlight
                    ? "border-[#ff5722]/40 bg-[#ff5722]/5"
                    : "border-white/8 bg-[#0a0a0a]"
                )}
              >
                <p className="text-neutral-400 text-sm mb-1">{tier.name}</p>
                <p className="text-neutral-500 text-xs mb-6 leading-relaxed">{tier.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white font-mono">{tier.price}</span>
                  {tier.price !== "—" && <span className="text-neutral-500 text-sm">{t.landing_price_free}</span>}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-neutral-400">
                      <CheckCircle className="w-4 h-4 text-[#ff5722] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={cn(
                    "block text-center py-3 rounded-full text-sm font-semibold transition-colors",
                    tier.highlight
                      ? "bg-[#ff5722] text-white hover:bg-[#ff6b3d]"
                      : "border border-white/15 text-neutral-200 hover:bg-white/5"
                  )}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Intelligence Sources (Blog style) ── */}
      <section id="sources" className="py-24 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-neutral-400 text-xs font-semibold mb-4">
              <Wifi className="w-3.5 h-3.5" /> {t.landing_sources_title.split(" ").slice(0, 2).join(" ")}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.landing_sources_title}</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">{t.landing_sources_subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INTEL_SOURCES.map((src) => (
              <a
                key={src.name}
                href={src.url}
                target={src.url !== "#" ? "_blank" : undefined}
                rel={src.url !== "#" ? "noopener noreferrer" : undefined}
                className="group p-5 rounded-2xl border border-white/8 bg-[#0a0a0a] hover:border-[#ff5722]/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <src.icon className={cn("w-5 h-5", src.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-white text-sm group-hover:text-[#ff5722] transition-colors">{src.name}</span>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full border", STATUS_COLOR[src.statusKey])}>
                        {src.statusKey === "source_status_live" ? "LIVE" : src.statusKey === "source_status_configured" ? "API" : "PUBLIC"}
                      </span>
                    </div>
                    <p className="text-neutral-500 text-xs">{src.desc}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 sm:p-14 rounded-3xl border border-white/10 bg-gradient-to-br from-[#ff5722]/10 via-[#0a0a0a] to-[#0a0a0a] relative overflow-hidden">
            <div className="absolute inset-0 agentory-ring pointer-events-none" />
            <Shield className="w-14 h-14 text-[#ff5722] mx-auto mb-6 relative z-10" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 relative z-10">{t.landing_cta_title}</h2>
            <p className="text-neutral-400 mb-8 relative z-10">{t.landing_cta_subtitle}</p>
            <div className="flex gap-4 justify-center flex-wrap relative z-10">
              <Link href="/login" className="px-8 py-3.5 rounded-full bg-[#ff5722] text-white font-semibold hover:bg-[#ff6b3d] transition-all">
                {t.landing_access_btn}
              </Link>
              <Link href="/login" className="px-8 py-3.5 rounded-full border border-white/15 text-neutral-300 font-semibold hover:bg-white/5 transition-all">
                {t.landing_demo_btn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#ff5722] flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white">LeakGuard</span>
              </div>
              <p className="text-neutral-500 text-xs leading-relaxed">{t.landing_hero_sub1}</p>
            </div>
            <div>
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-4">{t.landing_footer_platform}</p>
              <div className="space-y-2">
                <Link href="/login" className="block text-neutral-500 text-sm hover:text-white transition-colors">{t.nav_dashboard}</Link>
                <Link href="/login" className="block text-neutral-500 text-sm hover:text-white transition-colors">{t.nav_exposure}</Link>
                <Link href="/login" className="block text-neutral-500 text-sm hover:text-white transition-colors">{t.nav_resources}</Link>
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-4">{t.landing_footer_security}</p>
              <div className="space-y-2">
                <Link href="/login" className="block text-neutral-500 text-sm hover:text-white transition-colors">{t.nav_ai_safety}</Link>
                <Link href="/login" className="block text-neutral-500 text-sm hover:text-white transition-colors">{t.nav_admin}</Link>
                <Link href="/terms" className="block text-neutral-500 text-sm hover:text-white transition-colors">{t.footer_terms}</Link>
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-4">{t.landing_footer_social}</p>
              <a href="https://github.com/emilio-garcia-ie/ai-safaty-scz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-neutral-500 text-sm hover:text-[#ff5722] transition-colors">
                <Github className="w-4 h-4" /> GitHub
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-8 border-t border-white/5">
            <div className="flex flex-wrap items-center justify-center gap-5">
              {[
                { user: "paltaunkwnow" },
                { user: "emilio-garcia-ie" },
                { user: "invertilo" },
                { user: "fernandocastedo" },
              ].map(({ user }) => (
                <a key={user} href={`https://github.com/${user}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
                  <img
                    src={`https://github.com/${user}.png?size=64`}
                    alt={user}
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-[#ff5722]/25 group-hover:border-[#ff5722]/70 transition-all group-hover:scale-110"
                  />
                  <span className="text-[10px] text-neutral-500 group-hover:text-[#ff5722] transition-colors">@{user}</span>
                </a>
              ))}
            </div>
            <p className="text-neutral-600 text-xs text-center">
              {t.landing_footer_copyright} · FastAPI · Next.js · PostgreSQL
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
