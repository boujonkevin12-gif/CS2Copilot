"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  BarChart3,
  History,
  Target,
  Sparkles,
  Zap,
  Trophy,
  Swords,
  Medal,
  Package,
  Award,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/user-context";
import { useGamification } from "@/lib/gamification-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const sidebarGroups = [
  {
    title: "OVERVIEW",
    links: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: User, label: "Perfil", href: "/dashboard/profile" },
    ],
  },
  {
    title: "PERFORMANCE",
    links: [
      { icon: BarChart3, label: "Estadísticas", href: "/dashboard/stats" },
      { icon: History, label: "Partidas", href: "/dashboard/matches" },
      { icon: Target, label: "Demo Analyzer", href: "/dashboard/analytics" },
      { icon: Sparkles, label: "Coach IA", href: "/dashboard/coach", badge: "IA" },
      { icon: Zap, label: "Utilidades", href: "/dashboard/utility" },
    ],
  },
  {
    title: "COMPETITIVE",
    links: [
      { icon: Trophy, label: "Rankings", href: "/dashboard/leaderboard" },
      { icon: Swords, label: "Desafíos", href: "/dashboard/challenges" },
      { icon: Medal, label: "Torneos", href: "/dashboard/tournaments" },
    ],
  },
  {
    title: "PERSONALIZACIÓN",
    links: [
      { icon: Package, label: "Inventario", href: "/dashboard/inventory" },
      { icon: Award, label: "Logros", href: "/dashboard/achievements" },
      { icon: ShoppingBag, label: "Tienda", href: "/dashboard/shop" },
    ],
  },
];

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const { profile } = useGamification();

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "SP";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-white/[0.06] bg-surface backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[64px]" : "w-72",
      )}
    >
      {/* Header del sidebar */}
      <div className="flex h-14 items-center gap-3 px-4 border-b border-white/[0.06]">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          <User2 className="h-5 w-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-display font-bold text-foreground">CS2Pilot</span>
            <span className="text-[10px] text-muted">Competitive CS2</span>
          </div>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {sidebarGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <h3 className="px-3 mb-2 text-[10px] font-semibold tracking-wider uppercase text-muted">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-default",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <span className="flex-1 flex items-center gap-2">
                        {link.label}
                        {link.badge && (
                          <Badge variant="default" size="sm">
                            {link.badge}
                          </Badge>
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

      {/* Footer del sidebar */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-danger hover:bg-danger/5 transition-default"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-muted hover:text-foreground hover:bg-surface-elevated transition-default"
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

      {/* Información de usuario (solo expandido) */}
      {!collapsed && user && profile && (
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <Avatar src={user.avatar ?? undefined} fallback={initials} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted truncate">
                Nv. {profile.level} · {profile.current_title}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
