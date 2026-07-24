import { InventoryItem, ItemCategory, ItemRarity, RARITY_COLORS, CATEGORY_LABELS, InventorySummary, AppliedSticker } from "@/types/inventory";
import { getDb } from "@/lib/db";

const CS2_APPID = 730;
const CS2_CONTEXT_ID = 2;
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
const MAX_PAGES = 20;
const PAGE_SIZE = 5000;

interface SteamDescription {
  [key: string]: unknown;
  name?: string;
  market_hash_name?: string;
  type?: string;
  icon_url?: string;
  icon_url_large?: string;
  icon_drag_url?: string;
  tradable?: number;
  marketable?: number;
  commodity?: number;
  descriptions?: Array<{ type?: string; value?: string; color?: string }>;
  tags?: Array<{
    category?: string;
    internal_name?: string;
    localized_category_name?: string;
    localized_tag_name?: string;
    color?: string;
  }>;
  actions?: Array<{ name?: string; link?: string }>;
  market_actions?: Array<{ name?: string; link?: string }>;
  appid?: number;
  classid?: string;
  instanceid?: string;
  currency?: number;
  background_color?: string;
  name_color?: string;
}

interface SteamAsset {
  appid?: string;
  contextid?: string;
  assetid?: string;
  classid?: string;
  instanceid?: string;
  amount?: string;
}

interface SteamResponse {
  success?: number;
  total_inventory_count?: number;
  more_items?: number;
  last_assetid?: string;
  assets?: Record<string, Record<string, Record<string, SteamAsset>>>;
  descriptions?: Record<string, SteamDescription>;
}

const KNIFE_PATTERNS = [
  /karambit/i, /m9 bayonet/i, /bayonet/i, /butterfly/i, /falchion/i,
  /huntsman/i, /shadow daggers/i, /bowie/i, /navaja/i, /stiletto/i,
  /talon/i, /ursus/i, /classic/i, /paracord/i, /survival/i,
  /skeleton/i, /kukri/i, /nomad/i,
];

const GLOVE_PATTERNS = [
  /bloodhound/i, /driver/i, /hand wraps/i, /moto/i, /specialist/i,
  /sport/i, /broken fang/i,
];

const WEAPON_MAP: Record<string, string> = {
  weapon_ak47: "AK-47",
  weapon_m4a1: "M4A1-S",
  weapon_m4a4: "M4A4",
  weapon_awp: "AWP",
  weapon_deagle: "Desert Eagle",
  weapon_usp: "USP-S",
  weapon_glock: "Glock-18",
  weapon_mp9: "MP9",
  weapon_mac10: "MAC-10",
  weapon_mp7: "MP7",
  weapon_ump45: "UMP-45",
  weapon_p90: "P90",
  weapon_bizon: "PP-Bizon",
  weapon_mp5sd: "MP5-SD",
  weapon_famas: "FAMAS",
  weapon_galilar: "Galil AR",
  weapon_aug: "AUG",
  weapon_sg556: "SG 553",
  weapon_ssg08: "SSG 08",
  weapon_scar20: "SCAR-20",
  weapon_g3sg1: "G3SG1",
  weapon_negev: "Negev",
  weapon_m249: "M249",
  weapon_nova: "Nova",
  weapon_xm1014: "XM1014",
  weapon_mag7: "MAG-7",
  weapon_sawedoff: "Sawed-Off",
  weapon_p250: "P250",
  weapon_fiveseven: "Five-SeveN",
  weapon_tec9: "Tec-9",
  weapon_cz75: "CZ75-Auto",
  weapon_hkp2000: "P2000",
  weapon_elite: "Dual Berettas",
  weapon_revolver: "R8 Revolver",
};

const SUB_CATEGORY_MAP: Record<string, string> = {
  CSGO_Type_Rifle: "Rifle",
  CSGO_Type_SniperRifle: "Sniper",
  CSGO_Type_SMG: "SMG",
  CSGO_Type_Shotgun: "Shotgun",
  CSGO_Type_Machinegun: "Machine Gun",
  CSGO_Type_Pistol: "Pistol",
  CSGO_Type_Knife: "Knife",
  CSGO_Type_Grenade: "Grenade",
  CSGO_Type_Equipment: "Equipment",
};

