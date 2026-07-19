export interface DemoHeaderInfo {
  map: string;
  serverName: string;
  gameDir: string;
  duration: number;
  tickCount: number;
  roundCount: number;
  playbackFrames: number;
}

const KNOWN_MAPS = [
  "de_dust2", "de_mirage", "de_inferno", "de_overpass", "de_nuke", "de_ancient",
  "de_vertigo", "de_anubis", "de_cache", "de_train", "de_tuscan", "de_cbble",
  "cs_office", "cs_militia", "cs_assault", "cs_italy",
  "dz_blacksite", "dz_frostbite",
  "ar_shoots", "ar_baggage",
];

let snappyUncompress: ((input: Uint8Array) => Uint8Array) | null = null;
let snappyLoaded = false;

async function loadSnappy() {
  if (snappyLoaded) return;
  snappyLoaded = true;
  try {
    const mod = await import("snappyjs");
    snappyUncompress = (input: Uint8Array) => {
      const result = (mod as { uncompress: (data: Uint8Array) => Uint8Array }).uncompress(input);
      return result instanceof Uint8Array ? result : new Uint8Array(result);
    };
  } catch {
    snappyUncompress = null;
  }
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

function readFloat(data: Uint8Array, offset: number): number {
  if (offset + 4 > data.length) return 0;
  const view = new DataView(data.buffer, data.byteOffset + offset, 4);
  return view.getFloat32(0, true);
}

function skipField(data: Uint8Array, wireType: number, offset: number): number {
  if (wireType === 0) { const [, n] = readVarint(data, offset); return n; }
  if (wireType === 1) return offset + 8;
  if (wireType === 2) { const [l, n] = readVarint(data, offset); return n + l; }
  if (wireType === 5) return offset + 4;
  return offset;
}

function readString(data: Uint8Array, offset: number): [string, number] {
  const [len, strPos] = readVarint(data, offset);
  if (len > 1024 || strPos + len > data.length) return ["", offset];
  const str = new TextDecoder("utf-8", { fatal: false }).decode(data.slice(strPos, strPos + len));
  return [str, strPos + len];
}

function extractAsciiStrings(data: Uint8Array, minLength: number): string[] {
  const results: string[] = [];
  let current = "";
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    if (byte >= 0x20 && byte <= 0x7e) {
      current += String.fromCharCode(byte);
    } else {
      if (current.length >= minLength) results.push(current);
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
      if (lower === map || lower.startsWith(map + " ") || lower.startsWith(map + "\x00")) return map;
    }
    if (/^de_[a-z0-9]+$/i.test(s) || /^cs_[a-z0-9]+$/i.test(s) || /^dz_[a-z0-9]+$/i.test(s)) {
      return s.toLowerCase();
    }
  }
  return "unknown";
}

export async function parseDemoHeader(buffer: ArrayBuffer): Promise<DemoHeaderInfo | null> {
  try {
    await loadSnappy();

    const data = new Uint8Array(buffer);
    if (data.length < 64) return null;

    const result: DemoHeaderInfo = {
      map: "unknown",
      serverName: "desconocido",
      gameDir: "",
      duration: 0,
      tickCount: 0,
      roundCount: 0,
      playbackFrames: 0,
    };

    let pos = 16;

    const [cmd, p1] = readVarint(data, pos);
    pos = p1;
    const [, p2] = readVarint(data, pos);
    pos = p2;
    const [headerSize, p3] = readVarint(data, pos);
    pos = p3;

    const actualCmd = cmd & ~64;

    if (actualCmd === 1 && headerSize > 0 && headerSize < 100000 && pos + headerSize <= data.length) {
      const end = pos + headerSize;
      while (pos < end) {
        if (data[pos] === 0) break;
        const [tag, tp1] = readVarint(data, pos);
        if (tag === 0) break;
        const fn = tag >> 3;
        const wt = tag & 0x07;

        if (wt === 2) {
          if (fn === 3) { const [s, sp] = readString(data, tp1); result.serverName = s; pos = sp; }
          else if (fn === 5) { const [s, sp] = readString(data, tp1); result.map = s.toLowerCase(); pos = sp; }
          else if (fn === 6) { const [s, sp] = readString(data, tp1); result.gameDir = s; pos = sp; }
          else { pos = skipField(data, wt, tp1); }
        } else {
          pos = skipField(data, wt, tp1);
        }
      }
      pos = end;
    }

    let attempts = 0;
    while (pos + 10 < data.length && attempts < 5) {
      attempts++;
      const savePos = pos;
      const [fiCmd, fp1] = readVarint(data, pos);
      pos = fp1;
      const [, fp2] = readVarint(data, pos);
      pos = fp2;
      const [fiSize, fp3] = readVarint(data, pos);
      pos = fp3;

      if (fiSize === 0 || fiSize > 2000000 || pos + fiSize > data.length) {
        pos = savePos + 1;
        continue;
      }

      const actualFiCmd = fiCmd & ~64;

      if (actualFiCmd === 2) {
        let frameData: Uint8Array = data.slice(pos, pos + fiSize);
        if ((fiCmd & 64) !== 0 && snappyUncompress) {
          try {
            const decompressed = snappyUncompress(frameData);
            if (decompressed && decompressed.length > 0) {
              frameData = new Uint8Array(decompressed);
            }
          } catch {
            // try raw
          }
        }
        parseFileInfo(frameData, result);
        break;
      }

      pos += fiSize;
    }

    if (result.map === "unknown") {
      const strings = extractAsciiStrings(data.subarray(0, Math.min(data.length, 65536)), 3);
      result.map = findMapName(strings);
    }

    return result.map !== "unknown" ? result : null;
  } catch {
    return null;
  }
}

