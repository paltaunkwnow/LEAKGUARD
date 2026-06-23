import { cn } from "@/lib/utils";

export function Badge({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold", className)} {...props}>
      {children}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, string> = {
    Critical: "bg-red-950/80 text-red-400 border-red-800/60",
    High: "bg-orange-950/80 text-orange-400 border-orange-800/60",
    Medium: "bg-yellow-950/80 text-yellow-400 border-yellow-800/60",
    Low: "bg-green-950/80 text-green-400 border-green-800/60",
    Verified: "bg-green-950/80 text-green-400 border-green-800/60",
    "Pending Review": "bg-yellow-950/80 text-yellow-400 border-yellow-800/60",
    "Rejected Incident": "bg-red-950/80 text-red-400 border-red-800/60",
  };
  return map[status] || "bg-[#1a1a1a] text-slate-300 border-slate-700";
}
