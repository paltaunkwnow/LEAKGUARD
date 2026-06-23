"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, AiSafetyMetrics } from "@/lib/api";
import { useLang } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { Send, Bot, User as UserIcon } from "lucide-react";

type Message = { sender: "user" | "ai"; text: string };

function parseMarkdown(text: string) {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="text-[#ff5722] font-extrabold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function AiSafetyPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AiSafetyMetrics | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  // Chat state
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.aiSafety().then(setMetrics).catch(() => setMetrics(null));
  }, [user]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.aiAnalyze(
        "Incidente LockBit 3.0 contra sector salud con exfiltración AD y hashes NTLM.",
        "Resume riesgo e impacto para el analista."
      );
      setAnalysis(res.answer);
      setChatHistory([
        { sender: "ai", text: res.answer }
      ]);
    } catch (err) {
      setAnalysis(err instanceof Error ? err.message : "Error en análisis AI");
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || chatLoading) return;
    
    const userText = inputMsg;
    setInputMsg("");
    setChatHistory((prev) => [...prev, { sender: "user", text: userText }]);
    setChatLoading(true);

    try {
      const context = "Incidente LockBit 3.0 contra sector salud con exfiltración AD y hashes NTLM. Analizando detalles adicionales.";
      const res = await api.aiAnalyze(context, userText);
      setChatHistory((prev) => [...prev, { sender: "ai", text: res.answer }]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Error de comunicación";
      setChatHistory((prev) => [...prev, { sender: "ai", text: `Error: ${errMsg}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="text-2xl font-bold mb-6">{t.ai_title}</h1>

        {metrics && (
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-[#ff5722]">{metrics.verificationRate}%</div>
                <div className="text-sm text-neutral-500">{t.ai_verif_rate}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-orange-400">{metrics.falsePositiveRate}%</div>
                <div className="text-sm text-neutral-500">{t.ai_false_positive}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-400">{metrics.avgConfidence}%</div>
                <div className="text-sm text-neutral-500">{t.ai_confidence}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main analysis card */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>{t.ai_card_title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-neutral-400 mb-4">{t.ai_desc}</p>
                  <Button onClick={runAnalysis} className="w-full" disabled={loading}>
                    {loading ? t.ai_running_btn : t.ai_run_btn}
                  </Button>
                </div>
                {analysis && (
                  <div className="mt-4 p-4 rounded-xl border border-white/8 bg-[#0a0a0a]/60 text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {parseMarkdown(analysis)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Interactive Chat Card */}
          <div className="lg:col-span-2">
            <Card className="h-[520px] flex flex-col overflow-hidden">
              <CardHeader className="border-b border-white/8/80 bg-[#111]/10">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#ff5722]" />
                  <span>Consultar sobre Filtraciones (Gemini 2.5 Flash)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between p-0 overflow-hidden">
                {/* Message logs */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 p-6">
                      <Bot className="w-10 h-10 text-neutral-700 mb-2" />
                      <p className="text-xs">Ejecuta el análisis inicial para comenzar la conversación interactiva con el asistente.</p>
                    </div>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 max-w-[85%] ${
                          msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                            msg.sender === "user"
                              ? "bg-purple-950/50 text-purple-300 border border-purple-800/30"
                              : "bg-[#ff5722]/10 text-orange-300 border border-[#ff5722]/20"
                          }`}
                        >
                          {msg.sender === "user" ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-purple-950/40 text-purple-200 border border-purple-900/30 rounded-tr-none"
                              : "bg-[#111]/60 text-neutral-300 border border-white/8/80 rounded-tl-none"
                          }`}
                        >
                          {parseMarkdown(msg.text)}
                        </div>
                      </div>
                    ))
                  )}
                  {chatLoading && (
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs bg-[#ff5722]/10 text-orange-300 border border-[#ff5722]/20 animate-pulse">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="p-3 rounded-2xl text-xs bg-[#111]/60 text-neutral-500 border border-white/8/80 rounded-tl-none animate-pulse">
                        Escribiendo respuesta...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input block */}
                <form onSubmit={sendChatMessage} className="p-3 border-t border-white/8/80 bg-[#111]/20 flex gap-2">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    disabled={chatHistory.length === 0 || chatLoading}
                    placeholder={
                      chatHistory.length === 0
                        ? "Realiza el análisis de muestra primero..."
                        : "Pregunta detalles técnicos, mitigaciones..."
                    }
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-white/8 bg-[#0a0a0a] text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#ff5722]/80 disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <Button type="submit" size="sm" className="px-3" disabled={chatHistory.length === 0 || chatLoading || !inputMsg.trim()}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
