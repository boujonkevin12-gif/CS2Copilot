import { describe, it } from "node:test";
import { strictEqual } from "node:assert";

/**
 * Normaliza un valor numérico para evitar que .toLocaleString() reciba undefined/null.
 * Refleja la lógica de seguridad aplicada en XpProgress (dashboard/page.tsx).
 */
function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Simula el cálculo de progreso de XP con valores por defecto seguros.
 * Refleja la lógica corregida de XpProgress en src/app/dashboard/page.tsx.
 */
function computeXpProgress(profile: unknown): {
  level: number;
  xp: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressXP: number;
  neededXP: number;
  pct: number;
} {
  const profileObj = profile as Record<string, unknown> | null | undefined;
  const level =
    typeof profileObj?.level === "number" &&
    Number.isFinite(profileObj.level) &&
    profileObj.level > 0
      ? profileObj.level
      : 1;
  const xp =
    typeof profileObj?.xp === "number" && Number.isFinite(profileObj.xp)
      ? profileObj.xp
      : 0;

  const currentLevelXP = (level - 1) * (level - 1) * 100;
  const nextLevelXP = level * level * 100;
  const progressXP = Math.max(0, xp - currentLevelXP);
  const neededXP = Math.max(1, nextLevelXP - currentLevelXP);
  const pct = Math.min(100, Math.max(0, (progressXP / neededXP) * 100));

  return { level, xp, currentLevelXP, nextLevelXP, progressXP, neededXP, pct };
}

describe("dashboard numeric safety", () => {
  it("safeNumber convierte undefined en 0", () => {
    strictEqual(safeNumber(undefined), 0);
  });

  it("safeNumber convierte null en 0", () => {
    strictEqual(safeNumber(null), 0);
  });

  it("safeNumber convierte NaN en 0", () => {
    strictEqual(safeNumber(NaN), 0);
  });

  it("safeNumber preserva números válidos", () => {
    strictEqual(safeNumber(1234), 1234);
    strictEqual(safeNumber(0), 0);
  });

  it("computeXpProgress con profile undefined no falla", () => {
    const result = computeXpProgress(undefined);
    strictEqual(result.level, 1);
    strictEqual(result.xp, 0);
    strictEqual(result.progressXP, 0);
    strictEqual(result.neededXP, 100);
    strictEqual(result.pct, 0);
  });

  it("computeXpProgress con profile vacío no falla", () => {
    const result = computeXpProgress({});
    strictEqual(result.level, 1);
    strictEqual(result.xp, 0);
    strictEqual(result.progressXP, 0);
    strictEqual(result.neededXP, 100);
    strictEqual(result.pct, 0);
  });

  it("computeXpProgress con xp undefined no falla", () => {
    const result = computeXpProgress({ level: 5, xp: undefined });
    strictEqual(result.level, 5);
    strictEqual(result.xp, 0);
    strictEqual(result.progressXP, 0);
    strictEqual(result.neededXP, 900);
    strictEqual(result.pct, 0);
  });

  it("computeXpProgress con level undefined no falla", () => {
    const result = computeXpProgress({ xp: 500, level: undefined });
    strictEqual(result.level, 1);
    strictEqual(result.xp, 500);
    strictEqual(result.progressXP, 500);
    strictEqual(result.neededXP, 100);
  });

  it("computeXpProgress con valores válidos calcula correctamente", () => {
    const result = computeXpProgress({ level: 3, xp: 450 });
    strictEqual(result.level, 3);
    strictEqual(result.xp, 450);
    strictEqual(result.currentLevelXP, 400);
    strictEqual(result.progressXP, 50);
    strictEqual(result.neededXP, 500);
  });

  it("computeXpProgress con nivel 1 y xp 0 no divide por cero", () => {
    const result = computeXpProgress({ level: 1, xp: 0 });
    strictEqual(result.level, 1);
    strictEqual(result.xp, 0);
    strictEqual(result.neededXP, 100);
    strictEqual(result.pct, 0);
  });

  it("computeXpProgress con level NaN usa nivel 1", () => {
    const result = computeXpProgress({ level: NaN, xp: 100 });
    strictEqual(result.level, 1);
    strictEqual(result.xp, 100);
    strictEqual(result.progressXP, 100);
    strictEqual(result.pct, 100);
  });

  it("computeXpProgress con level Infinity usa nivel 1", () => {
    const result = computeXpProgress({ level: Infinity, xp: 100 });
    strictEqual(result.level, 1);
    strictEqual(result.xp, 100);
    strictEqual(result.progressXP, 100);
    strictEqual(result.pct, 100);
  });

  it("computeXpProgress con level -Infinity usa nivel 1", () => {
    const result = computeXpProgress({ level: -Infinity, xp: 100 });
    strictEqual(result.level, 1);
    strictEqual(result.xp, 100);
    strictEqual(result.progressXP, 100);
    strictEqual(result.pct, 100);
  });

  it("computeXpProgress con xp NaN usa 0 XP", () => {
    const result = computeXpProgress({ level: 3, xp: NaN });
    strictEqual(result.level, 3);
    strictEqual(result.xp, 0);
    strictEqual(result.progressXP, 0);
    strictEqual(result.pct, 0);
  });

  it("computeXpProgress con xp Infinity usa 0 XP", () => {
    const result = computeXpProgress({ level: 3, xp: Infinity });
    strictEqual(result.level, 3);
    strictEqual(result.xp, 0);
    strictEqual(result.progressXP, 0);
    strictEqual(result.pct, 0);
  });

  it("computeXpProgress con xp -Infinity usa 0 XP", () => {
    const result = computeXpProgress({ level: 3, xp: -Infinity });
    strictEqual(result.level, 3);
    strictEqual(result.xp, 0);
    strictEqual(result.progressXP, 0);
    strictEqual(result.pct, 0);
  });
});
