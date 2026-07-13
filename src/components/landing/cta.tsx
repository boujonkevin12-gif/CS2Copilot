"use client";

import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl sm:text-2xl text-muted font-medium"
        >
          Tus estadísticas nunca fueron tan inteligentes.
        </motion.p>
      </div>
    </section>
  );
}
