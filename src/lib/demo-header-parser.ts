export interface DemoHeaderInfo {
  map: string;
  serverName: string;
  gameDir: string;
  maxClients: number;
  networkProtocol: number;
  duration: number;
  tickCount: number;
}

const KNOWN_MAPS = [
  "de_dust2", "de_mirage", "de_inferno", "de_overpass", "de_nuke", "de_ancient",
  "de_vertigo", "de_anubis", "de_cache", "de_train", "de_tuscan", "de_cbble",
  "cs_office", "cs_militia", "cs_assault", "cs_italy",
  "dz_blacksite", "dz_frostbite",
  "ar_shoots", "ar_baggage",
  "wingman_",
];

function extractAsciiStrings(data: Uint8Array, minLength: number): string[] {
  const results: string[] = [];
  let current = "";
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    if (byte >= 0x20 && byte <= 0x7e) {
      current += String.fromCharCode(byte);
    } else {
      if (current.length >= minLength) {
        results.push(current);
      }
      current = "";
    }
  }
  if (current.length >= minLength) results.push(current);
  return results;
}

function findMapName(strings: string[]): string {
  for (const s of strings) {
    const lower = s.toLowerCase();
    for (const map of KNOWN_MAPS) {
      if (lower.startsWith(map)) return map;
    }
    if (/^de_[a-z0-9]+$/i.test(s) || /^cs_[a-z0-9]+$/i.test(s) || /^dz_[a-z0-9]+$/i.test(s)) {
      return s.toLowerCase();
    }
  }
  return "unknown";
}

function readVarint(data: Uint8Array, offset: number): [number, number] {
  let result = 0;
  let shift = 0;
  let pos = offset;
  while (pos < data.length && shift < 35) {
    const byte = data[pos];
    result |= (byte & 0x7f) << shift;
    pos++;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return [result, pos];
}

function readProtobufField(data: Uint8Array, offset: number): [number, number, number] | null {
  if (offset >= data.length) return null;
  const [tag, pos1] = readVarint(data, offset);
  if (tag === 0 && pos1 === offset) return null;
  const fieldNumber = tag >> 3;
  const wireType = tag & 0x07;
  if (wireType === 0) {
    const [value, pos2] = readVarint(data, pos1);
    return [fieldNumber, value, pos2];
  }
  if (wireType === 2) {
    const [length, pos2] = readVarint(data, pos1);
    return [fieldNumber, length, pos2];
  }
  return [fieldNumber, 0, pos1 + 4];
}

function tryParseProtobuf(data: Uint8Array, offset: number, size: number): DemoHeaderInfo | null {
  try {
    const end = Math.min(offset + size, data.length);
    let pos = offset;
    const result: DemoHeaderInfo = {
      map: "unknown",
      serverName: "desconocido",
      gameDir: "",
      maxClients: 0,
      networkProtocol: 0,
      duration: 0,
      tickCount: 0,
    };

    let fieldsParsed = 0;
    while (pos < end) {
      if (data[pos] === 0) break;
      const field = readProtobufField(data, pos);
      if (!field) break;
      const [fieldNumber, valueOrLength, pos1] = field;

      if (fieldNumber >= 1 && fieldNumber <= 6 && wireTypeIsString(fieldNumber, data, pos)) {
        const [length, strPos] = readVarint(data, pos1);
        if (length > 0 && strPos + length <= end && length < 512) {
          const str = new TextDecoder("utf-8", { fatal: false }).decode(data.slice(strPos, strPos + length));
          const isPrintable = /^[\x20-\x7e]+$/.test(str);
          if (isPrintable && fieldNumber === 1) result.map = str;
          else if (isPrintable && fieldNumber === 2) result.serverName = str;
          else if (isPrintable && fieldNumber === 3) result.gameDir = str;
          pos = strPos + length;
          fieldsParsed++;
          continue;
        }
      }

      if (fieldNumber === 4) { result.networkProtocol = valueOrLength; pos = pos1; fieldsParsed++; }
      else if (fieldNumber === 5) { result.maxClients = valueOrLength; pos = pos1; fieldsParsed++; }
      else if (fieldNumber === 8) { result.duration = valueOrLength / 100; pos = pos1; fieldsParsed++; }
      else if (fieldNumber === 6) { result.tickCount = valueOrLength; pos = pos1; fieldsParsed++; }
      else { pos = pos1; }
    }

    if (fieldsParsed >= 1 && result.map !== "unknown") return result;
    return null;
  } catch {
    return null;
  }
}

function wireTypeIsString(fieldNumber: number, data: Uint8Array, offset: number): boolean {
  if (offset >= data.length) return false;
  const tag = data[offset] & 0x07;
  return tag === 2;
}

export function parseDemoHeader(buffer: ArrayBuffer): DemoHeaderInfo | null {
  try {
    const data = new Uint8Array(buffer);
    if (data.length < 16) return null;

    const strings = extractAsciiStrings(data, 3);
    const mapName = findMapName(strings);

    let serverName = "desconocido";
    for (const s of strings) {
      if (s.length >= 5 && s.length <= 64 && !s.toLowerCase().startsWith("de_") && !s.toLowerCase().startsWith("cs_")) {
        const lower = s.toLowerCase();
        if (lower.includes("server") || lower.includes("match") || lower.includes("cs2") ||
            lower.includes("retake") || lower.includes("warmup") || lower.includes("faceit") ||
            lower.includes("1v1") || lower.includes("aim") || lower.includes("dm") ||
            lower.includes("hub") || lower.includes("lobby") || lower.includes("game")) {
          serverName = s;
          break;
        }
      }
    }

    if (serverName === "desconocido") {
      for (const s of strings) {
        if (s.length >= 8 && s.length <= 64 && !s.toLowerCase().startsWith("de_") && !s.toLowerCase().startsWith("cs_")) {
          if (/^[a-zA-Z0-9_\-\.\s\[\]#]+$/.test(s)) {
            serverName = s;
            break;
          }
        }
      }
    }

    let pos = 0;
    const [cmd, pos1] = readVarint(data, pos);
    pos = pos1;
    const [tickVal, pos2] = readVarint(data, pos);
    pos = pos2;
    const [sizeVal, pos3] = readVarint(data, pos);
    pos = pos3;

    if (cmd >= 0 && cmd <= 30 && sizeVal > 0 && sizeVal < 100000) {
      const protobufResult = tryParseProtobuf(data, pos, sizeVal);
      if (protobufResult && protobufResult.map !== "unknown") {
        return protobufResult;
      }
    }

    if (mapName !== "unknown") {
      return {
        map: mapName,
        serverName,
        gameDir: "game",
        maxClients: 10,
        networkProtocol: 0,
        duration: 0,
        tickCount: 0,
      };
    }

    for (let i = 0; i < Math.min(data.length, 65536); i++) {
      if (data[i] === 0x01 && i + 3 < data.length) {
        const tryPos = i;
        const [tryCmd, tp1] = readVarint(data, tryPos);
        if (tryCmd === 1) {
          const [, tp2] = readVarint(data, tp1);
          const [trySize, tp3] = readVarint(data, tp2);
          if (trySize > 0 && trySize < 100000) {
            const innerStrings = extractAsciiStrings(data.slice(tp3, tp3 + Math.min(trySize, 4096)), 3);
            const innerMap = findMapName(innerStrings);
            if (innerMap !== "unknown") {
              return {
                map: innerMap,
                serverName,
                gameDir: "game",
                maxClients: 10,
                networkProtocol: 0,
                duration: 0,
                tickCount: 0,
              };
            }
          }
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function getDemoSizeLabel(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
