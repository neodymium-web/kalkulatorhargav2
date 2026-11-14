import { it, expect } from "vitest";
import { releaseConfiguration } from "../lib/migration/release";
import { calculateComparison } from "../lib/creator-analytics/engines";
import { publishedPaths } from "../lib/published-paths";
import sitemap from "../app/sitemap";
it("www is inert by default and never activated on staging", () => {
  for (const VERCEL_ENV of ["preview", "development", undefined])
    expect(
      releaseConfiguration({
        VERCEL_ENV,
        MIGRATION_CUTOVER_APPROVED: "true",
        SITE_INDEXABLE: "true",
      }).enabled,
    ).toBe(false);
  expect(releaseConfiguration({}).origin).toBe("https://kalkulatorharga.com");
  expect(
    releaseConfiguration({
      VERCEL_ENV: "production",
      MIGRATION_CUTOVER_APPROVED: "true",
      SITE_INDEXABLE: "true",
    }),
  ).toEqual({
    enabled: true,
    origin: "https://www.kalkulatorharga.com",
    includePendingArchives: false,
  });
});
it("two additional routes are unique supplemental tools without replacing inventory IDs", () => {
  expect(publishedPaths()).toHaveLength(133);
  expect(new Set(publishedPaths()).size).toBe(133);
  for (const path of [
    "/kalkulator/saham/average",
    "/kalkulator/tiktok/benchmark",
  ])
    expect(sitemap().some((r) => new URL(r.url).pathname === path)).toBe(true);
});
it("manual engagement comparison uses a chosen common denominator, not an industry dataset", () => {
  const v = {
    basis: "followers",
    followersA: "1000",
    viewsA: "1000",
    interactionsA: "100",
    videosA: "3",
    followersB: "2000",
    viewsB: "800",
    interactionsB: "100",
    videosB: "2",
  };
  const a = calculateComparison(v);
  expect(a.success && a.values.erChange).toBe(-500n);
  const b = calculateComparison({ ...v, basis: "views" });
  expect(b.success && b.values.erChange).toBe(250n);
  const c = calculateComparison({ ...v, followersA: "0" });
  expect(c.success && c.values.erChange).toBeNull();
});
it("future production-only sitemap uses www and excludes all pending archives", async () => {
  const { vi } = await import("vitest");
  vi.resetModules();
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("MIGRATION_CUTOVER_APPROVED", "true");
  vi.stubEnv("SITE_INDEXABLE", "true");
  try {
    const future = (await import("../app/sitemap")).default();
    expect(future).toHaveLength(111);
    expect(
      future.every(
        (x) => new URL(x.url).hostname === "www.kalkulatorharga.com",
      ),
    ).toBe(true);
    expect(future.some((x) => x.url.endsWith("/metodologi"))).toBe(false);
  } finally {
    vi.unstubAllEnvs();
    vi.resetModules();
  }
});
it('pending archive metadata remains noindex even when production is indexable',async()=>{
 const {legacyMetadata}=await import('../components/legacy-page');const {legacyPages}=await import('../lib/legacy/registry')
 for(const p of legacyPages)expect(legacyMetadata(p).robots).toEqual({index:false,follow:false})
})