const STEAM_RARITY_MAP: Record<string, ItemRarity> = {
  Rarity_Default: "consumer",
  Rarity_Common: "consumer",
  Rarity_Uncommon: "industrial",
  Rarity_Rare: "mil_spec",
  Rarity_Mythical: "restricted",
  Rarity_Legendary: "classifed",
  Rarity_Ancient: "covert",
  Rarity_Immortal: "rare",
  Rarity_Arcana: "unusual",
};

export function classifyItem(name: string, marketHashName: string, tags: Array<{ category?: string; internal_name?: string; localized_tag_name?: string }>): {
  category: ItemCategory;
  subCategory: string;
  weapon: string;
} {
  const isKnife = KNIFE_PATTERNS.some((p) => p.test(name) || p.test(marketHashName));
  const isGlove = GLOVE_PATTERNS.some((p) => p.test(name) || p.test(marketHashName));

  const typeTag = tags.find((t) => t.category === "Type" || t.category === "type");
  const typeInternal = typeTag?.internal_name || "";
  const typeLocalized = typeTag?.localized_tag_name || "";

  const weaponTag = tags.find((t) => t.category === "Weapon" || t.category === "weapon");
  const weaponInternal = weaponTag?.internal_name || "";
  const weaponLocalized = weaponTag?.localized_tag_name || "";
  const weaponResolved = WEAPON_MAP[weaponInternal] || weaponLocalized || "";

  if (isKnife || typeInternal === "CSGO_Type_Knife") {
    return { category: "knife", subCategory: "Knife", weapon: weaponResolved || "Knife" };
  }
  if (isGlove || typeInternal === "CSGO_Type_Gloves" || typeLocalized.toLowerCase().includes("glove")) {
    return { category: "gloves", subCategory: "Gloves", weapon: weaponResolved || "Gloves" };
  }

  if (typeInternal === "CSGO_Type_WeaponCase" || typeLocalized.toLowerCase().includes("case") || typeLocalized.toLowerCase().includes("caja")) {
    return { category: "case", subCategory: "Case", weapon: "Case" };
  }
  if (typeLocalized.includes("Key") || typeLocalized.includes("Llave")) {
    return { category: "key", subCategory: "Key", weapon: "Key" };
  }
  if (typeInternal === "CSGO_Type_Collectible") {
    return { category: "collectible", subCategory: "Collectible", weapon: typeLocalized || "Collectible" };
  }
  if (typeInternal === "CSGO_Type_WeaponCase_Key") {
    return { category: "key", subCategory: "Key", weapon: "Key" };
  }
  if (typeLocalized.includes("Sticker") || typeLocalized.includes("Calcomanía")) {
    return { category: "sticker", subCategory: "Sticker", weapon: "Sticker" };
  }
  if (typeLocalized.includes("Music Kit") || typeLocalized.includes("Kit de música")) {
    return { category: "music_kit", subCategory: "Music Kit", weapon: "Music Kit" };
  }
  if (typeLocalized.includes("Graffiti") || typeLocalized.includes("Grafiti")) {
    return { category: "graffiti", subCategory: "Graffiti", weapon: "Graffiti" };
  }
  if (typeLocalized.includes("Patch") || typeLocalized.includes("Parche")) {
    return { category: "patch", subCategory: "Patch", weapon: "Patch" };
  }
  if (typeLocalized.includes("Agent") || typeLocalized.includes("Agente")) {
    return { category: "agent", subCategory: "Agent", weapon: "Agent" };
  }
  if (typeLocalized.includes("Container") || typeLocalized.includes("Contenedor")) {
    return { category: "container", subCategory: "Container", weapon: "Container" };
  }
  if (typeLocalized.includes("Tool") || typeLocalized.includes("Herramienta")) {
    return { category: "tool", subCategory: "Tool", weapon: "Tool" };
  }
  if (typeLocalized.includes("Charm") || typeLocalized.includes("Amuleto")) {
    return { category: "charm", subCategory: "Charm", weapon: "Charm" };
  }

  if (typeInternal.startsWith("CSGO_Type_")) {
    const sub = SUB_CATEGORY_MAP[typeInternal] || "Other";
    if (sub === "Knife") return { category: "knife", subCategory: "Knife", weapon: weaponResolved || name };
    return { category: "skin", subCategory: sub, weapon: weaponResolved || name };
  }

  return { category: "other", subCategory: "Other", weapon: weaponResolved || name };
}

