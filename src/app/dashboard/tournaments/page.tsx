"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { PageHeader } from "@/components/ui/page-header";
import { useGamification } from "@/lib/gamification-context";
import { useUser } from "@/lib/user-context";
import { Medal, Plus, Users, Clock, CircleDollarSign, Loader2, Swords, LogIn, ChevronRight, Trophy, Ban, Swords as SwordsIcon, Check, X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TournamentData {
  id: string;
  name: string;
  creatorName: string;
  entryFee: number;
  prizePool: number;
  durationHours: number;
  status: "pending" | "active" | "completed";
  maxParticipants: number;
  participantCount: number;
  createdAt: string;
}

interface MatchChallenge {
  id: string;
  creatorSteamId: string;
  opponentSteamId: string;
  creatorName?: string;
  opponentName?: string;
  creatorAvatar?: string | null;
  opponentAvatar?: string | null;
  stake: number;
  status: "pending" | "accepted" | "completed" | "cancelled";
  faceitMatchId: string | null;
  winnerSteamId: string | null;
  creatorScore: number;
  opponentScore: number;
  createdAt: string;
  acceptedAt: string | null;
  resolvedAt: string | null;
}

const statusColors: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  active: "text-green-400 bg-green-400/10",
  completed: "text-blue-400 bg-blue-400/10",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  active: "Activo",
  completed: "Finalizado",
};

const challengeStatusColors: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  accepted: "text-green-400 bg-green-400/10",
  completed: "text-blue-400 bg-blue-400/10",
  cancelled: "text-red-400 bg-red-400/10",
};

const challengeStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptado",
  completed: "Finalizado",
  cancelled: "Cancelado",
};

function CreateTournamentModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [entryFee, setEntryFee] = useState(0);
  const [durationDays, setDurationDays] = useState(3);
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) { setError("Nombre requerido"); return; }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          entryFee,
          durationHours: durationDays * 24,
          maxParticipants: maxPlayers || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error");
      }
      onCreated();
      onClose();
      setName(""); setDescription(""); setEntryFee(0); setDurationDays(3); setMaxPlayers(0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Crear Torneo</h2>
            <div>
              <label className="text-xs text-muted block mb-1">Nombre</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Nombre del torneo" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Descripción (opcional)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full h-20 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Descripción" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1">Entrada (coins)</label>
                <input type="number" min="0" value={entryFee} onChange={e => setEntryFee(Math.max(0, parseInt(e.target.value) || 0))} className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Duración</label>
                <select value={durationDays} onChange={e => setDurationDays(parseInt(e.target.value))} className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value={1}>1 día</option>
                  <option value={2}>2 días</option>
                  <option value={3}>3 días</option>
                  <option value={7}>1 semana</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Máx. jugadores (0 = ilimitado)</label>
              <input type="number" min="0" value={maxPlayers} onChange={e => setMaxPlayers(Math.max(0, parseInt(e.target.value) || 0))} className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-medium bg-white/[0.04] hover:bg-white/[0.08] transition-all">Cancelar</button>
              <button onClick={handleCreate} disabled={creating} className="flex-1 h-10 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                Crear Torneo
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </>
  );
}

