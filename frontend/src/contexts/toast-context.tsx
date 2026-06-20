"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

type Toast = { id: number; message: string; type: ToastType };

type ToastContextType = {
  toasts: Toast[];
  show: (message: string, type?: ToastType) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const typeStyles: Record<ToastType, string> = {
  success: "border-emerald-500/50 text-emerald-400",
  error: "border-red-500/50 text-red-400",
  warning: "border-yellow-500/50 text-yellow-400",
  info: "border-cyan-500/50 text-cyan-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border bg-slate-900/95 backdrop-blur px-4 py-3 text-sm shadow-lg ${typeStyles[toast.type]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function breachTypeToToast(type: string): ToastType {
  if (type === "warning") return "warning";
  if (type === "error") return "error";
  if (type === "info") return "info";
  return "success";
}
