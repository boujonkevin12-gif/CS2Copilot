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
  BarChart3,
} from "lucide-react";
import { useUser } from "@/lib/user-context";

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
  const { user } = useUser();
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
        `¡Buena pregunta! Entiendo que quieres saber sobre "${messageText}".\n\n` +
        `**Próximamente me conectaré con tu perfil de Steam y FACEIT para darte análisis en tiempo real con datos reales.**\n\n` +
        `Mientras tanto, aquí van algunos consejos generales de CS2 que pueden ayudarte:\n\n` +
        `💡 **Consejos generales:**\n` +
        `- **Práctica constante**: Dedica tiempo diario a aim training (Aim Lab, Kovaak's o DM)\n` +
        `- **Crosshair placement**: Mantén el crosshair siempre a la altura de la cabeza y anticipa posiciones enemigas\n` +
        `- **Comunicación**: Informa a tu equipo sobre posiciones, utilities y temporizaciones\n` +
        `- **Game sense**: Observa las demos de tus partidas para identificar patrones y errores\n` +
        `- **Gestión de economía**: Aprende cuándo forzar, force buy o ahorrar\n` +
        `- **Mentalidad**: Si pierdes 2 seguidas, toma un descanso para evitar tilt\n\n` +
        `¿Quieres que profundice en algún aspecto específico del juego?\n\n` +
        `*Coach IA en desarrollo. Próximamente con análisis real de tus partidas.*`;

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

  const welcomeName = user?.name ? ` ${user.name}` : "";

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
              Hola{welcomeName}, soy tu <span className="gradient-text">Coach IA</span>
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
          Coach IA en desarrollo. Próximamente con análisis real de tus partidas.
        </p>
      </motion.div>
    </div>
  );
}
