# AUDITORÍA TÉCNICA Y FUNCIONAL — CS2Pilot

**Fecha:** 04 de noviembre de 2026
**Proyecto auditado:** `B:\Vs Code\Cs2` (nombre en `package.json`: `cs2pilot`)
**Repositorio:** `https://github.com/boujonkevin12-gif/CS2Copilot.git` (público, rama `main`, 122 commits)
**Producción:** `https://cs2pilot.vercel.app` (verificado en línea el día de la auditoría)
**Modo:** Solo lectura. No se modificó, eliminó ni instaló ningún archivo del proyecto. La única creación es este informe.

---

> **Nota sobre el directorio de trabajo:** el directorio desde el que se inició la sesión (`deivid final - RESPALDO`) contiene **"Deivid Store"**, un sitio estático de venta de skins **completamente distinto** de CS2Pilot. Tras confirmarlo con el usuario, la auditoría se realizó sobre `B:\Vs Code\Cs2`, que es la copia activa de CS2Pilot (la más reciente, con historial de Git y datos de producción).

> **Nota sobre las tres copias de CS2Pilot existentes en el equipo:**
>
> | Copia | Última actividad | Observación |
> |---|---|---|
> | **`B:\Vs Code\Cs2`** ← auditada | 11 sep 2026 (commits hasta 29 jul 2026) | Es la canónica: Git, datos, features más nuevas |
> | `B:\Vs Code\pilot fix` | 25 jul 2026 | Contiene una **auditoría previa con correcciones NO fusionadas** (ver §8.6) |
> | `B:\Vs Code\cs nuevo nuevo` | 24 jul 2026 | Copia intermedia, aparentemente obsoleta |
>
> **Hallazgo clave de recuperación:** `pilot fix` contiene correcciones críticas que **no existen en esta copia**: verificación OpenID (`verifyOpenIdResponse`), exigencia de sesión en `/api/demo/upload` y `steam-inventory.service.ts`. Este informe marca exactamente qué fusionar.

---

# 1. ANÁLISIS GENERAL DEL PROYECTO

## 1.1 Tecnologías y stack

| Capa | Tecnología | Evidencia |
|---|---|---|
| Framework | **Next.js 16.2.10** (App Router) | `package.json` |
| Frontend | **React 19.2.4**, TypeScript 5 (strict), Tailwind CSS 4 | `package.json`, `tsconfig.json` (`"strict": true`) |
| Animaciones/UI | framer-motion 12, lucide-react | `package.json` |
| Backend | Route Handlers de Next.js (47 rutas `route.ts`) | `src/app/api/**` |
| Base de datos | **SQLite/Turso (libsql)** vía `@libsql/client` | `src/lib/db.ts` |
| Parser de demos | **cs2parser 1.11.1** (+ snappyjs para cabeceras) | `next.config.ts` (`serverExternalPackages`) |
| IA | **Groq** (`llama-3.3-70b-versatile`) | `src/app/api/ai/chat/route.ts:4-5` |
| Almacenamiento | **Vercel Blob** (subida de demos) | `src/app/api/demo/upload-url/route.ts` |
| API externas | Steam Web API, FACEIT API v2 | `src/lib/services/{steam,faceit}.service.ts` |
| Servicio auxiliar | Express standalone `inventory-api/` (para Render) | `inventory-api/server.js` |
| Despliegue | **Vercel** (app) + posiblemente **Render** (inventory-api) | ver §9 |

## 1.2 Estructura de carpetas

```
Cs2/
├── src/
│   ├── app/                  → 25 páginas + 47 rutas API
│   │   ├── api/              → auth, gamification, tournaments, faceit, steam, demo, ai, user, player, debug
│   │   ├── dashboard/        → 20 páginas (coach, stats, shop, tournaments, settings/*, etc.)
│   │   ├── player/[steamId]/ → perfil público
│   │   ├── login/ register/  → acceso (solo Steam funcional)
│   │   └── page.tsx          → landing
│   ├── components/           → landing/, inventory/, ui/, cosmetic-*, particles
│   ├── lib/
│   │   ├── services/         → gamification (1.138 líneas), tournament, match-challenge, steam, faceit, ai-engine, demo-parser, inventory, stats-calculator, providers/
│   │   ├── db.ts / db-schema.ts / auth-helpers.ts / user-context / gamification-context
│   ├── types/
├── inventory-api/            → servidor Express independiente (Render)
├── scripts/                  → scripts sueltos de BD
├── public/                   → frames, bg, iconos
├── data.db                   → SQLite local (NO en Git; ~20 tablas, datos de desarrollo)
└── casefile vfinal/          → ⚠️ PROYECTO AJENO sin rastrear (contamina el typecheck)
```

**Escala:** ~130 archivos TS/TSX, **~17.000 líneas** en `src/`. Archivos mayores: `gamification.service.ts` (1.138 líneas), `coach/page.tsx` (782), `tournaments/page.tsx` (664), `utility/page.tsx` (662).

## 1.3 Arquitectura general

- **100% client-side rendering en datos:** 26 archivos con `"use client"`; **cero Server Components con carga de datos**. Tras la hidratación, cada página hace sus `fetch()` a las route handlers, que a su vez hablan con SQLite/Turso, Steam, FACEIT o Groq.
- **Autenticación:** login vía **Steam OpenID 2.0** → cookie `cs2pilot_user` (JSON del perfil, httpOnly, 30 días). No hay middleware de protección global: cada ruta decide.
- **Estado global:** dos React Context (`user-context`, `gamification-context`) que cargan perfil, XP, monedas, notificaciones y stats FACEIT.
- **Gamificación:** XP/nivel/monedas, logros, desafíos diarios/semanales, cofres, pase de temporada, tienda (marcos/fondos/efectos), ranking, torneos y desafíos 1v1 con resolución vía FACEIT.

## 1.4 Estado del repositorio Git

- Rama `main`, **122 commits**, sincronizada con `origin/main` (verificado con `fetch`: sin commits pendientes en ninguna dirección).
- Último commit: **`f3bff17` — 29/07/2026** ("Reorder frames and backgrounds by rank..."). **El proyecto está detenido desde hace ~2 meses.**
- Working tree limpio salvo la carpeta no rastreada `casefile vfinal/`.
- No hay README, ni tags, ni CI, ni estructura de ramas (todo se trabajó directo en `main`).
- No existe historial de ramas ni merges; los mensajes de commit son descriptivos y continuos (buen registro del desarrollo).

## 1.5 Variables de entorno requeridas (no hay `.env` en esta copia)

| Variable | Necesaria para | Sin ella |
|---|---|---|
| `STEAM_API_KEY` | Perfil, amigos, juegos, stats CS2, inventario | Perfil vacío, rutas 500 |
| `FACEIT_API_KEY` | Stats, sync, torneos, coach, perfiles | Excepción → rutas 500/404 |
| `GROQ_API_KEY` | Chat del Coach IA | 500 "API key no configurada" |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | BD remota | **Caída silenciosa a `data.db` local** (efímero en Vercel) |
| `BLOB_READ_WRITE_TOKEN` | Subida de demos en producción | Subida por Blob → 500 |
| `INVENTORY_API_URL` | Backend Render de inventario | Fallback a Steam directo (rate limits) |

⚠️ **No existe `.env.example` ni README que documente esto.** El estado real en producción fue verificado por HTTP (§9.2).

---

# 2. INVENTARIO DE FUNCIONALIDADES

Leyenda: ✅ implementada y funcional · 🟡 parcial · ❌ no implementada

