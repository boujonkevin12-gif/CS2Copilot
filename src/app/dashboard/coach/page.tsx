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

interface DemoResult {
  map: string;
  serverName: string;
  duration: number;
  rounds: number;
  playerStats: {
    name: string;
    kills: number;
    deaths: number;
    assists: number;
    kd: number;
    hsPercent: number;
    adr: number;
    weaponKills: Record<string, number>;
    clutchWins: Record<string, number>;
    aceRounds: number[];
  };
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
  const [activeTab, setActiveTab] = useState<"chat" | "analysis">("chat");
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

  const handleDemoUpload = async (file: File) => {
    setDemoUploading(true);
    setDemoError("");
    setDemoResult(null);

    try {
      const { parseDemoHeader } = await import("@/lib/demo-header-parser");
      const arrayBuffer = await file.arrayBuffer();
      const header = await parseDemoHeader(arrayBuffer);

      if (!header) {
        setDemoError("No se pudo leer el encabezado de la demo. Asegurate de que sea un archivo .dem de CS2 valido.");
        setDemoUploading(false);
        return;
      }

      const demoData = {
        map: header.map,
        serverName: header.serverName,
        fileName: file.name,
        fileSize: file.size,
        duration: header.duration,
        roundCount: header.roundCount,
      };

      setDemoResult({
        map: header.map,
        serverName: header.serverName,
        duration: header.duration,
        rounds: header.roundCount,
        playerStats: {
          name: "", kills: 0, deaths: 0, assists: 0,
          kd: 0, hsPercent: 0, adr: 0,
          weaponKills: {}, clutchWins: {}, aceRounds: [],
        },
      });

      await fetchAnalysis({ demoData });
    } catch {
      setDemoError("Error al leer la demo. Verifica que el archivo no este corrupto.");
    } finally {
      setDemoUploading(false);
    }
  };

