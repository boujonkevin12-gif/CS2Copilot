import { describe, it } from "node:test";
import { strictEqual } from "node:assert";
import { rateLimit } from "../lib/rate-limit.ts";

describe("rate-limit.ts", () => {
  it("permite exactamente hasta el límite y luego bloquea", () => {
    const key = `rl-test-${Date.now()}-${Math.random()}`;
    const limit = 5;
    let allowed = 0;
    for (let i = 0; i < limit; i++) {
      if (rateLimit(key, limit, 60_000)) allowed++;
    }
    strictEqual(allowed, limit);
    // El siguiente debe ser rechazado.
    let blocked = 0;
    for (let i = 0; i < 10; i++) {
      if (!rateLimit(key, limit, 60_000)) blocked++;
    }
    strictEqual(blocked, 10);
  });

  it("diferentes claves son independientes", () => {
    const a = `rl-a-${Date.now()}`;
    const b = `rl-b-${Date.now()}`;
    strictEqual(rateLimit(a, 1, 60_000), true);
    strictEqual(rateLimit(a, 1, 60_000), false);
    strictEqual(rateLimit(b, 1, 60_000), true); // clave distinta, no afectada
  });
});