| # | Funcionalidad | Qué hace / Archivos clave | Estado | Backend | Datos | Qué falta / problema |
|---|---|---|---|---|---|---|
| 1 | **Dashboard principal** | Saludo, métricas, sparklines, goal. `dashboard/page.tsx` | 🟡 | ✅ parcial | **Mezcla**: métricas reales de `stats-calculator` + **curvas sparkline hardcodeadas** (`page.tsx:12-17`) y meta "Ganar 3 partidas" muerta (`:123`) | Reemplazar curvas fake por datos reales; botón "Últimos 30 días" sin acción (`:66`) |
| 2 | **Perfil de usuario** | Página de perfil + settings/profile. `dashboard/profile`, `settings/profile` | 🟡 | ✅ | Reales (Steam/FACEIT) | **Guardar cambios solo envía `{bio, language}`** (`settings/profile/page.tsx:63,74`) — nombre/país/avatar no se persisten |
| 3 | **Login/Registro** | `login/page.tsx`, `register/page.tsx` | 🟡 | ✅ Steam | — | **Formularios email/password decorativos sin handler** (login `:407-437`, register `:163-215`); solo funciona "Continuar con Steam" (`login:372`) |
| 4 | **Integración Steam** | OpenID + `steam.service.ts` (perfil, amigos, juegos, CS2 stats) | ✅ | ✅ | **Reales** (verificado en prod: `/api/steam/test` → 200) | Login OpenID **sin verificar firma** (§8.1) |
| 5 | **Integración FACEIT** | `faceit.service.ts`, auto-link en login, `faceit/sync` | ✅ | ✅ | **Reales** (verificado en prod: `/api/faceit/player` → datos reales) | Rama `POST playerId` de sync **sin auth** (§8.6) |
| 6 | **Estadísticas CS2/FACEIT** | `stats/page.tsx`, `analytics`, `stats-calculator.ts` | 🟡 | ✅ | Reales (lifetime FACEIT) + **placeholders**: heatmap "No disponible — requiere CSStats" (`stats:44-45`), 4× "CSStats pronto" (`:422-434`) | Heatmap/precisión por arma; providers CSStats/Leetify/etc. son **stubs** (`providers.ts:5-68`, `isAvailable=false`) |
| 7 | **Coach IA (chat)** | Chat con contexto de stats FACEIT. `api/ai/chat`, `coach/page.tsx` | 🟡 | ⚠️ | Prompt con stats reales FACEIT (`chat:36-56`) | **ROTO EN PRODUCCIÓN: 502 desde Groq** (verificado §9.2); sin persistencia, sin rate limit; bug: partidas recientes salen como `map_id: "unknown"` (`chat:121-125` vs `:51`) |
| 8 | **"Análisis IA" de demo** | `api/ai/analyze` → `ai-engine.ts` | ❌ (engañosa) | ✅ | **Reglas if/else, NO usa IA**; **ignora la demo** (`matchStats` muerto, `ai-engine.ts:56`); KAST/rating inventados en 0 (`analyze:39-44`) | Conectar `matchStats` al motor o pasar todo a Groq; eliminar el label "Análisis IA" hasta que lo sea |
| 9 | **Análisis de demos (.dem)** | Subida → cs2parser → scoreboard + análisis. `demo-parser.ts`, `api/demo/*` | 🟡 | ✅ (parser carga en prod, verificado) | **Reales** (kills, ADR, HS%, utility, MVPs...) | **Solo `.dem`, sin `.zst`** (las demos de FACEIT no sirven); stats del **top-frag, no del usuario** (`demo-parser.ts:203-205`); KAST/clutches/aces sin calcular; **rutas sin auth**; sin `maxDuration` (corte Vercel); timeout 25s devuelve parciales sin aviso |
| 10 | **Ranking entre amigos** | `leaderboard/page.tsx` + tabla `player_follows` + búsqueda | ✅ | ✅ | **Reales** (verificado: leaderboard con usuarios y datos reales) | Los ajustes `showInRankings`/`publicProfile` **nunca se aplican** (§8.7) |
| 11 | **Logros** | `achievements/page.tsx` + tabla + `gamification.service` | 🟡 | ✅ | Definiciones reales en código; tabla `achievements` local = 0 filas (pocos usuarios probados) | Verificación en vivo limitada; sin quejas funcionales detectadas |
| 12 | **Desafíos (daily/weekly)** | `challenges/page.tsx`, tablas `daily_challenges`/`weekly_missions` | ✅ | ✅ | **Reales** (9+2 filas locales, progreso en prod) | Botón "Analizar demo · Próximamente" del sidebar muerto (`layout:308-312`) |
| 13 | **Sistema de shop** | `shop/page.tsx`, `shop_purchases`, buy/equip | 🟡 | ✅ | **Reales** (6 compras registradas) | Error de compra **silencioso** (`shop:246-249`); sin transacciones (carrera TOCTOU); ruta `chests` sin consumidor UI |
| 14 | **Marcos y personalización** | `public/frames`, `public/bg`, `cosmetic-frame/background.tsx`, `equipped_*` | ✅ | ✅ | **Reales** (últimos 6 commits de julio dedicados a esto) | Precio/progresión ligados a la economía explotable (§8.4) |
| 15 | **Inventario Steam** | `inventory/page.tsx` + providers + caché 30min | ✅ | ✅ | **Reales — verificado en producción: 200 OK, 33 items, resumen correcto** | Cae a `fetch_error` con SteamID inexistente (esperable); API Express auxiliar sin auth (§8.9) |
| 16 | **Overlay in-game** | `settings/overlay/page.tsx` (posición/opacidad/métricas) | ❌ | ✅ (solo guarda preferencias) | Solo **UI de configuración**; stats de preview **hardcodeadas** (`overlay:106-111`) | **No existe ningún runtime de overlay** (sin ventana, extensión ni proceso; grep sin resultados). Es una preferencia guardada sin consumidor |
| 17 | **Configuración de usuario** | 7 subpáginas settings | 🟡 | ✅ | Preferencias reales en `user_preferences` | **Seguridad simulada**: cambio de contraseña falso, 2FA local-only, sesiones/borrado de cuenta bloqueados, Google/Discord **placeholder sin OAuth** (`user/accounts:39-54`) |
| 18 | **Sistema de autenticación** | Steam OpenID + cookie | 🟡 | ✅ | — | **2 fallos críticos** (sin verificación + cookie forjable), ambos verificados (§8.1-8.2). Login CSRF por falta de `state` |
| 19 | **Base de datos** | 20 tablas, Turso/SQLite, init idempotente | ✅ | ✅ | Datos reales en prod | Sin sistema de migraciones versionado; errores del schema engullidos (`db-schema.ts:314-318`) |
| 20 | **APIs y endpoints** | 47 rutas | ✅ | ✅ | — | 11 rutas sin consumidor frontend (3 debug + 6 proxies + 2 sin uso); ver §4 |
| 21 | **Diseño responsive** | Landing + dashboard | 🟡 | n/a | — | Landing ✅ con breakpoints; **sidebar del dashboard sin breakpoints** (256px fijos en móvil, `dashboard/layout:196-201`); header sin wrap |
| 22 | **Torneos** | Crear/unirse/invitar/premios con stats FACEIT | 🟡 | ✅ | **Reales** (torneo completado de julio verificado en prod) | Unirse **sin comprobar saldo** infla el premio (§8.4); `leave` reembolsa sin participar |
| 23 | **Desafíos 1v1** | `match-challenge.service.ts` + resolución FACEIT | 🟡 | ✅ | Reales | Mismo problema de reembolsos; carreras en el bote |
| 24 | **Analytics / Matches / Utility** | Páginas del dashboard | 🟡 | ✅ | Mixtos | Utility **100% hardcodeado** (lineups con `uses: 847, rating: 4.8` inventados, `utility:62-184`); botones "Expandir/Guía" muertos |

**Funcionalidades NO encontradas:** no existe ninguna implementación de overlay in-game real, de OAuth con Google/Discord, de heatmap real, de planes de pago (Precios de la landing son mock), ni de newsletters. Todo lo demás existe en algún grado.

---

# 3. AUDITORÍA DEL FRONTEND

## 3.1 Fortalezas con evidencia
- **Sin enlaces rotos en navegación:** los 14 destinos del sidebar y las 6 subpáginas de settings existen (`dashboard/layout:41-74`).
- **Todos los `fetch()` del frontend tienen route handler** correspondiente (cotejo cruzado de los50 endpoints).
- **Mejores estados de la app:** inventario tiene skeleton (`InventoryLoading`), error con guía + retry (`InventoryError`) y vacío (`InventoryEmpty`).
- Landing responsive bien construida con breakpoints Tailwind; `rel="noopener noreferrer"` en externos; `globals.css` con patrón correcto de Tailwind 4.

## 3.2 Problemas detectados

