"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/exposure", label: "Exposure Check" },
  { href: "/admin", label: "Admin" },
  { href: "/ai-safety", label: "AI Safety" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-cyan-400">
            <Shield className="w-5 h-5" /> LeakGuard
          </Link>
          <nav className="hidden md:flex gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                  pathname.startsWith(item.href) ? "bg-cyan-950/50 text-cyan-400" : "text-slate-400 hover:text-slate-200"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <NotificationBell />
            <div className="text-right hidden sm:block">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-slate-500">{user.role}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { logout(); router.push("/login"); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