function parseExterior(name: string, tags: Array<{ category?: string; internal_name?: string; localized_tag_name?: string }>): string {
  const extTag = tags.find((t) => t.category === "Exterior" || t.category === "exterior");
  if (extTag?.localized_tag_name) return extTag.localized_tag_name;
  if (name.includes("Factory New")) return "Factory New";
  if (name.includes("Minimal Wear")) return "Minimal Wear";
  if (name.includes("Field-Tested")) return "Field-Tested";
  if (name.includes("Well-Worn")) return "Well-Worn";
  if (name.includes("Battle-Scarred")) return "Battle-Scarred";
  return "";
}

function parseSteamRarity(tags: Array<{ category?: string; internal_name?: string; localized_tag_name?: string; color?: string }>): { rarity: ItemRarity; rarityName: string } {
  const rarityTag = tags.find((t) => t.category === "Rarity" || t.category === "rarity");
  if (rarityTag?.internal_name) {
    const mapped = STEAM_RARITY_MAP[rarityTag.internal_name];
    if (mapped) return { rarity: mapped, rarityName: rarityTag.localized_tag_name || rarityTag.internal_name };
  }
  return { rarity: "common", rarityName: "Common" };
}

function extractStickers(descriptions: Array<{ type?: string; value?: string }>): AppliedSticker[] {
  const stickers: AppliedSticker[] = [];
  const stickerLines = descriptions.filter((d) => d.type === "sticker" || (d.value && d.value.includes("Sticker")));
  for (const line of stickerLines) {
    if (!line.value) continue;
    const slot = stickers.length;
    stickers.push({
      slot,
      stickerId: 0,
      name: line.value.replace(/\(.*\)/, "").trim(),
      imageUrl: "",
      wear: 0,
    });
  }
  return stickers;
}

function extractCollection(tags: Array<{ category?: string; internal_name?: string; localized_tag_name?: string }>): { collection: string | null; collectionName: string | null } {
  const setTag = tags.find((t) => t.category === "Item Set" || t.category === "item_set" || t.category === "Collection");
  if (setTag?.localized_tag_name) {
    return { collection: setTag.internal_name || null, collectionName: setTag.localized_tag_name };
  }
  return { collection: null, collectionName: null };
}

function buildInspectLink(actions: Array<{ name?: string; link?: string }> | undefined, steamId: string, contextId: number, assetId: string): string | null {
  if (!actions || actions.length === 0) return null;
  const inspectAction = actions.find((a) => a.name?.toLowerCase().includes("inspect"));
  const template = inspectAction?.link || actions[0]?.link;
  if (!template) return null;
  return template
    .replace(/{owner_steamid}/g, steamId)
    .replace(/{contextid}/g, String(contextId))
    .replace(/{assetid}/g, assetId);
}

function createMarketLink(marketHashName: string): string {
  return `https://steamcommunity.com/market/listings/730/${encodeURIComponent(marketHashName)}`;
}

function buildImageUrl(iconUrl: string, size?: string): string {
  if (!iconUrl) return "";
  const suffix = size === "large" ? "_large" : size === "medium" ? "_medium" : "";
  return `https://community.akamai.steamstatic.com/economy/image/${iconUrl}${suffix}`;
}

