"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { PageHeader } from "@/components/ui/page-header";
import { useGamification } from "@/lib/gamification-context";
import { useUser } from "@/lib/user-context";
import { Medal, Plus, Users, Clock, CircleDollarSign, Loader2, LogIn, ChevronRight, Trophy, Ban, Swords as SwordsIcon, Check, X, UserPlus } from "lucide-react";
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

interface MatchChallengeParticipant {
  steamId: string;
  name: string;
  avatar?: string | null;
  score: number;
  joinedAt: string;
}

interface MatchChallenge {
  id: string;
  creatorSteamId: string;
  creatorName: string;
  creatorAvatar?: string | null;
  stake: number;
  status: "open" | "in_progress" | "completed" | "cancelled";
  maxParticipants: number;
  winnerSteamId: string | null;
  createdAt: string;
  participants?: MatchChallengeParticipant[];
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
  open: "text-yellow-400 bg-yellow-400/10",
  in_progress: "text-green-400 bg-green-400/10",
  completed: "text-blue-400 bg-blue-400/10",
  cancelled: "text-red-400 bg-red-400/10",
};

const challengeStatusLabels: Record<string, string> = {
  open: "Abierto",
  in_progress: "En Progreso",
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

function InviteToChallengeModal({ open, onClose, challengeId, onInvited }: { open: boolean; onClose: () => void; challengeId: string; onInvited: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  const search = async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults(await res.json());
    } catch {} finally { setSearching(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const invite = async (steamId: string) => {
    setInviting(true);
    setError("");
    try {
      const res = await fetch("/api/tournaments/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite", challengeId, toSteamId: steamId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      onInvited();
      onClose();
    } catch (e: any) { setError(e.message); } finally { setInviting(false); }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Invitar Jugador</h2>
            <input value={query} onChange={e => setQuery(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Buscar por nombre o Steam ID..." />
            {searching && <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto" />}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {results.map((r: any) => (
                <button key={r.steam_id} onClick={() => invite(r.steam_id)} disabled={inviting} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all text-left disabled:opacity-50">
                  {r.avatar_url ? <img src={r.avatar_url} className="h-8 w-8 rounded-full" /> : <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">?</div>}
                  <span className="text-sm font-medium flex-1">{r.steam_name || r.steam_id}</span>
                  <UserPlus className="h-4 w-4 text-primary" />
                </button>
              ))}
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
          </GlassCard>
        </motion.div>
      </div>
    </>
  );
}

function CreateChallengeModal({ open, onClose, onCreated, userSteamId }: { open: boolean; onClose: () => void; onCreated: () => void; userSteamId: string }) {
  const [step, setStep] = useState<"settings" | "invite">("settings");
  const [stake, setStake] = useState(50);
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [creating, setCreating] = useState(false);
  const [createdId, setCreatedId] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  useEffect(() => {
    if (!query.trim() || step !== "invite") { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } catch {} finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query, step]);

  const handleCreate = async () => {
    if (stake < 10) { setError("Apuesta minima 10 coins"); return; }
    setCreating(true); setError("");
    try {
      const res = await fetch("/api/tournaments/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", stake, maxPlayers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreatedId(data.challenge.id);
      setStep("invite");
      onCreated();
    } catch (e: any) { setError(e.message); } finally { setCreating(false); }
  };

  const handleInvite = async (toSteamId: string) => {
    setInviteMsg("");
    try {
      const res = await fetch("/api/tournaments/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite", challengeId: createdId, toSteamId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInviteMsg("Invitado con exito");
      setResults([]); setQuery("");
    } catch (e: any) { setInviteMsg(e.message); }
  };

  const resetAndClose = () => {
    setStep("settings"); setStake(50); setMaxPlayers(5); setCreatedId(""); setQuery(""); setResults([]); setInviteMsg(""); setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={resetAndClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
          <GlassCard className="p-6 space-y-4">
            {step === "settings" ? (
              <>
                <h2 className="text-lg font-bold">Crear Desafío</h2>
                <p className="text-xs text-muted">Crea un desafío, compartí el código o invitá jugadores. El que tenga mejor rendimiento en la próxima partida de FACEIT gana el pozo.</p>
                <div>
                  <label className="text-xs text-muted block mb-1">Apuesta (coins cada uno)</label>
                  <input type="number" min="10" value={stake} onChange={e => setStake(Math.max(10, parseInt(e.target.value) || 10))} className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Máx. participantes (2-5)</label>
                  <select value={maxPlayers} onChange={e => setMaxPlayers(parseInt(e.target.value))} className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value={2}>2 jugadores</option>
                    <option value={3}>3 jugadores</option>
                    <option value={4}>4 jugadores</option>
                    <option value={5}>5 jugadores</option>
                  </select>
                </div>
                {error && <p className="text-xs text-danger">{error}</p>}
                <div className="flex gap-2 pt-2">
                  <button onClick={resetAndClose} className="flex-1 h-10 rounded-xl text-sm font-medium bg-white/[0.04] hover:bg-white/[0.08] transition-all">Cancelar</button>
                  <button onClick={handleCreate} disabled={creating} className="flex-1 h-10 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                    Crear Desafío
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button onClick={() => setStep("settings")} className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all">
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>
                  <h2 className="text-lg font-bold">Invitá Jugadores</h2>
                </div>
                <div className="bg-white/[0.04] rounded-xl p-3 space-y-1">
                  <p className="text-xs text-muted">Código del desafío:</p>
                  <p className="text-sm font-mono text-violet-400 select-all break-all">{createdId}</p>
                </div>
                <p className="text-xs text-muted">O buscá jugadores registrados para invitarlos directamente:</p>
                <input value={query} onChange={e => setQuery(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Buscar por nombre..." />
                {searching && <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto" />}
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {results.filter((r: any) => r.steam_id !== userSteamId).map((r: any) => (
                    <button key={r.steam_id} onClick={() => handleInvite(r.steam_id)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all text-left">
                      {r.avatar_url ? <img src={r.avatar_url} className="h-8 w-8 rounded-full" /> : <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">?</div>}
                      <span className="text-sm font-medium flex-1">{r.steam_name || r.steam_id}</span>
                      <UserPlus className="h-4 w-4 text-primary" />
                    </button>
                  ))}
                </div>
                {inviteMsg && <p className={`text-xs ${inviteMsg.includes("exito") ? "text-green-400" : "text-danger"}`}>{inviteMsg}</p>}
                <div className="flex gap-2 pt-2">
                  <button onClick={resetAndClose} className="flex-1 h-10 rounded-xl text-sm font-medium bg-white/[0.04] hover:bg-white/[0.08] transition-all">Cerrar</button>
                </div>
              </>
            )}
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
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [invitingChallengeId, setInvitingChallengeId] = useState<string | null>(null);

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
        setPendingInvites(data.pendingInvites || []);
      }
    } catch {} finally {
      setLoadingChallenges(false);
    }
  };

  const handleJoinDirect = async (challengeId: string) => {
    const res = await fetch("/api/tournaments/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", challengeId }),
    });
    if (res.ok) loadChallenges();
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    await handleJoinDirect(joinCode.trim());
    setJoining(false);
    setJoinCode("");
  };

  const handleLeave = async (challengeId: string) => {
    const res = await fetch("/api/tournaments/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leave", challengeId }),
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

  const handleStart = async (challengeId: string) => {
    const res = await fetch("/api/tournaments/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", challengeId }),
    });
    if (res.ok) loadChallenges();
  };

  const handleAcceptInvite = async (inviteId: number) => {
    const res = await fetch("/api/tournaments/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept_invite", inviteId }),
    });
    if (res.ok) loadChallenges();
  };

  const handleRejectInvite = async (inviteId: number) => {
    const res = await fetch("/api/tournaments/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject_invite", inviteId }),
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
            <h2 className="text-lg font-bold text-zinc-200">Desafíos</h2>
            <span className="text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-full">Apuesta en tu próxima partida de FACEIT</span>
          </div>
          {user && (
            <button onClick={() => setShowCreateChallenge(true)} className="h-9 px-4 rounded-xl text-xs font-medium bg-violet-500 text-white hover:bg-violet-600 transition-all flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Crear Desafío
            </button>
          )}
        </div>

        {/* Pending Invites */}
        {user && pendingInvites.length > 0 && (
          <div className="mb-4 space-y-2">
            <h3 className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <LogIn className="h-3 w-3" /> Invitaciones pendientes
            </h3>
            {pendingInvites.map((inv: any) => (
              <GlassCard key={inv.id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{inv.from_name || "Alguien"}</p>
                    <p className="text-xs text-muted">te invitó a un desafío · Apuesta: {inv.stake} coins · Código: <span className="font-mono text-violet-400 select-all text-[10px]">{inv.challenge_id}</span></p>
                  </div>
                  <button onClick={() => handleAcceptInvite(inv.id)} className="h-8 px-3 rounded-lg text-[11px] font-medium bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-1">
                    <Check className="h-3 w-3" /> Aceptar
                  </button>
                  <button onClick={() => handleRejectInvite(inv.id)} className="h-8 px-3 rounded-lg text-[11px] font-medium bg-white/[0.06] text-muted hover:text-danger hover:bg-red-500/10 transition-all flex items-center gap-1">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Join by code */}
        {user && (
          <div className="flex gap-2 mb-4">
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              className="flex-1 h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Código de desafío para unirte..."
            />
            <button onClick={handleJoinByCode} disabled={!joinCode.trim() || joining} className="h-10 px-4 rounded-xl text-xs font-medium bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-all disabled:opacity-50 flex items-center gap-1.5">
              {joining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogIn className="h-3.5 w-3.5" />}
              Unirse
            </button>
          </div>
        )}

        {loadingChallenges ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-violet-400" /></div>
        ) : challenges.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <SwordsIcon className="h-10 w-10 text-muted mx-auto mb-2" />
            <p className="text-muted text-sm">No hay desafíos activos</p>
            {user && <p className="text-xs text-muted mt-1">Creá un desafío y compartí el código con tus amigos para apostar en su próxima partida de FACEIT</p>}
          </GlassCard>
        ) : (
          <div className="grid gap-3">
            {challenges.map((c) => {
              const isCreator = user?.steamId === c.creatorSteamId;
              const isInChallenge = c.participants?.some(p => p.steamId === user?.steamId);
              const isWinner = c.winnerSteamId === user?.steamId;
              const isCompleted = c.status === "completed";
              const isOpen = c.status === "open";
              const isInProgress = c.status === "in_progress";
              const isCancelled = c.status === "cancelled";

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
                          <h3 className="font-semibold text-sm truncate">
                            {c.creatorName}
                            {(c.participants?.length ?? 0) > 0 && (
                              <span className="text-muted font-normal"> vs {c.participants!.filter(p => p.steamId !== c.creatorSteamId).map(p => p.name).join(", ")}</span>
                            )}
                          </h3>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${challengeStatusColors[c.status]}`}>{challengeStatusLabels[c.status]}</span>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          Apuesta: {c.stake} coins c/u · Pozo: {(c.stake * (c.participants?.length || 0)).toLocaleString()} coins · {c.participants?.length || 0}/{c.maxParticipants} jugadores
                        </p>

                        {/* Participants list */}
                        {c.participants && c.participants.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {c.participants.map((p) => (
                              <span key={p.steamId} className={`text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                c.status === "completed" && p.steamId === c.winnerSteamId
                                  ? "bg-green-500/15 text-green-400"
                                  : "bg-white/[0.04] text-zinc-300"
                              }`}>
                                {c.status === "completed" && p.steamId === c.winnerSteamId && <Trophy className="h-3 w-3" />}
                                {p.name}
                                {c.status === "completed" && p.score > 0 && <span className="text-[10px] text-muted">({p.score.toFixed(1)})</span>}
                              </span>
                            ))}
                          </div>
                        )}

                        {isCompleted && (
                          <p className={`text-xs mt-1 font-medium ${isWinner ? "text-green-400" : "text-zinc-400"}`}>
                            {isWinner ? "¡Ganaste!" : `Ganó ${c.participants?.find(p => p.steamId === c.winnerSteamId)?.name || "desconocido"}`}
                          </p>
                        )}

                        {isInProgress && (
                          <p className="text-xs text-violet-400 mt-1">¡En progreso! Jugá una partida de FACEIT y se resolverá automáticamente.</p>
                        )}

                        {isOpen && (
                          <p className="text-xs text-zinc-500 mt-1">Código: <span className="font-mono text-violet-400 select-all">{c.id}</span></p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isOpen && isInChallenge && !isCreator && (
                          <button onClick={() => handleLeave(c.id)} className="h-8 px-3 rounded-lg text-[11px] font-medium bg-white/[0.06] text-muted hover:text-danger hover:bg-red-500/10 transition-all flex items-center gap-1">
                            <X className="h-3 w-3" /> Salir
                          </button>
                        )}
                        {isOpen && !isInChallenge && (
                          <button onClick={() => handleJoinDirect(c.id)} className="h-8 px-3 rounded-lg text-[11px] font-medium bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-1">
                            <Check className="h-3 w-3" /> Unirse
                          </button>
                        )}
                        {isOpen && isCreator && (
                          <>
                            <button onClick={() => setInvitingChallengeId(c.id)} className="h-8 px-3 rounded-lg text-[11px] font-medium bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-all flex items-center gap-1">
                              <UserPlus className="h-3 w-3" /> Invitar
                            </button>
                            <button onClick={() => handleCancel(c.id)} className="h-8 px-3 rounded-lg text-[11px] font-medium bg-white/[0.06] text-muted hover:text-danger hover:bg-red-500/10 transition-all flex items-center gap-1">
                              <Ban className="h-3 w-3" /> Cancelar
                            </button>
                            {c.participants?.length >= 2 && (
                              <button onClick={() => handleStart(c.id)} className="h-8 px-3 rounded-lg text-[11px] font-medium bg-violet-500 text-white hover:bg-violet-600 transition-all flex items-center gap-1">
                                <SwordsIcon className="h-3 w-3" /> Iniciar
                              </button>
                            )}
                          </>
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
      <InviteToChallengeModal
        open={!!invitingChallengeId}
        onClose={() => setInvitingChallengeId(null)}
        challengeId={invitingChallengeId || ""}
        onInvited={loadChallenges}
      />
    </div>
  );
}
