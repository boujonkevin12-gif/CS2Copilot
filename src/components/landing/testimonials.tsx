"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "s1mple",
    role: "Jugador Profesional",
    team: "NAVI",
    content:
      "CS2Pilot cambió completamente la forma en que reviso mis demos. Solo el análisis de puntería me ayudó a mejorar mi colocación del crosshair en un 15%. Herramienta esencial para cualquier jugador competitivo.",
    rating: 5,
    rank: "FACEIT Nivel 10",
  },
  {
    name: "NiKo",
    role: "Jugador Profesional",
    team: "G2 Esports",
    content:
      "El rastreo de utilidades es increíble. Puedo ver exactamente dónde caen mis humos, qué tan efectivos son mis flashes y dónde mejorar mis alineaciones de granadas. Cambiador de juego.",
    rating: 5,
    rank: "Global Elite",
  },
  {
    name: "ZywOo",
    role: "Jugador Profesional",
    team: "Vitality",
    content:
      "He probado todas las herramientas de análisis de CS ahí fuera. CS2Pilot es con diferencia la más completa y el coaching con IA se siente como tener un entrenador real viendo cada partido.",
    rating: 5,
    rank: "FACEIT Nivel 10",
  },
  {
    name: "dev1ce",
    role: "Jugador Profesional",
    team: "Astralis",
    content:
      "El panel de análisis de equipo es exactamente lo que necesitaba. Puedo revisar el rendimiento de mis compañeros y coordinar estrategias basadas en datos, no solo en intuición.",
    rating: 5,
    rank: "Global Elite",
  },
  {
    name: "EliGE",
    role: "Jugador Profesional",
    team: "Complexity",
    content:
      "La mejor inversión que he hecho para mi carrera. El seguimiento de progreso me mantiene motivado y los consejos de IA son muy precisos. Pasé del Nivel 7 al Nivel 10 en dos meses.",
    rating: 5,
    rank: "FACEIT Nivel 10",
  },
  {
    name: "ropz",
    role: "Jugador Profesional",
    team: "FaZe Clan",
    content:
      "Interfaz limpia, análisis potentes, cero redundancia. CS2Pilot respeta tu tiempo y ofrece exactamente lo que necesitas para mejorar. Muy recomendado.",
    rating: 5,
    rank: "Global Elite",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-widest mb-4"
          >
            Testimonios
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
          >
            Favorito de{" "}
            <span className="gradient-text">150,000+</span> jugadores
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6 flex flex-col"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-accent text-accent"
                  />
                ))}
              </div>
              <p className="text-sm text-muted leading-relaxed mb-6 flex-1">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                <div>
                  <div className="text-sm font-semibold">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted">
                    {testimonial.role} &middot; {testimonial.team}
                  </div>
                </div>
                <Badge variant="default" size="sm">
                  {testimonial.rank}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