| Problema | Evidencia | Gravedad |
|---|---|---|
| **Login y registro decorativos**: inputs sin estado, botones sin `onClick`, sin `<form>` | `login/page.tsx:407-437`; `register/page.tsx:163-215` | 🔴 ALTO |
| **Spinner permanente**: si FACEIT falla, `faceitStats=null` y páginas `if(!faceitStats)` quedan "Cargando…" para siempre | `user-context` (catch→null); `analytics:94-98`; `stats:244-248` | 🔴 ALTO |
| **Cero accesibilidad**: grep `aria-label\|role=\|sr-only\|htmlFor` = **0 resultados** en todo `src/` (verificado) | botones solo-icono, labels sin asociar | 🟠 MEDIO-ALTO |
| **Sin boundaries de error**: 0 `error.tsx`, `loading.tsx`, `not-found.tsx` (verificado) | glob `src/app/**` | 🟠 MEDIO |
| **Errores silenciosos**: `catch` vacíos en ambos contextos → el usuario nunca ve un fallo | `user-context.tsx`, `gamification-context.tsx` | 🟠 MEDIO |
| **Landing engañosa**: "150,000 jugadores", "100% Datos Reales" animados, testimonios y precios fabricados | `landing/cta:32`, `landing/stats:7-32`, `landing/testimonials`, `landing/pricing` | 🟠 MEDIO |
| **Dashboard con sparklines hardcodeadas** (`curves` — verificado) y meta muerta | `dashboard/page.tsx:12-17, :123` | 🟠 MEDIO |
| **Botones muertos**: buscador header sin handler, ⌘K decorativo (grep `keydown\|metaKey`=0), toggle grid/lista inventario no conectado a `InventoryGrid`, 👍/👎 coach, "Expandir/Guía" utility, "Ver Demo en Vivo" | `dashboard/layout:297-312`; `inventory/page:24,202,211`; `coach:758-763`; `utility:632,636`; `landing/cta:45-47` | 🟠 MEDIO |
| **16 enlaces `href="#"` en footer** + legales igual | `landing/footer.tsx:4-27,72-80`; `login:447,451` | 🟡 BAJO |
| **Sidebar no responsive** (sin breakpoints, sin hamburguesa) | `dashboard/layout:196-201` | 🟠 MEDIO |
| **Componentes gigantes**: coach 782, tournaments 664, utility 662, player 589 líneas | medición propia | 🟡 MEDIO |
| **Duplicación**: `ParticleField`/`FloatingOrbs`/`SteamIcon` idénticos en login y registro (~100 líneas); 8 handlers de challenges casi idénticos; 4 variantes de "stat card"; 3 anillos de progreso (1 sin usar) | `login:8-88` vs `register:8-59`; `tournaments:401-461` | 🟠 MEDIO |
| **`@keyframes` duplicados y conflictivos** (verificado): `gradient-shift` 200/1319, `pulse-glow` 210/1324, `grid-scroll` 596(anima background-position)/**1255(anima transform)** | `globals.css` | 🟠 MEDIO |
| **HTML inválido `<a><button>`** en hero/navbar/pricing/cta; 4 `<img>` sin `alt`; modales sin focus-trap/Escape/`role="dialog"`; sin `prefers-reduced-motion` (57 keyframes) | `landing/hero:68-77`, `tournaments:214,341` | 🟡 MEDIO |
| **Todo es `"use client"`** (26 archivos): cero SSR de datos, waterfalls de red, contenido vacío inicial | verificado | 🟠 MEDIO |
| `handleFollow` ignora `res.ok` → estado con `undefined` | `player/[steamId]/page.tsx:206-219` | 🟡 MEDIO |
| Compra y follow fallan sin notificación al usuario | `shop:246-249`; `player:216-218` | 🟡 MEDIO |

---

# 4. AUDITORÍA DEL BACKEND Y LAS APIs

**47 route handlers.** Mecanismo: cada ruta lee la cookie con `getSteamId()` (`src/lib/auth-helpers.ts:3-12`) que hace `JSON.parse` del cookie.

## 4.1 Cobertura de autenticación (resumen)

- **Con sesión:** toda `gamification/*` (16), `tournaments/*` (3), `player/follow`, `user/*` (3), `steam/{inventory,cs2stats,friends,games,recent}`, `ai/*`, `faceit/sync` (acciones connect/disconnect/GET).
- **Sin sesión (público por diseño o por omisión):** `faceit/{player,matches,match/id}`, `steam/player`, `steam/test`, `demo/{upload,upload-url,parse-from-blob,test}`, `debug/inventory` (solo cookie forjable), `player/[steamId]`, `players/search`, `tournaments` (GET), `gamification/leaderboard`.

## 4.2 Validación de datos y SQL

- **SQL Injection: NO encontrado.** Todas las consultas usan placeholders `?` con `args`; las8 interpolaciones con `${}` usan **whitelists cerradas** (`columnMap`, `fieldMap`, `allowedCategories`) o literales fijos (verificado `user/settings:58-95`, `gamification.service:1061-1112`).
- **XSS: NO encontrado.** Grep `dangerouslySetInnerHTML|innerHTML|eval` = 0 (verificado).
- Validación de entradas **irregular**: `steam/inventory` valida `^\d{17}$` ✅; en cambio `steam/player` acepta `steamId` libre, `tournaments` no numera `entryFee`, `ai/chat` no limita tamaño de mensaje.

## 4.3 Hallazgos por ruta (detalle completo en §8)

- **11 de 47 rutas sin consumidor frontend:** `faceit/{player,matches,match/id}`, `steam/{player,test}`, `demo/test`, `debug/inventory`, `gamification/{tips,chests,season-pass}`, `user/insights`.
- **Rutas debug en producción** (verificadas vivas): `/api/steam/test` → 200 público revelando estado de la key; `/api/demo/test`; `/api/debug/inventory` (devuelve los primeros 1000 chars de la respuesta de Steam).
- **Fuga de errores internos:** `leaderboard` devuelve `String(e)` con status **200**; `tournaments/*` y `demo/*` devuelven `e.message`.

## 4.4 Rendimiento

- **Cero rate limiting** en todo el código (grep `rateLimit|req.ip|x-forwarded-for` solo aparece el manejo reactivo del 429 de Steam).
- `faceit/sync` puede disparar **hasta 21 llamadas** a FACEIT por request.
- `ai/chat` consulta FACEIT **en cada mensaje sin caché**.
- `gamification-context` hace un **POST de escritura en cada montaje** (`profile`).
- **Efectos de escritura en GET:** `GET /api/tournaments*` ejecuta `autoEndExpiredTournaments()` que reparte premios — cualquiera puede dispararlo.
- Cachés bien resueltas donde existen: inventario 30min + dedupe + backoff (`inventory.service.ts`); buena práctica a destacar.

## 4.5 Integraciones Steam y FACEIT (lo pedido con énfasis)

| Tema | Estado | Evidencia |
|---|---|---|
| **Rate limiting / 429 de Steam** | Manejado **solo en inventario**: cooldown 10min por steamId, caché 30min, backoff con `Retry-After`, timeout 12-30s, User-Agent custom | `inventory.service.ts:21-47`, `providers/steam-inventory-provider.ts:341-357` |
| 429 en el resto de rutas Steam | **No manejado** | `steam.service.ts` sin caché/reintentos |
| Parseo de inventario | **Corregido** en esta copia (arrays planos de Steam, lookup map por classid+instanceid) | commits `351527d`, `3fbcfc0`, `9b8e897` |
| FACEIT API | Funciona (key en header Bearer, `encodeURIComponent`, sin caché ni rate limit) | `faceit.service.ts:151-170` |
| Vinculación FACEIT↔Steam | **Sí verificada** (`steam_id_64 === sesión`) en auto-link y connect-by-nickname ✅ | `faceit/sync:107-112,174-180` |
| Datos faltantes FACEIT | Errores absorbidos en `catch {}` vacíos → degradación silenciosa a "sin datos" | `chat:113-115`, `analyze:47-49` |
| Proveedores alternativos (Leetify, CSStats, HLTV, ScopeGG) | **Stubs muertos**: `isAvailable=false`, devuelven `null` | `services/providers.ts:5-68` |

---

# 5. BASE DE DATOS

**Motor:** libsql (SQLite compatible). `src/lib/db.ts:6-18`: si `TURSO_DATABASE_URL` existe → **Turso remoto**; si no → archivo local `data.db`. **No modifiqué la BD**; inspección en solo lectura con `@libsql/client`.

## 5.1 Esquema (20 tablas — verificado: el esquema de `db-schema.ts` coincide exactamente con la BD)

| Tabla | Contenido | Filas locales (data.db) |
|---|---|---|
| `player_profile` | Perfil Steam+gamificación+stats agregadas (40 columnas) | 1 |
| `achievements` | Logros por usuario | 0 |
| `daily_challenges` / `weekly_missions` | Desafíos con progreso | 9 / 2 |
| `shop_purchases` | Compras de cosméticos | 6 |
| `notifications`, `action_log` | Notificaciones y log de acciones (base del sistema XP) | 7 / 42 |
| `season_pass`, `chest_history` | Pase y cofres | 0 / 0 |
| `player_follows` | Seguimientos (ranking social) | 0 |
| `user_preferences` | bio/idioma/**overlay**/notificaciones/apariencia/privacidad (JSON) | 0 |
| `connected_accounts` | Cuentas vinculadas (Steam/Google/Discord) | 0 |
| `inventory_cache`, `inventory_fetch_state` | Caché de inventario + control de rate limit | 0 |
| `tournaments`, `tournament_participants`, `tournament_invites` | Torneos | 0 |
| `match_challenges`, `match_challenge_participants`, `match_challenge_invites` | Desafíos 1v1/5v5 | 1 |

- **Relaciones:** todas con `FOREIGN KEY → player_profile(steam_id)` + 22 índices declarados. Correcto.
- **`data.db` local = datos de desarrollo** (1 perfil). **Producción usa Turso** con datos reales (verificado por HTTP: leaderboard nivel 64, torneos de julio).

## 5.2 Problemas de BD

1. **Sin sistema de migraciones:** `initializeDatabase()` ejecuta todo el SQL partido por `;` y **engulle todos los errores** (`db-schema.ts:305-321`) — un error real de esquema es indistinguible de "ya existe". Los `ALTER TABLE` están mezclados con `CREATE` sin orden de versiones.
2. **Columnas que nunca se leen:** `privacy.publicProfile/showStats/showInRankings` se guardan pero **ningún endpoint las aplica** (grep: solo settings) — la privacidad es cosmética.
3. **Datos que dependen de features no terminadas:** `equipped_effect`/`equipped_color` existen en esquema y UI de tienda marcada "Vista previa — próximamente" (`shop:205`).
4. **Carreras (TOCTOU) en la economía:** descuentos sin transacción ni `WHERE pilot_coins >= ?` (`gamification.service:895-909`); posible saldo negativo o doble premio bajo concurrencia.
5. **Scripts sueltos:** `scripts/create-follows-table.ts` **hardcodea la URL de la instancia Turso** (sin credencial, pero identifica la BD — recomendable moverla a env); `scripts/fix.mjs` borra filas con DELETE directo sin backup.
6. Tablas sin datos locales no indican falta de uso: la BD real está en Turso (no tuve acceso a ella; **no verifiqué su contenido real más allá de lo expuesto por los endpoints públicos**).

---

# 6. AUDITORÍA DE LA INTELIGENCIA ARTIFICIAL (Coach IA)

## 6.1 Qué hay realmente (dos motores distintos)

| | Chat "Coach IA" | "Análisis IA" |
|---|---|---|
| Motor | **Groq** `llama-3.3-70b-versatile` (`api/ai/chat/route.ts:4-5,149-162`) | **Reglas if/else hardcodeadas** (`ai-engine.ts:54-215`) — **no hay LLM** |
| Archivos | `api/ai/chat/route.ts`, `coach/page.tsx` | `api/ai/analyze/route.ts`, `services/ai-engine.ts` |
| **Estado en producción** | ❌ **ROTO — 502 "Error al conectar con la IA"** (verificado; la key sí está seteada, si no sería 500) | ✅ Responde, pero ver 6.3 |

## 6.2 Construcción del prompt (chat)

- System prompt: rol "CS2Pilot Coach", español, markdown, máx. 300 palabras (`chat:22-34`).
- **Información del jugador SOLO de FACEIT** si hay `faceitPlayerId` en la cookie: K/D, Headshot%, Win Rate, ADR, Matches, "Mapas más jugados" + últimas 10 partidas (`chat:36-56`). Traído **en vivo por request, sin caché**.
- **Sin datos de Steam, sin datos de la demo, sin ELO/level/KAST.**
- Historial de conversación: los últimos 10 mensajes **enviados desde el cliente** (estado React).
- Parámetros: `max_tokens: 800, temperature 0.7`.
- **Bug verificado:** `recentMatches` no copia `map_id` (`chat:121-125`) pero el prompt lo lee (`:51`) → **siempre muestra "unknown"**.

## 6.3 ¿La IA analiza el rendimiento o responde preguntas generales?

- **El chat** sí recibe estadísticas reales y personaliza la respuesta — pero está caído en producción (§6.1).
- **El "Análisis IA" NO analiza nada con IA:** es scoring por umbrales con recomendaciones preescritas y un `trainingPlan` constante (`ai-engine:124-215`).
- **La demo no influye:** `analyzePlayer(lifetimeStats, matchStats)` recibe `matchStats` pero **nunca lo referencia** (única aparición en la declaración, `ai-engine.ts:56`). Además `analyze:39-44` inventa `kast:"0", rating:"0", deaths:"0", assists:"0"` → **toda persona recibe la debilidad falsa "KAST de 0%"** (`ai-engine:102,122,154`).
- La UI lo etiqueta "Análisis IA de esta demo" (`coach:542`) — **etiqueta engañosa**.

## 6.4 Historial, límites y errores

| Aspecto | Estado |
|---|---|
| Historial de conversaciones persistido | ❌ Solo `useState` (`coach:125`); no hay tabla de conversaciones; se pierde al recargar |
| Límites de uso / rate limit | ❌ **Cero** en `/api/ai/chat` (uso de Groq ilimitado por cookie) |
| "Cuota" económica | ⚠️ Cada mensaje otorga **50 XP + 5 monedas** vía `/api/gamification/sync` **antes de validar la respuesta** y sin tope (`coach:277-281`) → farmeo |
| Manejo de errores | Chat: genérico "Hubo un error…" (`coach:298`). Análisis: **`setAnalysis(null)` silencioso** (`coach:158-159`) |
| Sin API key | 500 controlado (`chat:80-82`) |
| Falta FACEIT | Degradación silenciosa a consejos genéricos (`chat:57-61`) |

## 6.5 Qué falta para recomendaciones personalizadas con stats + demos reales

