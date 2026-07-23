"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Monitor,
  Bell,
  Shield,
  Palette,
  Link2,
  LogOut,
  ChevronRight,
  Star,
  Gamepad2,
  Unlink,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/lib/user-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const settingsSections = [
  {
    icon: User,
    title: "Perfil",
    description: "Administra tu nombre de usuario, avatar y información pública",
    color: "text-primary",
    bg: "bg-primary/10",
    href: "profile",
  },
  {
    icon: Link2,
    title: "Cuentas Conectadas",
    description: "Vincula tu Steam, FACEIT y otras cuentas de gaming",
    color: "text-accent",
    bg: "bg-accent/10",
    href: "accounts",
  },
  {
    icon: Monitor,
    title: "Configuración del Overlay",
    description: "Configura la posición, opacidad y estadísticas del overlay en el juego",
    color: "text-success",
    bg: "bg-success/10",
    href: "overlay",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description: "Controla las preferencias de notificaciones por email, push y en la app",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    href: "notifications",
  },
  {
    icon: Palette,
    title: "Apariencia",
    description: "Personaliza el aspecto de tu panel de control",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    href: "appearance",
  },
  {
    icon: Shield,
    title: "Privacidad y Seguridad",
    description: "Administra tu contraseña, autenticación de dos factores y configuración de privacidad",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    href: "privacy",
  },
];

export default function SettingsPage() {
  const { user, connectFaceit, autoLinkFaceit, disconnectFaceit } = useUser();
  const router = useRouter();
  const [faceitNickname, setFaceitNickname] = useState("");
  const [faceitLoading, setFaceitLoading] = useState(false);
  const [faceitError, setFaceitError] = useState("");
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [autoDetectResult, setAutoDetectResult] = useState<string | null>(null);

  const initials = (user?.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // fallback
    }
    router.push("/login");
  };

  const handleAutoDetect = async () => {
    setAutoDetecting(true);
    setAutoDetectResult(null);
    setFaceitError("");
    const result = await autoLinkFaceit();
    setAutoDetecting(false);
    if (result.success) {
      setAutoDetectResult(`Conectado: ${result.faceit?.nickname} (Nivel ${result.faceit?.level ?? "?"}, ELO ${result.faceit?.elo ?? "?"})`);
    } else {
      setAutoDetectResult(null);
      setFaceitError(result.error || "No se encontro cuenta de FACEIT vinculada a tu Steam");
    }
  };

  const handleConnectFaceit = async () => {
    if (!faceitNickname.trim()) return;
    setFaceitLoading(true);
    setFaceitError("");
    const result = await connectFaceit(faceitNickname.trim());
    setFaceitLoading(false);
    if (result.success) {
      setFaceitNickname("");
    } else {
      setFaceitError(result.error || "Error al conectar");
    }
  };

  const handleDisconnectFaceit = async () => {
    setFaceitLoading(true);
    await disconnectFaceit();
    setFaceitLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted mt-1">
          Administra la configuración y preferencias de tu cuenta.
        </p>
      </div>

      <GlassCard padding="lg" hover={false}>
        <div className="flex items-center gap-5">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-xl font-bold text-white">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">
                {user?.name || "Usuario"}
              </h2>
              <Badge variant="accent" size="sm">
                Gratis
              </Badge>
            </div>
            {user?.steamId && (
              <div className="text-sm text-muted mt-0.5">
                Steam ID: {user.steamId}
              </div>
            )}
            {user?.steamLevel != null && user.steamLevel > 0 && (
              <div className="text-xs text-muted mt-0.5">
                Nivel Steam: {user.steamLevel}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm">
            Editar Perfil
          </Button>
        </div>
      </GlassCard>

      <GlassCard padding="lg" hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Gamepad2 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">FACEIT</h3>
            <p className="text-xs text-muted">Conecta tu cuenta de FACEIT para ver historial de partidas y estadísticas</p>
          </div>
        </div>

        {user?.faceitNickname ? (
          <div className="space-y-3">
            <div className="glass rounded-xl p-4 flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-success shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{user.faceitNickname}</div>
                <div className="text-xs text-muted mt-0.5">
                  Nivel {user.faceitLevel ?? "—"} · ELO {user.faceitElo ?? "—"}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<Unlink className="h-4 w-4" />}
                onClick={handleDisconnectFaceit}
                disabled={faceitLoading}
              >
                Desconectar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant="accent"
                size="sm"
                onClick={handleAutoDetect}
                disabled={autoDetecting || faceitLoading}
                icon={autoDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              >
                {autoDetecting ? "Buscando..." : "Auto-detectar por Steam"}
              </Button>
            </div>
            {autoDetectResult && (
              <div className="flex items-center gap-2 text-xs text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {autoDetectResult}
              </div>
            )}
            <div className="text-xs text-muted">— o ingresa tu nickname manualmente —</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={faceitNickname}
                onChange={(e) => { setFaceitNickname(e.target.value); setFaceitError(""); setAutoDetectResult(null); }}
                placeholder="Tu nickname de FACEIT"
                className="flex-1 h-9 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleConnectFaceit()}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleConnectFaceit}
                disabled={faceitLoading || !faceitNickname.trim()}
                icon={faceitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              >
                Conectar
              </Button>
            </div>
            {faceitError && (
              <div className="flex items-center gap-2 text-xs text-danger">
                <AlertCircle className="h-3.5 w-3.5" />
                {faceitError}
              </div>
            )}
          </div>
        )}
      </GlassCard>

      <div className="space-y-2">
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/dashboard/settings/${section.href}`} className="block w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.05] transition-all group cursor-pointer text-left">
              <div
                className={`h-10 w-10 rounded-xl ${section.bg} flex items-center justify-center shrink-0`}
              >
                <section.icon className={`h-5 w-5 ${section.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{section.title}</div>
                <div className="text-xs text-muted mt-0.5 truncate">
                  {section.description}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>

      <GlassCard padding="md" hover={false}>
        <h3 className="text-sm font-semibold mb-4">Suscripción</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Plan Gratis</span>
              <Badge variant="default" size="sm">
                Actual
              </Badge>
            </div>
            <div className="text-xs text-muted mt-1 flex items-center gap-1">
              <Star className="h-3 w-3" />
              Próximamente planes Pro
            </div>
          </div>
          <Button variant="ghost" size="sm">
            Ver Planes
          </Button>
        </div>
      </GlassCard>

      <div className="border-t border-white/[0.06] pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-danger hover:bg-danger/5 transition-all w-full cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