function parseItem(
  asset: SteamAsset,
  desc: SteamDescription,
  steamId: string
): InventoryItem {
  const name = String(desc.name || "");
  const marketHashName = String(desc.market_hash_name || name);
  const tags = (Array.isArray(desc.tags) ? desc.tags : []) as Array<{
    category?: string;
    internal_name?: string;
    localized_category_name?: string;
    localized_tag_name?: string;
    color?: string;
  }>;
  const descriptionsArr = (Array.isArray(desc.descriptions) ? desc.descriptions : []) as Array<{ type?: string; value?: string; color?: string }>;

  const classification = classifyItem(name, marketHashName, tags);
  const { rarity, rarityName } = parseSteamRarity(tags);

  const stattrak = name.startsWith("StatTrak\u2122") || tags.some((t) => t.internal_name === "strange" || t.category === "Quality");
  const souvenir = name.includes("Souvenir") || marketHashName.includes("Souvenir");

  const exterior = parseExterior(name, tags);
  const { collection, collectionName } = extractCollection(tags);
  const stickers = extractStickers(descriptionsArr);

  const iconUrl = String(desc.icon_url || "");
  const iconUrlLarge = String(desc.icon_url_large || "");

  const actions = (Array.isArray(desc.actions) ? desc.actions : undefined) as Array<{ name?: string; link?: string }> | undefined;
  const contextId = Number(asset.contextid) || CS2_CONTEXT_ID;
  const assetId = String(asset.assetid || "");

  const inspectLink = buildInspectLink(actions, steamId, contextId, assetId);
  const marketLink = createMarketLink(marketHashName);

  return {
    id: assetId,
    appId: CS2_APPID,
    contextId,
    name,
    marketHashName,
    weapon: classification.weapon,
    category: classification.category,
    subCategory: classification.subCategory,
    rarity,
    rarityName,
    quality: desc.type || "",
    exterior,
    stattrak,
    souvenir,
    iconUrl: buildImageUrl(iconUrl),
    imageUrl: buildImageUrl(iconUrlLarge || iconUrl, iconUrlLarge ? "large" : undefined),
    tradable: desc.tradable === 1,
    marketable: desc.marketable === 1,
    inspectLink,
    marketLink,
    quantity: Number(asset.amount) || 1,
    floatValue: null,
    paintSeed: null,
    paintIndex: null,
    pattern: null,
    stickers: stickers.length > 0 ? stickers : null,
    collection,
    collectionName,
    rarityColor: RARITY_COLORS[rarity] || "#b0c3d9",
    categoryLabel: CATEGORY_LABELS[classification.category] || "Other",
  };
}

function parseInventoryResponse(
  data: SteamResponse,
  steamId: string
): InventoryItem[] {
  const items: InventoryItem[] = [];
  if (!data.assets || !data.descriptions) return items;

  const descriptions = data.descriptions;
  const assets = data.assets;

  for (const [appId, contexts] of Object.entries(assets)) {
    if (typeof contexts !== "object" || !contexts) continue;
    for (const [, assetsMap] of Object.entries(contexts)) {
      if (typeof assetsMap !== "object" || !assetsMap) continue;
      for (const [, assetRaw] of Object.entries(assetsMap)) {
        const asset = assetRaw as SteamAsset;
        if (!asset.classid) continue;
        const descKey = `${appId}_${asset.classid}`;
        const desc = descriptions[descKey];
        if (!desc) continue;
        try {
          items.push(parseItem(asset, desc, steamId));
        } catch {
          // skip malformed items
        }
      }
    }
  }

  return items;
}

async function fetchSteamPage(
  steamId: string,
  startAssetId?: string
): Promise<SteamResponse> {
  const params = new URLSearchParams({
    l: "english",
    count: String(PAGE_SIZE),
  });
  if (startAssetId) params.set("start_assetid", startAssetId);

  const url = `https://steamcommunity.com/inventory/${steamId}/${CS2_APPID}/${CS2_CONTEXT_ID}?${params.toString()}`;

  async function attempt(retries: number): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
      if (res.status === 429 && retries > 0) {
        await new Promise((r) => setTimeout(r, 3000));
        return attempt(retries - 1);
      }
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  const res = await attempt(2);

  if (res.status === 429) throw new Error("rate_limited");
  if (res.status === 403) throw new Error("private");
  if (!res.ok) throw new Error(`steam_error:${res.status}`);

  const text = await res.text();
  if (!text || text === "null") return { success: 0 };

  const data = JSON.parse(text) as SteamResponse;
  if (data.success !== 1) return { success: 0 };

  return data;
}

async function fetchFullInventory(steamId: string): Promise<InventoryItem[]> {
  const allItems: InventoryItem[] = [];
  let lastAssetId: string | undefined;
  let page = 0;

  while (page < MAX_PAGES) {
    const data = await fetchSteamPage(steamId, lastAssetId);
    if (!data.success) break;

    const items = parseInventoryResponse(data, steamId);
    allItems.push(...items);

    if (data.more_items && data.last_assetid) {
      lastAssetId = data.last_assetid;
      page++;
    } else {
      break;
    }
  }

  return allItems;
}

