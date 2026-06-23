"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { 
  Database, Users, Globe, Search, 
  Radar, Info, ArrowUpRight, ShieldAlert, Sparkles, Filter
} from "lucide-react";

type Category = "breach_engines" | "threat_actors" | "threat_maps";

interface Resource {
  id: string;
  category: Category;
  name: string;
  desc: string;
  url: string;
  tags: string[];
}

const RESOURCES: Resource[] = [
  // 1. Data Breach Search Engines
  {
    id: "breach-credenshow",
    category: "breach_engines",
    name: "CredenShow",
    desc: "Identify your compromised credentials before others do.",
    url: "https://credenshow.com",
    tags: ["credentials", "breach-lookup"]
  },
  {
    id: "breach-hib-ransomed",
    category: "breach_engines",
    name: "HIB Ransomed",
    desc: "Because people have the right to know if their data has been leaked in ransomware attacks.",
    url: "https://haveibeenransom.com",
    tags: ["ransomware", "leak-lookup"]
  },
  {
    id: "breach-heroic-now",
    category: "breach_engines",
    name: "HEROIC.NOW",
    desc: "Has your data been leaked on the dark web? Scan your identities for FREE.",
    url: "https://heroic.now",
    tags: ["darkweb-scan", "identity"]
  },
  {
    id: "breach-iknowyour-dad",
    category: "breach_engines",
    name: "IKnowYour.Dad",
    desc: "Comprehensive OSINT search engine checking across multiple breach databases.",
    url: "https://iknowyour.dad",
    tags: ["identity", "leak-lookup"]
  },
  {
    id: "breach-leaker",
    category: "breach_engines",
    name: "Leaker",
    desc: "Passive leak enumeration CLI tool that searches across 10 breach databases simultaneously.",
    url: "https://github.com/leaker-dev/leaker",
    tags: ["cli", "osint", "passive-recon"]
  },
  {
    id: "breach-nox",
    category: "breach_engines",
    name: "NOX Framework",
    desc: "Recursive async framework for deep breach analysis, identity pivoting and threat mapping.",
    url: "https://github.com/nox-project/nox",
    tags: ["framework", "async", "pivoting"]
  },
  {
    id: "breach-osintcat",
    category: "breach_engines",
    name: "OsintCat",
    desc: "Check if an email address has been exposed in known data breaches. Fast lookup with a simple API.",
    url: "https://osintcat.com",
    tags: ["email-lookup", "api"]
  },
  {
    id: "breach-stealseek",
    category: "breach_engines",
    name: "StealSeek",
    desc: "Powerful search engine designed to help you find and analyze credentials in data breaches.",
    url: "https://stealseek.io",
    tags: ["credentials", "analysis"]
  },
  {
    id: "breach-venacus",
    category: "breach_engines",
    name: "Venacus",
    desc: "Search for your data breaches and get notified when your identity is compromised.",
    url: "https://venacus.com",
    tags: ["monitoring", "breach-lookup"]
  },

  // 2. Threat Actor Search
  {
    id: "actor-apt-groups",
    category: "threat_actors",
    name: "APT Groups and Operations",
    desc: "Know about Threat Actors, sponsored countries, their tools, methods, and active campaigns.",
    url: "https://apt.etda.or.th",
    tags: ["apt", "campaigns", "attribution"]
  },
  {
    id: "actor-bizone",
    category: "threat_actors",
    name: "Bi.Zone",
    desc: "Detailed profile tracking of 148 threat groups with mapped tactics, techniques, and procedures (TTPs).",
    url: "https://bi.zone",
    tags: ["ttps", "mitre-mapping"]
  },
  {
    id: "actor-breachhq",
    category: "threat_actors",
    name: "BreachHQ",
    desc: "Provides a list of all known cyber threat actors, malicious actors, APT groups, or hacking collectives.",
    url: "https://breachhq.com",
    tags: ["apt-profiles", "threat-actors"]
  },
  {
    id: "actor-darkwebinformer",
    category: "threat_actors",
    name: "Dark Web Informer",
    desc: "Tracking hundreds of active threat actors, ransomware groups, and underground leaks.",
    url: "https://darkwebinformer.com",
    tags: ["ransomware-track", "darkweb"]
  },
  {
    id: "actor-etda",
    category: "threat_actors",
    name: "ETDA Threat Actor Hub",
    desc: "Search for Threat Actor groups, country sponsorship, and custom malware tools.",
    url: "https://apt.etda.or.th",
    tags: ["apt-database", "malware-mapping"]
  },
  {
    id: "actor-fortiguard",
    category: "threat_actors",
    name: "FortiGuard Threat Actor Encyclopedia",
    desc: "Encyclopedia providing actionable insights, helping security teams prepare and streamline hunting.",
    url: "https://www.fortiguard.com/encyclopedia?type=threatactor",
    tags: ["encyclopedia", "threat-hunting"]
  },
  {
    id: "actor-knowledge-now",
    category: "threat_actors",
    name: "KNOWLEDGENOW",
    desc: "Platform tracking trending cybersecurity threats, active malware exploits, and adversary groups.",
    url: "https://knowledge.now",
    tags: ["trending-threats", "exploits"]
  },
  {
    id: "actor-lazarusholic",
    category: "threat_actors",
    name: "Lazarusholic",
    desc: "Dedicated repository tracking threat actors with profiles, operations, and associated indicators.",
    url: "https://lazarusholic.github.io",
    tags: ["threat-actors", "intel"]
  },
  {
    id: "actor-malpedia",
    category: "threat_actors",
    name: "Malpedia",
    desc: "A collaborative database providing list of threat actor groups and associated malware families.",
    url: "https://malpedia.caad.fkie.fraunhofer.de",
    tags: ["malware-db", "adversaries"]
  },
  {
    id: "actor-misp-galaxy",
    category: "threat_actors",
    name: "MISP Galaxy",
    desc: "Known or estimated adversary groups as identified by misp-project and industry partners.",
    url: "https://www.misp-project.org/galaxy.html",
    tags: ["misp-galaxy", "sharing"]
  },
  {
    id: "actor-openhunting",
    category: "threat_actors",
    name: "OPENHUNTING.IO",
    desc: "Threat library collecting actionable intelligence, hunting queries, and adversary profiles.",
    url: "https://openhunting.io",
    tags: ["threat-library", "hunting-queries"]
  },
  {
    id: "actor-socradar-labs",
    category: "threat_actors",
    name: "SOCRadar LABS",
    desc: "Know threat actor tactics, techniques, and past activities. Access detailed profiles and track TTPs.",
    url: "https://socradar.io/labs/",
    tags: ["soc-radar", "ttps", "profiles"]
  },
  {
    id: "actor-thales",
    category: "threat_actors",
    name: "Thales Attack Explorer",
    desc: "Find and analyze threat actor groups in a graphical attack explorer based on MITRE ATT&CK.",
    url: "https://www.thalesgroup.com",
    tags: ["graphical-explorer", "mitre"]
  },
  {
    id: "actor-usernames-scrape",
    category: "threat_actors",
    name: "Threat Actor Usernames Scrape",
    desc: "A collection of intel and 650k+ threat actor usernames scraped from underground forums.",
    url: "https://github.com/threat-actor-usernames",
    tags: ["intel-scrape", "usernames", "forums"]
  },

  // 3. Live Cyber Threat Maps
  {
    id: "map-bitdefender",
    category: "threat_maps",
    name: "Bitdefender Threat Map",
    desc: "Interactive real-time visualization of global cyberthreats blocked by Bitdefender.",
    url: "https://threatmap.bitdefender.com",
    tags: ["real-time", "attacks"]
  },
  {
    id: "map-bunkerweb",
    category: "threat_maps",
    name: "BunkerWeb Live Map",
    desc: "Live map of cyber attacks blocked by BunkerWeb, an open-source next-generation WAF.",
    url: "https://demo.bunkerweb.io",
    tags: ["waf", "blocked-attacks"]
  },
  {
    id: "map-checkpoint",
    category: "threat_maps",
    name: "Check Point Live Map",
    desc: "Explore top cyber threats in real time, including ransomware, infostealers, and cloud targets.",
    url: "https://threatmap.checkpoint.com",
    tags: ["real-time", "malware"]
  },
  {
    id: "map-cisco-talos",
    category: "threat_maps",
    name: "Cisco Talos Intelligence",
    desc: "Global threat map illustrating IP reputation, spam rates, and malicious network traffic.",
    url: "https://talosintelligence.com",
    tags: ["reputation", "network-traffic"]
  },
  {
    id: "map-fortiguard",
    category: "threat_maps",
    name: "FortiGuard Outbreak Map",
    desc: "FortiGuard Outbreak Alerts providing key information about on-going cybersecurity outbreaks.",
    url: "https://threatmap.fortiguard.com",
    tags: ["outbreaks", "alerts"]
  },
  {
    id: "map-hcl",
    category: "threat_maps",
    name: "HCL Threat Map",
    desc: "Visualized cyber threat map showing active malware activity and network security events.",
    url: "https://hcltech.com",
    tags: ["cyber-threats", "malware"]
  },
  {
    id: "map-ibm-xforce",
    category: "threat_maps",
    name: "IBM X-Force Activity Map",
    desc: "Real-time threat intelligence feeds showing current malicious IP and domain activity.",
    url: "https://exchange.xforce.ibmcloud.com",
    tags: ["malicious-activity", "ips"]
  },
  {
    id: "map-imperva",
    category: "threat_maps",
    name: "Imperva Live Threat Map",
    desc: "Real-time global view of DDoS attacks, hacking attempts, and bot assaults mitigated by Imperva.",
    url: "https://www.imperva.com/resources/ddos-live-threat-map/",
    tags: ["ddos", "bots", "mitigation"]
  },
  {
    id: "map-kaspersky",
    category: "threat_maps",
    name: "Kaspersky Cyberthreat Live Map",
    desc: "Interactive live map showing real-time scans, web anti-virus detections, and mail threats.",
    url: "https://cybermap.kaspersky.com",
    tags: ["real-time", "interactive"]
  },
  {
    id: "map-lionic",
    category: "threat_maps",
    name: "LIONIC Cyber Threat Map",
    desc: "Cyber threat map visualizing security blocks, IPS activities, and virus outbreaks globally.",
    url: "https://www.lionic.com/threatmap/",
    tags: ["blocks", "ips", "virus"]
  },
  {
    id: "map-netscout",
    category: "threat_maps",
    name: "NETSCOUT Cyber Threat Map",
    desc: "Real-Time DDoS Attack Map presenting global network congestion and DDoS mitigation events.",
    url: "https://www.netscout.com/ddos-threat-map",
    tags: ["ddos", "real-time"]
  },
  {
    id: "map-radware",
    category: "threat_maps",
    name: "Radware Live Threat Map",
    desc: "Presents near real-time information about cyberattacks based on a global threat deception network.",
    url: "https://live-threat-map.radware.com",
    tags: ["deception-network", "attacks"]
  },
  {
    id: "map-securegateway",
    category: "threat_maps",
    name: "Secure Gateway Live Map",
    desc: "Dashboard showcasing threat alerts, security events, and block rates monitored by Secure Gateway.",
    url: "https://threatmap.securegateway.com",
    tags: ["alerts", "security-events"]
  },
  {
    id: "map-thales",
    category: "threat_maps",
    name: "Thales Cyberthreat Map",
    desc: "Discover cybersecurity trends, targeted areas, frequent attacks, and affected sectors.",
    url: "https://www.thalesgroup.com",
    tags: ["trends", "attacks", "sectors"]
  },
  {
    id: "map-threatseye",
    category: "threat_maps",
    name: "ThreatsEye | Cyber Threat Map",
    desc: "Real-time visualization of global cyber attacks, attack origins, targets, and threat categories.",
    url: "https://threatseye.com",
    tags: ["origins", "targets", "real-time"]
  },
  {
    id: "map-worldmonitor",
    category: "threat_maps",
    name: "World Monitor Tech",
    desc: "Intelligence dashboard combining CISA advisories, CVE feeds, campaigns, and global heatmaps.",
    url: "https://worldmonitor.tech",
    tags: ["heatmaps", "cisa-advisories", "cve"]
  },
  {
    id: "map-zscaler",
    category: "threat_maps",
    name: "Zscaler Global Threat Map",
    desc: "Illustrates threats seen in the past 24 hours detected by Zscaler security cloud.",
    url: "https://threatmap.zscaler.com",
    tags: ["clouds-threats", "24h-scans"]
  }
];

