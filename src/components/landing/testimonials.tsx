"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "Jugador Nivel 10",
    content:
      "El análisis de puntería me ayudó a mejorar mi colocación del crosshair. Consejos específicos basados en mis datos reales de FACEIT.",
    rating: 5,
    rank: "FACEIT Nivel 10",
  },
  {
    name: "Jugador Competitivo",
    content:
      "El tracking de utilidades es muy útil. Puedo ver exactamente dónde mejorar mis alineaciones de granadas y mis executes en equipo.",
    rating: 5,
    rank: "Premier 18,000",
  },
  {
    name: "Aspirante a Pro",
    content:
      "He probado varias herramientas de análisis. La más completa y el coaching con IA se siente como tener un entrenador personal analizando cada partida.",
    rating: 5,
    rank: "FACEIT Nivel 8",
  },
  {
    name: "Jugador Casual+",
    content:
      "Me gusta que muestra datos reales de mi perfil. El auto-detect de FACEIT con Steam es muy cómodo. Todo funciona sin complicaciones.",
    rating: 4,
    rank: "Global Elite",
  },
  {
    name: "Jugador de Equipo",
    content:
      "Los lineups de utilidades son excelentes. Tengo acceso a smokes, flashes y molotovs para cada mapa con explicaciones claras.",
    rating: 5,
    rank: "FACEIT Nivel 9",
  },
  {
    name: "Veterano de CS",
    content:
      "Interfaz limpia, análisis basados en datos reales. CS2Pilot respeta tu tiempo y ofrece lo que necesitas para mejorar sin humo.",
    rating: 5,
    rank: "Premier 15,000",
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
            Construido para{" "}
            <span className="gradient-text">jugadores reales</span>
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
