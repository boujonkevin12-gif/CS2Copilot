"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  BarChart3,
  Crosshair,
  Brain,
  Target,
  Trophy,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Tu rendimiento",
    description:
      "Análisis avanzados de tus partidas con gráficos interactivos y datos en tiempo real.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: TrendingUp,
    title: "Tus estadísticas",
    description:
      "Heatmaps, precisión por arma, winrate por mapa y mucho más para dominar cada partida.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Brain,
    title: "Coach IA",
    description:
      "Obtén consejos personalizados de estrategia y mejora impulsados por inteligencia artificial.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Target,
    title: "Inventario",
    description:
      "Gestiona tu colección de skins, rastrea valores y analiza tu inversión en CS2.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Trophy,
    title: "Premier",
    description:
      "Seguimiento completo de tu Premier Rating, rango y progreso hacia la élite.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    icon: Crosshair,
    title: "Análisis de demos",
    description:
      "Revisa cada partida con datos detallados de puntería, utilidades y momentos clave.",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-widest mb-4"
          >
            Características
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
          >
            Todo lo que necesitas para{" "}
            <span className="gradient-text">mejorar</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-muted text-lg"
          >
            Desde estadísticas de puntería hasta coaching con IA, CS2Pilot
            te da las herramientas para mejorar cada aspecto de tu juego.
          </motion.p>
        </div>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <GlassCard glow className="h-full">
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} mb-5`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
