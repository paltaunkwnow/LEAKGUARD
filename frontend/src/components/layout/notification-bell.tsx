"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/contexts/notifications-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!user || user.id === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 text-[10px] font-bold rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-slate-950 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/40">
            <span className="text-xs font-bold text-slate-200">Security Notification Log</span>
            <button
              type="button"
              className="text-[10px] text-cyan-400 hover:underline"
              onClick={() => markAllRead()}
            >
              Marcar todas leídas
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-xs text-slate-500 text-center">Sin notificaciones</p>
            ) : (
              notifications.map((n) => {
                const isBreach = n.category === "account-breach";
                const isWarning = n.type === "warning";
                return (
                  <button
                    key={n.id}
                    type="button"
                    className={`w-full text-left p-3 text-xs border-b border-slate-800/40 hover:bg-slate-800/40 transition-colors ${
                      !n.read ? "bg-slate-900/30" : ""
                    } ${
                      isBreach && isWarning
                        ? "border-l-2 border-red-500/60"
                        : isBreach
                          ? "border-l-2 border-emerald-500/40"
                          : ""
                    }`}
                    onClick={() => {
                      if (!n.read) markRead(n.id);
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium text-slate-200">{n.message}</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        {formatTime(n.created_at)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
