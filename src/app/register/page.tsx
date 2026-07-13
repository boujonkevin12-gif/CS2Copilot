"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Crosshair, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

function ParticleField() {
  const [particles, setParticles] = useState<
    { x: number; y: number; size: number; speed: number; opacity: number; delay: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 60 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 20 + 10,
      opacity: Math.random() * 0.4 + 0.1,
      delay: Math.random() * 10,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/40"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, -30, 0], opacity: [p.opacity, p.opacity * 2, p.opacity] }}
          transition={{ duration: p.speed, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[150px]"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", left: "-5%", top: "10%" }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[180px]"
        style={{ background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)", right: "-10%", bottom: "5%" }}
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function SteamIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <FloatingOrbs />
      {mounted && <ParticleField />}

      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-transparent to-accent/[0.03]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] rounded-full bg-primary/[0.06] blur-[80px] pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl gradient-border pointer-events-none" />

            <div className="relative z-10">
              <motion.div
                className="flex flex-col items-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link href="/" className="flex items-center gap-3 mb-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                    <Crosshair className="h-7 w-7 text-primary" />
                  </div>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight mt-2">
                  Crear Cuenta
                </h1>
                <p className="text-sm text-muted mt-1">Únete a CS2Pilot gratis</p>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest">
                  Registrarse
                </span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </motion.div>

              <motion.button
                className="w-full relative group cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => window.location.href = "/api/auth/steam"}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#1b2838] via-[#2a475e] to-[#1b2838] opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#1b2838] via-[#2a475e] to-[#1b2838] blur-xl opacity-30 group-hover:opacity-50 transition-opacity -z-10" />
                <div className="relative flex items-center justify-center gap-3 h-14 rounded-xl border border-white/[0.08] group-hover:border-white/[0.15] transition-all">
                  <SteamIcon />
                  <span className="text-base font-semibold text-white">
                    Registrarse con Steam
                  </span>
                </div>
              </motion.button>

              <motion.div
                className="flex items-center gap-3 my-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] text-muted-foreground font-mono">O</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </motion.div>

              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted font-medium mb-1.5 block">Nombre</label>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted font-medium mb-1.5 block">Usuario</label>
                    <input
                      type="text"
                      placeholder="username"
                      className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">Confirmar contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                  />
                </div>
              </motion.div>

              <motion.button
                className="w-full h-12 rounded-xl font-semibold text-sm mt-5 relative overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
                <span className="relative text-white">Crear Cuenta</span>
              </motion.button>

              <motion.p
                className="text-center text-[11px] text-muted-foreground mt-5 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                Al crear una cuenta, aceptas nuestros{" "}
                <a href="#" className="text-primary hover:text-primary-hover transition-colors">
                  Términos de Servicio
                </a>{" "}
                y{" "}
                <a href="#" className="text-primary hover:text-primary-hover transition-colors">
                  Política de Privacidad
                </a>
              </motion.p>

              <motion.p
                className="text-center text-xs text-muted mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
                  Inicia sesión
                </Link>
              </motion.p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}
