"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickSuggestions = [
  {
    icon: Crosshair,
    label: "¿Cómo mejorar mi aim?",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: TrendingDown,
    label: "¿Por qué bajo de ELO?",
    color: "text-danger",
    bg: "bg-danger/10",
  },
  {
    icon: BarChart3,
    label: "Analiza mis partidas",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Map,
    label: "¿Cómo jugar Mirage?",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Target,
    label: "¿Cómo mejorar mi K/D?",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

const mockResponses: Record<string, string> = {
  "¿Cómo mejorar mi aim?":
    "Basándome en tus estadísticas, aquí tienes consejos personalizados para mejorar tu puntería:\n\n🎯 **Configuración de Crosshair**\nTu crosshair actual tiene buen contraste. Asegúrate de que el tamaño sea consistente entre las sesiones de entrenamiento.\n\n📊 **Tu datos actuales:**\n- Precisión general: 34.2%\n- Tasa de headshots: 52.3%\n- Tiempo de reacción: 187ms\n\n💡 **Recomendaciones:**\n1. **Aim Training Daily**: Dedica 15-20 minutos diarios a aim trainers como Aim Lab o Kovaak's\n2. **DM Pre-Match**: Juega 2-3 Deathmatch antes de entrar a competitivo\n3. **Crosshair Placement**: Trabaja en mantener el crosshair a la altura de la cabeza mientras te mueves\n4. **Peek Correctly**: Usa jiggle peeking en lugar de wide peeking\n5. **Sensibilidad**: Tu sensibilidad parece óptima, pero prueba bajar 0.1-0.2 si sientes que sobrepasas objetivos\n\n⚡ **Drill recomendado:**\n- 10 min Aim Lab (Gridshot)\n- 10 min Reflexshot\n- 5 min tracking\n\n¿Quieres que analice tus estadísticas de puntería por mapa en detalle?",
  "¿Por qué bajo de ELO?":
    "He analizado tus partidas recientes y encontré varios patrones que están afectando tu ELO:\n\n📉 **Análisis de tu caída:**\n- ELO actual: 1847 (↓47 esta semana)\n- Win rate reciente: 52% (vs 64.8% histórico)\n- K/D reciente: 1.2 (vs 1.67 histórico)\n\n🔍 **Causas identificadas:**\n\n1. **Juego en horas pico**\n   - Estás jugando entre 20:00-23:00 cuando hay más smurfs\n   - Intenta jugar en horarios menos congestinados\n\n2. **Deterioro de performance en halftime**\n   - Tus stats de CT están 15% por debajo de T\n   - Necesitas trabajar tu juego defensivo\n\n3. **Mapas problemáticos**\n   - Vertigo: 48% WR (tu peor mapa)\n   - Nuke: 54% WR\n   - Considera banear estos mapas en el pick/ban\n\n4. **Fatiga mental**\n   - Has jugado 42 horas esta semana\n   - Toma descansos de 15 min cada 3-4 partidas\n\n5. **Tilting**\n   - Tus 3 últimas derrotas consecutivas muestran un patrón de tilt\n   - Si pierdes 2 seguidas, haz una pausa\n\n💪 **Plan de acción:**\n1. Reduce sesiones a 2-3 horas máximo\n2. Enfócate en Inferno y Overpass (tus mejores mapas)\n3. Trabaja específicamente en juego CT\n4. Usa el coaching IA post-partida para identificar errores",
  "Analiza mis partidas":
    "📊 **Análisis de tus últimas 7 partidas:**\n\n**Resumen General:**\n- Victoria: 5 (71.4%)\n- Derrota: 2 (28.6%)\n- Rating promedio: 1.29\n- K/D total: 99/101 (0.98)\n\n🗺️ **Por Mapa:**\n\n**Dust II** ✅ Victoria (16-12)\n- Rating: 1.45 | HS: 62%\n- Fuerte en AWP en Mid\n- Débil: Retakes en B site\n\n**Mirage** ❌ Derrota (11-16)\n- Rating: 0.98 | HS: 44%\n- Problema: Rotaciones lentas\n- Sugerencia: Mejora tu timing en A split\n\n**Inferno** ✅ Victoria (16-8)\n- Rating: 1.72 | HS: 58%\n- Dominio total en Banana control\n- Tu mejor mapa actualmente\n\n**Anubis** ✅ Victoria (16-14)\n- Rating: 1.18 | HS: 50%\n- Partida muy reñida\n- Mejorar clutch situations (perdiste 3 clutchs 1v1)\n\n**Nuke** ❌ Derrota (9-16)\n- Rating: 0.76 | HS: 38%\n- Problema principal: Navegación en ramp\n- Necesitas trabajar los setups de CT en Nuke\n\n**Overpass** ✅ Victoria (16-6)\n- Rating: 1.65 | HS: 65%\n- Dominio en Long control\n- Partida casi perfecta\n\n🎯 **Tendencia:**\n- Mejorando en mapas de tamaño mediano (Inferno, Overpass)\n- Dificultad en mapas complejos (Nuke, Vertigo)\n- Consistencia en headshots subiendo (+3% este mes)\n\n¿Quieres que profundice en algún mapa específico?",
  "¿Cómo jugar Mirage?":
    "🗺️ **Guía Completa de Mirage para tu nivel (Supremo):**\n\n**Posiciones Recomendadas según tu estilo:**\n\n🔵 **CT Side (tus stats: 58% WR)**\n\n**A Site - Ticket/CT:**\n- Posición ideal para tu estilo de juego\n- Usa smokes de A ramp para isolations\n- Timing: peek a los 1:45 del round\n\n**Mid - Window:**\n- Tu AWP es fuerte aquí\n- Smoke de top mid cada round\n- Comunicación con connector player\n\n**B Site - Van/Forest:**\n- Juega passivo, espera el contact\n- Usa molotovs para delay\n- Retake con equipo, no solo\n\n🟠 **T Side (tus stats: 62% WR)**\n\n**A Split:**\n- Tu mejor estrategia actual\n- Smoke CT + Stairs + Jungle\n- Execute a los 1:20 del round\n\n**B Rush:**\n- Solo usar como surprise 1-2 veces por juego\n- Flash over wall + rush together\n\n**Mid Control:**\n- Essential para ganar en Mirage\n- Smoke window + top mid\n- Split A o B desde connectors\n\n💡 **Tips específicos para ti:**\n1. Mejora tus rotaciones (estás 2s lentos)\n2. Trabaja los clutches 1v1 (40% win rate)\n3. Mejora tu spray control con AK (35% accuracy)\n\n¿Quieres que te enseñe lineup específicos de smokes y flashes?",
  "¿Cómo mejorar mi K/D?":
    "🎯 **Análisis de tu K/D y plan de mejora:**\n\n**Tu K/D actual:** 1.67 (bueno, pero puedes mejorar)\n\n📊 **Desglose por situación:**\n\n**Entry Frags:** 1.2 K/D\n- Necesitas mejorar tu primer contacto\n- Practica crosshair placement en paths comunes\n\n**Trading:** 2.1 K/D ✅\n- Excelente, mantén esto\n- Siempre cubre a tu compañero\n\n**Clutch 1vX:** 0.8 K/D ❌\n- Tu mayor debilidad\n- Necesitas trabajo en situaciones de presión\n\n**Lurking:** 1.9 K/D ✅\n- Muy buen timing\n- Sigue leyendo el mapa\n\n💡 **Plan de Mejora (4 semanas):**\n\n**Semana 1-2: Fundamentos**\n- 15 min/day: Aim Lab (tracking + flicking)\n- 2 DM antes de cada sesión competitiva\n- Enfócate en no over-peeking\n\n**Semana 3-4: Avanzado**\n- Trabaja positions específicas por mapa\n- Mejora tu crosshair placement en movement\n- Practica spray transfers\n\n🔧 **Ajustes técnicos:**\n- Tu sensibilidad: 1.8 @ 800 DPI (buena)\n- Crosshair: centro con punto (óptimo)\n- Rate: 128tick (asegúrate de que tu PC lo soporte)\n\n📈 **Objetivos medibles:**\n- Subir K/D a 1.8+ en 2 semanas\n- Mejorar clutch rate a 45%\n- Mantener HS% arriba de 55%\n\n¿Quieres que creemos un plan de entrenamiento personalizado semanal?",
};

import { BarChart3 } from "lucide-react";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <motion.div
        className="w-2 h-2 rounded-full bg-primary"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-primary"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-primary"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
}