function parseFileInfo(data: Uint8Array, result: DemoHeaderInfo): void {
  let pos = 0;
  const end = data.length;

  while (pos < end) {
    if (data[pos] === 0) break;
    const [tag, tp1] = readVarint(data, pos);
    if (tag === 0) break;
    const fn = tag >> 3;
    const wt = tag & 0x07;

    if (fn === 1 && wt === 5) {
      result.duration = readFloat(data, tp1);
      pos = tp1 + 4;
    } else if (fn === 2 && wt === 0) {
      const [ticks] = readVarint(data, tp1);
      result.tickCount = ticks;
      pos = tp1;
    } else if (fn === 3 && wt === 0) {
      const [frames] = readVarint(data, tp1);
      result.playbackFrames = frames;
      pos = tp1;
    } else if (fn === 4 && wt === 2) {
      const [nestedLen, nestedPos] = readVarint(data, tp1);
      const nestedEnd = Math.min(nestedPos + nestedLen, end);
      parseGameInfo(data, nestedPos, nestedEnd, result);
      pos = nestedEnd;
    } else {
      pos = skipField(data, wt, tp1);
    }
  }
}

function parseGameInfo(data: Uint8Array, start: number, end: number, result: DemoHeaderInfo): void {
  let pos = start;
  while (pos < end) {
    if (data[pos] === 0) break;
    const [tag, tp1] = readVarint(data, pos);
    if (tag === 0) break;
    const fn = tag >> 3;
    const wt = tag & 0x07;

    if (fn === 5 && wt === 2) {
      const [csLen, csPos] = readVarint(data, tp1);
      const csEnd = Math.min(csPos + csLen, end);
      parseCSGameInfo(data, csPos, csEnd, result);
      pos = csEnd;
    } else {
      pos = skipField(data, wt, tp1);
    }
  }
}

function parseCSGameInfo(data: Uint8Array, start: number, end: number, result: DemoHeaderInfo): void {
  let pos = start;
  let roundCount = 0;
  while (pos < end) {
    if (data[pos] === 0) break;
    const [tag, tp1] = readVarint(data, pos);
    if (tag === 0) break;
    const fn = tag >> 3;
    const wt = tag & 0x07;

    if (fn === 1 && wt === 0) {
      roundCount++;
      const [, nr] = readVarint(data, tp1);
      pos = nr;
    } else if (fn === 1 && wt === 2) {
      const [arrLen, arrPos] = readVarint(data, tp1);
      const arrEnd = Math.min(arrPos + arrLen, end);
      let apos = arrPos;
      while (apos < arrEnd) {
        const [, av] = readVarint(data, apos);
        roundCount++;
        apos = av;
      }
      pos = arrEnd;
    } else {
      pos = skipField(data, wt, tp1);
    }
  }
  result.roundCount = roundCount;
}

export function getDemoSizeLabel(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