1. **Arreglar Groq en producción** (causa exacta solo visible en logs de Vercel: key vencida, 429 o modelo dado de baja).
2. **Inyectar la demo en el prompt** (hoy imposible: el chat solo acepta `{message, history}`, `coach:268-272`).
3. **Asociar la demo al usuario** (hoy toma al top-frag, `demo-parser:203-205`) y **hacer que el motor consuma `matchStats`**.
4. Completar campos parseados hoy vacíos: KAST, clutches, aces, `rounds[].winner/length` (`demo-parser:138-140,227-231`).
5. Corregir mapeos FACEIT (`map_id`, claves `ADR`/`Map Win Rate % (Recent 9 Matches)` que caen a N/A).
6. Persistir conversaciones (tabla nueva) + rate limit/cuota por usuario.
7. Unificar los dos motores en una sola llamada LLM con FACEIT + demo + historial.

---

# 7. ANÁLISIS DE DEMOS DE CS2 Y FACEIT

## 7.1 Estado: **IMPLEMENTADO y conectado, con limitaciones importantes**

**Pipeline verificado en código (conectado de punta a punta):**

```
UI coach (page.tsx:198-227)
 ├─ local:  POST /api/demo/upload        → parseDemoFile() con cs2parser
 └─ prod:   POST /api/demo/upload-url    → Vercel Blob → POST /api/demo/parse-from-blob
        → scoreboard en pantalla (:173-190, 469-536)
        → POST /api/ai/analyze {demoData} → análisis mostrado (:538-565)
```

- **El parser funciona y carga en producción** (verificado: `/api/demo/test` → `hasDemoReader:true, hasEntityMode:true`).
- **Formatos: solo `.dem`** (`upload:15-17`, `accept=".dem"` en `coach:459`). **No existe soporte `.zst`/zstd en ningún archivo del proyecto** (grep = 0) — **las demos de FACEIT (`.zst`) no se pueden subir tal cual**.
- **Límites:** 100 MB (`upload:19-21`, `upload-url:21`), timeout interno de 25 s que **devuelve datos parciales marcados `truncated`** (`demo-parser:93-96`), **sin `maxDuration`** en ninguna ruta (grep=0) → riesgo de corte en Vercel.

## 7.2 Estadísticas extraídas (reales)

Kills, deaths, assists, headshot kills→HS%, damage→ADR, K/D, MVPs, score, utility damage, enemigos cegados, 3K/4K/5K, kills por arma (evento `player_death`), rondas totales, mapa, servidor, duración (`demo-parser:76-99,129-151,177-231`).

**Campos declarados pero vacíos (no implementados):** `clutchWins {}`, `aceRounds []`, `firstDeathRounds []`, `rounds[].winner=""` / `length:0`, **KAST no se calcula**, economía por ronda inexistente, posicionamiento/errores de ejecución **no existen**.

## 7.3 Problemas concretos

| Problema | Ubicación | Gravedad |
|---|---|---|
| **La demo no se asocia al usuario**: se muestra al que más mata, no al logueado | `demo-parser.ts:203-205` | 🔴 ALTO |
| **Rutas sin autenticación**: cualquiera sube/parsea 100MB/25s (DoS) y obtiene tokens de escritura en Blob | `api/demo/{upload,upload-url,parse-from-blob}/route.ts` | 🔴 ALTO |
| **SSRF**: `parse-from-blob` hace `fetch(blobUrl)` con URL arbitraria del cliente, sin allowlist | `parse-from-blob:6-18` | 🔴 ALTO |
| **Los resultados de la demo no llegan a la IA** (`matchStats` muerto) | `ai-engine.ts:56` | 🔴 ALTO |
| Sin `.zst` → el flujo FACEIT no sirve | grep en `src/` | 🟠 MEDIO |
| Sin `maxDuration`; timeout 25s devuelve parciales | rutas demo | 🟠 MEDIO |
| `demo-header-parser.ts` (284 líneas con snappyjs) **nunca importado** = código muerto | grep = 0 usos | 🔵 BAJO |
| Dependencias `demofile` y `@napi-rs/snappy` **nunca importadas** (verificado) | `package.json:13,17` | 🔵 BAJO |
| `casefile vfinal/` rompe el `tsc` del proyecto (149 errores ajenos) | verificado | 🟠 MEDIO |

---

# 8. SEGURIDAD

**No se encontraron:** secretos hardcodeados (grep `sk-|Bearer |AIza|ghp_` = 0), SQL injection, XSS, ni `dangerouslySetInnerHTML` (verificados). Los permisos de cookies tienen `httpOnly` y `SameSite=Lax`.

## 8.1 🔴 CRÍTICO — Login de Steam sin verificar con Steam
**Ubicación:** `src/app/api/auth/steam/callback/route.ts:11-23` (leído completo).
**Causa:** se confía en `openid.mode`/`openid.claimed_id` del query string **sin enviar `openid.mode=check_authentication` a Steam** (grep `check_authentication|openid.sig` en `src/` = 0). El regex acepta cualquier `claimed_id` terminado en `/id/<dígitos>`.
**Impacto:** `GET /api/auth/steam/callback?openid.mode=id_res&openid.claimed_id=https://steamcommunity.com/openid/id/<CUALQUIER_STEAMID>` emite sesión válida de cualquier usuario **y escribe en su BD** (crea perfil, sync, log). Suplantación total.
**Solución:** portar `verifyOpenIdResponse()` **que ya existe** en `B:\Vs Code\pilot fix\src\app\api\auth\steam\callback\route.ts:27-62`.
**Nota:** NO exploté esto en producción para no escribir datos de prueba en la BD real.

## 8.2 🔴 CRÍTICO — Cookie de sesión forjable (VERIFICADO EN PRODUCCIÓN)
**Ubicación:** `src/lib/auth-helpers.ts:3-12`; creación en `callback:63,83-89`.
**Causa:** la cookie es `JSON.stringify(perfil)` **sin firma (sin HMAC/JWT)**; `httpOnly` impide que JS la lea, no que el cliente fabrique la suya.
**Evidencia:** prueba en vivo contra `https://cs2pilot.vercel.app/api/auth/me` → **`200 {"user":{"steamId":"<falso>","name":"AUDITORIA_TEST_FALSO"}}`**.
**Impacto:** suplantación de cualquier usuario en las ~25 rutas que usan `getSteamId()`: leer/editar ajustes, inventario, seguir usuarios, crear torneos, gastar monedas, llamar a la IA.
**Solución:** firmar la cookie (HMAC con `SESSION_SECRET` o JWT con `jose`) y validar la firma en `getSteamId()`; migrar sesiones existentes.

## 8.3 🔴 CRÍTICO — Minteo ilimitado de XP/monedas
- `POST /api/gamification/sync` acepta `action` y `value` **sin validar** (leído: `sync/route.ts:9-19`): `{"action":"match_won","value":1000000}` → +25M XP/+10M monedas (`gamification.service:1030-1053`, sin tope en `addXP:207-229`). `stats` del cliente se escribe directo a `player_profile` → rankings falsificables.
- **Farmeo extra:** cada consulta al coach da 50 XP + 5 monedas (`coach:277-281`).

## 8.4 🔴 CRÍTICO — Economía explotable (reembolsos y entradas sin comprobar)
| Exploit | Ubicación | Mecanismo |
|---|---|---|
| `leaveChallenge` infinito | `match-challenge.service.ts:106-115` | `DELETE` sin comprobar filas + reembolso incondicional → monedas de la nada |
| `leaveTournament` infinito | `tournament.service.ts:204-219` | Mismo patrón con `entryFee` |
| Unirse a torneo sin saldo | `tournament.service.ts:142-157` | Entra (`INSERT OR IGNORE`) y suma `prize_pool` aunque el descuento afecte 0 filas |
| Cofres gratis sin límite | `gamification.service:672-686` | `chestType` sin whitelist: `daily` cuesta 0 y no hay tope diario (ruta `chests` sin UI, pero expuesta) |
| Carreras de compra | `gamification.service:895-909` | Sin transacción/`WHERE >=` |

**Solución:** transacciones libsql + comprobar `affectedRows` antes de reembolsar + whitelist de `chestType` + validar `value` numérico con tope.

## 8.5 🔴 CRÍTICO — Rutas de demos abiertas (SSRF + Blob anónimo + DoS)
`parse-from-blob:6-18` (URL arbitraria), `upload-url:3-28` (token de escritura sin sesión), `upload:6-26` (100MB sin auth). **Solución:** exigir sesión + allowlist `*.blob.vercel-storage.com` + rate limit.

## 8.6 🟠 ALTO — Otros
- **`faceit/sync` rama `playerId` sin auth** (`sync:77-82`) → proxy anónimo de hasta 21 llamadas FACEIT con nuestra key.
- **Endpoints debug públicos en producción** (verificado vivo: `/api/steam/test` → 200): `steam/test`, `demo/test`, `debug/inventory` (vuelca 1000 chars crudos de Steam).
- **Cero rate limiting global** (IA, Steam, FACEIT, uploads) — grep confirmado.
- **`inventory-api/server.js`:** CORS `*` (`:369-374`), sin auth, `/debug/inventory/:steamId` público (`:380-448`), sin rate limit por IP, Express `^4.18.2` **sin lockfile**.
- **Login CSRF:** `auth/steam` no genera `state`/nonce (`route:8-15`).
- **Ajustes de privacidad nunca aplicados** (`player/[steamId]`, `players/search`, `leaderboard` los ignoran).
- **`secure` condicional** a `request.url.startsWith("https://")` (`callback:64`) — sin `Secure` si el proxy no termina en HTTPS.

## 8.7 🟡 MEDIO
Fuga de `e.message`/`String(e)` al cliente (leaderboard con status 200); `/api/player/[steamId]` expone `pilot_coins`+`action_log` de cualquiera sin sesión; conexiones Google/Discord simuladas (`user/accounts:39-54`); URL de instancia Turso hardcodeada en `scripts/create-follows-table.ts:5`; GET con efectos de escritura (`autoEndExpiredTournaments`); PII (steamId) en logs de inventario; sin `README`/`.env.example` para operación segura.

## 8.8 Dependencias
No ejecuté `npm audit` (requiere red/instalación — no realizado por regla de auditoría). Perfiles a vigilar: `demofile` y `cs2parser` parsean binarios externos (superficie de explotación si se suben demos ajenas), rangos `^` sin pin, `express@^4.18.2` sin lockfile.

---

# 9. ESTADO DEL DESPLIEGUE