function MessageActions({ onCopy }: { onCopy: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/[0.05] transition-all"
        title="Copiar"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/[0.05] transition-all" title="Útil">
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/[0.05] transition-all" title="No útil">
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
      <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/[0.05] transition-all" title="Más opciones">
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

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
      const responseText =
        mockResponses[messageText] ||
        `Entendido tu pregunta sobre "${messageText}".\n\nBasándome en tus estadísticas y partidas recientes, aquí va mi análisis:\n\n📊 **Tus datos actuales:**\n- Win Rate: 64.8%\n- K/D: 1.67\n- Rating: 1.52\n- Horas jugadas: 3,420\n\n💡 **Mi recomendación:**\nEsta es un área donde puedes mejorar significativamente. Te sugiero:\n\n1. **Análisis de replays**: Revisa tus últimas 5 derrotas\n2. **Identifica patrones**: ¿En qué situaciones pierdes más?\n3. **Práctica dirigida**: Enfócate en esa área específica\n4. **Coaching consistente**: Usa esta herramienta regularmente\n\n¿Quieres que profundice en algún aspecto específico?\n\n*Nota: Próximamente me conectaré con tu perfil de Steam para darte análisis en tiempo real con datos reales.*`;

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
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
            {line.slice(2)}
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
      if (line === "") {
        return <br key={i} />;
      }
      return (
        <p key={i} className="text-muted">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Coach IA
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                BETA
              </span>
            </h1>
            <p className="text-xs text-muted">Asistente inteligente de Counter-Strike 2</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted hover:text-foreground hover:bg-white/[0.04] transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Nueva conversación
          </button>
        )}
      </motion.div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin pr-2">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full"
          >
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
              Hola, soy tu <span className="gradient-text">Coach IA</span>
            </h2>
            <p className="text-sm text-muted text-center max-w-md mb-8">
              Analizo tus partidas, estadísticas y juego para darte consejos personalizados
              y ayudarte a subir de rango en CS2.
            </p>

            {/* Quick Suggestions */}
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
                  <span className="text-sm text-muted group-hover:text-foreground transition-colors">
                    {suggestion.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Extra suggestions row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <span className="text-[11px] text-muted-foreground">También puedes preguntar:</span>
              {[
                "Mejorar movilidad",
                "Lineups de smokes",
                "Estrategias de equipo",
                "Crosshair settings",
              ].map((tip) => (
                <button
                  key={tip}
                  onClick={() => handleSend(tip)}
                  className="px-3 py-1 rounded-full text-[11px] text-muted hover:text-foreground bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all cursor-pointer"
                >
                  {tip}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Messages */
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

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-white rounded-br-md"
                        : "glass rounded-bl-md"
                    }`}
                  >
                    <div
                      className={`text-sm leading-relaxed ${
                        message.role === "user" ? "text-white" : ""
                      }`}
                    >
                      {message.role === "assistant"
                        ? formatContent(message.content)
                        : message.content}
                    </div>
                    {message.role === "assistant" && (
                      <MessageActions
                        onCopy={() => navigator.clipboard.writeText(message.content)}
                      />
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="glass rounded-2xl rounded-bl-md px-2 py-2">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="glass-strong rounded-2xl p-2 gradient-border">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregúntale al Coach IA..."
              rows={1}
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none max-h-32"
              style={{
                height: "auto",
                minHeight: "40px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
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

        {/* Quick suggestions below input (when there are messages) */}
        {messages.length > 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2 mt-3 justify-center"
          >
            {[
              { icon: Lightbulb, text: "Dame más detalles" },
              { icon: Shield, text: "Cómo contrarrestar esto" },
              { icon: Zap, text: "Resumen rápido" },
            ].map((quick) => (
              <button
                key={quick.text}
                onClick={() => handleSend(quick.text)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-muted hover:text-foreground bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all cursor-pointer"
              >
                <quick.icon className="h-3 w-3" />
                {quick.text}
              </button>
            ))}
          </motion.div>
        )}

        <p className="text-center text-[10px] text-muted-foreground mt-3">
          Coach IA puede cometer errores. Verifica la información importante.
          Datos de ejemplo hasta la conexión con tu perfil de Steam.
        </p>
      </motion.div>
    </div>
  );
}