function computeSummary(items: InventoryItem[]): InventorySummary {
  let knifeCount = 0;
  let gloveCount = 0;
  const rarityDistribution: Record<string, number> = {};
  const categoryDistribution: Record<string, number> = {};

  for (const item of items) {
    if (item.category === "knife") knifeCount++;
    if (item.category === "gloves") gloveCount++;

    const r = item.rarityName || item.rarity;
    rarityDistribution[r] = (rarityDistribution[r] || 0) + item.quantity;
    categoryDistribution[item.categoryLabel] = (categoryDistribution[item.categoryLabel] || 0) + item.quantity;
  }

  return {
    totalItems: items.length,
    knifeCount,
    gloveCount,
    rarityDistribution,
    categoryDistribution,
  };
}

interface CacheRow {
  items: string;
  knife_count: number;
  glove_count: number;
  rarity_distribution: string;
  category_distribution: string;
  total_items: number;
  cached_at: string;
  expires_at: string;
}

async function getCachedInventory(steamId: string): Promise<{ items: InventoryItem[]; summary: InventorySummary; cachedAt: string } | null> {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM inventory_cache WHERE steam_id = ? AND datetime(expires_at) > datetime('now')",
      args: [steamId],
    });
    if (result.rows.length === 0) return null;

    const row = result.rows[0] as unknown as CacheRow;
    const items = JSON.parse(row.items) as InventoryItem[];
    const summary: InventorySummary = {
      totalItems: row.total_items,
      knifeCount: row.knife_count,
      gloveCount: row.glove_count,
      rarityDistribution: JSON.parse(row.rarity_distribution),
      categoryDistribution: JSON.parse(row.category_distribution),
    };

    return { items, summary, cachedAt: row.cached_at };
  } catch {
    return null;
  }
}

async function getStaleInventory(steamId: string): Promise<{ items: InventoryItem[]; summary: InventorySummary; cachedAt: string } | null> {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM inventory_cache WHERE steam_id = ?",
      args: [steamId],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0] as unknown as CacheRow;
    return {
      items: JSON.parse(row.items) as InventoryItem[],
      summary: {
        totalItems: row.total_items,
        knifeCount: row.knife_count,
        gloveCount: row.glove_count,
        rarityDistribution: JSON.parse(row.rarity_distribution),
        categoryDistribution: JSON.parse(row.category_distribution),
      },
      cachedAt: row.cached_at,
    };
  } catch {
    return null;
  }
}

async function setCachedInventory(steamId: string, items: InventoryItem[], summary: InventorySummary): Promise<void> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const expires = new Date(Date.now() + CACHE_TTL_MS).toISOString();
    await db.execute({
      sql: `INSERT OR REPLACE INTO inventory_cache
        (steam_id, items, knife_count, glove_count,
         rarity_distribution, category_distribution, total_items, cached_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        steamId,
        JSON.stringify(items),
        summary.knifeCount,
        summary.gloveCount,
        JSON.stringify(summary.rarityDistribution),
        JSON.stringify(summary.categoryDistribution),
        summary.totalItems,
        now,
        expires,
      ],
    });
  } catch {
    // silent
  }
}

export async function getInventory(steamId: string, forceRefresh: boolean = false): Promise<{
  items: InventoryItem[];
  summary: InventorySummary;
  cached: boolean;
  cachedAt: string | null;
}> {
  if (!forceRefresh) {
    const cached = await getCachedInventory(steamId);
    if (cached) {
      return { ...cached, cached: true, cachedAt: cached.cachedAt };
    }
  }

  let items: InventoryItem[];
  try {
    items = await fetchFullInventory(steamId);
  } catch (err) {
    const stale = await getStaleInventory(steamId);
    if (stale) {
      return { ...stale, cached: true, cachedAt: stale.cachedAt };
    }
    throw err;
  }

  const summary = computeSummary(items);
  await setCachedInventory(steamId, items, summary);

  return { items, summary, cached: false, cachedAt: new Date().toISOString() };
}
