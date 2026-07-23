"use client";

import { useGamification } from "@/lib/gamification-context";
import { Swords, CheckCircle, Timer, Star, Gift, Flame, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const difficultyConfig: Record<string, { label: string; color: string; bg: string; ring: string }> = {
  easy: { label: "Fácil", color: "text-green-400", bg: "bg-green-500/10", ring: "ring-green-500/30" },
  medium: { label: "Medio", color: "text-orange-400", bg: "bg-orange-500/10", ring: "ring-orange-500/30" },
  hard: { label: "Difícil", color: "text-red-400", bg: "bg-red-500/10", ring: "ring-red-500/30" },
};

export default function ChallengesPage() {
  const { dailyChallenges, weeklyMissions, dailyChest, refreshChallenges } = useGamification();
  const [claiming, setClaiming] = useState<string | null>(null);
  const [chestReward, setChestReward] = useState<{ amount: number } | null>(null);

  const handleClaim = async (id: string, type?: string) => {
    setClaiming(id);
    try {
      const res = await fetch("/api/gamification/challenges/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: id, type: type || "daily" }),
      });
      const data = await res.json();
      if (type === "chest" && data.success) {
        setChestReward({ amount: data.amount });
        setTimeout(() => setChestReward(null), 4000);
      }
      await refreshChallenges();
    } finally {
      setClaiming(null);
    }
  };

  const allDailyDone = dailyChest?.allDone || false;
  const dailyChestClaimed = dailyChest?.claimed || false;

  if (useGamification().loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Swords className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Desafíos</h1>
          <p className="text-sm text-muted">Completá misiones para ganar recompensas</p>
        </div>
      </div>

      {/* Daily Challenges */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Timer className="h-4 w-4 text-accent" />
          <h2 className="text-lg font-bold">Desafíos Diarios</h2>
          <span className="text-[10px] text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">Se renuevan cada día</span>
        </div>

        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          {dailyChallenges.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center text-sm text-muted col-span-3">No hay desafíos disponibles hoy</div>
          ) : (
            dailyChallenges.map((c) => {
              const pct = c.target > 0 ? Math.min(100, (c.progress / c.target) * 100) : 0;
              const diff = difficultyConfig[c.difficulty || "easy"];
              return (
                <div
                  key={c.id}
                  className={`glass-strong rounded-xl p-4 transition-all ring-1 ${diff.ring} ${
                    c.claimed ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${diff.color} ${diff.bg} px-2 py-0.5 rounded-full`}>
                      {diff.label}
                    </span>
                    {c.claimed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : c.completed ? (
                      <button
                        onClick={() => handleClaim(c.id)}
                        disabled={claiming === c.id}
                        className="text-[10px] font-bold text-white bg-gradient-to-r from-primary to-accent px-3 py-1 rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
                      >
                        {claiming === c.id ? <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Gift className="h-3 w-3" />}
                        Reclamar
                      </button>
                    ) : (
                      <span className="text-[10px] text-muted font-mono">{c.progress}/{c.target}</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold mb-3">{c.name}</h3>

                  <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        c.difficulty === "hard" ? "from-red-500 to-orange-500" :
                        c.difficulty === "medium" ? "from-orange-500 to-yellow-500" :
                        "from-green-500 to-emerald-500"
                      } transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                    <span className="text-[10px] text-primary font-medium">⚡ +{c.xp} XP</span>
                    {c.coins > 0 && <span className="text-[10px] text-accent font-medium">🪙 +{c.coins}</span>}
                    {c.badge && <span className="text-[10px] text-yellow-500 font-medium">🏅 +Badge</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Daily Chest */}
        {dailyChallenges.length > 0 && (
          <div className="mt-4">
            <div className={`glass-strong rounded-xl p-4 flex items-center gap-4 ${
              allDailyDone && !dailyChestClaimed ? "ring-1 ring-primary/50" : ""
            }`}>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${
                allDailyDone && !dailyChestClaimed
                  ? "bg-primary/10 animate-pulse"
                  : dailyChestClaimed
                    ? "bg-white/[0.04] opacity-50"
                    : "bg-white/[0.04]"
              }`}>
                {dailyChestClaimed ? "✅" : allDailyDone ? "🎁" : "📦"}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold">
                  {dailyChestClaimed ? "Cofre Diario Reclamado" : allDailyDone ? "¡Cofre Diario Listo!" : "Cofre Diario"}
                </h3>
                <p className="text-xs text-muted">
                  {dailyChestClaimed
                    ? "Vuelve mañana para más recompensas"
                    : allDailyDone
                      ? "Completaste todos los desafíos. ¡Reclamá tu cofre!"
                      : `Completá los 3 desafíos para desbloquear el cofre`
                  }
                </p>
              </div>
              {allDailyDone && !dailyChestClaimed && (
                <button
                  onClick={() => handleClaim("daily_chest", "chest")}
                  className="gradient-btn text-xs font-bold text-white px-4 py-2 rounded-xl shadow-lg shadow-primary/20"
                >
                  🎁 Abrir Cofre
                </button>
              )}
            </div>
          </div>
        )}
        </div>

      {/* Chest Reward Toast */}
      {chestReward && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-primary to-accent rounded-2xl p-5 shadow-2xl shadow-primary/30 text-white text-center"
        >
          <div className="text-3xl mb-2">🎁</div>
          <div className="text-lg font-bold">+{chestReward.amount} 🪙</div>
          <div className="text-xs text-white/70 mt-1">Pilot Coins obtenidas</div>
        </motion.div>
      )}

      {/* Weekly Missions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 text-yellow-500" />
          <h2 className="text-lg font-bold">Misiones Semanales</h2>
          <span className="text-[10px] text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">Se renuevan los lunes</span>
        </div>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          {weeklyMissions.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center text-sm text-muted col-span-3">No hay misiones semanales</div>
          ) : (
            weeklyMissions.map((m) => {
              const pct = m.target > 0 ? Math.min(100, (m.progress / m.target) * 100) : 0;
              return (
                <div key={m.id} className={`glass-strong rounded-xl p-4 transition-all ${m.claimed ? "opacity-50" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                      Semanal
                    </span>
                    {m.claimed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : m.completed ? (
                      <button
                        onClick={() => handleClaim(m.id, "weekly")}
                        disabled={claiming === m.id}
                        className="text-[10px] font-bold text-white bg-gradient-to-r from-primary to-accent px-3 py-1 rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
                      >
                        {claiming === m.id ? <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Gift className="h-3 w-3" />}
                        Reclamar
                      </button>
                    ) : (
                      <span className="text-[10px] text-muted font-mono">{m.progress}/{m.target}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold mb-3">{m.name}</h3>
                  <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                    <span className="text-[10px] text-primary font-medium">⚡ +{m.xp} XP</span>
                    <span className="text-[10px] text-accent font-medium">🪙 +{m.coins}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-3 pt-4">
        <Link href="/dashboard/achievements" className="glass rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/[0.06] transition-all">
          ← Logros
        </Link>
        <Link href="/dashboard/shop" className="glass rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/[0.06] transition-all">
          Tienda →
        </Link>
      </div>
    </div>
  );
}
