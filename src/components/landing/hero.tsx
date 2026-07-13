"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/ui/gradient-text";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="radial-glow top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-accent/[0.04] blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted font-medium">
              Ahora en Beta Pública
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6 text-balance"
        >
          Tu Entrenador
          <br />
          <GradientText>Inteligente de CS2</GradientText>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto max-w-2xl text-lg sm:text-xl text-muted mb-10 leading-relaxed"
        >
          Análisis avanzados, estadísticas en tiempo real y coaching inteligente
          impulsado por IA. Conecta tu Steam y empieza a mejorar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login">
            <Button variant="primary" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
              Conectar con Steam
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" icon={<Play className="h-4 w-4" />}>
              Ver Demo
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 mx-auto max-w-4xl"
        >
          <div className="glass rounded-2xl p-1 gradient-border">
            <div className="rounded-xl overflow-hidden bg-surface">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-danger/60" />
                  <div className="h-3 w-3 rounded-full bg-accent/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                </div>
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  Panel de CS2Pilot
                </span>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4">
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-muted mb-2">Tasa de Victoria</div>
                  <div className="text-2xl font-bold text-success">68.4%</div>
                  <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full w-[68.4%] bg-success rounded-full" />
                  </div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-muted mb-2">% de Headshots</div>
                  <div className="text-2xl font-bold text-primary">47.2%</div>
                  <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full w-[47.2%] bg-primary rounded-full" />
                  </div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-muted mb-2">Rating</div>
                  <div className="text-2xl font-bold text-accent">1.32</div>
                  <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full w-[66%] bg-accent rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