function CreateChallengeModal({ open, onClose, onCreated, userSteamId }: { open: boolean; onClose: () => void; onCreated: () => void; userSteamId: string }) {
  const [nickname, setNickname] = useState("");
  const [stake, setStake] = useState(50);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [searchedPlayer, setSearchedPlayer] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!nickname.trim()) return;
    setSearching(true);
    setError("");
    try {
      const res = await fetch("/api/tournaments/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "lookup", nickname: nickname.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSearchedPlayer(data.player);
    } catch (e: any) {
      setError(e.message);
      setSearchedPlayer(null);
    } finally {
      setSearching(false);
    }
  };

  const handleCreate = async () => {
    if (!searchedPlayer) { setError("Busca un jugador primero"); return; }
    if (stake < 10) { setError("Apuesta minima 10 coins"); return; }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/tournaments/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", nickname: nickname.trim(), stake }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated();
      onClose();
      setNickname(""); setStake(50); setSearchedPlayer(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Crear Desafío 1v1</h2>
            <p className="text-xs text-muted">Ambos apostarán la misma cantidad. El que tenga mejor rendimiento en la próxima partida de FACEIT gana el pozo.</p>
            <div>
              <label className="text-xs text-muted block mb-1">Nickname de FACEIT del oponente</label>
              <div className="flex gap-2">
                <input value={nickname} onChange={e => { setNickname(e.target.value); setSearchedPlayer(null); }} className="flex-1 h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Ej: Jugador123" />
                <button onClick={handleSearch} disabled={searching || !nickname.trim()} className="h-10 px-4 rounded-xl text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1.5">
                  {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  Buscar
                </button>
              </div>
            </div>
            {searchedPlayer && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04]">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center text-sm font-bold text-violet-400">
                  {searchedPlayer.nickname?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{searchedPlayer.nickname}</p>
                  <p className="text-xs text-muted">Nivel {searchedPlayer.level} · {searchedPlayer.elo} ELO</p>
                </div>
                <Check className="h-4 w-4 text-green-400 ml-auto" />
              </div>
            )}
            <div>
              <label className="text-xs text-muted block mb-1">Apuesta (coins cada uno)</label>
              <input type="number" min="10" value={stake} onChange={e => setStake(Math.max(10, parseInt(e.target.value) || 10))} className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-medium bg-white/[0.04] hover:bg-white/[0.08] transition-all">Cancelar</button>
              <button onClick={handleCreate} disabled={creating || !searchedPlayer} className="flex-1 h-10 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                Crear Desafío
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </>
  );
}

