"use client";

import { Shield, Key, Mail, MousePointer, RefreshCw, Smartphone } from "lucide-react";
import { useLang } from "@/contexts/language-context";

export function SecurityTips() {
  const { t } = useLang();

  const tips = [
    { icon: Smartphone, title: t.tip_2fa_title, desc: t.tip_2fa_desc, color: "text-[#ff5722]", bg: "bg-[#ff5722]/10 border-[#ff5722]/20" },
    { icon: Key, title: t.tip_pwd_title, desc: t.tip_pwd_desc, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { icon: Mail, title: t.tip_monitor_title, desc: t.tip_monitor_desc, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
    { icon: MousePointer, title: t.tip_phishing_title, desc: t.tip_phishing_desc, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { icon: RefreshCw, title: t.tip_update_title, desc: t.tip_update_desc, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
  ];

  return (
    <div className="rounded-xl border border-white/8 bg-[#111]/60 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/8">
        <Shield className="w-4 h-4 text-[#ff5722]" />
        <h3 className="font-bold text-white text-sm">{t.tips_title}</h3>
        <span className="ml-auto text-neutral-500 text-xs">{t.tips_subtitle}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4">
        {tips.map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className={`flex flex-col gap-2 p-3 rounded-lg border ${bg} hover:scale-[1.02] transition-transform`}>
            <div className={`flex items-center gap-2 ${color}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold text-white text-xs">{title}</span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
