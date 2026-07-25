import { InventoryItem } from "@/types/inventory";
import { InventoryProvider } from "@/lib/services/inventory-provider.interface";

export const renderInventoryProvider: InventoryProvider = {
  name: "Render",
  async getItems(steamId: string): Promise<InventoryItem[]> {
    const apiUrl = process.env.INVENTORY_API_URL;
    if (!apiUrl) throw new Error("INVENTORY_API_URL not configured");

    const url = `${apiUrl.replace(/\/$/, "")}/inventory/${steamId}`;
    console.log("[RENDER_PROVIDER] fetching", { steamId, url });

    const res = await fetch(url, {
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      let code = `http_${res.status}`;
      try {
        const body = await res.json();
        if (body?.code) code = body.code;
      } catch {}
      console.log("[RENDER_PROVIDER] error", { steamId, status: res.status, code });
      throw new Error(code);
    }

    const data = await res.json();
    console.log("[RENDER_PROVIDER] success", { steamId, items: data.items?.length ?? 0 });
    return data.items as InventoryItem[];
  },
};
