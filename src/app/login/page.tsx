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
        <svg
          viewBox="0 0 240 480"
          className="w-52 h-auto relative z-10 drop-shadow-[0_0_40px_rgba(59,130,246,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ct-body" x1="120" y1="0" x2="120" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#3b82f6" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#1e40af" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="ct-vest" x1="120" y1="120" x2="120" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="ct-helmet" x1="120" y1="20" x2="120" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="ct-visor" x1="100" y1="55" x2="140" y2="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="ct-gun" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="ct-glow" x1="120" y1="0" x2="120" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <filter id="ct-blur">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <motion.g
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Helmet */}
            <path d="M88 30 Q88 18 120 15 Q152 18 152 30 L155 65 Q155 80 140 85 L100 85 Q85 80 85 65 Z" fill="url(#ct-helmet)" opacity="0.9" />
            {/* Helmet top ridge */}
            <path d="M95 25 Q120 12 145 25" stroke="#7dd3fc" strokeWidth="1.5" fill="none" opacity="0.5" />
            {/* Night vision mount */}
            <rect x="108" y="28" width="24" height="6" rx="2" fill="#475569" opacity="0.7" />
            <circle cx="114" cy="28" r="4" fill="#334155" opacity="0.6" />
            <circle cx="126" cy="28" r="4" fill="#334155" opacity="0.6" />
            {/* NVG tubes */}
            <rect x="110" y="18" width="6" height="14" rx="2" fill="#1e293b" opacity="0.7" />
            <rect x="124" y="18" width="6" height="14" rx="2" fill="#1e293b" opacity="0.7" />
            <circle cx="113" cy="18" r="3" fill="#22c55e" opacity="0.4" />
            <circle cx="127" cy="18" r="3" fill="#22c55e" opacity="0.4" />
            {/* Visor / Gas mask */}
            <path d="M92 60 Q120 52 148 60 L146 78 Q120 85 94 78 Z" fill="url(#ct-visor)" opacity="0.8" />
            <path d="M92 60 Q120 52 148 60" stroke="#bae6fd" strokeWidth="0.8" fill="none" opacity="0.5" />
            {/* Visor reflection */}
            <path d="M98 58 Q115 54 130 58 L128 62 Q115 59 100 62 Z" fill="#e0f2fe" opacity="0.2" />
            {/* Gas mask filter left */}
            <ellipse cx="92" cy="75" rx="10" ry="8" fill="#334155" opacity="0.7" />
            <ellipse cx="92" cy="75" rx="7" ry="5" fill="#475569" opacity="0.5" />
            <circle cx="92" cy="75" r="3" fill="#64748b" opacity="0.4" />
            {/* Gas mask filter right */}
            <ellipse cx="148" cy="75" rx="10" ry="8" fill="#334155" opacity="0.7" />
            <ellipse cx="148" cy="75" rx="7" ry="5" fill="#475569" opacity="0.5" />
            <circle cx="148" cy="75" r="3" fill="#64748b" opacity="0.4" />
            {/* Mask center piece */}
            <path d="M108 70 L120 68 L132 70 L135 82 L120 86 L105 82 Z" fill="#1e293b" opacity="0.6" />
            {/* Chin strap */}
            <path d="M95 82 Q120 90 145 82" stroke="#475569" strokeWidth="1" fill="none" opacity="0.5" />

            {/* Neck / Collar */}
            <path d="M95 85 L100 95 L140 95 L145 85" fill="url(#ct-body)" opacity="0.7" />
            {/* Collar flaps */}
            <path d="M95 85 L88 100 L100 95" fill="#1e40af" opacity="0.5" />
            <path d="M145 85 L152 100 L140 95" fill="#1e40af" opacity="0.5" />

            {/* Body / Tactical vest */}
            <path d="M75 95 L165 95 L170 200 L70 200 Z" fill="url(#ct-vest)" opacity="0.85" />
            {/* Vest panel lines */}
            <line x1="90" y1="100" x2="88" y2="195" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3" />
            <line x1="150" y1="100" x2="152" y2="195" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3" />
            {/* Center zipper */}
            <line x1="120" y1="95" x2="120" y2="200" stroke="#1e3a8a" strokeWidth="1" opacity="0.4" />
            {/* Magazine pouches */}
            <rect x="82" y="110" width="18" height="35" rx="3" fill="#1e3a8a" opacity="0.6" />
            <rect x="82" y="110" width="18" height="35" rx="3" stroke="#60a5fa" strokeWidth="0.5" fill="none" opacity="0.3" />
            <rect x="140" y="110" width="18" height="35" rx="3" fill="#1e3a8a" opacity="0.6" />
            <rect x="140" y="110" width="18" height="35" rx="3" stroke="#60a5fa" strokeWidth="0.5" fill="none" opacity="0.3" />
            {/* Radio pouch */}
            <rect x="105" y="100" width="30" height="12" rx="2" fill="#1e3a8a" opacity="0.5" />
            {/* Radio */}
            <rect x="108" y="102" width="6" height="8" rx="1" fill="#475569" opacity="0.6" />
            <line x1="111" y1="100" x2="111" y2="102" stroke="#64748b" strokeWidth="1" opacity="0.5" />
            {/* Utility pouches */}
            <rect x="95" y="155" width="14" height="14" rx="2" fill="#1e3a8a" opacity="0.5" />
            <rect x="131" y="155" width="14" height="14" rx="2" fill="#1e3a8a" opacity="0.5" />
            {/* Shoulder armor */}
            <ellipse cx="72" cy="100" rx="12" ry="8" fill="#1e3a8a" opacity="0.6" />
            <ellipse cx="168" cy="100" rx="12" ry="8" fill="#1e3a8a" opacity="0.6" />

            {/* Left arm */}
            <path d="M68 100 L50 115 L42 195 L55 200 L62 115" fill="url(#ct-body)" opacity="0.75" />
            {/* Left arm sleeve details */}
            <line x1="52" y1="130" x2="56" y2="130" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3" />
            <line x1="48" y1="150" x2="53" y2="150" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3" />
            {/* Left glove */}
            <path d="M42 192 L38 210 L58 212 L55 195 Z" fill="#334155" opacity="0.7" />
            {/* Left elbow pad */}
            <ellipse cx="48" cy="165" rx="7" ry="5" fill="#1e3a8a" opacity="0.5" />

            {/* Right arm - holding M4A4 */}
            <path d="M172 100 L188 115 L195 175 L182 180 L178 120" fill="url(#ct-body)" opacity="0.75" />
            {/* Right arm sleeve */}
            <line x1="186" y1="130" x2="182" y2="130" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3" />
            {/* Right elbow pad */}
            <ellipse cx="190" cy="155" rx="7" ry="5" fill="#1e3a8a" opacity="0.5" />
            {/* Right glove */}
            <path d="M188 172 L192 195 L205 197 L200 170 Z" fill="#334155" opacity="0.7" />

            {/* M4A4 Rifle */}
            <g opacity="0.8">
              {/* Stock */}
              <path d="M195 168 L210 155 L212 172 L198 185 Z" fill="#475569" opacity="0.7" />
              {/* Receiver body */}
              <rect x="165" y="158" width="38" height="10" rx="2" fill="#64748b" opacity="0.7" />
              {/* Barrel */}
              <rect x="140" y="159" width="28" height="5" rx="1" fill="#94a3b8" opacity="0.6" />
              {/* Muzzle */}
              <rect x="135" y="157" width="8" height="9" rx="1" fill="#64748b" opacity="0.6" />
              {/* Magazine */}
              <path d="M175 168 L172 200 L180 200 L182 168 Z" fill="#475569" opacity="0.6" />
              {/* Grip */}
              <path d="M195 168 L192 195 L198 195 L200 168 Z" fill="#334155" opacity="0.6" />
              {/* Sight rail */}
              <rect x="160" y="155" width="30" height="3" rx="1" fill="#94a3b8" opacity="0.5" />
              {/* Red dot sight */}
              <rect x="170" y="148" width="12" height="7" rx="2" fill="#475569" opacity="0.6" />
              <circle cx="176" cy="148" r="2" fill="#ef4444" opacity="0.4" />
              {/* Foregrip */}
              <rect x="150" y="168" width="8" height="15" rx="2" fill="#334155" opacity="0.5" />
            </g>

            {/* Left leg */}
            <path d="M70 200 L62 340 L82 342 L90 205" fill="url(#ct-body)" opacity="0.75" />
            {/* Knee pad left */}
            <ellipse cx="70" cy="290" rx="10" ry="8" fill="#1e3a8a" opacity="0.6" />
            <ellipse cx="70" cy="290" rx="7" ry="5" fill="#2563eb" opacity="0.3" />
            {/* Left leg pocket */}
            <rect x="68" y="220" width="14" height="12" rx="2" fill="#1e3a8a" opacity="0.4" />

            {/* Right leg */}
            <path d="M150 205 L158 340 L178 340 L170 200" fill="url(#ct-body)" opacity="0.75" />
            {/* Knee pad right */}
            <ellipse cx="168" cy="290" rx="10" ry="8" fill="#1e3a8a" opacity="0.6" />
            <ellipse cx="168" cy="290" rx="7" ry="5" fill="#2563eb" opacity="0.3" />
            {/* Right leg pocket */}
            <rect x="160" y="220" width="14" height="12" rx="2" fill="#1e3a8a" opacity="0.4" />

            {/* Combat boots */}
            <path d="M55 338 L88 338 L92 365 L88 370 L50 370 L46 365 Z" fill="#1e293b" opacity="0.8" />
            <path d="M155 338 L185 338 L188 365 L185 370 L150 370 L148 365 Z" fill="#1e293b" opacity="0.8" />
            {/* Boot laces */}
            <line x1="65" y1="342" x2="78" y2="342" stroke="#475569" strokeWidth="0.5" opacity="0.4" />
            <line x1="63" y1="348" x2="80" y2="348" stroke="#475569" strokeWidth="0.5" opacity="0.4" />
            <line x1="163" y1="342" x2="178" y2="342" stroke="#475569" strokeWidth="0.5" opacity="0.4" />
            <line x1="160" y1="348" x2="180" y2="348" stroke="#475569" strokeWidth="0.5" opacity="0.4" />
            {/* Boot soles */}
            <rect x="46" y="368" width="44" height="5" rx="2" fill="#0f172a" opacity="0.7" />
            <rect x="148" y="368" width="40" height="5" rx="2" fill="#0f172a" opacity="0.7" />

            {/* Glow silhouette */}
            <ellipse cx="120" cy="230" rx="80" ry="200" fill="url(#ct-glow)" filter="url(#ct-blur)" opacity="0.12" />
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
          viewBox="0 0 240 480"
          className="w-52 h-auto relative z-10 drop-shadow-[0_0_40px_rgba(249,115,22,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="t-body" x1="120" y1="0" x2="120" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#f97316" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#c2410c" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="t-jacket" x1="120" y1="100" x2="120" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#9a3412" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="t-balaclava" x1="120" y1="20" x2="120" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#c2410c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="t-glow" x1="120" y1="0" x2="120" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
            <filter id="t-blur">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <motion.g
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            {/* Head shape */}
            <ellipse cx="120" cy="55" rx="24" ry="28" fill="url(#t-balaclava)" opacity="0.9" />
            {/* Balaclava */}
            <path d="M92 32 Q92 18 120 15 Q148 18 148 32 L150 68 Q150 82 135 85 L105 85 Q90 82 90 68 Z" fill="url(#t-balaclava)" opacity="0.85" />
            {/* Balaclava knit texture */}
            <path d="M95 28 Q120 18 145 28" stroke="#ea580c" strokeWidth="0.8" fill="none" opacity="0.3" />
            <path d="M93 35 Q120 25 147 35" stroke="#ea580c" strokeWidth="0.5" fill="none" opacity="0.25" />
            <path d="M92 42 Q120 32 148 42" stroke="#ea580c" strokeWidth="0.5" fill="none" opacity="0.2" />
            {/* Eye holes */}
            <path d="M100 48 Q108 44 116 48 L114 58 Q108 62 102 58 Z" fill="#1c1917" opacity="0.85" />
            <path d="M124 48 Q132 44 140 48 L138 58 Q132 62 126 58 Z" fill="#1c1917" opacity="0.85" />
            {/* Eyes */}
            <ellipse cx="109" cy="52" rx="4" ry="3" fill="#fef3c7" opacity="0.6" />
            <circle cx="110" cy="52" r="1.5" fill="#1c1917" opacity="0.8" />
            <ellipse cx="133" cy="52" rx="4" ry="3" fill="#fef3c7" opacity="0.6" />
            <circle cx="134" cy="52" r="1.5" fill="#1c1917" opacity="0.8" />
            {/* Eye glint */}
            <circle cx="111" cy="51" r="0.8" fill="white" opacity="0.5" />
            <circle cx="135" cy="51" r="0.8" fill="white" opacity="0.5" />
            {/* Nose bump under balaclava */}
            <path d="M118 56 Q120 60 122 56" stroke="#c2410c" strokeWidth="0.5" fill="none" opacity="0.3" />
            {/* Mouth slit */}
            <path d="M112 65 Q120 68 128 65" stroke="#1c1917" strokeWidth="0.8" fill="none" opacity="0.4" />

            {/* Neck */}
            <path d="M105 82 L110 95 L130 95 L135 82" fill="url(#t-body)" opacity="0.7" />

            {/* Body - Leather jacket */}
            <path d="M72 95 L168 95 L172 205 L68 205 Z" fill="url(#t-jacket)" opacity="0.85" />
            {/* Jacket collar - popped */}
            <path d="M95 85 L88 100 L105 95" fill="#9a3412" opacity="0.6" />
            <path d="M145 85 L152 100 L135 95" fill="#9a3412" opacity="0.6" />
            {/* Jacket zipper */}
            <line x1="120" y1="95" x2="120" y2="205" stroke="#7c2d12" strokeWidth="1.2" opacity="0.4" />
            <path d="M118 95 L120 92 L122 95" fill="#94a3b8" opacity="0.4" />
            {/* Jacket seam lines */}
            <line x1="88" y1="100" x2="86" y2="200" stroke="#c2410c" strokeWidth="0.5" opacity="0.3" />
            <line x1="152" y1="100" x2="154" y2="200" stroke="#c2410c" strokeWidth="0.5" opacity="0.3" />
            {/* Shoulder seams */}
            <path d="M72 95 Q85 100 95 95" stroke="#7c2d12" strokeWidth="0.5" fill="none" opacity="0.3" />
            <path d="M168 95 Q155 100 145 95" stroke="#7c2d12" strokeWidth="0.5" fill="none" opacity="0.3" />
            {/* Chest pocket */}
            <path d="M82 115 L108 115 L106 140 L84 140 Z" fill="#9a3412" opacity="0.4" />
            <line x1="82" y1="115" x2="108" y2="115" stroke="#c2410c" strokeWidth="0.5" opacity="0.3" />
            {/* Pocket flap */}
            <path d="M84 115 L106 115 L105 120 L85 120 Z" fill="#7c2d12" opacity="0.3" />
            {/* Belt */}
            <rect x="70" y="185" width="100" height="8" rx="2" fill="#1c1917" opacity="0.6" />
            <rect x="112" y="183" width="16" height="12" rx="2" fill="#78716c" opacity="0.5" />
            {/* Belt buckle */}
            <rect x="115" y="186" width="10" height="6" rx="1" fill="#a8a29e" opacity="0.4" />

            {/* Left arm - leather sleeve */}
            <path d="M68 100 L48 115 L38 200 L55 205 L62 115" fill="url(#t-body)" opacity="0.75" />
            {/* Left arm cuff */}
            <rect x="38" y="192" width="20" height="8" rx="2" fill="#1c1917" opacity="0.4" />
            {/* Left glove - fingerless */}
            <path d="M38 198 L34 218 L58 220 L55 200 Z" fill="#44403c" opacity="0.7" />
            <path d="M40 198 L52 198" stroke="#292524" strokeWidth="1" opacity="0.4" />
            {/* Left elbow patch */}
            <ellipse cx="45" cy="165" rx="8" ry="6" fill="#7c2d12" opacity="0.4" />

            {/* Right arm - holding AK-47 */}
            <path d="M172 100 L190 115 L198 180 L184 185 L180 120" fill="url(#t-body)" opacity="0.75" />
            {/* Right arm cuff */}
            <rect x="188" y="172" width="14" height="8" rx="2" fill="#1c1917" opacity="0.4" />
            {/* Right glove */}
            <path d="M192 178 L196 200 L210 202 L205 176 Z" fill="#44403c" opacity="0.7" />
            {/* Right elbow patch */}
            <ellipse cx="193" cy="155" rx="8" ry="6" fill="#7c2d12" opacity="0.4" />

            {/* AK-47 Rifle */}
            <g opacity="0.8">
              {/* Stock - wooden */}
              <path d="M200 170 L218 155 L222 178 L204 190 Z" fill="#92400e" opacity="0.7" />
              <path d="M200 170 L218 155 L222 178 L204 190 Z" stroke="#78350f" strokeWidth="0.5" fill="none" opacity="0.3" />
              {/* Receiver */}
              <rect x="160" y="162" width="44" height="12" rx="2" fill="#57534e" opacity="0.7" />
              {/* Barrel */}
              <rect x="128" y="164" width="35" height="6" rx="1" fill="#78716c" opacity="0.6" />
              {/* Muzzle brake */}
              <rect x="122" y="162" width="10" height="10" rx="1" fill="#57534e" opacity="0.6" />
              {/* Curved magazine */}
              <path d="M172 174 L165 215 Q168 220 175 215 L180 174 Z" fill="#292524" opacity="0.7" />
              {/* Magazine ribs */}
              <line x1="168" y1="180" x2="168" y2="210" stroke="#44403c" strokeWidth="0.5" opacity="0.3" />
              <line x1="172" y1="178" x2="172" y2="212" stroke="#44403c" strokeWidth="0.5" opacity="0.3" />
              {/* Pistol grip */}
              <path d="M198 174 L194 205 L202 205 L204 174 Z" fill="#292524" opacity="0.6" />
              {/* Sight */}
              <rect x="165" y="158" width="8" height="4" rx="1" fill="#57534e" opacity="0.5" />
              <rect x="140" y="160" width="6" height="3" rx="1" fill="#57534e" opacity="0.5" />
              {/* Wood furniture grain */}
              <line x1="204" y1="172" x2="218" y2="160" stroke="#a16207" strokeWidth="0.3" opacity="0.2" />
              <line x1="202" y1="176" x2="220" y2="165" stroke="#a16207" strokeWidth="0.3" opacity="0.2" />
            </g>

            {/* Left leg - cargo pants */}
            <path d="M68 205 L60 340 L82 342 L92 210" fill="url(#t-body)" opacity="0.75" />
            {/* Cargo pocket */}
            <rect x="62" y="250" width="16" height="16" rx="2" fill="#9a3412" opacity="0.4" />
            <path d="M64 250 L76 250 L75 253 L65 253 Z" fill="#7c2d12" opacity="0.3" />
            {/* Knee area */}
            <path d="M64 285 Q72 280 80 285" stroke="#c2410c" strokeWidth="0.5" fill="none" opacity="0.3" />

            {/* Right leg - cargo pants */}
            <path d="M148 210 L158 340 L178 340 L172 205" fill="url(#t-body)" opacity="0.75" />
            {/* Cargo pocket */}
            <rect x="162" y="250" width="16" height="16" rx="2" fill="#9a3412" opacity="0.4" />
            <path d="M164 250 L176 250 L175 253 L165 253 Z" fill="#7c2d12" opacity="0.3" />
            {/* Knee area */}
            <path d="M162 285 Q170 280 178 285" stroke="#c2410c" strokeWidth="0.5" fill="none" opacity="0.3" />

            {/* Combat boots - worn leather */}
            <path d="M52 338 L88 338 L92 365 L88 372 L48 372 L44 365 Z" fill="#292524" opacity="0.8" />
            <path d="M155 338 L185 338 L188 365 L185 372 L150 372 L146 365 Z" fill="#292524" opacity="0.8" />
            {/* Boot worn marks */}
            <path d="M55 342 L82 342" stroke="#44403c" strokeWidth="0.5" opacity="0.3" />
            <path d="M52 348 L84 348" stroke="#44403c" strokeWidth="0.5" opacity="0.3" />
            <path d="M158 342 L182 342" stroke="#44403c" strokeWidth="0.5" opacity="0.3" />
            <path d="M155 348 L184 348" stroke="#44403c" strokeWidth="0.5" opacity="0.3" />
            {/* Boot laces */}
            <line x1="64" y1="342" x2="76" y2="342" stroke="#78716c" strokeWidth="0.6" opacity="0.4" />
            <line x1="62" y1="348" x2="78" y2="348" stroke="#78716c" strokeWidth="0.6" opacity="0.4" />
            <line x1="164" y1="342" x2="176" y2="342" stroke="#78716c" strokeWidth="0.6" opacity="0.4" />
            <line x1="162" y1="348" x2="178" y2="348" stroke="#78716c" strokeWidth="0.6" opacity="0.4" />
            {/* Boot soles */}
            <rect x="44" y="370" width="46" height="5" rx="2" fill="#0c0a09" opacity="0.7" />
            <rect x="146" y="370" width="44" height="5" rx="2" fill="#0c0a09" opacity="0.7" />

            {/* Glow silhouette */}
            <ellipse cx="120" cy="230" rx="80" ry="200" fill="url(#t-glow)" filter="url(#t-blur)" opacity="0.12" />
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
