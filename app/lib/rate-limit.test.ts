import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rate-limit";

function requestFor(ip: string) {
  return new Request("https://ministrypartner.co.kr/api/test", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("checkRateLimit", () => {
  it("allows requests inside the configured limit", () => {
    const key = `allow-${crypto.randomUUID()}`;
    expect(checkRateLimit(requestFor("192.0.2.1"), { key, limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit(requestFor("192.0.2.1"), { key, limit: 2, windowMs: 60_000 }).allowed).toBe(true);
  });

  it("blocks the next request and returns a retry time", () => {
    const key = `block-${crypto.randomUUID()}`;
    checkRateLimit(requestFor("192.0.2.2"), { key, limit: 1, windowMs: 60_000 });
    const blocked = checkRateLimit(requestFor("192.0.2.2"), { key, limit: 1, windowMs: 60_000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keeps different client addresses independent", () => {
    const key = `clients-${crypto.randomUUID()}`;
    checkRateLimit(requestFor("192.0.2.3"), { key, limit: 1, windowMs: 60_000 });
    expect(checkRateLimit(requestFor("192.0.2.4"), { key, limit: 1, windowMs: 60_000 }).allowed).toBe(true);
  });
});
