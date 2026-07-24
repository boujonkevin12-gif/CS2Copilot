"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserProvider, useUser } from "@/lib/user-context";
import { GamificationProvider, useGamification } from "@/lib/gamification-context";
import {
  LayoutDashboard,
  History,
  BarChart3,
  Settings,
  Crosshair,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Sparkles,
  Target,
  Package,
  Flame,
  User,
  LogOut,
  Plus,
  ChevronDown,
  Bookmark,
  Trophy,
  ShoppingBag,
  Swords,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

const sidebarGroups = [
  {
    title: "Principal",
    links: [
      { icon: LayoutDashboard, label: "Resumen", href: "/dashboard" },
      { icon: User, label: "Perfil", href: "/dashboard/profile" },
      { icon: History, label: "Historial de Partidas", href: "/dashboard/matches" },
    ],
  },
  {
    title: "Análisis",
    links: [
      { icon: BarChart3, label: "Análisis", href: "/dashboard/analytics" },
      { icon: Target, label: "Estadísticas", href: "/dashboard/stats" },
      { icon: Package, label: "Inventario", href: "/dashboard/inventory" },
    ],
  },
  {
    title: "Gamificación",
    links: [
      { icon: Trophy, label: "Logros", href: "/dashboard/achievements" },
      { icon: Swords, label: "Desafíos", href: "/dashboard/challenges" },
      { icon: ShoppingBag, label: "Tienda", href: "/dashboard/shop" },
      { icon: Zap, label: "Rankings", href: "/dashboard/leaderboard" },
    ],
  },
  {
    title: "Utilidades",
    links: [
      { icon: Sparkles, label: "Coach IA", href: "/dashboard/coach", badge: "IA" },
      { icon: Flame, label: "Utilidades", href: "/dashboard/utility" },
    ],
  },
  {
    title: "Configuración",
    links: [
      { icon: Settings, label: "Configuración", href: "/dashboard/settings" },
    ],
  },
];

function XPBar() {
  const { profile } = useGamification();
  if (!profile) return null;

  const currentLevelXP = (profile.level - 1) * (profile.level - 1) * 100;
  const nextLevelXP = profile.level * profile.level * 100;
  const progressXP = profile.xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const pct = Math.min(100, (progressXP / neededXP) * 100);

  return (
    <div className="glass rounded-xl p-3 mb-2">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">Nivel {profile.level}</span>
        </div>
        <span className="text-[10px] text-muted font-mono">{profile.xp.toLocaleString()} XP</span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-muted">{progressXP} / {neededXP} XP</span>
        <span className="text-[10px] text-primary font-medium">Nv. {profile.level + 1}</span>
      </div>
    </div>
  );
}

function NotificationBell() {
  const { unreadCount, notifications, refreshNotifications } = useGamification();
  const [open, setOpen] = useState(false);

  const handleMarkRead = async () => {
    await fetch("/api/gamification/notifications/read", { method: "POST" });
    await refreshNotifications();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.04] transition-all"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-xl border border-white/[0.08] shadow-2xl z-50 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <span className="text-sm font-semibold">Notificaciones</span>
              {unreadCount > 0 && (
                <button onClick={handleMarkRead} className="text-[10px] text-primary hover:underline">
                  Marcar todo leído
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted">Sin notificaciones</div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-white/[0.04] ${n.read === 0 ? "bg-primary/5" : ""}`}>
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-muted mt-0.5">{n.message}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CoinDisplay() {
  const { profile } = useGamification();
  if (!profile) return null;

  return (
    <Link href="/dashboard/shop" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/15 transition-all">
      <span className="text-xs">🪙</span>
      <span className="text-xs font-bold font-mono text-accent">{profile.pilot_coins.toLocaleString()}</span>
    </Link>
  );
}

function DashboardNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const { profile } = useGamification();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
  };

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : "SP";
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          "flex flex-col border-r border-white/[0.06] bg-[#0d0d11]/80 backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 px-4 border-b border-white/[0.06]">
          <img src="/logo-icon.png" alt="CS2Pilot" className="h-9 w-9 shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              CS2<span className="text-primary">Pilot</span>
            </span>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.links.map((link) => {
                  const isActive =
                    link.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                      )}
                    >
                      <link.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <span className="flex-1 flex items-center gap-2">
                          {link.label}
                          {link.badge && (
                            <span className="text-[9px] font-bold uppercase tracking-wide bg-primary text-white rounded-full px-1.5 py-0.5">
                              {link.badge}
                            </span>
                          )}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          {!collapsed && <XPBar />}
          {!collapsed && user?.cs2 && (
            <div className="glass rounded-xl p-3 mb-2">
              <div className="text-xs font-medium mb-1">Horas CS2</div>
              <div className="text-lg font-bold text-primary font-mono">
                {user.cs2.hoursPlayed.toLocaleString()}h
              </div>
              <div className="text-[11px] text-muted">
                {user.cs2.hoursLast2Weeks}h últimas 2 semanas
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-danger hover:bg-danger/5 transition-all mb-1"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted hover:text-foreground hover:bg-white/[0.04] transition-all"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Colapsar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-white/[0.06] px-6 bg-[#0d0d11]/60 backdrop-blur-xl">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar partidas, jugadores, mapas..."
                className="w-full h-9 pl-10 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border border-white/[0.08] rounded-md px-1.5 py-0.5">
                ⌘K
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/coach"
              className="gradient-btn hidden sm:flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              Analizar demo
            </Link>
            <CoinDisplay />
            <NotificationBell />
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-3 border-l border-white/[0.06] cursor-pointer"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border border-white/[0.1]"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                )}
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">
                    {loading ? "Cargando..." : user?.name || "Jugador"}
                  </div>
                  <div className="text-xs text-muted">
                    {profile ? `Nv. ${profile.level} · ${profile.current_title}` : user?.steamLevel ? `Steam Level ${user.steamLevel}` : "Conectado"}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground hidden sm:block transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 glass-strong rounded-xl border border-white/[0.08] shadow-2xl z-50 overflow-hidden">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-white/[0.04] transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Ver Perfil
                    </Link>
                    <div className="border-t border-white/[0.06]" />
                    <button
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-danger hover:bg-white/[0.04] transition-colors cursor-pointer"
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

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <GamificationProvider>
        <DashboardNav>{children}</DashboardNav>
      </GamificationProvider>
    </UserProvider>
  );
}
