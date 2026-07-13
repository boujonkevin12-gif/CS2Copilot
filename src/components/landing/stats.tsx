"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Users, Trophy, Activity, Globe } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 150000,
    suffix: "+",
    label: "Jugadores Activos",
  },
  {
    icon: Trophy,
    value: 12000000,
    suffix: "+",
    label: "Partidas Analizadas",
  },
  {
    icon: Activity,
    value: 98,
    suffix: "%",
    label: "Tasa de Precisión",
  },
  {
    icon: Globe,
    value: 85,
    suffix: "+",
    label: "Países",
  },
];

export function Stats() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-3xl p-8 sm:p-12 gradient-border">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-1">
                  <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
