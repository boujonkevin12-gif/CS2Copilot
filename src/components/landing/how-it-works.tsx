"use client";

import { motion } from "framer-motion";
import { UserPlus, Link2, BarChart3, Trophy } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Crea tu Cuenta",
    description: "Regístrate en segundos con tu cuenta de Steam. Sin encuestas, sin complicaciones.",
  },
  {
    icon: Link2,
    step: "02",
    title: "Conecta Steam",
    description: "Vincula tu perfil de CS2. Importamos automáticamente tu historial de partidas.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Analiza y Mejora",
    description: "Obtén información instantánea sobre tu juego. Consejos con IA para cada nivel de habilidad.",
  },
  {
    icon: Trophy,
    step: "04",
    title: "Sube de Rango",
    description: "Aplica tu nuevo conocimiento y mira cómo tu rango sube. Sigue tu progreso en tiempo real.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-widest mb-4"
          >
            Cómo Funciona
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
          >
            Listo y funcionando en{" "}
            <span className="gradient-text">menos de 60 segundos</span>
          </motion.h2>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="glass rounded-2xl p-6 h-full text-center relative z-10">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mb-3">
                    PASO {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
