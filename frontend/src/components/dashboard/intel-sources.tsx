"use client";

import { ExternalLink, Wifi, LockOpen, Database, Building, ClipboardList, CloudLightning, Radio, Search, Eye, MessageSquare } from "lucide-react";
import { useLang } from "@/contexts/language-context";

const SOURCES = [
  { name: "Have I Been Pwned", icon: LockOpen, statusKey: "source_status_live" as const, url: "https://haveibeenpwned.com", desc: "Email / domain breach DB", iconColor: "text-emerald-400" },
  { name: "XposedOrNot", icon: Database, statusKey: "source_status_live" as const, url: "https://xposedornot.com", desc: "Breach records search", iconColor: "text-blue-400" },
  { name: "CISA KEV", icon: Building, statusKey: "source_status_public" as const, url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", desc: "Known exploited CVEs", iconColor: "text-purple-400" },
  { name: "NVD / NIST", icon: ClipboardList, statusKey: "source_status_public" as const, url: "https://nvd.nist.gov", desc: "CVE vulnerability DB", iconColor: "text-pink-400" },
  { name: "GreyNoise", icon: CloudLightning, statusKey: "source_status_configured" as const, url: "https://greynoise.io", desc: "Malicious IP intel", iconColor: "text-yellow-400" },
  { name: "Shodan", icon: Radio, statusKey: "source_status_configured" as const, url: "https://shodan.io", desc: "Exposed devices", iconColor: "text-[#ff5722]" },
  { name: "LeakIX", icon: Search, statusKey: "source_status_public" as const, url: "https://leakix.net", desc: "Exposed services", iconColor: "text-amber-400" },
  { name: "IntelligenceX", icon: Eye, statusKey: "source_status_configured" as const, url: "https://intelx.io", desc: "OSINT & darkweb", iconColor: "text-rose-400" },
  { name: "Cracked.io Monitor", icon: MessageSquare, statusKey: "source_status_live" as const, url: "#", desc: "Underground forum", iconColor: "text-teal-400" },
];

const STATUS_STYLE: Record<string, { dot: string; text: string; label: string }> = {
  source_status_live: { dot: "bg-emerald-400", text: "text-emerald-400", label: "LIVE" },
  source_status_configured: { dot: "bg-blue-400", text: "text-blue-400", label: "API" },
  source_status_public: { dot: "bg-purple-400", text: "text-purple-400", label: "PUBLIC" },
};

export function IntelSources() {
  const { t } = useLang();

  return (
    <div className="rounded-xl border border-white/8 bg-[#111]/60 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/8">
        <Wifi className="w-4 h-4 text-purple-400" />
        <h3 className="font-bold text-white text-sm">{t.intel_sources_title}</h3>
        <span className="ml-auto text-neutral-500 text-xs hidden sm:block">{t.intel_sources_subtitle}</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 xl:grid-cols-9 gap-0 divide-x divide-y divide-white/8">
        {SOURCES.map((src) => {
          const s = STATUS_STYLE[src.statusKey];
          const Icon = src.icon;
          return (
            <a
              key={src.name}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 hover:bg-white/5/60 transition-colors group text-center"
            >
              <span className="group-hover:scale-110 transition-transform">
                <Icon className={`w-5 h-5 ${src.iconColor}`} />
              </span>
              <span className="text-white text-xs font-semibold leading-tight">{src.name}</span>
              <span className="text-neutral-500 text-[10px] leading-tight">{src.desc}</span>
              <span className={`flex items-center gap-1 text-[9px] font-bold ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${src.statusKey === "source_status_live" ? "animate-pulse" : ""}`} />
                {s.label}
              </span>
              {src.url !== "#" && (
                <ExternalLink className="w-2.5 h-2.5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
