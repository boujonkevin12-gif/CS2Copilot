/**
 * Rate limiting simple en memoria (sliding window).
 *
 * Limitación conocida: en serverless (Vercel) cada instancia tiene su propio
 * Map, así que el límite efectivo se multiplica por el número de instancias.
 * Sigue siendo un freno contra abuso básico y fuerza bruta sin necesidad de
 * dependencias externas ni Redis. Si se necesita un límite global estricto,
 * migrar a Upstash/Vercel KV en una fase futura.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function prune(bucket: Bucket, windowMs: number, now: number): void {
  const cutoff = now - windowMs;
  while (bucket.hits.length > 0 && bucket.hits[0] <= cutoff) {
    bucket.hits.shift();
  }
}

/**
 * Registra un intento y devuelve si está permitido.
 * @param key identificador único (ej: "gamification/sync:7656119...")
 * @param limit cantidad máxima de requests por ventana
 * @param windowMs ventana en milisegundos
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    // Limpieza defensiva: descartar buckets vacíos para no crecer sin control.
    for (const [k, b] of buckets) {
      if (b.hits.length === 0) buckets.delete(k);
    }
    if (buckets.size > MAX_BUCKETS) buckets.clear();
  }

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }

  prune(bucket, windowMs, now);

  if (bucket.hits.length >= limit) {
    return false;
  }

  bucket.hits.push(now);
  return true;
}

/** Extrae la IP real del cliente (Vercel agrega x-forwarded-for). */
export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