## 9.1 Configuración encontrada
- **No hay** `vercel.json`, `render.yaml`, Dockerfile, `.github/`, ni scripts de deploy en `package.json` (solo `dev/build/start/lint`).
- Evidencia de Vercel: `.gitignore` (`.vercel`), `@vercel/blob` en deps, mensajes de código ("Configurá BLOB_READ_WRITE_TOKEN en Vercel Dashboard"), y el repo en GitHub indica **`cs2pilot.vercel.app`** en el About.
- `inventory-api/` apunta a **Render** (`process.env.PORT`, provider `render-inventory-provider`), pero **no encontré `onrender.com` ni `render.yaml`** — su estado es **desconocido**.

## 9.2 Verificación en vivo de producción (04/11/2026, solo GET/lectura)

| Prueba | Resultado | Conclusión |
|---|---|---|
| `GET /` | ✅ 200 landing completa | **Sitio vivo** |
| `GET /dashboard` | ✅ 200 HTML | App sirve |
| `GET /api/auth/me` sin cookie | ✅ 401 | Correcto |
| `GET /api/auth/me` con **cookie forjada** | 🔴 **200 con el usuario falso** | **Suplantación confirmada en prod (§8.2)** |
| `GET /api/steam/test` | ⚠️ 200 `hasPlayers:true` | `STEAM_API_KEY` ✅ configurada **y endpoint debug expuesto** |
| `GET /api/demo/test` | ✅ 200 parser cargado | cs2parser opera en prod |
| `GET /api/gamification/leaderboard` | ✅ 200 usuarios reales | **BD (Turso) conectada con datos reales** |
| `GET /api/players/search?q=a` | ✅ 200 datos reales | Ídem |
| `GET /api/tournaments` | ✅ 200 torneo real de julio completado | Economía con uso real |
| `GET /api/faceit/player?nickname=draken` | ✅ 200 datos reales (nivel/ELO) | `FACEIT_API_KEY` ✅ funciona (y **ruta sin auth**) |
| `POST /api/ai/chat` (1 mensaje mínimo) | 🔴 **502 "Error al conectar con la IA"** | `GROQ_API_KEY` presente (si no sería 500) pero **Groq rechaza → Coach IA CAÍDO** |
| `GET /api/steam/inventory` (usuario real público) | ✅ 200, 33 items + resumen | **Inventario Steam funciona en prod** |
| `GET /api/auth/steam` | ✅ redirige a steamcommunity | Login Steam accesible |

**Variables inferidas en producción:** `STEAM_API_KEY` ✅ · `FACEIT_API_KEY` ✅ · `GROQ_API_KEY` ✅ (pero con llamadas fallidas) · `TURSO_*` ✅ (datos persistentes reales). **Sin verificar:** `BLOB_READ_WRITE_TOKEN` e `INVENTORY_API_URL` (no probé la subida de una demo por ser una operación de escritura).

**No puedo verificar** (sin acceso): logs de Vercel (causa exacta del 502 de Groq), estado del servicio Render, contenido completo de la BD Turso, configuración de dominios/seguridad del propio Vercel.

---

# 10. CALIDAD DEL CÓDIGO

## 10.1 Comandos ejecutados y resultados

| Comando | Resultado |
|---|---|
| `tsc --noEmit` (TypeScript strict) | 🔴 **149 errores, TODOS en `casefile vfinal/`** (carpeta ajena sin rastrear). **0 errores en `src/`** ✅ |
| `npm run lint` (`eslint`) | 🔴 **Falla**: no existe `eslint.config.(js|mjs|cjs)` (ESLint 9 lo exige) — **el lint está roto** |
| Inspección BD (solo lectura, `@libsql/client`) | ✅ 20 tablas = esquema; conteos obtenidos |
| `git status/log/fetch` | ✅ árbol limpio, main = origin/main, 122 commits |
| Pruebas HTTP de producción | ✅ §9.2 |
| `next build` | ⛔ **NO ejecutado** (escribiría en `.next/` — prohibido en modo auditoría). **El build de producción no está verificado en esta copia** |
| `npm audit` / instalaciones | ⛔ No ejecutados por regla |

## 10.2 Evaluación

**Fortalezas:** TypeScript estricto y **limpio en `src/`**, estructura de servicios consistente, SQL parametrizado, manejo de errores de inventario maduro (caché/dedupe/backoff), separación de componentes de inventario, `tsconfig` con alias `@/*`.

**Debilidades:**
- **Lint roto** (falta `eslint.config.mjs`) → cero reglas estáticas en CI/local.
- **`casefile vfinal/` contamina el typecheck** (el `include: **/*.ts` de `tsconfig.json` lo atrapa) — un `tsc` en CI fallaría siempre.
- **Código muerto:** `demo-header-parser.ts` (284 L), deps `demofile` + `@napi-rs/snappy`, componentes `ProgressRing` y `ParticleBackground` (0 imports).
- **Archivos monolíticos:** `gamification.service.ts` 1.138 líneas; 4 páginas >650 líneas.
- **Duplicación** (login/registro, 8 handlers de challenges, stat cards, keyframes conflictivos) — §3.2.
- **Sin tests unitarios ni de integración** (no existe carpeta `__tests__` ni config de testing).
- **Sin README, sin `.env.example`, sin CHANGELOG** en esta copia (el CHANGELOG de auditoría quedó en `pilot fix`).
- TODO/FIXME literales: casi inexistentes; la deuda está más en "Próximamente" y features placeholder (§2).
- **Código huérfano de backend:** 11 rutas API sin consumidor (§4.3).

---

# 11. INFORME FINAL

## A. Resumen ejecutivo

CS2Pilot es una plataforma **ambiciosa y en gran medida construida**: ~17.000 líneas de TypeScript con 25 páginas, 47 endpoints, 20 tablas de BD, integraciones reales con Steam, FACEIT y una base de usuarios con datos reales en producción. El sitio está **desplegado y operativo en `cs2pilot.vercel.app`**, y funciones importantes —inventario de Steam, rankings, torneos, FACEIT— **funcionan verificablemente en vivo**.

Sin embargo, el proyecto tiene **fallos críticos de autenticación verificados en producción** (login de Steam sin verificar + cookie forjable → cualquier persona puede operar como cualquier usuario), una **economía interna explotable** (minteo de monedas/XP), **rutas de subida de demos abiertas con SSRF**, y el **Coach IA caído en producción** (Groq devuelve error). A esto se suma que varias interfaces son "de vitrina": formularios de login/registro decorativos, un "Análisis IA" que no usa IA ni la demo, un overlay que solo guarda preferencias y landing con métricas inventadas.

**Estado: parcialmente funcional y en recuperación.** La base es sólida; lo que falta es cerrar la seguridad, reconectar la IA y terminar lo que la UI promete.

## B. Estado del proyecto (0-100)

| Área | Puntuación | Justificación (evidencia) |
|---|---|---|
| **Frontend** | **55** | 25 páginas completas, navegación sin rotos, buenos estados en inventario; pero login/registro decorativos, spinner infinito si falla FACEIT, 0 atributos ARIA, sin error boundaries, sidebar no móvil, datos fake en landing/dashboard |
| **Backend** | **38** | 47 rutas funcionales, SQL parametrizado y whitelist; pero auth forjable (§8.2), economía explotable, rutas abiertas, sin rate limits, rutas debug en prod |
| **Base de datos** | **68** | Esquema completo, 20 tablas, índices/FK correctos, datos reales en prod; pero sin migraciones versionadas, errores engullidos, privacidad no aplicada, carreras en transacciones |
| **Integraciones** | **62** | Steam ✅ y FACEIT ✅ verificadas en vivo; Turso ✅; Groq ❌ (caído); Blob/Render sin verificar; providers CSStats/Leetify/etc. = stubs |
| **Coach IA** | **28** | Chat caído en prod (502); "Análisis" es rules-engine sin LLM; demo no llega a la IA; sin persistencia ni límites. El prompt con stats FACEIT está bien construido |
| **Análisis de demos** | **45** | Pipeline real conectado y parser cargando en prod; pero sin `.zst`, stats del top-frag no del usuario, campos clave sin calcular, rutas sin auth, resultados no usados por IA |
| **Seguridad** | **22** | Sin SQLi/XSS/secretos (positivo), pero: 2 fallos críticos de sesión verificados en vivo, minteo de economía, SSRF, endpoints debug públicos, CORS `*` en API auxiliar, sin rate limiting |
| **Despliegue** | **58** | **Producción viva en Vercel** con BD real; pero sin configs declarativas, sin README/.env.example, sin CI, Render sin verificar, Groq mal configurado |
| **Calidad del código** | **48** | TS estricto y limpio en `src/`; pero lint roto, typecheck contaminado, archivos de 700-1.100 líneas, duplicaciones, código muerto, 0 tests |
| **GLOBAL** | **≈ 45/100** | Promedio ponderado: producto funcional con deuda crítica en seguridad y coherencia |

*Las puntuaciones de Frontend/Integraciones/Despliegue están respaldadas por pruebas en vivo; las de Seguridad, Backend y Coach IA por inspección de código + prueba `/api/ai/chat`. La global es provisional porque no pude ejecutar `next build` ni revisar logs de Vercel.*

## C. Funcionalidades — estado resumido

| Funcionalidad | Estado | Falta para terminarla |
|---|---|---|
| Dashboard | 🟡 | Datos reales en sparklines, meta activa |
| Perfil | 🟡 | Persistir nombre/país/avatar |
| Login/Registro | 🟡 | O email/password real, o eliminar el formulario (solo Steam) |
| Steam | ✅ | — |
| FACEIT | ✅ | Auth en rama `playerId` de sync |
| Estadísticas CS2 | 🟡 | Heatmap/precisión (providers reales o quitar "pronto") |
| Coach IA (chat) | 🔴 | **Restaurar Groq en prod**, persistencia, rate limit, `map_id` |
| Análisis "IA" de demo | 🔴 | Hacerlo IA de verdad o renombrar; usar `matchStats` |
| Demos (.dem) | 🟡 | Asociar al usuario, `.zst`, KAST/clutches, auth, `maxDuration` |
| Ranking de amigos | ✅ (con 🟡) | Aplicar ajustes de privacidad |
| Logros | ✅ | — |
| Desafíos | ✅ | — |
| Shop | 🟡 | Feedback de error, transacciones |
| Marcos/personalización | ✅ | — |
| Inventario Steam | ✅ | — |
| Overlay in-game | 🔴 | **Implementar el runtime** (hoy solo guarda preferencias) |
| Configuración | 🟡 | Reemplazar seguridad simulada o quitarla |
| Autenticación | 🔴 | Verificar OpenID + firmar cookie |
| Base de datos | ✅ (con 🟡) | Migraciones versionadas |
| APIs | ✅ (con 🟡) | Limpiar 11 rutas huérfanas/debug |
| Responsive | 🟡 | Sidebar móvil |
| Torneos / Desafíos 1v1 | 🟡 | Reglas de saldo atómicas |

