import test from "node:test";
import assert from "node:assert/strict";
import { rateLimit, clientIp, resetRateLimits } from "./rate-limit.ts";

test("пропускает до лимита и блокирует дальше", () => {
  resetRateLimits();
  const call = () => rateLimit({ key: "a", limit: 3, windowMs: 60_000 });
  assert.equal(call().allowed, true);
  assert.equal(call().allowed, true);
  assert.equal(call().allowed, true);

  const blocked = call();
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0, "клиенту нужно сказать, через сколько повторить");
});

test("считает адреса раздельно", () => {
  resetRateLimits();
  rateLimit({ key: "a", limit: 1, windowMs: 60_000 });
  assert.equal(rateLimit({ key: "a", limit: 1, windowMs: 60_000 }).allowed, false);
  assert.equal(rateLimit({ key: "b", limit: 1, windowMs: 60_000 }).allowed, true, "чужой лимит не должен задевать другого");
});

test("окно скользит: старые попытки перестают считаться", async () => {
  resetRateLimits();
  const opts = { key: "c", limit: 2, windowMs: 40, blockMs: 1 };
  assert.equal(rateLimit(opts).allowed, true);
  assert.equal(rateLimit(opts).allowed, true);
  assert.equal(rateLimit(opts).allowed, false);

  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(rateLimit(opts).allowed, true, "после окна счётчик должен обнуляться");
});

test("адрес клиента берётся из заголовков прокси", () => {
  const forwarded = new Request("http://x", { headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" } });
  assert.equal(clientIp(forwarded), "203.0.113.9", "берём первый адрес цепочки, а не адрес прокси");

  const real = new Request("http://x", { headers: { "x-real-ip": "198.51.100.7" } });
  assert.equal(clientIp(real), "198.51.100.7");

  assert.equal(clientIp(new Request("http://x")), "unknown");
});
