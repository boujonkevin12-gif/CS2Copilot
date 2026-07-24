export type ItemCategory =
  | "skin" | "knife" | "gloves" | "agent" | "sticker"
  | "music_kit" | "case" | "key" | "graffiti" | "patch"
  | "charm" | "collectible" | "tool" | "container" | "other";

export type ItemRarity =
  | "consumer" | "industrial" | "mil_spec" | "restricted"
  | "classifed" | "covert" | "rare" | "unusual" | "common";

export const RARITY_ORDER: Record<ItemRarity, number> = {
  common: 0,
  consumer: 1,
  industrial: 2,
  mil_spec: 3,
  restricted: 4,
  classifed: 5,
  covert: 6,
  rare: 7,
  unusual: 8,
};

export const RARITY_COLORS: Record<string, string> = {
  consumer: "#b0c3d9",
  industrial: "#5e98d9",
  mil_spec: "#4b69ff",
  restricted: "#8847ff",
  classifed: "#d32ce6",
  covert: "#eb4b4b",
  rare: "#ffd700",
  unusual: "#ff7f50",
  common: "#b0c3d9",
};

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  skin: "Skin",
  knife: "Cuchillo",
  gloves: "Guantes",
  agent: "Agente",
  sticker: "Sticker",
  music_kit: "Music Kit",
  case: "Caja",
  key: "Llave",
  graffiti: "Graffiti",
  patch: "Parche",
  charm: "Charm",
  collectible: "Coleccionable",
  tool: "Herramienta",
  container: "Contenedor",
  other: "Otro",
};

export interface AppliedSticker {
  slot: number;
  stickerId: number;
  name: string;
  imageUrl: string;
  wear: number;
}

export interface InventoryItem {
  id: string;
  appId: number;
  contextId: number;

  name: string;
  marketHashName: string;
  weapon: string;

  category: ItemCategory;
  subCategory: string;

  rarity: ItemRarity;
  rarityName: string;
  quality: string;
  exterior: string;

  stattrak: boolean;
  souvenir: boolean;

  iconUrl: string;
  imageUrl: string;

  tradable: boolean;
  marketable: boolean;
  inspectLink: string | null;
  marketLink: string;

  price: number | null;
  totalPrice: number | null;
  priceUpdatedAt: string | null;
  priceSource: string | null;

  quantity: number;

  floatValue: number | null;
  paintSeed: number | null;
  paintIndex: number | null;
  pattern: string | null;
  stickers: AppliedSticker[] | null;
  collection: string | null;
  collectionName: string | null;

  rarityColor: string;
  categoryLabel: string;
}

export interface InventorySummary {
  totalItems: number;
  totalValue: number;
  mostExpensive: InventoryItem | null;
  knifeCount: number;
  gloveCount: number;
  rarityDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
}

export interface InventoryResponse {
  success: boolean;
  steamId: string;
  items: InventoryItem[];
  summary: InventorySummary;
  cached: boolean;
  cachedAt: string | null;
  error?: string;
  isPublic?: boolean;
}

export const EXTERIOR_ORDER: Record<string, number> = {
  "Factory New": 0,
  "Minimal Wear": 1,
  "Field-Tested": 2,
  "Well-Worn": 3,
  "Battle-Scarred": 4,
};
