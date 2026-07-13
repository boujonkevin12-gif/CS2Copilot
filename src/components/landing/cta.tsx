"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative glass rounded-3xl p-8 sm:p-16 text-center overflow-hidden gradient-border"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/[0.06] blur-[100px]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs text-muted font-medium">
                Conecta tu Steam Hoy
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Tus estadísticas nunca
              <br />
              <span className="gradient-text">fueron tan inteligentes</span>
            </h2>
            <p className="mx-auto max-w-xl text-lg text-muted mb-10">
              Únete a más de 150,000 jugadores que ya están subiendo de rango con
              CS2Pilot. Gratis para comenzar, sin tarjeta de crédito.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Conectar Steam Gratis
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                Ver Demo en Vivo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
