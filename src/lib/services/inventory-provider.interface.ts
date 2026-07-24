import { InventoryItem } from "@/types/inventory";

export interface InventoryProvider {
  readonly name: string;
  getItems(steamId: string): Promise<InventoryItem[]>;
}
