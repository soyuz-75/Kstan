import { beforeEach, describe, expect, it } from "vitest";
import { checkHoneypot, checkSpam, checkTiming, MIN_FILL_MS, rateLimit, resetRateLimit } from "@/lib/booking/antispam";
import { generateRef, refKind } from "@/lib/booking/ref";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("anti-spam", () => {
  beforeEach(() => resetRateLimit());

  it("flags a filled honeypot", () => {
    expect(checkHoneypot(form({ company: "ACME" }))).toBe(true);
    expect(checkHoneypot(form({ company: "" }))).toBe(false);
  });

  it("requires a plausible fill time", () => {
    const now = 1_000_000_000;
    expect(checkTiming(form({ renderedAt: String(now - MIN_FILL_MS - 1) }), now)).toBe(true);
    expect(checkTiming(form({ renderedAt: String(now - 500) }), now)).toBe(false);
    expect(checkTiming(form({}), now)).toBe(false);
    expect(checkTiming(form({ renderedAt: "abc" }), now)).toBe(false);
  });

  it("rate-limits per key", () => {
    const t = 5_000;
    for (let i = 0; i < 5; i++) expect(rateLimit("1.2.3.4", t + i)).toBe(true);
    expect(rateLimit("1.2.3.4", t + 10)).toBe(false);
    expect(rateLimit("5.6.7.8", t + 10)).toBe(true);
    // Window slides after 10 minutes.
    expect(rateLimit("1.2.3.4", t + 10 * 60 * 1000 + 1)).toBe(true);
  });

  it("combines the checks", async () => {
    const ok = form({ renderedAt: String(Date.now() - 10_000), company: "" });
    expect(await checkSpam(ok, "9.9.9.9")).toBe("ok");
    expect(await checkSpam(form({ renderedAt: String(Date.now() - 10_000), company: "x" }), "9.9.9.9")).toBe("honeypot");
    expect(await checkSpam(form({ renderedAt: String(Date.now()) }), "9.9.9.9")).toBe("tooFast");
  });
});

describe("booking refs", () => {
  it("generates readable, typed refs", () => {
    for (let i = 0; i < 200; i++) {
      const ref = generateRef("hotel");
      expect(ref).toMatch(/^H-[2-9A-HJKMNP-Z]{6}$/);
      expect(refKind(ref)).toBe("hotel");
    }
    expect(refKind(generateRef("table"))).toBe("table");
    expect(refKind(generateRef("event"))).toBe("event");
  });

  it("rejects malformed refs", () => {
    expect(refKind("H-ABC")).toBeNull();
    expect(refKind("X-ABCDEF")).toBeNull();
    expect(refKind("H-ABCDE0")).toBeNull();
    expect(refKind("<script>")).toBeNull();
  });
});