export default function OSINTResourcesPage() {
  const { t } = useLang();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");

  const categories = useMemo(() => [
    { id: "all" as const, label: t.category_all, icon: Filter, count: RESOURCES.length },
    { id: "breach_engines" as const, label: t.category_breach_engines, icon: Database, count: RESOURCES.filter(r => r.category === "breach_engines").length },
    { id: "threat_actors" as const, label: t.category_threat_actors, icon: Users, count: RESOURCES.filter(r => r.category === "threat_actors").length },
    { id: "threat_maps" as const, label: t.category_threat_maps, icon: Globe, count: RESOURCES.filter(r => r.category === "threat_maps").length },
  ], [t]);

  const filteredResources = useMemo(() => {
    return RESOURCES.filter(resource => {
      const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
      const matchesSearch = 
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const getCategoryStyles = (category: Category) => {
    switch (category) {
      case "breach_engines":
        return {
          icon: Database,
          badgeColor: "bg-[#ff5722]/10 text-[#ff5722] border-[#ff5722]/20",
          glowColor: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
          borderHover: "group-hover:border-[#ff5722]/50"
        };
      case "threat_actors":
        return {
          icon: ShieldAlert,
          badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          glowColor: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
          borderHover: "group-hover:border-purple-500/50"
        };
      case "threat_maps":
        return {
          icon: Radar,
          badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          glowColor: "group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]",
          borderHover: "group-hover:border-rose-500/50"
        };
    }
  };

  const getCategoryHeaderDesc = () => {
    if (selectedCategory === "breach_engines") return t.category_description_breach;
    if (selectedCategory === "threat_actors") return t.category_description_actors;
    if (selectedCategory === "threat_maps") return t.category_description_maps;
    return null;
  };

  return (
    <ProtectedRoute>
      <AppShell>
        {/* Header section with gradient background highlight */}
        <div className="relative mb-8 p-6 sm:p-8 rounded-2xl border border-white/8 bg-[#111]/40 overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-radial from-[#ff5722]/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> OSINT Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              {t.resources_title}
            </h1>
            <p className="text-neutral-400 text-sm max-w-2xl leading-relaxed">
              {t.resources_subtitle}
            </p>
          </div>
        </div>

        {/* Search and Filters bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          {/* Search box */}
          <div className="relative flex-1">
            <Input
              placeholder={t.resources_search_placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 border-white/8 bg-[#111]/60 focus:border-[#ff5722] focus:ring-[#ff5722]/20"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-[#0a0a0a]/40 border border-white/8 rounded-xl overflow-x-auto whitespace-nowrap">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    active
                      ? "bg-[#1a1a1a] text-white shadow-lg shadow-black/20"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                    active ? "bg-[#222] text-neutral-300" : "bg-[#111] text-neutral-500"
                  )}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Description Banner */}
        {getCategoryHeaderDesc() && (
          <div className="mb-6 flex gap-3 p-4 rounded-xl border border-white/8 bg-[#111]/20 text-neutral-400 text-xs items-start leading-relaxed animate-fade-in">
            <Info className="w-4.5 h-4.5 text-[#ff5722] shrink-0 mt-0.5" />
            <p>{getCategoryHeaderDesc()}</p>
          </div>
        )}

        {/* Grid layout for resources */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/8 rounded-2xl bg-[#111]/10">
            <Database className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm font-semibold">{t.no_resources_found}</p>
            <p className="text-neutral-600 text-xs mt-1">Try tweaking your search or category filter</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => {
              const styles = getCategoryStyles(res.category);
              const CategoryIcon = styles.icon;
              return (
                <div
                  key={res.id}
                  className={cn(
                    "group flex flex-col justify-between p-5 rounded-xl border border-white/8 bg-[#111]/40 backdrop-blur transition-all duration-300 hover:bg-white/5/20 hover:-translate-y-1 shadow-lg shadow-black/10",
                    styles.borderHover,
                    styles.glowColor
                  )}
                >
                  <div>
                    {/* Header: Category Badge + Share button */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border leading-none", styles.badgeColor)}>
                        {res.category === "breach_engines" ? t.category_breach_engines : res.category === "threat_actors" ? t.category_threat_actors : t.category_threat_maps}
                      </span>
                      <CategoryIcon className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                    </div>

                    {/* Content: Title + Description */}
                    <h3 className="font-extrabold text-white text-base mb-2 group-hover:text-[#ff5722] transition-colors">
                      {res.name}
                    </h3>
                    <p className="text-neutral-400 text-xs leading-relaxed mb-4">
                      {res.desc}
                    </p>
                  </div>

                  <div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {res.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-[#0a0a0a] text-neutral-500 hover:text-neutral-400 border border-white/8/60 text-[9px] font-mono leading-none py-0.5 px-1.5"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Launch Link Button */}
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff5722] group-hover:text-orange-300 transition-all border-t border-white/8/80 w-full pt-3"
                    >
                      <span>Launch Link</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
