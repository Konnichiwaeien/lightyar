/**
 * Скользящее окно по IP для публичных эндпоинтов.
 *
 * Хранилище в памяти процесса. Это осознанный выбор: фронт крутится одним
 * процессом pm2 в fork-режиме (ecosystem.config.js), общего состояния между
 * инстансами не нужно. Если появится кластер или несколько машин — счётчик
 * придётся вынести в Redis, иначе лимит начнёт умножаться на число процессов.
 */

interface Bucket {
  hits: number[];
  blockedUntil?: number;
}

const buckets = new Map<string, Bucket>();

/** Потолок числа отслеживаемых адресов: защита от разрастания карты при распределённой атаке */
const MAX_TRACKED_IPS = 10_000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function rateLimit({
  key,
  limit,
  windowMs,
  blockMs = windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
  blockMs?: number;
}): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_IPS) {
    for (const [id, bucket] of buckets) {
      const last = bucket.hits[bucket.hits.length - 1] ?? 0;
      if (now - last > windowMs && (!bucket.blockedUntil || bucket.blockedUntil < now)) buckets.delete(id);
    }
    // если чистка не помогла, отдаём предпочтение доступности, а не точности учёта
    if (buckets.size > MAX_TRACKED_IPS) buckets.clear();
  }

  const bucket = buckets.get(key) || { hits: [] };

  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.blockedUntil - now) / 1000) };
  }

  bucket.hits = bucket.hits.filter((stamp) => now - stamp < windowMs);

  if (bucket.hits.length >= limit) {
    bucket.blockedUntil = now + blockMs;
    buckets.set(key, bucket);
    return { allowed: false, retryAfterSeconds: Math.ceil(blockMs / 1000) };
  }

  bucket.hits.push(now);
  bucket.blockedUntil = undefined;
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Достаёт адрес клиента с учётом обратного прокси */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Только для тестов: сбрасывает накопленное состояние */
export function resetRateLimits() {
  buckets.clear();
}
