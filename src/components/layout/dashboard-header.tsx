"use client";

import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useUser } from "@/lib/user-context";
import { useGamification } from "@/lib/gamification-context";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  onCollapseToggle: () => void;
  collapsed: boolean;
}

export function DashboardHeader({ onCollapseToggle, collapsed }: DashboardHeaderProps) {
  const { user, loading } = useUser();
  const { profile } = useGamification();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "SP";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
  };

  return (
    <header
      className="flex h-14 items-center justify-between gap-4 border-b border-white/[0.06] bg-background/80 backdrop-blur-md z-20 px-4"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onCollapseToggle}
          className="flex items-center justify-center w-9 h-9 rounded-md text-muted hover:text-foreground hover:bg-surface-elevated transition-default"
          aria-label="Colapsar sidebar"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar partidas, jugadores, mapas..."
            className="w-full h-9 pl-10 pr-12 rounded-md bg-surface-elevated border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-default"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted border border-white/[0.08] rounded-md px-1.5 py-0.5">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {collapsed ? (
          <Button variant="ghost" size="sm" icon={<Plus className="h-4 w-4" />} />
        ) : (
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-elevated border border-white/[0.06] text-xs font-semibold text-zinc-400 hover:text-foreground hover:bg-white/[0.04] transition-default"
          >
            <Plus className="h-3 w-3" />
            Analizar demo
            <Badge variant="outline" size="sm">
              Próximamente
            </Badge>
          </Link>
        )}

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm">
            <span className="flex items-center gap-1 px-2 rounded-md bg-white/[0.03] px-2 text-[10px] font-semibold text-zinc-400">
              <CoinIcon className="h-3 w-3" /> {profile?.pilot_coins?.toLocaleString() || "0"}
            </span>
          </Button>
          <Button variant="ghost" size="sm" icon={<Bell className="h-4 w-4" />} />
        </div>

        <div className="relative pl-3 border-l border-white/[0.06]">
          <button
            onClick={() => setUserMenuOpen((p) => !p)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full border border-white/[0.1]"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {initials}
              </div>
            )}
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-foreground">
                {loading ? "Cargando..." : user?.name || "Jugador"}
              </div>
              <div className="text-[10px] text-muted">
                {profile ? `Nv. ${profile.level}` : user?.steamLevel ? `Steam ${user.steamLevel}` : "Conectado"}
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-lg border border-white/[0.08] shadow-xl z-50 overflow-hidden">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-surface-elevated transition-default"
                >
                  <User className="h-4 w-4" />
                  Ver Perfil
                </Link>
                <div className="border-t border-white/[0.06]" />
                <button
                  onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-danger hover:bg-danger/5 transition-default cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  );
}