export default function TournamentsPage() {
  const { profile } = useGamification();
  const { user } = useUser();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<TournamentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [challenges, setChallenges] = useState<MatchChallenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : "";
      const res = await fetch(`/api/tournaments${params}`);
      if (res.ok) setTournaments(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  };

  const loadChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const res = await fetch("/api/tournaments/challenges");
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch {} finally {
      setLoadingChallenges(false);
    }
  };

  const handleAccept = async (challengeId: string) => {
    const res = await fetch("/api/tournaments/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept", challengeId }),
    });
    if (res.ok) loadChallenges();
  };

  const handleCancel = async (challengeId: string) => {
    const res = await fetch("/api/tournaments/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", challengeId }),
    });
    if (res.ok) loadChallenges();
  };

  useEffect(() => { load(); }, [filter]);
  useEffect(() => { loadChallenges(); }, []);

  return (
    <div className="space-y-6">
      <PageHeader icon={<Medal className="h-5 w-5" />} title="Torneos" description="Crea o únete a torneos y compite por pilot coins" />

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setFilter(null)} className={`h-9 px-4 rounded-xl text-xs font-medium transition-all ${!filter ? "bg-primary text-white" : "bg-white/[0.04] text-muted hover:text-foreground"}`}>Todos</button>
        <button onClick={() => setFilter("active")} className={`h-9 px-4 rounded-xl text-xs font-medium transition-all ${filter === "active" ? "bg-primary text-white" : "bg-white/[0.04] text-muted hover:text-foreground"}`}>Activos</button>
        <button onClick={() => setFilter("pending")} className={`h-9 px-4 rounded-xl text-xs font-medium transition-all ${filter === "pending" ? "bg-primary text-white" : "bg-white/[0.04] text-muted hover:text-foreground"}`}>Pendientes</button>
        <button onClick={() => setFilter("completed")} className={`h-9 px-4 rounded-xl text-xs font-medium transition-all ${filter === "completed" ? "bg-primary text-white" : "bg-white/[0.04] text-muted hover:text-foreground"}`}>Finalizados</button>
        <div className="flex-1" />
        {user && (
          <button onClick={() => setShowCreate(true)} className="h-9 px-4 rounded-xl text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-all flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Crear Torneo
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : tournaments.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Medal className="h-12 w-12 text-muted mx-auto mb-3" />
          <p className="text-muted text-sm">No hay torneos{filter ? ` en "${filter}"` : ""}</p>
          {user && (
            <button onClick={() => setShowCreate(true)} className="mt-3 h-9 px-4 rounded-xl text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-all inline-flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Crear el primero
            </button>
          )}
        </GlassCard>
      ) : (
        <div className="grid gap-3">
          {tournaments.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Link href={`/dashboard/tournaments/${t.id}`}>
                <GlassCard className="p-4 hover:bg-white/[0.06] transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Medal className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{t.name}</h3>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>{statusLabels[t.status]}</span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">Creado por {t.creatorName}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t.participantCount}{t.maxParticipants > 0 ? `/${t.maxParticipants}` : ""}</span>
                        <span className="flex items-center gap-1"><CircleDollarSign className="h-3 w-3 text-accent" /><span className="text-accent font-medium">{t.prizePool.toLocaleString()}</span></span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.durationHours >= 24 ? `${t.durationHours / 24}d` : `${t.durationHours}h`}</span>
                        {t.entryFee > 0 && <span className="text-accent/70">Entrada: {t.entryFee.toLocaleString()} coins</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted shrink-0 mt-1" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Match Challenges Section */}
      <div className="pt-6 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SwordsIcon className="h-5 w-5 text-violet-400" />
            <h2 className="text-lg font-bold text-zinc-200">Desafíos 1v1</h2>
            <span className="text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-full">Apuesta en tu próxima partida de FACEIT</span>
          </div>
          {user && (
            <button onClick={() => setShowCreateChallenge(true)} className="h-9 px-4 rounded-xl text-xs font-medium bg-violet-500 text-white hover:bg-violet-600 transition-all flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Crear Desafío
            </button>
          )}
        </div>

        {loadingChallenges ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-violet-400" /></div>
        ) : challenges.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <SwordsIcon className="h-10 w-10 text-muted mx-auto mb-2" />
            <p className="text-muted text-sm">No hay desafíos activos</p>
            {user && <p className="text-xs text-muted mt-1">Creá un desafío para apostar contra un amigo en tu próxima partida de FACEIT</p>}
          </GlassCard>
        ) : (
          <div className="grid gap-3">
            {challenges.map((c) => {
              const isCreator = user?.steamId === c.creatorSteamId;
              const myName = isCreator ? c.creatorName : c.opponentName;
              const opponentName = isCreator ? c.opponentName : c.creatorName;
              const isWinner = c.winnerSteamId === user?.steamId;
              const isPending = c.status === "pending";
              const isAccepted = c.status === "accepted";
              const isCompleted = c.status === "completed";
              const isCancelled = c.status === "cancelled";
              const isMyChallenge = !isCreator && isPending;

              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <GlassCard className={`p-4 ${isCompleted ? (isWinner ? "ring-1 ring-green-500/30" : "ring-1 ring-zinc-500/20") : ""}`}>
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isCompleted ? (isWinner ? "bg-green-500/20" : "bg-zinc-500/10") : "bg-violet-500/10"
                      }`}>
                        {isCompleted ? (
                          <Trophy className={`h-6 w-6 ${isWinner ? "text-green-400" : "text-zinc-400"}`} />
                        ) : isCancelled ? (
                          <Ban className="h-6 w-6 text-red-400" />
                        ) : (
                          <SwordsIcon className="h-6 w-6 text-violet-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">{myName} vs {opponentName}</h3>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${challengeStatusColors[c.status]}`}>{challengeStatusLabels[c.status]}</span>
                        </div>
                        <p className="text-xs text-muted mt-0.5">Apuesta: {c.stake} coins cada uno · Pozo total: {c.stake * 2} coins</p>
                        {isCompleted && (
                          <p className={`text-xs mt-1 font-medium ${isWinner ? "text-green-400" : "text-zinc-400"}`}>
                            {isWinner ? "¡Ganaste!" : `Ganó: ${c.winnerSteamId === c.creatorSteamId ? c.creatorName : c.opponentName}`}
                            {c.creatorScore > 0 && ` · Score: ${c.creatorScore.toFixed(1)} vs ${c.opponentScore.toFixed(1)}`}
                          </p>
                        )}
                        {isAccepted && (
                          <p className="text-xs text-violet-400 mt-1">¡Aceptado! Jugá una partida de FACEIT y se resolverá automáticamente.</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isMyChallenge && (
                          <button onClick={() => handleAccept(c.id)} className="h-8 px-3 rounded-lg text-[11px] font-medium bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-1">
                            <Check className="h-3 w-3" /> Aceptar
                          </button>
                        )}
                        {isPending && (isCreator || !isMyChallenge) && (
                          <button onClick={() => handleCancel(c.id)} className="h-8 px-3 rounded-lg text-[11px] font-medium bg-white/[0.06] text-muted hover:text-danger hover:bg-red-500/10 transition-all flex items-center gap-1">
                            <X className="h-3 w-3" /> Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <CreateTournamentModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={load} />
      <CreateChallengeModal open={showCreateChallenge} onClose={() => setShowCreateChallenge(false)} onCreated={loadChallenges} userSteamId={user?.steamId || ""} />
    </div>
  );
}
