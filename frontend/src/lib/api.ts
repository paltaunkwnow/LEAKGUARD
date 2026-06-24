/**
 * Browser: use NEXT_PUBLIC_API_URL when set (Docker/direct); else relative URL for Next rewrites.
 * Server (SSR/rewrites): use INTERNAL_API_URL for Docker internal networking.
 */
const API_BASE =
  (typeof window === "undefined"
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "") ??
  (typeof window !== "undefined" ? "" : "http://localhost:8000");

function parseApiError(data: unknown, status: number): string {
  const body = data as { detail?: string | Array<{ msg?: string }>; error?: string };
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail)) {
    const msgs = body.detail.map((e) => e.msg).filter(Boolean);
    if (msgs.length) return msgs.join("; ");
  }
  if (body.error) return body.error;
  return `Error ${status}`;
}

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("leakguard_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("leakguard_token");
      localStorage.removeItem("leakguard_breach_alert");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    throw new Error(parseApiError(data, res.status));
  }
  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: User; breach_alert?: BreachAlert }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name: string) =>
    request<{ access_token: string; user: User; breach_alert?: BreachAlert }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  demo: () => request<{ access_token: string; user: User }>("/api/v1/auth/demo", { method: "POST" }),
  me: () => request<{ authenticated: boolean; user?: User }>("/api/v1/auth/me"),
  threats: () => request<Threat[]>("/api/v1/threats"),
  threat: (id: string) => request<Threat>(`/api/v1/threats/${id}`),
  adminQueue: () => request<AdminQueue>("/api/v1/threats/admin/queue"),
  verifyThreat: (id: string, action: string, reason: string) =>
    request<Threat>(`/api/v1/threats/${id}/verify`, {
      method: "POST",
      body: JSON.stringify({ action, reason }),
    }),
  audits: () => request<AuditEntry[]>("/api/v1/threats/admin/audits"),
  scan: (requestStr: string, mode: string, search_target: string = "breaches") =>
    request<ScanResult>("/api/v1/exposure/scan", {
      method: "POST",
      body: JSON.stringify({ request: requestStr, mode, search_target }),
    }),
  kAnon: (prefix: string) =>
    request<{ prefix: string; hashes: string[] }>(`/api/v1/exposure/k-anon/${prefix}`),
  consulted: () => request<ConsultedScan[]>("/api/v1/exposure/consulted"),
  clearConsulted: () => request<{ status: string; message: string }>("/api/v1/exposure/consulted", { method: "DELETE" }),
  breachesRecent: () => request<{ breaches: unknown }>("/api/v1/exposure/breaches-recent"),
  dashboardKpis: () => request<DashboardKpis>("/api/v1/dashboard/kpis"),
  dashboardCharts: () => request<ChartData>("/api/v1/dashboard/charts"),
  darkweb: () => request<{ items: DarkWebItem[] }>("/api/v1/dashboard/darkweb"),
  crackedLeaks: () => request<CrackedLeak[]>("/api/v1/dashboard/cracked-leaks"),
  hackreadNews: () => request<HackreadArticle[]>("/api/v1/dashboard/hackread-news"),
  aiSafety: () => request<AiSafetyMetrics>("/api/v1/dashboard/ai-safety"),
  aiAnalyze: (context: string, question?: string) =>
    request<{ answer: string; model: string; confidence: number }>("/api/v1/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ context, question }),
    }),
};

export type User = { id: number; email: string; name: string; role: string; clearance: string };
export type BreachAlert = {
  type: string;
  message: string;
  breachCount?: number;
  sources?: string[];
  mostRecent?: string;
  passwordRisk?: boolean;
};
export type Threat = Record<string, unknown> & {
  id: string;
  date: string;
  actor: string;
  victim: string;
  sector: string;
  country: string;
  riskScore: number;
  confidence: number;
  status: string;
  verificationStatus: string;
};
export type AdminQueue = { pending: number; verified: number; rejected: number; incidents: Threat[] };
export type AuditEntry = { timestamp: string; analyst: string; action: string; reason: string };
export type IncidentRecord = {
  id?: string;
  date?: string;
  actor?: string;
  victim?: string;
  sector?: string;
  country?: string;
  riskScore?: number;
  severity?: string;
  sourceName?: string;
  title?: string;
  login?: string;
  credential?: string;
  [key: string]: unknown;
};

export type ScanResult = {
  query: string;
  searchType: string;
  records: IncidentRecord[];
  stats: Record<string, number | null>;
  risk: { score: number; level: string; barColor: string };
  recommendations: Array<{ priority: string; color: string; items: string[] }>;
  sourcesChecked?: Array<{ name: string; status: string; hits: number; url: string }>;
  actorProfile?: {
    name: string;
    origin: string;
    sponsored: string;
    description: string;
    targetSectors: string[];
    typicalTools: string[];
    riskScore: number;
    confidence: number;
    externals: Record<string, string>;
  };
};
export type ConsultedScan = {
  queryHashPrefix?: string;
  searchType: string;
  riskScore: number;
  totalLogins: number;
  timestamp: string;
};
export type DashboardKpis = { threatsToday: number; critical: number; verified: number; pending: number; actors: number; sectors: number };
export type ChartData = {
  sectors: { labels: string[]; data: number[] };
  riskStatus: { labels: string[]; data: number[] };
  verification: { labels: string[]; data: number[] };
  geo: Record<string, number>;
};
export type DarkWebItem = { date: string; forum: string; title: string; victim: string; severity: string; indicator: string };
export type CrackedLeak = { title: string; link: string; author: string; date: string; replies: string; views: string };
export type HackreadArticle = { title: string; link: string; author: string; date: string; category: string };
export type AiSafetyMetrics = { verificationRate: string; falsePositiveRate: string; avgConfidence: string };
