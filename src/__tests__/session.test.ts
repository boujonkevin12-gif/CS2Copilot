import { describe, it } from "node:test";
import { strictEqual, ok } from "node:assert";
import { createSessionToken, verifySessionToken, isValidSteamId } from "../lib/session.ts";
import { createHmac } from "node:crypto";
import { deflateRawSync } from "node:zlib";

describe("session.ts", () => {
  const profile = { steamId: "76561198000000001", name: "Tester", avatar: null };

  it("crea y verifica un token de sesión (roundtrip)", () => {
    const token = createSessionToken(profile);
    ok(typeof token === "string" && token !== null);
    const verified = verifySessionToken(token);
    strictEqual(verified?.steamId, profile.steamId);
    strictEqual(verified?.name, "Tester");
  });

  it("rechaza un token con payload manipulado (firma inválida)", () => {
    const token = createSessionToken(profile)!;
    const parts = token.split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({ steamId: "76561198000000002", exp: 9999999999 }),
    ).toString("base64url");
    const forged = `${parts[0]}.${forgedPayload}.${parts[2]}`;
    strictEqual(verifySessionToken(forged), null);
  });

  it("rechaza un token con firma alterada", () => {
    const token = createSessionToken(profile)!;
    const parts = token.split(".");
    strictEqual(verifySessionToken(`${parts[0]}.${parts[1]}.AAAA`), null);
  });

  it("rechaza tokens vacíos o basura", () => {
    strictEqual(verifySessionToken(""), null);
    strictEqual(verifySessionToken("abc.def"), null);
    strictEqual(verifySessionToken(undefined), null);
  });

  it("rechaza steamId inválido al crear", () => {
    strictEqual(createSessionToken({ steamId: "abc" } as never), null);
  });

  it("isValidSteamId distingue IDs válidos", () => {
    strictEqual(isValidSteamId("76561198000000001"), true);
    strictEqual(isValidSteamId("123"), false);
    strictEqual(isValidSteamId(null as unknown as string), false);
  });

  it("rechaza un token expirado firmado con el mismo secreto", () => {
    const g = globalThis as typeof globalThis & { __cs2pilot_dev_session_secret?: string };
    const secret = g.__cs2pilot_dev_session_secret;
    ok(secret, "debería haber secreto de desarrollo");
    const payload = JSON.stringify({ steamId: profile.steamId, exp: Math.floor(Date.now() / 1000) - 100 });
    const data = deflateRawSync(Buffer.from(payload, "utf8")).toString("base64url");
    const body = `v1.${data}`;
    const sig = createHmac("sha256", secret!).update(body).digest("base64url");
    strictEqual(verifySessionToken(`${body}.${sig}`), null);
  });
});
