"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { PageHeader } from "@/components/ui/page-header";
import { useGamification } from "@/lib/gamification-context";
import { useUser } from "@/lib/user-context";
import {
  Medal, Users, Clock, CircleDollarSign, Loader2, LogIn, ArrowLeft,
  Trophy, Crown, Play, Flag, UserPlus, Ban, Swords, ChevronRight,
  Skull, Crosshair, Zap, Star
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

interface Participant {
  steamId: string;
  name: string;
  avatar: string | null;
  joinedAt: string;
  placement: number | null;
  prizeEarned: number;
}

interface TournamentDetail {
  id: string;
  name: string;
  creatorSteamId: string;
  creatorName: string;
  description: string;
  entryFee: number;
  prizePool: number;
  durationHours: number;
  status: "pending" | "active" | "completed";
  maxParticipants: number;
  participantCount: number;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  participants: Participant[];
}

function getTimeRemaining(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "Terminado";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m restantes`;
}

function InvitePlayerModal({ open, onClose, tournamentId, onInvited }: { open: boolean; onClose: () => void; tournamentId: string; onInvited: () => void }) {
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
      const res = await fetch(`/api/tournaments/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, toSteamId: steamId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Error"); }
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

function PlacementIcon({ placement }: { placement: number }) {
  if (placement === 1) return <Trophy className="h-4 w-4 text-yellow-400" />;
  if (placement === 2) return <Medal className="h-4 w-4 text-gray-400" />;
  if (placement === 3) return <Medal className="h-4 w-4 text-amber-600" />;
  return <span className="text-xs text-muted w-4 text-center">#{placement}</span>;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const { profile } = useGamification();
  const { user } = useUser();
  const router = useRouter();
  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const tournamentId = typeof params.id === "string" ? params.id : "";

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`);
      if (res.ok) setTournament(await res.json());
      else setError("Torneo no encontrado");
    } catch { setError("Error al cargar"); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tournamentId]);

  const doAction = async (action: string) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Error"); }
      await load();
    } catch (e: any) { setError(e.message); } finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  if (error && !tournament) return (
    <div className="space-y-6">
      <Link href="/dashboard/tournaments" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-all">
        <ArrowLeft className="h-4 w-4" /> Volver a torneos
      </Link>
      <GlassCard className="p-12 text-center">
        <p className="text-danger">{error}</p>
      </GlassCard>
    </div>
  );

  if (!tournament) return null;

  const isCreator = user && tournament.creatorSteamId === user.steamId;
  const isParticipant = user && tournament.participants.some(p => p.steamId === user.steamId);
  const canStart = isCreator && tournament.status === "pending";
  const canJoin = !isParticipant && tournament.status === "pending";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/tournaments" className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <PageHeader icon={<Medal className="h-5 w-5" />} title={tournament.name} description={tournament.description || `Creado por ${tournament.creatorName}`} />
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-danger/10 text-danger text-xs">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted mb-1">
            <Users className="h-3.5 w-3.5" /> Jugadores
          </div>
          <p className="text-xl font-bold">{tournament.participantCount}{tournament.maxParticipants > 0 ? `/${tournament.maxParticipants}` : ""}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted mb-1">
            <CircleDollarSign className="h-3.5 w-3.5 text-accent" /> Premio
          </div>
          <p className="text-xl font-bold text-accent">{tournament.prizePool.toLocaleString()}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted mb-1">
            <Clock className="h-3.5 w-3.5" /> {tournament.status === "pending" ? "Duración" : tournament.status === "active" ? "Restante" : "Terminó"}
          </div>
          <p className="text-xl font-bold">
            {tournament.status === "active" && tournament.endTime
              ? getTimeRemaining(tournament.endTime)
              : tournament.status === "completed"
                ? "—"
                : `${tournament.durationHours >= 24 ? `${tournament.durationHours / 24} días` : `${tournament.durationHours}h`}`
            }
          </p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted mb-1">
            <Swords className="h-3.5 w-3.5" /> Estado
          </div>
          <p className={`text-xl font-bold ${tournament.status === "active" ? "text-green-400" : tournament.status === "completed" ? "text-blue-400" : "text-yellow-400"}`}>
            {tournament.status === "active" ? "Activo" : tournament.status === "completed" ? "Finalizado" : "Pendiente"}
          </p>
        </GlassCard>
      </div>

      {tournament.entryFee > 0 && (
        <GlassCard className="p-3 flex items-center gap-2 text-sm">
          <CircleDollarSign className="h-4 w-4 text-accent shrink-0" />
          <span>Entrada: <strong className="text-accent">{tournament.entryFee.toLocaleString()} pilot coins</strong></span>
        </GlassCard>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {canJoin && (
          <button onClick={() => doAction("join")} disabled={actionLoading} className="h-10 px-5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2">
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Unirse
          </button>
        )}
        {isParticipant && tournament.status === "pending" && !isCreator && (
          <button onClick={() => doAction("leave")} disabled={actionLoading} className="h-10 px-5 rounded-xl text-sm font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-all disabled:opacity-50 flex items-center gap-2">
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
            Salir
          </button>
        )}
        {canStart && (
          <>
            <button onClick={() => doAction("start")} disabled={actionLoading || tournament.participantCount < 1} className="h-10 px-5 rounded-xl text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-50 flex items-center gap-2">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Iniciar Torneo
            </button>
            <button onClick={() => setShowInvite(true)} className="h-10 px-5 rounded-xl text-sm font-medium bg-white/[0.04] hover:bg-white/[0.08] transition-all flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invitar
            </button>
          </>
        )}
        {isCreator && tournament.status === "active" && (
          <button onClick={() => doAction("end")} disabled={actionLoading} className="h-10 px-5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2">
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
            Finalizar Torneo
          </button>
        )}
      </div>

      {/* Standings */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-400" />
          Clasificación ({tournament.participants.length} jugadores)
        </h3>
        <div className="space-y-1">
          {tournament.participants.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Users className="h-8 w-8 text-muted mx-auto mb-2" />
              <p className="text-sm text-muted">Aún no hay participantes</p>
            </GlassCard>
          ) : (
            tournament.participants.map((p, i) => {
              const isMe = user && p.steamId === user.steamId;
              return (
                <GlassCard key={p.steamId} className={`p-3 flex items-center gap-3 ${isMe ? "ring-1 ring-primary/30" : ""}`}>
                  {p.avatar ? (
                    <img src={p.avatar} className="h-10 w-10 rounded-full shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {p.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{p.name}</span>
                      {isMe && <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Tú</span>}
                    </div>
                    <p className="text-[11px] text-muted">Se unió {new Date(p.joinedAt).toLocaleDateString()}</p>
                  </div>
                  {tournament.status === "completed" && p.placement && (
                    <div className="flex items-center gap-2">
                      <PlacementIcon placement={p.placement} />
                      {p.prizeEarned > 0 && (
                        <span className="text-xs font-medium text-accent">+{p.prizeEarned.toLocaleString()}</span>
                      )}
                    </div>
                  )}
                  {tournament.status === "completed" && !p.placement && (
                    <span className="text-xs text-muted">—</span>
                  )}
                  {tournament.status !== "completed" && (
                    <span className="text-xs text-muted">#{i + 1}</span>
                  )}
                </GlassCard>
              );
            })
          )}
        </div>
      </div>

      <InvitePlayerModal open={showInvite} onClose={() => setShowInvite(false)} tournamentId={tournament.id} onInvited={load} />
    </div>
  );
}