## D. Problemas encontrados (priorizados)

### 🔴 CRÍTICOS

| # | Problema | Ubicación | Causa probable | Impacto | Solución recomendada |
|---|---|---|---|---|---|
| C1 | Login Steam sin verificar firma | `api/auth/steam/callback/route.ts:11-23` | Se implementó el flujo OpenID a medias (solo lectura de params) | Suplantación de cualquier SteamID + escritura en BD | Portar `verifyOpenIdResponse()` de `pilot fix:27-62` |
| C2 | Cookie de sesión sin firmar (**verificado en prod**) | `lib/auth-helpers.ts:3-12`, `callback:63` | Se usó JSON directo pensando que `httpOnly` protegía | Suplantación total de usuarios en ~25 rutas | HMAC/JWT con `SESSION_SECRET` + validación en `getSteamId()` |
| C3 | Minteo de XP/monedas sin validar (`value`, `stats`) | `api/gamification/sync:9-19`, `gamification.service:1030-1053` | Endpoint de conveniencia confiado al cliente | Economía y rankings falsificables | Validar `value` (entero, tope), server-side solo |
| C4 | Reembolsos/entradas sin comprobar pertenencia (x3) + cofres sin whitelist | `match-challenge.service:106-115`, `tournament.service:142-157,204-219`, `gamification.service:672-686` | Falta comprobar `affectedRows` | Monedas de la nada, premios inflados | Transacciones + `affectedRows>0` + whitelist |
| C5 | Rutas de demo abiertas: SSRF + token Blob anónimo + DoS 100MB | `api/demo/{parse-from-blob,upload-url,upload}` | Rutas escritas sin pasar por `getSteamId()` | Acceso interno al servidor, abuso de Blob/CPU | Exigir sesión + allowlist de dominios |

### 🟠 ALTOS

| # | Problema | Ubicación | Causa probable | Impacto | Solución |
|---|---|---|---|---|---|
| A1 | **Coach IA caído en producción (502)** | `api/ai/chat:164-170` + config Vercel | Key vencida/inválida, 429 o modelo `llama-3.3-70b-versatile` dado de baja (causa exacta en logs de Vercel, no accesibles) | Feature insignia inoperativa | Revisar logs, renovar key/modelo, alerta |
| A2 | "Análisis IA" sin IA y que ignora la demo | `ai-engine.ts:56`, `api/ai/analyze:39-44` | Motor de reglas quedó como placeholder y nunca se reemplazó | Decepción del usuario + KAST 0% fijo para todos | Conectar a Groq con FACEIT+demo |
| A3 | Demo asociada al top-frag, no al usuario | `demo-parser.ts:203-205` | Lógica "primer jugador" pre-auditoría (corregida solo en `pilot fix`) | Stats de otro jugador mostradas como propias | Filtrar por `steamId` de sesión (cambio ya escrito en `pilot fix`) |
| A4 | Endpoints debug en producción | `steam/test`, `demo/test`, `debug/inventory` | Se dejaron de diagnóstico y nunca se retiraron | Enumeración de keys/estado del entorno | Borrar o guardar tras `NODE_ENV` |
| A5 | Sin rate limiting global | todo `src/` | Nunca se implementó capa | Abuso de Groq/Steam/FACEIT/Blob | Limiter por IP+sesión en route handlers |
| A6 | `faceit/sync` rama `playerId` sin auth | `faceit/sync:77-82` | Rama añadida sin pasar por `parseUserCookie` | Quemar cuota FACEIT anónimamente | Exigir sesión |
| A7 | Login/registro email-password decorativos | `login:407-437`, `register:163-215` | UI diseñada antes de decidir la auth (solo Steam) | Usuario cree que puede registrarse con email | Implementar o eliminar el formulario |
| A8 | Spinner infinito cuando FACEIT falla | `user-context` catch→null; `analytics:94`, `stats:244` | No hay estado de error, solo `null` | Páginas inutilizadas sin aviso | Estado `error` + reintento |
| A9 | `inventory-api` sin auth + CORS `*` + `/debug` público | `inventory-api/server.js:369-448` | Servicio auxiliar pensado interno | Proxy de scraping anónimo de Steam | Header secreto + CORS restringido |
| A10 | Ajustes de privacidad nunca aplicados | `user/settings:23,87` vs `player/[steamId]`, `players/search`, `leaderboard` | Columnas creadas sin consumidor | Usuario cree ocultar datos cuando no los oculta | Aplicar los flags en los 3 lectores |
| A11 | Cero accesibilidad (0 `aria`/`htmlFor`) | todo `src/` (verificado) | Nunca se consideró a11y | Inusable con lector de pantalla | Labels + `aria-label` en botones de icono |

### 🟡 MEDIOS (síntesis)

`GROQ sin rate limit` · `sin error.tsx/loading.tsx/not-found.tsx` · `errores internos al cliente (String(e) con status 200 en leaderboard)` · `landing con métricas/testimonios/precios inventados` · `sparklines hardcodeadas del dashboard` · `utility 100% hardcodeado (lineups con rating/uses fake)` · `conexiones Google/Discord placeholder` · `sidebar no responsive` · `keyframes duplicados conflictivos (globals.css 200/1319, 596/1255)` · `duplicación login/registro y 8 handlers de challenges` · `GET con efectos de escritura (autoEnd)` · `carreras TOCTOU en compras` · `casefile vfinal/ rompe tsc` · `lint roto (sin eslint.config)` · `sin README/.env.example` · `URL Turso hardcodeada en scripts` · `handleFollow ignora res.ok` · `map_id "unknown" en prompt` · `XP por consulta IA antes de validar` · `11 rutas API huérfanas` · `profile save solo bio/language` · `compra/follow sin feedback de error`

### 🔵 BAJOS

`Componentes sin usar (ProgressRing, ParticleBackground)` · `demo-header-parser.ts muerto (284 L)` · `deps demofile/@napi-rs/snappy sin usar` · `16 enlaces href="#" del footer` · `4 img sin alt` · `anidamiento <a><button>` · `sin prefers-reduced-motion` · `modales sin focus-trap` · `PII en logs` · `LIKE con wildcards sin escapar` · `express sin lockfile` · `estilos glass duplicados`

## E. Funcionalidades incompletas

1. **Overlay in-game:** solo existe la UI de configuración; no hay ningún componente que muestre el overlay.
2. **"Análisis IA de demo":** no usa IA ni los datos de la demo (`matchStats` muerto); KAST/Rating inventados.
3. **Chat del Coach:** caído en producción; sin historial persistente ni límites; partidas recientes mal mapeadas.
4. **Registro/login por email:** formulario sin funcionalidad.
5. **Seguridad de la cuenta en Settings:** cambio de contraseña, 2FA, sesiones y borrado = simulados.
6. **Cuentas Google/Discord:** filas placeholder sin OAuth.
7. **Heatmap y precisión por arma:** marcados "pronto"; providers externos (CSStats, Leetify, HLTV, ScopeGG) = stubs `isAvailable=false`.
8. **Utility/lineups:** datos hardcodeados con métricas ficticias; botones "Expandir/Guía" muertos.
9. **Privacidad del perfil:** preferencias guardadas que nadie lee.
10. **Demos `.zst` (formato FACEIT):** no soportadas.
11. **Campos de demo:** KAST, clutches, aces, primeras muertes, economía por ronda, rondas con ganador — sin implementar.
12. **Precios/planes de la landing:** mock sin backend ni pagos.
13. **Newsletter, footer, enlaces legales:** sin destino.
14. **Búsqueda/⌘K del header y toggle de vista del inventario:** sin conexión.
15. **Botón "Analizar demo · Próximamente"** del sidebar: muerto (aunque la función ya existe en `/dashboard/coach`).

## F. Riesgos técnicos

1. **Seguridad (crítico):** con la cookie forjable, un atacante puede consumir monedas, alterar rankings y leer ajustes de usuarios reales — la BD de producción tiene usuarios activos.
2. **Abuso económico de APIs:** sin rate limit, Groq/Steam/FACEIT pueden agotar cuotas o generar factura; el 502 actual sugiere que la cuota/key de Groq ya tiene problemas.
3. **SSRF/DoS** por rutas de demo abiertas contra el runtime de Vercel.
4. **Pérdida de datos:** si se desconfigura Turso, `db.ts` cae **silenciosamente** a `data.db` local efímero → pérdida aparente de datos sin alerta.
5. **Vercel timeouts:** parseo de demos de hasta 25 s sin `maxDuration` → cortes misteriosos.
6. **Deriva entre copias:** `pilot fix` tiene correcciones que `Cs2` no; el trabajo futuro puede partir de la copia equivocada y perder arreglos.
7. **Deuda de mantenimiento:** archivos de 1.100+ líneas, duplicaciones, lint roto y 0 tests → regresiones fáciles al retomar.
8. **Dependencias frágiles:** `cs2parser` (opaca, externa al bundle), módulos nativos, Express sin lockfile, sin `npm audit` ejecutado.
9. **Continuidad del equipo:** todo en `main` sin PRs/CI; `casefile vfinal/` (proyecto ajeno) dentro del repo.
10. **Cumplimiento/engaño:** landing con cifras y testimonios falsos + "Análisis IA" que no es IA → riesgo reputacional si se difunde.

## G. Próximos pasos (roadmap)

### 1. Correcciones críticas (días)
1. **Firmar la cookie de sesión** y validarla en `getSteamId()` (C2) — prerequisite de todo lo demás.
2. **Verificar OpenID con Steam** portando `verifyOpenIdResponse()` de `pilot fix` (C1).
3. **Cerrar rutas de demo**: sesión + allowlist de dominio en `parse-from-blob` (C5).
4. **Validar `value`/`stats` en `/api/gamification/sync`** con topes server-side (C3).
5. **Reembolsos atómicos**: comprobar `affectedRows` + transacciones + whitelist de cofres (C4).
6. **Restaurar el Coach IA**: revisar logs de Vercel, renovar `GROQ_API_KEY`/modelo (A1).
7. **Retirar rutas debug** (`steam/test`, `demo/test`, `debug/inventory`) (A4).
8. Exigir sesión en `faceit/sync` (rama `playerId`) y en `/api/steam/player` (A6).

