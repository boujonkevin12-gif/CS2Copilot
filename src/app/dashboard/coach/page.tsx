"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Crosshair,
  Target,
  TrendingDown,
  Map,
  Zap,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Lightbulb,
  Brain,
  Shield,
  BarChart3,
  Upload,
  FileVideo,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Swords,
  Skull,
  HeartHandshake,
  Star,
  Eye,
} from "lucide-react";
import { useUser } from "@/lib/user-context";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AiAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    id: string;
    category: string;
    priority: string;
    title: string;
    description: string;
    actionable: string;
    impact: string;
  }>;
  trainingPlan: { focus: string; exercises: string[] }[];
}

interface PlayerStat {
  name: string;
  steamId: string;
  kills: number;
  deaths: number;
  assists: number;
  headshotKills: number;
  totalDamage: number;
  kd: number;
  hsPercent: number;
  adr: number;
  mvps: number;
  score: number;
  utilityDamage: number;
  enemiesFlashed: number;
  enemy3Ks: number;
  enemy4Ks: number;
  enemy5Ks: number;
}

interface TeamInfo {
  teamNumber: number;
  teamName: string;
  score: number;
  players: PlayerStat[];
}

interface DemoResult {
  map: string;
  serverName: string;
  duration: number;
  rounds: number;
  teams: TeamInfo[];
  allPlayers: PlayerStat[];
}

const priorityColors: Record<string, string> = {
  alta: "text-danger",
  media: "text-accent",
  baja: "text-success",
};

const priorityBg: Record<string, string> = {
  alta: "bg-danger/10",
  media: "bg-accent/10",
  baja: "bg-success/10",
};

const categoryIcons: Record<string, typeof Crosshair> = {
  aim: Crosshair,
  positioning: Map,
  economy: BarChart3,
  utility: Shield,
  teamplay: User,
  clutch: Target,
  mental: Brain,
  training: Zap,
};

