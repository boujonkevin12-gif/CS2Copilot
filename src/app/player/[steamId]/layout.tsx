"use client";

import { UserProvider } from "@/lib/user-context";
import { GamificationProvider } from "@/lib/gamification-context";

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <GamificationProvider>
        {children}
      </GamificationProvider>
    </UserProvider>
  );
}