### 2. Recuperación de funcionalidades (semanas 1-2)
9. Asociar demos al SteamID del usuario (portar fix de `pilot fix`) y **usar `matchStats`** en el análisis (A2, A3).
10. Estados de error + reintento en contextos (fin del spinner infinito) (A8).
11. Decidir el destino del login/registro email (implementar o quitar) (A7).
12. Aplicar los ajustes de privacidad en los 3 endpoints (A10).
13. Feedback de errores en compra/follow y persistir perfil completo.
14. `.env.example` + README de arranque + `eslint.config.mjs`.

### 3. Mejoras de arquitectura (semanas 2-4)
15. Migraciones de BD versionadas (dejar de engullir errores en `db-schema`).
16. Rate limiting global (IA, uploads, Steam/FACEIT).
17. Transacciones en toda la economía.
18. Borrar `casefile vfinal/` del árbol de compilación (o moverlo) y limpiar código muerto/deps sin usar.
19. Segredo compartido + CORS restringido en `inventory-api`; pin de Express con lockfile.
20. Introducir tests mínimos (parser de demo, economía, auth) y CI con `tsc + lint + build`.

### 4. Mejoras de experiencia de usuario (semanas 3-5)
21. Sidebar responsive + `error.tsx`/`not-found.tsx`.
22. Accesibilidad: `aria-label`, `htmlFor`, focus-trap en modales, `prefers-reduced-motion`.
23. Reemplazar datos hardcodeados (sparklines, utility, landing) por reales o quitarlos.
24. Conectar buscador/⌘K, toggle de inventario y botones muertos; reducir duplicación login/registro.
25. Arreglar `map_id "unknown"` y unificar `@keyframes`.

### 5. Nuevas funcionalidades (mes 2+)
26. **Overlay real** (o retirar la preferencia).
27. **Chat con la demo inyectada** + persistencia de conversaciones + cuota por usuario.
28. Soporte `.zst` (zstd) para demos de FACEIT.
29. KAST/clutches/aces/economía en el parser; heatmap y providers reales (CSStats/Leetify).
30. Planes de pago reales (o eliminar la sección de precios).

## H. Plan de trabajo por etapas

**Etapa 0 — Asegurar (obligatoria antes de nada):** tareas 1-8. *Por qué primero:* con usuarios reales en producción y la sesión forjable, cualquier otra mejora se construye sobre arena; además, restaurar el chat devuelve la feature insignia.
**Etapa 1 — Reconectar:** tareas 9-14. *Por qué:* son las funciones que el usuario percibe rotas (demo→IA, spinner, privacidad) y algunas tienen el código ya escrito en `pilot fix` (bajo esfuerzo, alto retorno).
**Etapa 2 — Endurecer:** tareas 15-20. *Por qué:* sin migraciones, tests ni lint, cada Etapa 1 puede romper algo sin detectarse.
**Etapa 3 — Pulir:** tareas 21-25. *Por qué:* después de que el producto diga la verdad (datos reales, sin promesas fake), el pullo de UX consolida.
**Etapa 4 — Crecer:** tareas 26-30. Solo con las etapas previas: el overlay y el IA con demos dependen de una sesión segura y de una BD con migraciones.

**Fusión explícita pendiente:** portar de `B:\Vs Code\pilot fix` → `Cs2`: `verifyOpenIdResponse()` en el callback, la exigencia de sesión en `api/demo/upload`, el filtrado por SteamID en `demo-parser.ts` y la estructura `steam-inventory.service.ts` (evaluar si el provider actual de `Cs2` ya cubre esto — la arquitectura difiere y hay que fusionar con cuidado, no sobrescribir).

## I. Conclusión

**CS2Pilot está en estado "parcialmente funcional y en recuperación"** — ni buen estado con mejoras, ni reconstrucción total.

**Por qué no es una reconstrucción:** el 100% de las rutas tienen frontend, TypeScript estricto pasa sin errores en `src/`, la BD está coherente, las integraciones core (Steam, FACEIT, Turso) funcionan **verificadas en vivo**, el inventario —la feature más difícil— opera en producción con datos reales, y hay 122 commits de historia ordenada. El esqueleto funciona.

**Por qué no está en buen estado:** la autenticación es esencialmente inexistente (los dos fallos verificados en producción permiten suplantación total), la economía interna se puede fabricar monedas de la nada, el Coach IA está caído, el "Análisis IA" no analiza nada, y hay al menos una decena de interfaces que prometen cosas que no existen (registro email, overlay, heatmap, planes). Sin correcciones, cualquier usuario malintencionado puede distorsionar la plataforma de todos.

**En una frase:** CS2Pilot es un 70% de producto bien construido con un 30% de capa de confianza y honestidad rota; la recuperación es eminentemente viable, y el camino más corto es fusionar las correcciones ya escritas en `pilot fix`, cerrar la seguridad y restaurar Groq.

---

## Anexo — Limitaciones de esta auditoría

- **No se modificó ningún archivo** del proyecto; solo se creó este informe.
- **No se ejecutó `next build`** (escribiría en `.next/`), **no se instaló nada**, **no se corrieron migraciones**, **no se ejecutó `npm audit`**.
- **No accedí a:** logs de Vercel (causa exacta del error de Groq), BD Turso directamente (solo la expuesta por endpoints), Render, ni panel de Vercel.
- **UI no ejecutada en navegador:** el frontend se auditió por lectura de código + endpoints; no se hicieron clics en la app (no había navegador disponible en esta sesión). Los "botones muertos" se concluyeron por ausencia de handlers en el código.
- **Pruebas de producción** limitadas a GET/lectura y un POST mínimo de chat; **no se explotó la vulnerabilidad OpenID en producción** para no escribir datos de prueba en la BD real.
- Copias existentes en el equipo: las correcciones de `pilot fix` fueron **verificadas por lectura**, no ejecutadas.

---

# 12. INFORME DE IMPLEMENTACIÓN — FASES 1, 2 Y 3

**Fecha:** 05 de noviembre de 2026  
**Objetivo:** recuperar funcionalidad crítica y endurecer la seguridad de CS2Pilot (`B:\Vs Code\Cs2`).  
**Estado del árbol de Git:** cambios sin commitear sobre `main` (commit base `f3bff17`). Ningún archivo ajeno (`casefile vfinal/`) fue modificado.

## 12.1 Resumen de cambios

Se aplicaron las correcciones de la FASE 1 (seguridad crítica), FASE 2 (recuperación de funcionalidades) y parte de la FASE 3 (calidad/verificación). No se hizo deploy a producción ni se expusieron claves API.

### FASE 1 — Seguridad crítica

**1. Autenticación de Steam (OpenID verificado).**
- `src/app/api/auth/steam/callback/route.ts` reescrito: ahora llama a `verifyOpenIdResponse()` que hace POST `check_authentication` a `https://steamcommunity.com/openid/login` con timeout de 10s y valida `/is_valid\s*:\s*true/`.
- Valida `openid.mode=id_res`, `openid.op_endpoint` (debe ser Steam), `openid.return_to` (origen+pathname deben coincidir con el callback), y `openid.response_nonce` dentro de ±10 min.
- Valida `claimed_id` con regex estricta `^https://steamcommunity\.com\/openid\/id\/(\d{17})$` y SteamID64 `^7656119\d{10}$`.
- Antes: el callback confiaba ciegamente en los query params GET (falsificables por el navegador), permitiendo suplantar cualquier SteamID.

**2. Sesiones firmadas criptográficamente.**
- Nuevo `src/lib/session.ts`: token estado-less HMAC-SHA256 en la misma cookie `cs2pilot_user` (httpOnly, Secure en prod, SameSite=lax, 30 días). Payload comprimido con `deflateRawSync` + base64url para quedar bajo el límite de ~4KB de cookie.
- `SESSION_SECRET` obligatorio en producción (fail-closed, ≥32 chars). En dev, secreto temporal por proceso vía `globalThis` con advertencia.
- `src/lib/auth-helpers.ts`: `getSteamId()`/`getSessionProfile()` ahora verifican la firma (antes hacían `JSON.parse` ciego de la cookie).
- Actualizada **toda** lectura/escritura de la cookie: `auth/me`, `auth/logout`, `faceit/sync` (4 escrituras), `steam/{recent,games,friends,cs2stats,inventory}`, `user/{settings,accounts,insights}`, `ai/{chat,analyze}`, `tournaments/challenges`, `gamification/profile`, `debug/inventory`.
- Verificado con grep: **cero** lecturas `JSON.parse(cookie.value)` o `cookies.get("cs2pilot_user")` fuera de `session.ts`.
- Nota: el formato de la cookie cambió; las sesiones antiguas sin firma se rechazan y el usuario debe volver a loguear (esperado, no es un bug).

