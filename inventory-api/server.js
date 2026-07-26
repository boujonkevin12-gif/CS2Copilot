import express from "express";

const PORT = process.env.PORT || 3001;
const CS2_APPID = 730;
const CS2_CONTEXT_ID = 2;
const MAX_PAGES = 20;
const CACHE_TTL_MS = 30 * 60 * 1000;
const RATE_LIMIT_COOLDOWN_MS = 10 * 60 * 1000;

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

const WEAPON_MAP = {
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

const SUB_CATEGORY_MAP = {
  CSGO_Type_Rifle: "Rifle",
  CSGO_Type_SniperRifle: "Sniper",
  CSGO_Type_SMG: "SMG",
  CSGO_Type_Shotgun: "Shotgun",
  CSGO_Type_Machinegun: "Machine Gun",
  CSGO_Type_Pistol: "Pistol",
  CSGO_Type_Knife: "Knife",
};

const STEAM_RARITY_MAP = {
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

const RARITY_COLORS = {
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

const CATEGORY_LABELS = {
  skin: "Skin", knife: "Cuchillo", gloves: "Guantes",
  agent: "Agente", sticker: "Sticker", music_kit: "Music Kit",
  case: "Caja", key: "Llave", graffiti: "Graffiti",
  patch: "Parche", charm: "Charm", collectible: "Coleccionable",
  tool: "Herramienta", container: "Contenedor", other: "Otro",
};

// --- In-memory cache ---
const cache = new Map();
const rateLimitMap = new Map();

// --- Helpers ---
function classifyItem(name, marketHashName, tags) {
  const isKnife = KNIFE_PATTERNS.some((p) => p.test(name) || p.test(marketHashName));
  const isGlove = GLOVE_PATTERNS.some((p) => p.test(name) || p.test(marketHashName));
  const typeTag = tags.find((t) => t.category === "Type" || t.category === "type");
  const typeInternal = typeTag?.internal_name || "";
  const typeLocalized = typeTag?.localized_tag_name || "";
  const weaponTag = tags.find((t) => t.category === "Weapon" || t.category === "weapon");
  const weaponInternal = weaponTag?.internal_name || "";
  const weaponLocalized = weaponTag?.localized_tag_name || "";
  const weaponResolved = WEAPON_MAP[weaponInternal] || weaponLocalized || "";

  if (isKnife || typeInternal === "CSGO_Type_Knife")
    return { category: "knife", subCategory: "Knife", weapon: weaponResolved || "Knife" };
  if (isGlove || typeInternal === "CSGO_Type_Gloves" || typeLocalized.toLowerCase().includes("glove"))
    return { category: "gloves", subCategory: "Gloves", weapon: weaponResolved || "Gloves" };
  if (typeInternal === "CSGO_Type_WeaponCase" || typeLocalized.toLowerCase().includes("case") || typeLocalized.toLowerCase().includes("caja"))
    return { category: "case", subCategory: "Case", weapon: "Case" };
  if (typeLocalized.includes("Key") || typeLocalized.includes("Llave"))
    return { category: "key", subCategory: "Key", weapon: "Key" };
  if (typeInternal === "CSGO_Type_Collectible")
    return { category: "collectible", subCategory: "Collectible", weapon: typeLocalized || "Collectible" };
  if (typeInternal === "CSGO_Type_WeaponCase_Key")
    return { category: "key", subCategory: "Key", weapon: "Key" };
  if (typeLocalized.includes("Sticker") || typeLocalized.includes("Calcomanía"))
    return { category: "sticker", subCategory: "Sticker", weapon: "Sticker" };
  if (typeLocalized.includes("Music Kit") || typeLocalized.includes("Kit de música"))
    return { category: "music_kit", subCategory: "Music Kit", weapon: "Music Kit" };
  if (typeLocalized.includes("Graffiti") || typeLocalized.includes("Grafiti"))
    return { category: "graffiti", subCategory: "Graffiti", weapon: "Graffiti" };
  if (typeLocalized.includes("Patch") || typeLocalized.includes("Parche"))
    return { category: "patch", subCategory: "Patch", weapon: "Patch" };
  if (typeLocalized.includes("Agent") || typeLocalized.includes("Agente"))
    return { category: "agent", subCategory: "Agent", weapon: "Agent" };
  if (typeLocalized.includes("Container") || typeLocalized.includes("Contenedor"))
    return { category: "container", subCategory: "Container", weapon: "Container" };
  if (typeLocalized.includes("Tool") || typeLocalized.includes("Herramienta"))
    return { category: "tool", subCategory: "Tool", weapon: "Tool" };
  if (typeLocalized.includes("Charm") || typeLocalized.includes("Amuleto"))
    return { category: "charm", subCategory: "Charm", weapon: "Charm" };
  if (typeInternal.startsWith("CSGO_Type_")) {
    const sub = SUB_CATEGORY_MAP[typeInternal] || "Other";
    if (sub === "Knife") return { category: "knife", subCategory: "Knife", weapon: weaponResolved || name };
    return { category: "skin", subCategory: sub, weapon: weaponResolved || name };
  }
  return { category: "other", subCategory: "Other", weapon: weaponResolved || name };
}

function parseExterior(name, tags) {
  const extTag = tags.find((t) => t.category === "Exterior" || t.category === "exterior");
  if (extTag?.localized_tag_name) return extTag.localized_tag_name;
  if (name.includes("Factory New")) return "Factory New";
  if (name.includes("Minimal Wear")) return "Minimal Wear";
  if (name.includes("Field-Tested")) return "Field-Tested";
  if (name.includes("Well-Worn")) return "Well-Worn";
  if (name.includes("Battle-Scarred")) return "Battle-Scarred";
  return "";
}

function parseSteamRarity(tags) {
  const rarityTag = tags.find((t) => t.category === "Rarity" || t.category === "rarity");
  if (rarityTag?.internal_name) {
    const mapped = STEAM_RARITY_MAP[rarityTag.internal_name];
    if (mapped) return { rarity: mapped, rarityName: rarityTag.localized_tag_name || rarityTag.internal_name };
    // New format: "Rarity_Uncommon_Weapon" → match by prefix
    for (const [key, value] of Object.entries(STEAM_RARITY_MAP)) {
      if (rarityTag.internal_name.startsWith(key)) {
        return { rarity: value, rarityName: rarityTag.localized_tag_name || rarityTag.internal_name };
      }
    }
  }
  return { rarity: "common", rarityName: "Common" };
}

function extractStickers(descriptions) {
  const stickers = [];
  const stickerLines = descriptions.filter((d) => d.type === "sticker" || (d.value && d.value.includes("Sticker")));
  for (const line of stickerLines) {
    if (!line.value) continue;
    stickers.push({ slot: stickers.length, stickerId: 0, name: line.value.replace(/\(.*\)/, "").trim(), imageUrl: "", wear: 0 });
  }
  return stickers;
}

function extractCollection(tags) {
  const setTag = tags.find((t) => t.category === "Item Set" || t.category === "item_set" || t.category === "Collection" || t.category === "ItemSet");
  if (setTag?.localized_tag_name)
    return { collection: setTag.internal_name || null, collectionName: setTag.localized_tag_name };
  return { collection: null, collectionName: null };
}

function buildInspectLink(actions, steamId, contextId, assetId) {
  if (!actions || actions.length === 0) return null;
  const template = actions.find((a) => a.name?.toLowerCase().includes("inspect"))?.link || actions[0]?.link;
  if (!template) return null;
  return template.replace(/{owner_steamid}/g, steamId).replace(/{contextid}/g, String(contextId)).replace(/{assetid}/g, assetId);
}

function createMarketLink(marketHashName) {
  return `https://steamcommunity.com/market/listings/730/${encodeURIComponent(marketHashName)}`;
}

function buildImageUrl(iconUrl, size) {
  if (!iconUrl) return "";
  const suffix = size === "large" ? "_large" : size === "medium" ? "_medium" : "";
  return `https://community.akamai.steamstatic.com/economy/image/${iconUrl}${suffix}`;
}

function parseItem(asset, desc, steamId) {
  const name = String(desc.name || "");
  const marketHashName = String(desc.market_hash_name || name);
  const tags = Array.isArray(desc.tags) ? desc.tags : [];
  const descriptionsArr = Array.isArray(desc.descriptions) ? desc.descriptions : [];

  const classification = classifyItem(name, marketHashName, tags);
  const { rarity, rarityName } = parseSteamRarity(tags);
  const stattrak = false;
  const souvenir = name.includes("Souvenir") || marketHashName.includes("Souvenir");
  const exterior = parseExterior(name, tags);
  const { collection, collectionName } = extractCollection(tags);
  const stickers = extractStickers(descriptionsArr);
  const actions = Array.isArray(desc.actions) ? desc.actions : undefined;
  const contextId = Number(asset.contextid) || CS2_CONTEXT_ID;
  const assetId = String(asset.assetid || "");
  const inspectLink = buildInspectLink(actions, steamId, contextId, assetId);

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
    iconUrl: buildImageUrl(String(desc.icon_url || "")),
    imageUrl: buildImageUrl(String(desc.icon_url_large || desc.icon_url || ""), desc.icon_url_large ? "large" : undefined),
    tradable: desc.tradable === 1,
    marketable: desc.marketable === 1,
    inspectLink,
    marketLink: createMarketLink(marketHashName),
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

function parseInventoryResponse(data, steamId) {
  const items = [];
  if (!data.assets || !data.descriptions) return items;

  // Normalize assets to a flat array
  const assetsList = [];
  if (Array.isArray(data.assets)) {
    assetsList.push(...data.assets);
  } else {
    for (const [, contexts] of Object.entries(data.assets)) {
      if (typeof contexts !== "object" || !contexts) continue;
      for (const [, assetsMap] of Object.entries(contexts)) {
        if (typeof assetsMap !== "object" || !assetsMap) continue;
        for (const [, asset] of Object.entries(assetsMap)) {
          assetsList.push(asset);
        }
      }
    }
  }

  // Build description lookup
  const descLookup = {};
  if (Array.isArray(data.descriptions)) {
    for (const d of data.descriptions) {
      if (d.classid) {
        descLookup[`${d.appid || CS2_APPID}_${d.classid}`] = d;
      }
    }
  } else {
    Object.assign(descLookup, data.descriptions);
  }

  for (const asset of assetsList) {
    if (!asset.classid) continue;
    const desc = descLookup[`${asset.appid || CS2_APPID}_${asset.classid}`];
    if (!desc) continue;
    try { items.push(parseItem(asset, desc, steamId)); } catch { /* skip */ }
  }
  return items;
}

async function fetchSteamPage(steamId, startAssetId) {
  let url = `https://steamcommunity.com/inventory/${steamId}/${CS2_APPID}/${CS2_CONTEXT_ID}`;
  if (startAssetId) url += `?start_assetid=${startAssetId}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  let res;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429) throw new Error("steam_rate_limit");
  if (res.status === 403) throw new Error("private");
  if (!res.ok) throw new Error(`steam_error:${res.status}`);

  const text = await res.text();
  if (text === "null") throw new Error("inventory_unavailable");

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("inventory_unavailable");
  }

  if (!data.success) {
    console.log(`[STEAM] response has no success`, { steamId, startAssetId, successValue: data.success, typeofSuccess: typeof data.success, textPreview: text.substring(0, 300) });
    throw new Error("inventory_unavailable");
  }

  const assetCount = data.assets ? Object.keys(data.assets).length : 0;
  console.log(`[STEAM] response ok`, { steamId, startAssetId, assetGroups: assetCount, totalInventoryCount: data.total_inventory_count, descCount: data.descriptions ? Object.keys(data.descriptions).length : 0, moreItems: data.more_items, lastAssetId: data.last_assetid });

  return data;
}

async function fetchAllPages(steamId) {
  const allItems = [];
  let lastAssetId;
  let page = 0;

  while (page < MAX_PAGES) {
    const data = await fetchSteamPage(steamId, lastAssetId);
    if (!data.success) break;
    allItems.push(...parseInventoryResponse(data, steamId));
    if (data.more_items && data.last_assetid) {
      lastAssetId = data.last_assetid;
      page++;
    } else {
      break;
    }
  }
  return allItems;
}

// --- Express server ---
const app = express();

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/debug/inventory/:steamId", async (req, res) => {
  const { steamId } = req.params;
  const start = Date.now();

  if (!/^\d{17}$/.test(steamId)) {
    return res.status(400).json({ code: "invalid_steam_id", error: "SteamID must be 17 digits" });
  }

  try {
    let url = `https://steamcommunity.com/inventory/${steamId}/${CS2_APPID}/${CS2_CONTEXT_ID}`;
    console.log(`[DEBUG] fetching Steam URL`, { url });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    let steamRes;
    try {
      steamRes = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
    } finally {
      clearTimeout(timer);
    }

    const text = await steamRes.text();
    const elapsed = Date.now() - start;

    let parsed = null;
    let parseError = null;
    try { parsed = JSON.parse(text); } catch (e) { parseError = e.message; }

    const assetsIsArray = Array.isArray(parsed?.assets);
    const assetCount = parsed?.assets ? Object.keys(parsed.assets).length : 0;
    const descsIsArray = Array.isArray(parsed?.descriptions);
    const descCount = parsed?.descriptions ? Object.keys(parsed.descriptions).length : 0;
    let sampleDescKeys = [];
    if (parsed?.descriptions) {
      sampleDescKeys = Object.keys(parsed.descriptions).slice(0, 3);
    }
    let sampleDescAll = null;
    if (descsIsArray && parsed.descriptions.length > 0) {
      sampleDescAll = parsed.descriptions[0];
    } else if (!descsIsArray && sampleDescKeys.length > 0) {
      sampleDescAll = parsed.descriptions[sampleDescKeys[0]];
    }

    res.json({
      steamStatus: steamRes.status,
      elapsed,
      textLength: text.length,
      isNull: text === "null",
      parseError,
      success: parsed?.success,
      typeofSuccess: typeof parsed?.success,
      total_inventory_count: parsed?.total_inventory_count,
      moreItems: parsed?.more_items,
      lastAssetId: parsed?.last_assetid,
      assetsType: Array.isArray(parsed?.assets) ? "array" : typeof parsed?.assets,
      assetsCount: assetCount,
      descsType: descsIsArray ? "array" : typeof parsed?.descriptions,
      descCount,
      sampleDescKeys,
      firstDesc: sampleDescAll,
      firstAsset: Array.isArray(parsed?.assets) ? parsed.assets[0] : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/inventory/:steamId", async (req, res) => {
  const { steamId } = req.params;
  const force = req.query.force === "1";
  const start = Date.now();

  console.log(`[INVENTORY] request`, { steamId, force, ip: req.ip });

  // Validate steamId
  if (!/^\d{17}$/.test(steamId)) {
    console.log(`[INVENTORY] invalid steamId`, { steamId });
    return res.status(400).json({ code: "invalid_steam_id", error: "SteamID must be 17 digits" });
  }

  // Check in-memory cache (skip if force refresh)
  const cached = cache.get(steamId);
  if (!force && cached && cached.expiresAt > Date.now()) {
    console.log(`[INVENTORY] cache hit`, { steamId, items: cached.items.length, age: Math.round((Date.now() - cached.cachedAt) / 1000) + "s" });
    return res.json({ items: cached.items, meta: { source: "cache", cachedAt: cached.cachedAt } });
  }

  // Check rate limit cooldown
  const cooldown = rateLimitMap.get(steamId);
  if (cooldown && cooldown > Date.now()) {
    console.log(`[INVENTORY] cooldown active`, { steamId });
    return res.status(429).json({ code: "steam_rate_limit", error: "Steam rate limit cooldown active" });
  }

  // Fetch from Steam
  let items;
  let pageCount = 0;
  try {
    items = await fetchAllPages(steamId);
    pageCount = 1; // Simplified - could track actual page count
    console.log(`[INVENTORY] steam success`, { steamId, itemsFound: items.length, elapsed: Date.now() - start + "ms" });
  } catch (err) {
    const msg = err.message;
    console.log(`[INVENTORY] steam error`, { steamId, error: msg, elapsed: Date.now() - start + "ms" });

    if (msg === "steam_rate_limit") {
      rateLimitMap.set(steamId, Date.now() + RATE_LIMIT_COOLDOWN_MS);
      return res.status(429).json({ code: "steam_rate_limit", error: "Steam rate limited" });
    }
    if (msg === "private") {
      return res.status(403).json({ code: "private", error: "Inventory is private" });
    }
    if (msg.startsWith("steam_error:")) {
      const status = msg.split(":")[1];
      return res.status(502).json({ code: "steam_error", error: "Steam returned error", detail: { status: Number(status) } });
    }
    if (msg === "inventory_unavailable") {
      return res.status(503).json({ code: "inventory_unavailable", error: "Inventory unavailable or empty" });
    }
    return res.status(500).json({ code: "internal", error: "Internal server error", detail: msg });
  }

  // Save to cache
  cache.set(steamId, { items, cachedAt: Date.now(), expiresAt: Date.now() + CACHE_TTL_MS });

  // Clean old cache entries periodically
  if (cache.size > 100) {
    const now = Date.now();
    for (const [key, val] of cache) {
      if (val.expiresAt <= now) cache.delete(key);
    }
  }

  console.log(`[INVENTORY] response`, { steamId, items: items.length, elapsed: Date.now() - start + "ms" });
  res.json({ items, meta: { source: "steam", pageCount, cachedAt: new Date().toISOString() } });
});

app.listen(PORT, () => {
  console.log(`[INVENTORY] server running on port ${PORT}`);
});
