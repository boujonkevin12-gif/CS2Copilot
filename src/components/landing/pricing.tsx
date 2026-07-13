"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Gratis",
    price: "$0",
    period: "para siempre",
    description: "Perfecto para comenzar",
    features: [
      "Historial básico de partidas",
      "Seguimiento de Victorias/Derrotas",
      "Acceso a la comunidad",
      "5 partidas por día",
    ],
    cta: "Comenzar",
    variant: "secondary" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/mes",
    description: "Para jugadores competitivos serios",
    features: [
      "Análisis ilimitado de partidas",
      "Estadísticas avanzadas de puntería",
      "Consejos de coaching con IA",
      "Heatmaps y rastreo de utilidades",
      "Panel de progreso",
      "Soporte prioritario",
    ],
    cta: "Prueba Gratis",
    variant: "primary" as const,
    popular: true,
  },
  {
    name: "Equipo",
    price: "$29.99",
    period: "/mes",
    description: "Para equipos y organizaciones",
    features: [
      "Todo lo de Pro",
      "Hasta 5 miembros del equipo",
      "Panel de análisis de equipo",
      "Ojeo de oponentes",
      "Estrategias personalizadas",
      "Acceso a API",
      "Soporte dedicado",
    ],
    cta: "Contactar Ventas",
    variant: "secondary" as const,
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-widest mb-4"
          >
            Precios
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
          >
            Precios simples y{" "}
            <span className="gradient-text">transparentes</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-xl text-muted text-lg"
          >
            Sin costos ocultos. Sin sorpresas. Cancela cuando quieras.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative glass rounded-2xl p-8 ${
                plan.popular ? "border-primary/30 border" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="accent" size="md">
                    Más Popular
                  </Badge>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted">{plan.period}</span>
                </div>
              </div>
              <Link href={plan.name === "Equipo" ? "/login" : "/register"}>
                <Button variant={plan.variant} className="w-full mb-6">
                  {plan.cta}
                </Button>
              </Link>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span className="text-muted">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
