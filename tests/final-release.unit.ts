import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
const {
  plan,
  validate,
  simulate,
  report,
} = require("../scripts/migration/final-release.cjs");

describe("Final Release Gate: decisions versus execution permissions", () => {
  it("uses owner-selected www and manual product scope without granting release", () => {
    const p = plan(),
      r = report();
    expect(validate(p)).toHaveLength(38);
    expect(r.decision).toBe("NO-GO");
    expect(r.activationAllowed).toBe(false);
    expect(r.frozenApplicationFiles).toBe(180);
    expect(r.dryRun.routeChecks).toHaveLength(262);
    expect(
      r.dryRun.rollback.every(
        (v: { restoredExactly: boolean }) => v.restoredExactly,
      ),
    ).toBe(true);
    expect(p.manualProductChoices.gold).toBe("ACCEPTED_MANUAL_SCOPE_ONLY");
    expect(p.futureCanonical.origin).toBe("https://www.kalkulatorharga.com");
    expect(p.stock.frozenPR.head).toBe(
      "b46d47d1cfd5a4bb256b0346416e9406e9874bd0",
    );
  }, 20_000);
  it.each([
    "archive",
    "reference",
    "benchmark",
    "stock",
    "seo",
    "host",
    "activation",
    "redirect",
    "rollback",
    "execution",
    "source",
    "missing",
    "duplicate",
    "manual",
  ])("fails closed on fabricated or missing evidence: %s", (kind) => {
    const p = plan();
    if (kind === "archive") p.archives[0].approval = { name: "invented" };
    if (kind === "reference") p.references[0].treatment = "CLICKABLE";
    if (kind === "benchmark") p.benchmark.retirementApproved = true;
    if (kind === "stock") p.stock.parity = "COMPLETE";
    if (kind === "seo") p.seo.gsc.exports = ["invented.csv"];
    if (kind === "host")
      p.futureCanonical.origin = "https://kalkulatorharga.com";
    if (kind === "activation") p.hostRedirect.runtimeEnabled = true;
    if (kind === "redirect")
      p.pathRedirects[1].destination = "/kalkulator/rata-rata-beli-saham";
    if (kind === "rollback")
      p.rollback.observedRecoveryDuration = "fake five minutes";
    if (kind === "execution") p.executionAuthorized = true;
    if (kind === "source") p.sourceSha256 = "invented";
    if (kind === "missing") p.archives.pop();
    if (kind === "duplicate") p.references[0].id = p.archives[0].id;
    if (kind === "manual")
      p.manualProductChoices.comparison = "FULL_PARITY_APPROVED";
    expect(() => validate(p)).toThrow();
  });
  it("preserves path/query with a single www hop; root proposal stays separately held", () => {
    const first = simulate(
      "https://kalkulatorharga.com/kalkulator/kpr?utm_source=a&utm_source=b",
    );
    expect(first.status).toBe(308);
    expect(first.location).toBe(
      "https://www.kalkulatorharga.com/kalkulator/kpr?utm_source=a&utm_source=b",
    );
    expect(simulate(first.location).status).toBe(200);
    expect(
      simulate("https://www.kalkulatorharga.com/metodologi").publication,
    ).toBe("PENDING_OWNER_APPROVAL");
    expect(simulate("https://kalkulatorharga.com/kalkulator").status).toBe(
      "HOLD_REDIRECT_APPROVAL",
    );
    expect(
      simulate("https://kalkulatorharga.com/kalkulator", plan(), true).location,
    ).toBe("https://www.kalkulatorharga.com/");
  });
  it.each(["/kalkulator/saham/average", "/kalkulator/tiktok/benchmark"])(
    "never redirects or fabricates a replacement for %s",
    (path) => {
      for (const host of ["kalkulatorharga.com", "www.kalkulatorharga.com"])
        expect(simulate(`https://${host}${path}`)).toEqual({
          status: "HOLD_MISSING_TARGET",
          location: null,
        });
    },
  );
  it("holds unknown/preset URLs and rejects unsafe origins or fragments", () => {
    expect(
      simulate("https://www.kalkulatorharga.com/?platform=shopee").status,
    ).toBe("HOLD_QUERY_INTENT");
    expect(simulate("https://www.kalkulatorharga.com/unmapped").status).toBe(
      "HOLD_UNMAPPED_URL",
    );
    for (const u of [
      "http://kalkulatorharga.com/",
      "https://untrusted.test/",
      "https://user:pw@kalkulatorharga.com/",
      "https://kalkulatorharga.com:8443/",
      "https://kalkulatorharga.com/#preset",
    ])
      expect(() => simulate(u)).toThrow();
  });
  it("separates successful dry-run exit0 from release denial exit2 and rejects mutation flags", () => {
    const r = spawnSync(
      process.execPath,
      ["scripts/migration/final-release.cjs", "--require-release"],
      { encoding: "utf8" },
    );
    expect(r.status).toBe(2);
    expect(JSON.parse(r.stdout).decision).toBe("NO-GO");
    for (const flag of ["--apply", "--deploy", "--approve"]) {
      const denied = spawnSync(
        process.execPath,
        ["scripts/migration/final-release.cjs", flag],
        { encoding: "utf8" },
      );
      expect(denied.status).toBe(1);
      expect(denied.stderr).toContain("no apply mode");
    }
  });
});
