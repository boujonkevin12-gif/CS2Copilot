import { NextRequest, NextResponse } from "next/server";
import { getSteamService } from "@/lib/services";

type Insight = {
  emoji: string;
  title: string;
  desc: string;
  type: "positive" | "negative" | "neutral";
};

function generateInsights(stats: {
  totalKills: number; totalDeaths: number; totalWins: number; totalLosses: number;
  totalHeadshotKills: number; totalShotsFired: number; totalShotsHit: number;
  totalRifleKills: number; totalSniperKills: number; totalSmgKills: number;
  totalPistolKills: number; totalShotgunKills: number; totalMachinegunKills: number;
  totalMVPs: number; totalDominations: number; totalRevenges: number;
  totalKnifeKills: number; totalGrenadeKills: number;
  totalHSPct: number; totalKD: number; totalWinPct: number; accuracy: number;
}): Insight[] {
  const insights: Insight[] = [];
  const totalMatches = stats.totalWins + stats.totalLosses;

  if (totalMatches === 0 && stats.totalKills === 0) return [];

  const weaponKills: [string, number][] = [
    ["Rifles", stats.totalRifleKills],
    ["SMG", stats.totalSmgKills],
    ["Pistolas", stats.totalPistolKills],
    ["AWP/Sniper", stats.totalSniperKills],
    ["Escopetas", stats.totalShotgunKills],
    ["Metralletas", stats.totalMachinegunKills],
  ];
  const bestWeapon = weaponKills.reduce((a, b) => (a[1] >= b[1] ? a : b));
  const bestWeaponPct = stats.totalKills > 0
    ? Math.round((bestWeapon[1] / stats.totalKills) * 100)
    : 0;

  if (stats.totalKD >= 1.5) {
    insights.push({
      emoji: "🟢",
      title: `Tu K/D de ${stats.totalKD.toFixed(2)} está muy por encima del promedio (${stats.totalKills} kills, ${stats.totalDeaths} muertes).`,
      desc: `Sigue así, tu desempeño es sólido.${bestWeapon[1] > 0 ? ` ${bestWeapon[0]} son tu fuerte (${bestWeaponPct}% de kills).` : ""}`,
      type: "positive",
    });
  } else if (stats.totalKD >= 1.0) {
    insights.push({
      emoji: "🔵",
      title: `K/D equilibrado: ${stats.totalKD.toFixed(2)}.`,
      desc: `Estás en el promedio. ${bestWeapon[1] > 0 ? `Tus ${bestWeapon[0].toLowerCase()} son tu mejor arma (${bestWeaponPct}%).` : "Sigue practicando para mejorar."}`,
      type: "neutral",
    });
  } else if (stats.totalKD > 0) {
    insights.push({
      emoji: "🟠",
      title: `Tu K/D es de ${stats.totalKD.toFixed(2)} — por debajo del promedio.`,
      desc: `Trabaja en tu positioning y aim. ${bestWeapon[1] > 0 ? `Tus ${bestWeapon[0].toLowerCase()} son lo mejor de tu arsenal (${bestWeaponPct}%).` : ""}`,
      type: "negative",
    });
  }

  if (stats.totalHSPct >= 50 && stats.totalKills >= 50) {
    insights.push({
      emoji: "🟢",
      title: `Headshot rate del ${stats.totalHSPct}% — eres letal!`,
      desc: `Tu aim está muy por encima del promedio. Sigue practicando ese crosshair placement.`,
      type: "positive",
    });
  } else if (stats.totalHSPct >= 30 && stats.totalHSPct < 50 && stats.totalKills >= 50) {
    insights.push({
      emoji: "🔵",
      title: `${stats.totalHSPct}% de headshots — decente.`,
      desc: `Tu precisión es buena. Intenta apuntar más a la cabeza en peleas cuerpo a cuerpo.`,
      type: "neutral",
    });
  } else if (stats.totalHSPct > 0 && stats.totalHSPct < 30 && stats.totalKills >= 30) {
    insights.push({
      emoji: "🟠",
      title: `Solo ${stats.totalHSPct}% de headshots — puedes mejorar.`,
      desc: `Trabaja en mantener el crosshair a la altura de la cabeza. Prueba el modo deathmatch.`,
      type: "negative",
    });
  }

  if (stats.accuracy >= 25 && stats.totalShotsFired >= 200) {
    insights.push({
      emoji: "🟢",
      title: `Precisión del ${stats.accuracy}% — muy buen control de recoil.`,
      desc: `Tu spray control está por encima del promedio. Sigue practicando.`,
      type: "positive",
    });
  } else if (stats.accuracy >= 15 && stats.accuracy < 25 && stats.totalShotsFired >= 200) {
    insights.push({
      emoji: "🔵",
      title: `${stats.accuracy}% de precisión — dentro del promedio.`,
      desc: `Buen control general. Intenta no disparar en ráfagas largas.`,
      type: "neutral",
    });
  } else if (stats.accuracy > 0 && stats.accuracy < 15 && stats.totalShotsFired >= 200) {
    insights.push({
      emoji: "🟠",
      title: `Precisión del ${stats.accuracy}% — puedes mejorar tu spray.`,
      desc: `Practica el control de recoil en el workshop. Menos balas, más precisión.`,
      type: "negative",
    });
  }

  if (totalMatches >= 10) {
    if (stats.totalWinPct >= 60) {
      insights.push({
        emoji: "🟢",
        title: `Win rate del ${stats.totalWinPct}% en ${totalMatches} partidas.`,
        desc: `Estás teniendo un gran impacto en tus partidas. Sigue así!`,
        type: "positive",
      });
    } else if (stats.totalWinPct >= 45) {
      insights.push({
        emoji: "🔵",
        title: `${stats.totalWinPct}% de win rate en ${totalMatches} partidas.`,
        desc: `Win rate equilibrado. Intenta coordinar más con tu equipo.`,
        type: "neutral",
      });
    } else if (stats.totalWinPct > 0) {
      insights.push({
        emoji: "🟠",
        title: `Win rate del ${stats.totalWinPct}% — por debajo del promedio.`,
        desc: `Necesitas más impacto en las rondas. Intenta jugar con amigos para mejorar la comunicación.`,
        type: "negative",
      });
    }
  }

  if (stats.totalMVPs > 0 && totalMatches > 0) {
    const mvpsPerMatch = (stats.totalMVPs / totalMatches).toFixed(1);
    if (parseFloat(mvpsPerMatch) >= 1.0) {
      insights.push({
        emoji: "🟢",
        title: `Promedio de ${mvpsPerMatch} MVPs por partida (${stats.totalMVPs} totales).`,
        desc: `Siempre estás en el top de la tabla. Sigue siendo el MVP!`,
        type: "positive",
      });
    }
  }

  if (stats.totalKnifeKills >= 5) {
    insights.push({
      emoji: "🔵",
      title: `${stats.totalKnifeKills} cuchilladas — te gusta arriesgar!`,
      desc: `Eres valiente con el cuchillo. Intenta no arriesgar tanto en rondas clave.`,
      type: "neutral",
    });
  }

  if (stats.totalGrenadeKills >= 10) {
    insights.push({
      emoji: "🟢",
      title: `${stats.totalGrenadeKills} kills con granadas — sabes usar la utility.`,
      desc: `Tus granadas son letales. Sigue aprendiendo lineups.`,
      type: "positive",
    });
  }

  if (bestWeapon[1] > 0 && bestWeapon[0] !== "Rifles" && bestWeaponPct >= 25) {
    const weaponMap: Record<string, string> = {
      "AWP/Sniper": "Eres un sniper nato!",
      "SMG": "Prefieres la velocidad de las SMG.",
      "Pistolas": "Tus pistolas son tu mejor aliado — buenas en eco rounds.",
      "Escopetas": "Te gusta el combate cercano con escopetas.",
      "Metralletas": "La M249/Negev es tu estilo de supresión.",
    };
    insights.push({
      emoji: "🔵",
      title: `${bestWeapon[0]} — ${weaponMap[bestWeapon[0]] || "tu arma favorita"}`,
      desc: `${bestWeaponPct}% de tus kills son con ${bestWeapon[0].toLowerCase()}.`,
      type: "neutral",
    });
  }

  const unique = new Set<string>();
  return insights.filter((i) => {
    const key = i.title.slice(0, 30);
    if (unique.has(key)) return false;
    unique.add(key);
    return true;
  }).slice(0, 3);
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("cs2pilot_user");
  if (!cookie) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const user = JSON.parse(cookie.value);
    const steamService = getSteamService();
    const stats = await steamService.getUserStatsForGame(user.steamId);

    if (!stats || (stats.totalKills === 0 && stats.totalDeaths === 0 && stats.totalWins === 0)) {
      return NextResponse.json({ insights: [] });
    }

    const insights = generateInsights(stats);
    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json({ insights: [] });
  }
}
