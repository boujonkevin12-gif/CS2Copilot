"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/user-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Link2, Unlink, CheckCircle2, XCircle, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface ConnectedAccount {
  provider: string;
  providerId: string | null;
  username: string | null;
  connectedAt: string | null;
}

const ACCOUNT_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  steam: { label: "Steam", icon: "🎮", color: "text-blue-400", bg: "bg-blue-400/10" },
  faceit: { label: "FACEIT", icon: "🎯", color: "text-orange-400", bg: "bg-orange-400/10" },
  google: { label: "Google", icon: "🔵", color: "text-blue-500", bg: "bg-blue-500/10" },
  discord: { label: "Discord", icon: "💬", color: "text-indigo-400", bg: "bg-indigo-400/10" },
};

export default function AccountsSettings() {
  const { user } = useUser();
  const router = useRouter();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/user/settings").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.accounts) setAccounts(d.accounts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDisconnect = async (provider: string) => {
    setActionLoading(provider);
    try {
      const res = await fetch("/api/user/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, action: "disconnect" }),
      });
      const d = await res.json();
      if (d.success) {
        setAccounts(prev => prev.filter(a => a.provider !== provider));
        showToast("success", `${ACCOUNT_CONFIG[provider]?.label || provider} desconectada`);
      } else {
        showToast("error", d.error || "Error al desconectar");
      }
    } catch {
      showToast("error", "Error de conexión");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConnect = async (provider: string) => {
    setActionLoading(provider);
    try {
      const res = await fetch("/api/user/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, action: "connect" }),
      });
      const d = await res.json();
      if (d.success) {
        setAccounts(prev => [...prev.filter(a => a.provider !== provider), { provider, providerId: d.placeholder ? `${provider}_connected` : user?.steamId || "", username: d.placeholder ? `${ACCOUNT_CONFIG[provider]?.label || provider} User` : user?.name || "", connectedAt: new Date().toISOString() }]);
        showToast("success", `${ACCOUNT_CONFIG[provider]?.label || provider} conectada`);
      } else {
        showToast("error", d.error || "Error al conectar");
      }
    } catch {
      showToast("error", "Error de conexión");
    } finally {
      setActionLoading(null);
    }
  };

  const isConnected = (provider: string) => accounts.some(a => a.provider === provider) || (provider === "steam" && !!user?.steamId) || (provider === "faceit" && !!user?.faceitNickname);

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="h-9 w-9 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-all cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Cuentas Conectadas</h1>
          <p className="text-sm text-muted">Vincula tus cuentas de gaming</p>
        </div>
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${toast.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </motion.div>
      )}

      <div className="space-y-3">
        {Object.entries(ACCOUNT_CONFIG).map(([provider, config]) => {
          const connected = isConnected(provider);
          const account = accounts.find(a => a.provider === provider);
          const loadingThis = actionLoading === provider;

          return (
            <motion.div key={provider} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard padding="md" hover={false}>
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl ${config.bg} flex items-center justify-center text-xl shrink-0`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{config.label}</span>
                      {connected ? (
                        <span className="text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="h-2.5 w-2.5" /> Conectado
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted bg-white/[0.06] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="h-2.5 w-2.5" /> No conectado
                        </span>
                      )}
                    </div>
                    {account?.username && <div className="text-xs text-muted mt-0.5">{account.username}</div>}
                    {account?.connectedAt && <div className="text-[10px] text-muted-foreground mt-0.5">Conectado {new Date(account.connectedAt).toLocaleDateString()}</div>}
                    {provider === "steam" && !connected && <div className="text-xs text-muted mt-0.5">Conecta con Steam para usar CS2Pilot</div>}
                  </div>
                  {provider !== "steam" && (
                    connected ? (
                      <Button variant="ghost" size="sm" onClick={() => handleDisconnect(provider)} disabled={loadingThis} icon={loadingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}>
                        Desconectar
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => handleConnect(provider)} disabled={loadingThis} icon={loadingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}>
                        Conectar
                      </Button>
                    )
                  )}
                  {provider === "steam" && (
                    <div className="text-xs text-muted bg-white/[0.04] px-3 py-1.5 rounded-lg">
                      {user.steamId?.slice(0, 8)}...
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
