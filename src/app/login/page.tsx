"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Crosshair } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

function ParticleField() {
  const [particles, setParticles] = useState<
    { x: number; y: number; size: number; speed: number; opacity: number; delay: number }[]
  >([]);
  const [lines, setLines] = useState<
    { width: number; left: number; top: number; rotate: number; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 80 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 20 + 10,
        opacity: Math.random() * 0.4 + 0.1,
        delay: Math.random() * 10,
      }))
    );
    setLines(
      Array.from({ length: 6 }, () => ({
        width: Math.random() * 200 + 100,
        left: Math.random() * 100,
        top: Math.random() * 100,
        rotate: Math.random() * 360,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/40"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.speed,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      {lines.map((l, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          style={{
            width: `${l.width}px`,
            left: `${l.left}%`,
            top: `${l.top}%`,
            transform: `rotate(${l.rotate}deg)`,
          }}
          animate={{
            opacity: [0, 0.3, 0],
            scaleX: [0.5, 1, 0.5],
          }}
          transition={{
            duration: l.duration,
            repeat: Infinity,
            delay: l.delay,
            ease: "easeInOut",
          }}
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
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          left: "-5%",
          top: "10%",
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[180px]"
        style={{
          background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)",
          right: "-10%",
          bottom: "5%",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)",
          left: "40%",
          top: "60%",
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 20, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function CrosshairSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="50" cy="50" r="2" fill="currentColor" />
      <line x1="50" y1="25" x2="50" y2="40" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <line x1="50" y1="60" x2="50" y2="75" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <line x1="25" y1="50" x2="40" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <line x1="60" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

function CTCharacter() {
  return (
    <motion.div
      className="relative hidden lg:flex items-end justify-center"
      initial={{ opacity: 0, x: -80, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
    >
      <div className="relative">
        <div className="absolute -inset-20 bg-primary/[0.04] rounded-full blur-[80px]" />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src="/agents/ct-sas.png"
            alt="CS2 CT Agent"
            className="w-64 h-auto relative z-10 drop-shadow-[0_0_40px_rgba(59,130,246,0.3)]"
            style={{
              opacity: 0.3,
              filter: "drop-shadow(0 0 30px rgba(59,130,246,0.25))",
              maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
              transform: "translateX(-25%)",
            }}
          />
        </motion.div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-primary/60 font-mono uppercase tracking-widest">Counter-Terrorist</span>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

function TCharacter() {
  return (
    <motion.div
      className="relative hidden lg:flex items-end justify-center"
      initial={{ opacity: 0, x: 80, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
    >
      <div className="relative">
        <div className="absolute -inset-20 bg-accent/[0.04] rounded-full blur-[80px]" />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <img
            src="/agents/t-terrorist.png"
            alt="CS2 Terrorist Agent"
            className="w-64 h-auto relative z-10 drop-shadow-[0_0_40px_rgba(249,115,22,0.3)]"
            style={{
              opacity: 0.3,
              filter: "drop-shadow(0 0 30px rgba(249,115,22,0.25))",
              maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
              transform: "translateX(25%)",
            }}
          />
        </motion.div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] text-accent/60 font-mono uppercase tracking-widest">Terrorist</span>
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

function SteamIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
    </svg>
  );
}

function ScanLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015]">
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className="w-full h-px bg-white"
          style={{ marginTop: `${i * 8}px` }}
        />
      ))}
    </div>
  );
}

function AnimatedCrosshairs() {
  const positions = [
    { x: "15%", y: "20%", size: 40, delay: 0 },
    { x: "85%", y: "30%", size: 30, delay: 2 },
    { x: "10%", y: "70%", size: 35, delay: 4 },
    { x: "90%", y: "75%", size: 25, delay: 1 },
    { x: "50%", y: "10%", size: 20, delay: 3 },
    { x: "30%", y: "85%", size: 28, delay: 5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/[0.06]"
          style={{
            left: pos.x,
            top: pos.y,
            width: pos.size,
            height: pos.size,
          }}
          animate={{
            opacity: [0, 0.5, 0],
            rotate: [0, 90],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: pos.delay,
            ease: "easeInOut",
          }}
        >
          <CrosshairSVG className="w-full h-full" />
        </motion.div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background layers */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <ScanLines />
      <FloatingOrbs />
      {mounted && <ParticleField />}
      <AnimatedCrosshairs />

      {/* Gradient edges */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-transparent to-accent/[0.03]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex items-center justify-center gap-8 lg:gap-16">
        {/* CT Character */}
        <div className="hidden lg:block flex-1">
          {mounted && <CTCharacter />}
        </div>

        {/* Login Card */}
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
            {/* Inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] rounded-full bg-primary/[0.06] blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[200px] h-[150px] rounded-full bg-accent/[0.04] blur-[60px] pointer-events-none" />

            {/* Animated border */}
            <div className="absolute inset-0 rounded-3xl gradient-border pointer-events-none" />

            <div className="relative z-10">
              {/* Logo */}
              <motion.div
                className="flex flex-col items-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link href="/" className="flex items-center gap-3 mb-2">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <img src="/logo-icon.png" alt="CS2Pilot" className="h-14 w-14" />
                  </motion.div>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight mt-2">
                  CS2<span className="text-primary">Pilot</span>
                </h1>
                <p className="text-sm text-muted mt-1">Tu compañero definitivo de CS2</p>
              </motion.div>

              {/* Divider with text */}
              <motion.div
                className="flex items-center gap-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest">
                  Iniciar Sesión
                </span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </motion.div>

              {/* Steam Login Button */}
              <motion.button
                className="w-full relative group cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => window.location.href = "/api/auth/steam"}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#1b2838] via-[#2a475e] to-[#1b2838] opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#1b2838] via-[#2a475e] to-[#1b2838] blur-xl opacity-30 group-hover:opacity-50 transition-opacity -z-10" />
                <div className="relative flex items-center justify-center gap-3 h-14 rounded-xl border border-white/[0.08] group-hover:border-white/[0.15] transition-all">
                  <SteamIcon />
                  <span className="text-base font-semibold text-white">
                    Continuar con Steam
                  </span>
                </div>
              </motion.button>

              {/* Separator */}
              <motion.div
                className="flex items-center gap-3 my-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] text-muted-foreground font-mono">O</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </motion.div>

              {/* Email input */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium mb-1.5 block">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                  />
                </div>
              </motion.div>

              {/* Login button */}
              <motion.button
                className="w-full h-12 rounded-xl font-semibold text-sm mt-5 relative overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
                <span className="relative text-white">Iniciar Sesión</span>
              </motion.button>

              {/* Footer text */}
              <motion.p
                className="text-center text-[11px] text-muted-foreground mt-5 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Al continuar, aceptas nuestros{" "}
                <a href="#" className="text-primary hover:text-primary-hover transition-colors">
                  Términos de Servicio
                </a>{" "}
                y{" "}
                <a href="#" className="text-primary hover:text-primary-hover transition-colors">
                  Política de Privacidad
                </a>
              </motion.p>

              {/* Register link */}
              <motion.p
                className="text-center text-xs text-muted mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-primary hover:text-primary-hover font-medium transition-colors">
                  Regístrate gratis
                </Link>
              </motion.p>
            </div>
          </div>

          {/* Bottom stats */}
          <motion.div
            className="flex items-center justify-center gap-6 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
              <span className="text-[11px] text-muted-foreground">150K+ jugadores</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] text-muted-foreground">Gratis para empezar</span>
            </div>
          </motion.div>
        </motion.div>

        {/* T Character */}
        <div className="hidden lg:block flex-1">
          {mounted && <TCharacter />}
        </div>
      </div>

      {/* Back to home */}
      <motion.div
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>
      </motion.div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}
