export interface DemoHeaderInfo {
  map: string;
  serverName: string;
  gameDir: string;
  maxClients: number;
  networkProtocol: number;
  duration: number;
  tickCount: number;
}

function readVarint(data: Uint8Array, offset: number): [number, number] {
  let result = 0;
  let shift = 0;
  let pos = offset;
  while (pos < data.length) {
    const byte = data[pos];
    result |= (byte & 0x7f) << shift;
    pos++;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return [result, pos];
}

function readProtobufField(data: Uint8Array, offset: number): [number, number, number] {
  const [tag, pos1] = readVarint(data, offset);
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

function readProtobufString(data: Uint8Array, offset: number): [string, number] {
  const [length, pos] = readVarint(data, offset);
  const str = new TextDecoder().decode(data.slice(pos, pos + length));
  return [str, pos + length];
}

function skipProtobufField(data: Uint8Array, fieldNumber: number, offset: number): number {
  const [, valueOrLength, pos1] = readProtobufField(data, offset);
  if (fieldNumber === 0) return pos1;
  if ([0, 1, 5].includes(fieldNumber & 7)) return pos1;
  return pos1 + valueOrLength;
}

export function parseDemoHeader(buffer: ArrayBuffer): DemoHeaderInfo | null {
  try {
    const data = new Uint8Array(buffer);
    let pos = 0;

    const [cmd, pos1] = readVarint(data, pos);
    pos = pos1;
    const [tickVal, pos2] = readVarint(data, pos);
    pos = pos2;
    const [_sizeVal, pos3] = readVarint(data, pos);
    pos = pos3;

    if (cmd !== 1) return null;

    const result: DemoHeaderInfo = {
      map: "unknown",
      serverName: "desconocido",
      gameDir: "",
      maxClients: 0,
      networkProtocol: 0,
      duration: 0,
      tickCount: 0,
    };

    const headerEnd = Math.min(pos + 8192, data.length);

    while (pos < headerEnd) {
      if (data[pos] === 0) break;

      const [fieldNumber, valueOrLength, pos1] = readProtobufField(data, pos);

      if (fieldNumber === 1) {
        const [mapName, newPos] = readProtobufString(data, pos1);
        result.map = mapName;
        pos = newPos;
      } else if (fieldNumber === 2) {
        const [serverName, newPos] = readProtobufString(data, pos1);
        result.serverName = serverName;
        pos = newPos;
      } else if (fieldNumber === 3) {
        const [gameDir, newPos] = readProtobufString(data, pos1);
        result.gameDir = gameDir;
        pos = newPos;
      } else if (fieldNumber === 4) {
        result.networkProtocol = valueOrLength;
        pos = pos1;
      } else if (fieldNumber === 5) {
        result.maxClients = valueOrLength;
        pos = pos1;
      } else if (fieldNumber === 8) {
        result.duration = valueOrLength / 100;
        pos = pos1;
      } else if (fieldNumber === 6) {
        result.tickCount = valueOrLength;
        pos = pos1;
      } else {
        pos = pos1;
      }
    }

    return result;
  } catch {
    return null;
  }
}

export function getDemoSizeLabel(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
