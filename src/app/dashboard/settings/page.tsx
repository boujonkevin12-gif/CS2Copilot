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
} from "lucide-react";

const settingsSections = [
  {
    icon: User,
    title: "Perfil",
    description: "Administra tu nombre de usuario, avatar y información pública",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Link2,
    title: "Cuentas Conectadas",
    description: "Vincula tu Steam, FACEIT y otras cuentas de gaming",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Monitor,
    title: "Configuración del Overlay",
    description: "Configura la posición, opacidad y estadísticas del overlay en el juego",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description: "Controla las preferencias de notificaciones por email, push y en la app",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Palette,
    title: "Apariencia",
    description: "Personaliza el aspecto de tu panel de control",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    icon: Shield,
    title: "Privacidad y Seguridad",
    description: "Administra tu contraseña, autenticación de dos factores y configuración de privacidad",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
];

export default function SettingsPage() {
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
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-xl font-bold text-white">
            SP
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">SteamPlayer</h2>
              <Badge variant="accent" size="sm">Pro</Badge>
            </div>
            <div className="text-sm text-muted mt-0.5">
              steamplayer@cs2pilot.com
            </div>
          </div>
          <Button variant="ghost" size="sm">Editar Perfil</Button>
        </div>
      </GlassCard>

      <div className="space-y-2">
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <button className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.05] transition-all group cursor-pointer text-left">
              <div className={`h-10 w-10 rounded-xl ${section.bg} flex items-center justify-center shrink-0`}>
                <section.icon className={`h-5 w-5 ${section.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{section.title}</div>
                <div className="text-xs text-muted mt-0.5 truncate">
                  {section.description}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </button>
          </motion.div>
        ))}
      </div>

      <GlassCard padding="md" hover={false}>
        <h3 className="text-sm font-semibold mb-4">Suscripción</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">CS2Pilot Pro</span>
              <Badge variant="success" size="sm">Activo</Badge>
            </div>
            <div className="text-xs text-muted mt-1">
              Renovación el 12 de agosto, 2026 &middot; $9.99/mes
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">Administrar</Button>
            <Button variant="ghost" size="sm" className="text-danger hover:text-danger">
              Cancelar
            </Button>
          </div>
        </div>
      </GlassCard>

      <div className="border-t border-white/[0.06] pt-4">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-danger hover:bg-danger/5 transition-all w-full cursor-pointer">
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