  const generateAiResponse = (question: string): string => {
    const ls = faceitStats?.lifetime;
    const kd = ls ? parseFloat(String(ls["Average K/D Ratio"] || "0")) : 0;
    const hs = ls ? parseFloat(String(ls["Average Headshots %"] || "0")) : 0;
    const wr = ls ? parseFloat(String(ls["Win Rate %"] || "0")) : 0;
    const adr = ls ? parseFloat(String(ls["ADR"] || "0")) : 0;
    const kast = 0;
    const matches = ls ? parseInt(String(ls.Matches || "0")) : 0;
    const name = user?.faceitNickname || user?.name || "jugador";

    const q = question.toLowerCase();

    if (q.includes("aim") || q.includes("punteria") || q.includes("mira")) {
      if (hs < 40) {
        return `**Análisis de Aim para ${name}:**\n\nTu headshot rate es de ${hs.toFixed(0)}%, lo cual indica que tu crosshair placement necesita mejora.\n\n**Plan de acción:**\n- Crosshair siempre a nivel de cabeza\n- Aim Botz: 15 min/día\n- Deathmatch 2-3 partidas sin grenades\n- Pre-aim en mapas workshop\n\n**Meta:** Subir HS% a 50%+ en 2 semanas.\n\n*Basado en tus estadísticas reales de FACEIT.*`;
      }
      return `**Análisis de Aim para ${name}:**\n\nTu HS% de ${hs.toFixed(0)}% es ${hs >= 50 ? "bueno" : "aceptable"}. Tu K/D de ${kd.toFixed(2)} ${kd >= 1.2 ? "refleja buen aim" : "puede mejorar"}.\n\n**Siguientes pasos:**\n- Practica flick shots en Aim Botz\n- Trabaja tracking en DM\n- Enfoca en headshots más que en cantidad de kills\n\n*Basado en datos reales de FACEIT.*`;
    }

    if (q.includes("elo") || q.includes("subir") || q.includes("rank")) {
      return `**Análisis de climbing para ${name}:**\n\nCon ${matches} partidas y un win rate de ${wr.toFixed(0)}%, ${wr >= 50 ? "vas bien" : "hay margen de mejora"}.\n\n**Claves para subir:**\n- Win rate > 50% es lo mínimo para subir ELO\n- K/D de ${kd.toFixed(2)} ${kd >= 1.0 ? "es positivo" : "necesita mejorar"}\n- Juega con consistentes teammates\n- Enfoca en 2-3 mapas que domines\n- Analiza tus demos perdidas\n\n*Consistencia > spikes de rendimiento.*`;
    }

    if (q.includes("mirage") || q.includes("mapa") || q.includes("map")) {
      return `**Guía rápida de Mirage:**\n\n**CT Side:**\n- Smoke mid from CT spawn\n- Jungle smoke desde A ramp\n- Retake B con molotov de van\n\n**T Side:**\n- Execute A: Smoke jungle + CT, flash over palace\n- Mid control: Smoke top mid, molotov window\n- B split: Short + apartments simultaneously\n\n**Tips:**\n- Mid control es clave\n- No fuerces A/B solo\n- Comunica rotaciones\n\n*Practica los smokes en modo entrenamiento.*`;
    }

    if (q.includes("k/d") || q.includes("kd") || q.includes("muerte")) {
      return `**Análisis K/D para ${name}:**\n\nTu K/D actual: **${kd.toFixed(2)}**\n${kd >= 1.2 ? "Excelente — estás eliminando más de lo que mueres." : kd >= 1.0 ? "Aceptable — estás balanceado." : "Necesita mejora — estás muriendo más de lo que eliminas."}\n\n**Para mejorar tu K/D:**\n- No hagas dry peeks (siempre con flash)\n- Retira si estás en desventaja\n- Juega posiciones más seguras\n- Trading kills > plays individuales\n- ${kd < 1.0 ? "Enfoca en survivality primero" : "Mantén tu estilo y refina la consistencia"}\n\n*K/D de 1.1+ es lo ideal para escalar.*`;
    }

    if (q.includes("grena") || q.includes("smoke") || q.includes("flash") || q.includes("utility")) {
      return `**Guía de Utility para ${name}:**\n\nLas grenades son la herramienta más subestimada en CS2.\n\n**Prioridades:**\n1. Smoke para mid/map control\n2. Flash para entries y retakes\n3. Molotov para clear positions\n4. HE para daño en executes\n\n**Por mapa - aprende primero:**\n- Dust II: Long corner smoke, CT smoke\n- Mirage: Jungle, CT, window smokes\n- Inferno: Banana control, arch side\n- Nuke: Ramp, outside smokes\n\n**Ejercicio:** 10 min/día practicando lineups en entrenamiento.\n\n*3 smokes bien ejecutados pueden ganar una ronda completa.*`;
    }

    if (q.includes("mental") || q.includes("tilt") || q.includes("psicolog") || q.includes("calma")) {
      return `**Mentalidad para ${name}:**\n\n${matches} partidas jugadas — sabes que CS2 puede ser frustrante.\n\n**Reglas de mentalidad:**\n- Si pierdes 2 seguidas: 5 min de descanso\n- No批评 teammates — enfoca en tu juego\n- Cada ronda es nueva (olvida la anterior)\n- Focus en proceso, no en resultado\n- Celebra los small wins\n\n**Antes de jugar:**\n- Warmup 10 min (DM o aim training)\n- Warmup 5 min (clutch scenarios)\n- Respira profundo antes de empezar\n\n*Los pros pierden el 45% de sus partidas. Es normal.*`;
    }

    return `**Análisis para ${name}:**\n\nBasado en tus ${matches} partidas con K/D ${kd.toFixed(2)} y WR ${wr.toFixed(0)}%:\n\n${analysis?.recommendations.slice(0, 3).map((r) => `- **${r.title}**: ${r.description}`).join("\n") || "- Juega más partidas para obtener un análisis personalizado"}\n\n¿Qué aspecto específico quieres que analice? Puedo revisar:\n- Aim y puntería\n- Posicionamiento\n- Utility / grenades\n- Mentalidad\n- Estrategia por mapa`;
  };

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateAiResponse(messageText);
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
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
            onClick={() => setActiveTab("analysis")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "analysis" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground hover:bg-white/[0.04]"
            }`}
          >
            Análisis
          </button>
        </div>
      </motion.div>

      {activeTab === "analysis" ? (
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

          <GlassCard padding="md" hover={false}>
            <div className="flex items-center gap-3 mb-4">
              <Upload className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-semibold">Subir Demo (.dem)</h3>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file?.name.endsWith(".dem")) handleDemoUpload(file);
              }}
              className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center hover:border-primary/30 transition-all cursor-pointer"
            >
              {demoUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted">Procesando demo...</p>
                </div>
              ) : demoResult ? (
                <div className="space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
                  <p className="text-sm font-medium">{demoResult.map}</p>
                  <p className="text-xs text-muted">
                    {demoResult.serverName && demoResult.serverName !== "desconocido" ? `${demoResult.serverName} · ` : ""}
                    {demoResult.rounds > 0 ? `${demoResult.rounds} rondas` : ""}
                    {demoResult.duration > 0 ? ` · ${Math.round(demoResult.duration)}s` : ""}
                  </p>
                  {faceitStats?.lifetime && (
                    <div className="text-[10px] text-muted-foreground pt-1 border-t border-white/5">
                      <span>K/D: {String(faceitStats.lifetime["Average K/D Ratio"] || "—")}</span>
                      <span className="mx-1">·</span>
                      <span>HS: {String(faceitStats.lifetime["Average Headshots %"] || "—")}%</span>
                      <span className="mx-1">·</span>
                      <span>ADR: {String(faceitStats.lifetime["ADR"] || "—")}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FileVideo className="h-8 w-8 text-muted" />
                  <p className="text-sm text-muted">Arrastra un archivo .dem o haz clic para seleccionar</p>
                  <p className="text-[10px] text-muted-foreground">Maximo 100MB</p>
                </div>
              )}
              {demoError && (
                <div className="flex items-center gap-2 mt-3 text-xs text-danger justify-center">
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
                      <p key={i} className="text-sm text-muted pl-5 before:content-['✓'] before:absolute before:-ml-4 before:text-success">
                        {s}
                      </p>
                    ))}
                  </div>
                )}

                {analysis.weaknesses.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-danger uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5" /> Debilidades
                    </h4>
                    {analysis.weaknesses.map((w, i) => (
                      <p key={i} className="text-sm text-muted pl-5 before:content-['!'] before:absolute before:-ml-4 before:text-danger">
                        {w}
                      </p>
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
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <GlassCard padding="md" hover={false}>
                        <div className="flex items-start gap-4">
                          <div className={`h-10 w-10 rounded-xl ${priorityBg[rec.priority]} flex items-center justify-center shrink-0`}>
                            <Icon className={`h-5 w-5 ${priorityColors[rec.priority]}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold">{rec.title}</h4>
                              <Badge variant={rec.priority === "alta" ? "danger" : rec.priority === "media" ? "accent" : "default"} size="sm">
                                {rec.priority}
                              </Badge>
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
