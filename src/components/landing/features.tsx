"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  { emoji: "\uD83D\uDCC8", title: "Tu rendimiento" },
  { emoji: "\uD83D\uDCC8", title: "Tus estadísticas" },
  { emoji: "\uD83C\uDFAF", title: "Coach IA" },
  { emoji: "\uD83D\uDCB0", title: "Inventario" },
  { emoji: "\uD83C\uDFC6", title: "Premier" },
  { emoji: "\uD83E\uDDE0", title: "An\u00E1lisis de demos" },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-2xl px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 sm:p-10"
        >
          <div className="space-y-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-center gap-4 text-lg"
              >
                <span className="text-2xl w-8 text-center">{feature.emoji}</span>
                <span className="font-medium">{feature.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
