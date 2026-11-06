import { describe, it } from "node:test";
import { strictEqual } from "node:assert";
import { validateBlobUrl } from "../lib/blob-url.ts";

describe("blob-url.ts", () => {
  const base = "https://store123.public.blob.vercel-storage.com";

  it("acepta una URL de blob pública legítima en namespace demos/", () => {
    const r = validateBlobUrl(`${base}/demos/archivo.dem`);
    strictEqual(r.ok, true, r.reason);
  });

  it("acepta blob con namespace de usuario del propietario correcto", () => {
    const r = validateBlobUrl(`${base}/demos/76561198000000001/a.dem`, "76561198000000001");
    strictEqual(r.ok, true, r.reason);
  });

  it("rechaza blob de otro usuario", () => {
    const r = validateBlobUrl(`${base}/demos/76561198000000002/a.dem`, "76561198000000001");
    strictEqual(r.ok, false);
    strictEqual(r.reason, "La demo pertenece a otro usuario");
  });

  it("rechaza http (solo https)", () => {
    strictEqual(
      validateBlobUrl("http://store.public.blob.vercel-storage.com/demos/a.dem").ok,
      false,
    );
  });

  it("rechaza hosts internos / SSRF", () => {
    strictEqual(validateBlobUrl("http://169.254.169.254/latest/meta-data").ok, false);
    strictEqual(validateBlobUrl("http://localhost:3000/api/auth/me").ok, false);
  });

  it("rechaza dominios que se hacen pasar por blob (spoof)", () => {
    strictEqual(
      validateBlobUrl("https://evil-blob.vercel-storage.com.attacker.com/demos/a.dem").ok,
      false,
    );
    strictEqual(
      validateBlobUrl("https://notblob.vercel-storage.com.evil.io/demos/a.dem").ok,
      false,
    );
  });

  it("rechaza path fuera del namespace demos/", () => {
    strictEqual(
      validateBlobUrl("https://store.public.blob.vercel-storage.com/secrets/a.dem").ok,
      false,
    );
  });

  it("rechaza entradas no string", () => {
    strictEqual(validateBlobUrl(null).ok, false);
    strictEqual(validateBlobUrl(undefined).ok, false);
    strictEqual(validateBlobUrl(123).ok, false);
  });

  it("acepta formato de host sin .public", () => {
    const r = validateBlobUrl("https://store456.blob.vercel-storage.com/demos/x.dem");
    strictEqual(r.ok, true, r.reason);
  });
});
