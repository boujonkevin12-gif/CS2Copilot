"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserProvider, useUser } from "@/lib/user-context";
import { GamificationProvider, useGamification } from "@/lib/gamification-context";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useUser();

  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;

  return (
    <UserProvider>
      <GamificationProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Mobile drawer overlay */}
          {isMobile && mobileSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              "flex flex-col border-r border-white/[0.06] bg-surface backdrop-blur-xl z-10 transition-all duration-300",
              isMobile
                ? (mobileSidebarOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full")
                : collapsed
                  ? "w-[64px]"
                  : "w-72",
            )}
          >
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader onCollapseToggle={() => setCollapsed((c) => !c)} collapsed={collapsed} />

            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </GamificationProvider>
    </UserProvider>
  );
}
