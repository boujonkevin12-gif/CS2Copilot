"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserProvider, useUser } from "@/lib/user-context";
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
} from "lucide-react";
import { useRouter } from "next/navigation";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Resumen", href: "/dashboard" },
  { icon: User, label: "Perfil", href: "/dashboard/profile" },
  { icon: History, label: "Historial de Partidas", href: "/dashboard/matches" },
  { icon: BarChart3, label: "Análisis", href: "/dashboard/analytics" },
  { icon: Target, label: "Estadísticas", href: "/dashboard/stats" },
  { icon: Package, label: "Inventario", href: "/dashboard/inventory" },
  { icon: Flame, label: "Utilidades", href: "/dashboard/utility" },
  { icon: Sparkles, label: "Coach IA", href: "/dashboard/coach" },
  { icon: Settings, label: "Configuración", href: "/dashboard/settings" },
];

function DashboardNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // fallback
    }
    router.push("/login");
  };

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : "SP";

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          "flex flex-col border-r border-white/[0.06] bg-surface/50 backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 px-4 border-b border-white/[0.06]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Crosshair className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              CS2<span className="text-primary">Pilot</span>
            </span>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => {
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
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
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
        <header className="flex h-16 items-center justify-between border-b border-white/[0.06] px-6 bg-surface/30 backdrop-blur-xl">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar partidas, estadísticas..."
                className="w-full h-9 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/[0.04] transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-white/[0.06]">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-white/[0.1]"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                  {initials}
                </div>
              )}
              <div className="hidden sm:block">
                <div className="text-sm font-medium">
                  {loading ? "Cargando..." : user?.name || "Jugador"}
                </div>
                <div className="text-xs text-muted">
                  {user?.steamLevel ? `Steam Level ${user.steamLevel}` : "Conectado"}
                </div>
              </div>
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
      <DashboardNav>{children}</DashboardNav>
    </UserProvider>
  );
}