export default function CoachPage() {
  const { user, faceitStats, faceitMatches } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [demoUploading, setDemoUploading] = useState(false);
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);
  const [demoError, setDemoError] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "demos" | "analysis">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const fetchAnalysis = useCallback(async (demoData?: Record<string, unknown>) => {
    setAnalysisLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoData ? { demoData } : {}),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  useEffect(() => {
    if (faceitStats || faceitMatches.length > 0) {
      fetchAnalysis();
    }
  }, [faceitStats, faceitMatches, fetchAnalysis]);

  const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const parseResult = async (data: any, warning?: string) => {
    if (!data || !data.teams || data.teams.length < 2) {
      setDemoError("No se pudieron extraer los datos de la partida. La demo podria estar incompleta.");
      setDemoUploading(false);
      return;
    }
    setDemoResult({
      map: data.map,
      serverName: data.serverName,
      duration: data.duration,
      rounds: data.rounds || 0,
      teams: data.teams,
      allPlayers: data.allPlayers || [],
    });
    if (warning) setDemoError(warning);
    await fetchAnalysis({ demoData: data });
    await logGamification();
  };

  const handleDemoUpload = async (file: File) => {
    setDemoUploading(true);
    setDemoError("");
    setDemoResult(null);

    try {
      if (isLocal) {
        const formData = new FormData();
        formData.append("demo", file);
        const res = await fetch("/api/demo/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) { setDemoError(json.error || "Error al procesar"); setDemoUploading(false); return; }
        await parseResult(json.data, json.warning);
        return;
      }

      // Vercel: upload directo a Blob (bypass 4.5MB)
      const tokenRes = await fetch("/api/demo/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name }),
      });
      if (!tokenRes.ok) { setDemoError("No se pudo iniciar la subida"); setDemoUploading(false); return; }
      const { token, pathname } = await tokenRes.json();

      const { put } = await import("@vercel/blob/client");
      const blob = await put(pathname, file, { access: "public", token });

      const parseRes = await fetch("/api/demo/parse-from-blob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blobUrl: blob.url }),
      });
      const parseJson = await parseRes.json();
      if (!parseRes.ok) { setDemoError(parseJson.error || "Error al analizar"); setDemoUploading(false); return; }
      await parseResult(parseJson.data, parseJson.warning);
    } catch {
      setDemoError("Error al subir la demo. Verifica que el archivo no este corrupto.");
    } finally {
      setDemoUploading(false);
    }
  };

  const logGamification = async () => {
    try {
      await fetch("/api/gamification/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "demo_analyzed" }),
      });
    } catch {
      // not critical
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al obtener respuesta");
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Hubo un error al conectar con el Coach IA. Por favor intenta de nuevo.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="font-semibold text-foreground mt-3 mb-1">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <p key={i} className="text-muted pl-4 before:content-['•'] before:mr-2 before:text-primary">
            {line.slice(2).replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <p key={i} className="text-muted pl-4">
            {line}
          </p>
        );
      }
      if (line === "") return <br key={i} />;
      return (
        <p key={i} className="text-muted">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    });
  };

  const quickSuggestions = [
    { icon: Crosshair, label: "¿Cómo mejorar mi aim?", color: "text-primary", bg: "bg-primary/10" },
    { icon: TrendingDown, label: "¿Por qué bajo de ELO?", color: "text-danger", bg: "bg-danger/10" },
    { icon: BarChart3, label: "Analiza mis partidas", color: "text-success", bg: "bg-success/10" },
    { icon: Map, label: "¿Cómo jugar Mirage?", color: "text-accent", bg: "bg-accent/10" },
    { icon: Target, label: "¿Cómo mejorar mi K/D?", color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  const welcomeName = user?.name ? ` ${user.name}` : "";

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Coach IA
              <Badge variant="accent" size="sm">BETA</Badge>
            </h1>
            <p className="text-xs text-muted">
              {user?.faceitNickname ? `Análisis basado en ${user.faceitNickname}` : "Conecta FACEIT para análisis real"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "chat" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground hover:bg-white/[0.04]"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab("demos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "demos" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground hover:bg-white/[0.04]"
            }`}
          >
            Demos
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "analysis" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground hover:bg-white/[0.04]"
            }`}
          >
            Análisis IA
          </button>
        </div>
      </motion.div>

      {activeTab === "demos" ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin pr-2 space-y-6">
          <GlassCard padding="lg" hover={false} glow>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file?.name.endsWith(".dem")) handleDemoUpload(file);
              }}
              className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/60 transition-all cursor-pointer bg-primary/5"
            >
              {demoUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-sm font-medium text-foreground">Procesando demo...</p>
                  <p className="text-xs text-muted-foreground">Analizando estadísticas de la partida</p>
                </div>
              ) : demoResult ? (
                <div className="flex items-center gap-3 justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Demo cargada — {demoResult.map}</p>
                    <p className="text-xs text-muted">
                      {demoResult.rounds} rondas · {demoResult.serverName !== "desconocido" ? `${demoResult.serverName} · ` : ""}
                      {demoResult.duration > 0 ? `${Math.round(demoResult.duration / 60)} min` : ""}
                      {demoResult.allPlayers.length > 0 ? ` · ${demoResult.allPlayers.length} jugadores` : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Subí un demo de CS2</p>
                    <p className="text-sm text-muted mt-1">Arrastrá un archivo .dem o hacé clic para seleccionar</p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Máximo 100MB</span>
                    <span>·</span>
                    <span>CS2 .dem files</span>
                    <span>·</span>
                    <span>Análisis completo</span>
                  </div>
                </div>
              )}
              {demoError && (
                <div className="flex items-center gap-2 mt-4 text-xs text-danger justify-center">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {demoError}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".dem"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDemoUpload(file);
                }}
              />
            </div>
          </GlassCard>

          {demoResult && demoResult.teams.length >= 2 && (
            <>
              {/* Match header */}
              <GlassCard padding="md" hover={false}>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-rose-400">{demoResult.teams[0].teamName}</p>
                    <p className="text-4xl font-bold font-mono text-rose-400 mt-1">{demoResult.teams[0].score}</p>
                  </div>
                  <div className="text-center px-6">
                    <Swords className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">VS</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{demoResult.map}</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-cyan-400">{demoResult.teams[1].teamName}</p>
                    <p className="text-4xl font-bold font-mono text-cyan-400 mt-1">{demoResult.teams[1].score}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Player scoreboards */}
              {demoResult.teams.map((team, ti) => (
                <GlassCard key={ti} padding="md" hover={false}>
                  <div className="flex items-center gap-2 mb-4">
                    <Swords className={`h-4 w-4 ${ti === 0 ? "text-rose-400" : "text-cyan-400"}`} />
                    <h3 className="text-sm font-semibold">{team.teamName}</h3>
                    <Badge variant={ti === 0 ? "danger" : "default"} size="sm">{team.score} pts</Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">{team.players.length} jugadores</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground border-b border-white/[0.06]">
                          <th className="text-left py-2 pr-2 font-medium">Jugador</th>
                          <th className="text-center py-2 px-2 font-medium"><Skull className="h-3 w-3 inline" /> K</th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground/60">D</th>
                          <th className="text-center py-2 px-2 font-medium"><HeartHandshake className="h-3 w-3 inline" /> A</th>
                          <th className="text-center py-2 px-2 font-medium">K/D</th>
                          <th className="text-center py-2 px-2 font-medium"><Crosshair className="h-3 w-3 inline" /> HS%</th>
                          <th className="text-center py-2 px-2 font-medium"><Eye className="h-3 w-3 inline" /> ADR</th>
                          <th className="text-center py-2 px-2 font-medium"><Star className="h-3 w-3 inline" /> MVP</th>
                          <th className="text-center py-2 pl-2 font-medium">Daño</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...team.players]
                          .sort((a, b) => b.kills - a.kills)
                          .map((p, i) => (
                            <tr key={p.steamId || i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                              <td className="py-2 pr-2 font-medium text-foreground">{p.name}</td>
                              <td className="text-center py-2 px-2 text-success font-medium">{p.kills}</td>
                              <td className="text-center py-2 px-2 text-muted-foreground">{p.deaths}</td>
                              <td className="text-center py-2 px-2 text-accent">{p.assists}</td>
                              <td className={`text-center py-2 px-2 font-medium ${p.kd >= 1 ? "text-success" : p.kd >= 0.8 ? "text-accent" : "text-danger"}`}>{p.kd.toFixed(2)}</td>
                              <td className="text-center py-2 px-2 text-muted-foreground">{p.hsPercent.toFixed(1)}%</td>
                              <td className={`text-center py-2 px-2 font-medium ${p.adr >= 80 ? "text-success" : p.adr >= 60 ? "text-accent" : "text-muted-foreground"}`}>{p.adr.toFixed(0)}</td>
                              <td className="text-center py-2 px-2 text-muted-foreground">{p.mvps}</td>
                              <td className="text-center py-2 pl-2 text-muted-foreground">{p.totalDamage.toLocaleString()}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              ))}
            </>
          )}

          {analysis && (
            <GlassCard padding="md" hover={false}>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Análisis IA de esta demo</h3>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted">Score general</span>
                <span className="text-2xl font-bold font-mono text-primary">{analysis.overallScore}/100</span>
              </div>
              {analysis.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-success uppercase tracking-wider mb-1">Fortalezas</p>
                  {analysis.strengths.map((s, i) => (
                    <p key={i} className="text-xs text-muted pl-4 before:content-['✓'] before:absolute before:-ml-4 before:text-success">{s}</p>
                  ))}
                </div>
              )}
              {analysis.weaknesses.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-danger uppercase tracking-wider mb-1">Debilidades</p>
                  {analysis.weaknesses.map((w, i) => (
                    <p key={i} className="text-xs text-muted pl-4 before:content-['!'] before:absolute before:-ml-4 before:text-danger">{w}</p>
                  ))}
                </div>
              )}
            </GlassCard>
          )}
        </div>
      ) : activeTab === "analysis" ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin pr-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Análisis de Rendimiento</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchAnalysis()}
              disabled={analysisLoading}
              icon={analysisLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            >
              {analysisLoading ? "Analizando..." : "Actualizar"}
            </Button>
          </div>

          {analysisLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : analysis ? (
            <>
              <GlassCard padding="lg" hover={false} glow>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Score General</h3>
                  <div className="text-4xl font-bold font-mono text-primary">{analysis.overallScore}/100</div>
                </div>

                {analysis.strengths.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-success uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" /> Fortalezas
                    </h4>
                    {analysis.strengths.map((s, i) => (
                      <p key={i} className="text-sm text-muted pl-5 before:content-['✓'] before:absolute before:-ml-4 before:text-success">{s}</p>
                    ))}
                  </div>
                )}

                {analysis.weaknesses.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-danger uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5" /> Debilidades
                    </h4>
                    {analysis.weaknesses.map((w, i) => (
                      <p key={i} className="text-sm text-muted pl-5 before:content-['!'] before:absolute before:-ml-4 before:text-danger">{w}</p>
                    ))}
                  </div>
                )}
              </GlassCard>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  Recomendaciones
                </h3>
                {analysis.recommendations.map((rec, i) => {
                  const Icon = categoryIcons[rec.category] || Target;
                  return (
                    <motion.div key={rec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <GlassCard padding="md" hover={false}>
                        <div className="flex items-start gap-4">
                          <div className={`h-10 w-10 rounded-xl ${priorityBg[rec.priority]} flex items-center justify-center shrink-0`}>
                            <Icon className={`h-5 w-5 ${priorityColors[rec.priority]}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold">{rec.title}</h4>
                              <Badge variant={rec.priority === "alta" ? "danger" : rec.priority === "media" ? "accent" : "default"} size="sm">{rec.priority}</Badge>
                            </div>
                            <p className="text-xs text-muted mb-2">{rec.description}</p>
                            <div className="glass rounded-lg p-3">
                              <p className="text-xs font-medium text-foreground mb-1">Acción concreta:</p>
                              <p className="text-xs text-muted">{rec.actionable}</p>
                            </div>
                            <p className="text-[10px] text-accent mt-2">Impacto: {rec.impact}</p>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Plan de Entrenamiento
                </h3>
                {analysis.trainingPlan.map((plan, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <GlassCard padding="md" hover={false}>
                      <h4 className="text-sm font-semibold mb-3 text-primary">{plan.focus}</h4>
                      <div className="space-y-2">
                        {plan.exercises.map((ex, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="text-primary text-xs mt-0.5">▸</span>
                            <p className="text-xs text-muted">{ex}</p>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <GlassCard padding="lg" className="text-center">
              <Brain className="h-12 w-12 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">
                {user?.faceitNickname
                  ? "Cargando análisis..."
                  : "Conecta FACEIT en Configuración para obtener un análisis personalizado"}
              </p>
            </GlassCard>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin pr-2">
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full">
                <motion.div
                  className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mb-6 relative"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Brain className="h-10 w-10 text-primary" />
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </motion.div>

                <h2 className="text-2xl font-bold mb-2">
                  Hola{welcomeName}, soy tu <span className="gradient-text">Coach IA</span>
                </h2>
                <p className="text-sm text-muted text-center max-w-md mb-8">
                  Analizo tus partidas reales de FACEIT para darte consejos personalizados.
                  {user?.faceitNickname && (
                    <span className="block mt-1 text-foreground font-medium">
                      Conectado como {user.faceitNickname}
                    </span>
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
                  {quickSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      onClick={() => handleSend(suggestion.label)}
                      className="glass rounded-xl p-4 text-left hover:bg-white/[0.05] transition-all group cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`h-8 w-8 rounded-lg ${suggestion.bg} flex items-center justify-center mb-3`}>
                        <suggestion.icon className={`h-4 w-4 ${suggestion.color}`} />
                      </div>
                      <span className="text-sm text-muted group-hover:text-foreground transition-colors">{suggestion.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user" ? "bg-primary text-white rounded-br-md" : "glass rounded-bl-md"
                      }`}>
                        <div className={`text-sm leading-relaxed ${message.role === "user" ? "text-white" : ""}`}>
                          {message.role === "assistant" ? formatContent(message.content) : message.content}
                        </div>
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-1 mt-2">
                            <button onClick={() => navigator.clipboard.writeText(message.content)} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/[0.05] transition-all">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/[0.05] transition-all">
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/[0.05] transition-all">
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center shrink-0 mt-1">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="glass rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                      <motion.div className="w-2 h-2 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
                      <motion.div className="w-2 h-2 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <div className="glass-strong rounded-2xl p-2 gradient-border">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Preguntale al Coach IA..."
                  rows={1}
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none max-h-32"
                  style={{ height: "auto", minHeight: "40px" }}
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = "auto";
                    t.style.height = Math.min(t.scrollHeight, 128) + "px";
                  }}
                />
                <motion.button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors shrink-0 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-2">
              {user?.faceitNickname
                ? `Respuestas basadas en tus ${faceitMatches.length} partidas de FACEIT`
                : "Conecta FACEIT para respuestas personalizadas"}
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}