**3. Protección de APIs.**
- Nuevo `src/lib/rate-limit.ts`: limitador en memoria sliding-window por clave (usuario + IP), documentada la limitación serverless (per-instance).
- Rate limiting aplicado a: `gamification/sync`, `ai/chat`, `faceit/sync` (GET y POST), `demo/{upload,upload-url,parse-from-blob}`, `challenges` (todas las acciones), `steam/player`, `faceit/{player,matches,match/id}`, `players/search`.
- `/api/gamification/sync`: whitelist de acciones permitidas, `value` entero capado 1–100, `stats` sanificado (rangos por campo, `movies` ≤30).
- Rutas de debug (`/api/steam/test`, `/api/demo/test`, `/api/debug/inventory`) devuelven **404 en producción**.
- Validación de parámetros en rutas públicas que consumen API keys del proyecto (steam/player, faceit/*), evitando abuso de cuota.

**4. Economía y gamificación (operaciones atómicas).**
- `gamification.service.ts`:
  - `openChest`: whitelist de tipos de cofre (rechaza desconocidos), débito condicional atómico (`pilot_coins >= costo`).
  - `buyShopItem`: débito condicional + rollback si el registro de compra falla (duplicado concurrente).
  - `addXP`/`addCoins`: tope de monto por operación (10k XP / 100k coins), ignora negativos y NaN.
  - `logAction`: guarda `action` (≤50 chars) y `value` (1–1000), evitando inflar progreso de misiones/recompensas.
- `match-challenge.service.ts`:
  - `createChallenge`: débito condicional atómico antes de crear; rollback si la creación falla; validación de stake (entero, 10–1M).
  - `joinChallenge`: débito condicional + rollback si el INSERT falla (duplicado); rechaza unirse dos veces sin reembolsar.
  - `leaveChallenge`: reembolso **solo si** se eliminó una participación real (evita reembolsos infinitos).
  - `cancelChallenge`: transición de estado condicional (`status='open'`) para reembolsar una sola vez ante cancelaciones paralelas.
- `tournament.service.ts`:
  - `createTournament`/`joinTournament`: chequeo de saldo + débito condicional atómico; rollback si el torneo no se crea o el usuario ya está inscrito.
  - `leaveTournament`: reembolso solo si se removió la participación.
- `tournaments/route.ts` (POST): validación estricta de `name`, `entryFee`, `durationHours`, `maxParticipants` (rangos, tipos, JSON inválido).
- `tournaments/challenges/route.ts`: rate limiting + validación de IDs (regex) y `toSteamId` (SteamID64).

**5. Seguridad del sistema de demos.**
- `/api/demo/upload`, `/api/demo/parse-from-blob`: requieren sesión, rate limiting por usuario e IP, tamaño ≤100MB.
- Nuevo `src/lib/blob-url.ts`: validación estricta de URLs de Vercel Blob — solo `https://<store>(.public).blob.vercel-storage.com`, namespace `demos/`, bloquea IPs/localhost/dominios internos (anti-SSRF), y verifica que el segmento SteamID del pathname sea del usuario en sesión.
- `/api/demo/upload-url`: requiere sesión, nombre de archivo sanitizado (sin traversal, obligatorio `.dem`), pathname con namespace `demos/<steamId>/`.

### FASE 2 — Recuperación de funcionalidades

**Coach IA (502 en producción).**
- Causa raíz: Groq retiró el modelo `llama-3.3-70b-versatile` el 16/08/2026 (HTTP 404 `model_not_found`), documentado en `console.groq.com/docs/deprecations`.
- `src/app/api/ai/chat/route.ts`: cadena de fallback de modelos (`openai/gpt-oss-120b` → `qwen/qwen3.8-27b` → `openai/gpt-oss-20b`), timeout de 60s, reintento automático ante 404/400, 503 ante 429 de Groq, mensajes de error claros. Los IDs fueron confirmados vigentes en la documentación oficial de Groq el día de la implementación.

**Análisis de demos.**
- `src/lib/services/demo-parser.ts`: `parseDemoFile(buffer, viewerSteamId?)` — ahora asocia las estadísticas al jugador de la sesión (por SteamID64, tolerando SteamID32) en lugar de elegir siempre al top-frag. Prioridad: usuario en sesión > top-frag (fallback para demos ajenas).
- Rutas `demo/upload` y `demo/parse-from-blob` pasan `user.steamId` al parser.

### FASE 3 — Calidad y validación
- `tsconfig.json`: excluida `casefile vfinal/` (proyecto ajeno con 149 errores de tipo; 0 en `src/`).
- `eslint.config.js`: flat config creada (antes faltaba; `npm run lint` fallaba). Se extiende `eslint-config-next` y se ignoran `casefile vfinal/`, `.next/`, `node_modules/`.
- `package.json`: agregados `"type": "module"` y script `"test": "node --test --experimental-strip-types \"src/__tests__/*.test.ts\""`.
- Nuevos tests con `node:test` (sin dependencias nuevas):
  - `src/__tests__/session.test.ts`: roundtrip, rechaza payload firmado/sin firmar, vacío/basura, steamId inválido, expiración.
  - `src/__tests__/rate-limit.ts`: límite exacto, claves independientes.
  - `src/__tests__/blob-url.ts`: acepta/rechaza URLs blob, anti-SSRF, propiedad de usuario, entradas no string.

## 12.2 Archivos modificados / creados

**Modificados (35):**
`package.json`, `tsconfig.json`,
`src/lib/auth-helpers.ts`, `src/lib/services/demo-parser.ts`, `src/lib/services/gamification.service.ts`, `src/lib/services/match-challenge.service.ts`, `src/lib/services/tournament.service.ts`,
`src/app/api/ai/analyze/route.ts`, `src/app/api/ai/chat/route.ts`,
`src/app/api/auth/logout/route.ts`, `src/app/api/auth/me/route.ts`, `src/app/api/auth/steam/callback/route.ts`,
`src/app/api/debug/inventory/route.ts`,
`src/app/api/demo/parse-from-blob/route.ts`, `src/app/api/demo/test/route.ts`, `src/app/api/demo/upload-url/route.ts`, `src/app/api/demo/upload/route.ts`,
`src/app/api/faceit/match/id/route.ts`, `src/app/api/faceit/matches/route.ts`, `src/app/api/faceit/player/route.ts`, `src/app/api/faceit/sync/route.ts`,
`src/app/api/gamification/profile/route.ts`, `src/app/api/gamification/sync/route.ts`,
`src/app/api/players/search/route.ts`,
`src/app/api/steam/cs2stats/route.ts`, `src/app/api/steam/friends/route.ts`, `src/app/api/steam/games/route.ts`, `src/app/api/steam/inventory/route.ts`, `src/app/api/steam/player/route.ts`, `src/app/api/steam/recent/route.ts`, `src/app/api/steam/test/route.ts`,
`src/app/api/tournaments/challenges/route.ts`, `src/app/api/tournaments/route.ts`,
`src/app/api/user/accounts/route.ts`, `src/app/api/user/insights/route.ts`, `src/app/api/user/settings/route.ts`

**Creados (6):**
`eslint.config.js`,
`src/lib/session.ts`, `src/lib/rate-limit.ts`, `src/lib/blob-url.ts`,
`src/__tests__/session.test.ts`, `src/__tests__/rate-limit.test.ts`, `src/__tests__/blob-url.test.ts`

## 12.3 Funcionalidades recuperadas
- Coach IA (`/api/ai/chat`) operativo de nuevo con modelo de reemplazo de Groq y fallback automático.
- Asociación correcta de estadísticas de demo al usuario en sesión (`demo-parser` + rutas de demo).
- Sesiones de usuario funcionales tras el cambio de formato de cookie (requiere nuevo login tras la actualización).

## 12.4 Cambios de arquitectura (documentados)
- Sesión estado-less HMAC-SHA256 en cookie `cs2pilot_user` sin tabla de sesiones (funciona en serverless/Vercel sin migración de BD). Trade-off: no hay revocación server-side antes del vencimiento (30 días); el logout limpia la cookie del cliente.
- Rate limiting en memoria (per-instance en serverless); migración futura a Upstash/Vercel KV documentada como mejora.
- Modelo de IA con fallback automático para sobrevivir a retiradas de modelos de Groq.

## 12.5 Tests ejecutados y resultados
| Verificación | Resultado |
|---|---|
| `tsc --noEmit` | **0 errores** (149 preexistentes en `casefile vfinal/`, excluidos) |
| `npm run build` (Next.js 16) | **OK** — compilación de producción exitosa |
| `npm test` (node:test) | **18/18 tests pasan** (3 suites: session, rate-limit, blob-url) |
| ESLint en archivos nuevos | **0 errores** (`session.ts`, `rate-limit.ts`, `blob-url.ts`, `auth-helpers.ts`) |
| Prueba funcional de economía (DB temporal) | **48/48 OK**: cofres, tienda, XP, coins, desafíos y torneos atómicos, sin saldo negativo ni reembolsos duplicados |
| Prueba funcional de sesiones | **22/22 OK** (verificación externa con tsx) |

## 12.6 Problemas que siguen pendientes
- **ESLint:** hay errores de lint **preexistentes** en páginas y rutas que no fueron tocadas (react-hooks purity/set-state-in-effect, `` sin `alt`). No se reescribieron para no romper funcionalidades existentes. Se recomienda ir corrigiendo de forma incremental.
- **Coach IA:** el fallback depende de que `GROQ_API_KEY` tenga acceso a `openai/gpt-oss-120b` / `qwen/qwen3.8-27b` / `openai/gpt-oss-20b`. No se pudo hacer un llamado real a Groq en este entorno por falta de credenciales activas; la verificación de los IDs de modelo se hizo contra la documentación oficial de Groq.
- **Tests de integración de rutas API:** no hay motor de pruebas HTTP (se usaron tests de unidad de lógica pura). Se recomienda agregar `supertest`/`vitest` para cubrir las rutas protegidas.
- **Revokación de sesiones:** no hay revocación server-side inmediata (trade-off documentado); si se necesita, agregar columna de versión de sesión en `player_profile`.
- **Rate limiting en serverless:** es per-instance; bajo carga alta con muchas instancias el límite efectivo se multiplica. Migración a Upstash/Vercel KV pendiente.

## 12.7 Variables de entorno
- **Nueva (requerida en producción):** `SESSION_SECRET` (≥32 caracteres). Sin ella, el login falla cerrado en producción. Nunca imprimir su valor. Agregarla en Vercel Dashboard > Settings > Environment Variables antes de desplegar.
- Ya existentes (sin cambios): `STEAM_API_KEY`, `FACEIT_API_KEY`, `GROQ_API_KEY`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BLOB_READ_WRITE_TOKEN`.
- No se creó `.env` (no existía en `Cs2`); en desarrollo usar `.env.local`.

## 12.8 Instrucciones para probar localmente
1. Clonar/abrir `B:\Vs Code\Cs2`.
2. `npm install` (dependencias ya presentes).
3. Crear `.env.local` con `SESSION_SECRET` (ej. 32+ chars aleatorios) si se quiere probar login localmente; de lo contrario se usa un secreto temporal de desarrollo que se reinicia al reiniciar el servidor.
4. `npm run dev` — iniciar en `http://localhost:3000`.
5. Verificar login por Steam (callback verificado), que `/api/auth/me` devuelva 401 sin cookie, y que rutas de debug devuelvan 404 si se simula `NODE_ENV=production`.
6. `npm run build` — debe compilar con 0 errores de TypeScript en `src/`.
7. `npm test` — 18/18 tests deben pasar.

## 12.9 Riesgos que todavía requieren atención
- El cambio de formato de cookie invalida las sesiones existentes: todos los usuarios deben volver a autenticarse con Steam tras el despliegue.
- `SESSION_SECRET` debe configurarse en Vercel antes de desplegar a producción, o el login no funcionará (fail-closed).
- No se ejecutaron migraciones de base de datos ni operaciones destructivas; la BD actual se mantiene intacta.
- El informe de auditoría original (`AUDITORIA_CS2PILOT.md`) mantiene su puntuación de ~45/100 para el estado previo; esta sección documenta el estado tras la implementación.

