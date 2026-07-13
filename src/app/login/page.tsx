"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Crosshair } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

function ParticleField() {
  const [particles, setParticles] = useState<
    { x: number; y: number; size: number; speed: number; opacity: number; delay: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 80 }, () => ({
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
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          style={{
            width: `${Math.random() * 200 + 100}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
          animate={{
            opacity: [0, 0.3, 0],
            scaleX: [0.5, 1, 0.5],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            delay: Math.random() * 5,
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
        <svg
          viewBox="0 0 200 400"
          className="w-48 h-auto relative z-10 drop-shadow-[0_0_40px_rgba(59,130,246,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ct-gradient" x1="100" y1="0" x2="100" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="ct-glow" x1="100" y1="0" x2="100" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <filter id="ct-blur">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Head */}
            <ellipse cx="100" cy="55" rx="22" ry="26" fill="url(#ct-gradient)" opacity="0.8" />
            <ellipse cx="100" cy="55" rx="24" ry="28" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3" />
            {/* Helmet visor */}
            <path d="M78 48 Q100 42 122 48 L120 60 Q100 65 80 60 Z" fill="url(#ct-gradient)" opacity="0.6" />
            <line x1="80" y1="52" x2="120" y2="52" stroke="#60a5fa" strokeWidth="0.5" opacity="0.4" />
            {/* Neck */}
            <rect x="92" y="78" width="16" height="10" rx="3" fill="url(#ct-gradient)" opacity="0.6" />
            {/* Torso */}
            <path d="M70 88 L130 88 L135 180 L65 180 Z" fill="url(#ct-gradient)" opacity="0.75" />
            <path d="M70 88 L130 88 L135 180 L65 180 Z" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3" />
            {/* Vest details */}
            <line x1="85" y1="95" x2="85" y2="165" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3" />
            <line x1="115" y1="95" x2="115" y2="165" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3" />
            <rect x="88" y="100" width="24" height="40" rx="3" fill="url(#ct-gradient)" opacity="0.5" />
            <rect x="88" y="148" width="24" height="25" rx="3" fill="url(#ct-gradient)" opacity="0.4" />
            {/* Left arm */}
            <path d="M70 88 L55 95 L48 155 L60 160 L65 105" fill="url(#ct-gradient)" opacity="0.65" />
            {/* Right arm - holding rifle */}
            <path d="M130 88 L145 95 L152 140 L140 145 L135 100" fill="url(#ct-gradient)" opacity="0.65" />
            {/* Rifle */}
            <rect x="138" y="100" width="6" height="80" rx="2" fill="url(#ct-gradient)" opacity="0.5" transform="rotate(15, 141, 140)" />
            <rect x="135" y="98" width="18" height="8" rx="2" fill="url(#ct-gradient)" opacity="0.4" transform="rotate(15, 144, 102)" />
            {/* Left leg */}
            <path d="M65 180 L58 300 L72 302 L80 185" fill="url(#ct-gradient)" opacity="0.65" />
            {/* Right leg */}
            <path d="M120 185 L128 300 L142 300 L135 180" fill="url(#ct-gradient)" opacity="0.65" />
            {/* Boots */}
            <path d="M52 298 L78 298 L80 315 L50 315 Z" fill="url(#ct-gradient)" opacity="0.7" />
            <path d="M125 298 L148 298 L150 315 L123 315 Z" fill="url(#ct-gradient)" opacity="0.7" />
            {/* Glow silhouette */}
            <ellipse cx="100" cy="200" rx="65" ry="170" fill="url(#ct-glow)" filter="url(#ct-blur)" opacity="0.15" />
          </motion.g>
        </svg>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
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
        <svg
          viewBox="0 0 200 400"
          className="w-48 h-auto relative z-10 drop-shadow-[0_0_40px_rgba(249,115,22,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="t-gradient" x1="100" y1="0" x2="100" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#c2410c" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="t-glow" x1="100" y1="0" x2="100" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
            <filter id="t-blur">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            {/* Head */}
            <ellipse cx="100" cy="55" rx="22" ry="26" fill="url(#t-gradient)" opacity="0.8" />
            <ellipse cx="100" cy="55" rx="24" ry="28" fill="none" stroke="#fb923c" strokeWidth="0.5" opacity="0.3" />
            {/* Balaclava/Head wrap */}
            <path d="M78 45 Q100 38 122 45 L118 62 Q100 68 82 62 Z" fill="url(#t-gradient)" opacity="0.5" />
            <line x1="85" y1="50" x2="115" y2="50" stroke="#fb923c" strokeWidth="0.3" opacity="0.4" />
            <line x1="83" y1="55" x2="117" y2="55" stroke="#fb923c" strokeWidth="0.3" opacity="0.3" />
            {/* Neck */}
            <rect x="92" y="78" width="16" height="10" rx="3" fill="url(#t-gradient)" opacity="0.6" />
            {/* Torso - jacket */}
            <path d="M68 88 L132 88 L138 185 L62 185 Z" fill="url(#t-gradient)" opacity="0.75" />
            <path d="M68 88 L132 88 L138 185 L62 185 Z" fill="none" stroke="#fb923c" strokeWidth="0.5" opacity="0.3" />
            {/* Jacket details */}
            <line x1="100" y1="88" x2="100" y2="185" stroke="#fb923c" strokeWidth="0.5" opacity="0.3" />
            <path d="M75 100 L80 95 L85 105" fill="url(#t-gradient)" opacity="0.4" />
            <rect x="80" y="110" width="40" height="5" rx="2" fill="url(#t-gradient)" opacity="0.3" />
            {/* Left arm */}
            <path d="M68 88 L52 98 L46 160 L58 165 L62 100" fill="url(#t-gradient)" opacity="0.65" />
            {/* Right arm */}
            <path d="M132 88 L148 98 L154 150 L142 155 L138 100" fill="url(#t-gradient)" opacity="0.65" />
            {/* AK in right hand */}
            <rect x="140" y="105" width="5" height="75" rx="2" fill="url(#t-gradient)" opacity="0.5" transform="rotate(-12, 142, 142)" />
            <rect x="135" y="100" width="16" height="6" rx="2" fill="url(#t-gradient)" opacity="0.4" transform="rotate(-12, 143, 103)" />
            {/* Left leg */}
            <path d="M62 185 L55 305 L70 307 L78 190" fill="url(#t-gradient)" opacity="0.65" />
            {/* Right leg */}
            <path d="M122 190 L130 305 L145 305 L138 185" fill="url(#t-gradient)" opacity="0.65" />
            {/* Boots */}
            <path d="M49 303 L76 303 L78 320 L47 320 Z" fill="url(#t-gradient)" opacity="0.7" />
            <path d="M127 303 L150 303 L152 320 L125 320 Z" fill="url(#t-gradient)" opacity="0.7" />
            {/* Glow silhouette */}
            <ellipse cx="100" cy="200" rx="65" ry="170" fill="url(#t-glow)" filter="url(#t-blur)" opacity="0.15" />
          </motion.g>
        </svg>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
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
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
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
      <ParticleField />
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
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Crosshair className="h-7 w-7 text-primary" />
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
                <a href="#" className="text-primary hover:text-primary-hover font-medium transition-colors">
                  Regístrate gratis
                </a>
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
