const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const { readCsv } = require("./csv.cjs");
const { applicationFiles, rollbackFixture } = require("./release-gates.cjs");
const { trace } = require("../legacy/host-policy.cjs");
const directory = "docs/audit/final-release";
const load = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const plan = () => load(`${directory}/plan.json`);
const assert = (v, message) => {
  if (!v) throw Error(message);
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const baseline = "125e93d240d83ae35f63965289dd87315cb52bcc";
const hosts = ["kalkulatorharga.com", "www.kalkulatorharga.com"];

function validate(p) {
  assert(
    p.schemaVersion === 1 && p.baseline === baseline,
    "Wrong baseline/schema",
  );
  assert(
    p.scope === "INACTIVE_REVIEW_ONLY" &&
      p.featureFreeze === true &&
      p.runtimeEnabled === false &&
      p.executionAuthorized === false,
    "Inactive feature freeze required",
  );
  assert(
    p.source === `${directory}/source-snapshot.json`,
    "Wrong source provenance",
  );
  assert(
    createHash("sha256").update(fs.readFileSync(p.source)).digest("hex") ===
      p.sourceSha256,
    "Source snapshot changed",
  );
  assert(
    same(p.futureCanonical, {
      origin: "https://www.kalkulatorharga.com",
      status: "OWNER_SELECTED_PLANNING_ONLY",
      evidence: "https://github.com/neodymium-web/kalkulatorhargav2/issues/60",
      activationApproval: null,
    }),
    "WWW selection is not activation permission",
  );
  assert(
    same(p.manualProductChoices, {
      gold: "ACCEPTED_MANUAL_SCOPE_ONLY",
      comparison: "ACCEPTED_MANUAL_SCOPE_ONLY",
      evidence: "https://github.com/neodymium-web/kalkulatorhargav2/issues/60",
    }),
    "Manual product acceptance must not be lost or widened",
  );
  const ledger = load("docs/audit/editorial61/changes.json");
  assert(
    p.archives.length === 22 &&
      same(
        p.archives.map((r) => r.path).sort(),
        ledger.pages.map((r) => r.path).sort(),
      ),
    "22 archive coverage required",
  );
  for (const r of p.archives) {
    const source = ledger.pages.find((s) => s.path === r.path);
    assert(
      load("docs/audit/migration-release/register.json").archives.find(
        (a) => a.path === r.path,
      )?.id === r.id,
      "Archive ID/path mismatch",
    );
    assert(
      r.status === "PENDING_OWNER_APPROVAL" &&
        r.approval === null &&
        source.ownerDecision === null &&
        source.publicationStatus === "PENDING_OWNER_APPROVAL",
      "No archive publication approval supplied",
    );
    assert(
      r.editorialEvidence === "docs/audit/editorial61/changes.json" &&
        r.requiredEvidence.length === 4,
      "Archive approval handoff missing",
    );
  }
  const refs = readCsv("docs/audit/legacy-link-dependencies.csv").filter(
    (r) => r.classification === "unresolved-legacy-feature",
  );
  assert(
    p.references.length === 6 &&
      same(
        p.references.map((r) => [r.sourcePath, r.anchorText, r.target]),
        refs.map((r) => [r.source_path, r.anchor_text, r.target]),
      ),
    "Six reference instances required",
  );
  for (const r of p.references)
    assert(
      r.status === "PENDING_INTENT_DECISION" &&
        r.approval === null &&
        r.treatment === "NONCLICKABLE_ARCHIVAL_REFERENCE",
      "Reference decision not supplied",
    );
  assert(
    new Set([...p.archives, ...p.references].map((r) => r.id)).size === 28,
    "Duplicate decision IDs",
  );
  assert(
    p.benchmark.path === "/kalkulator/tiktok/benchmark" &&
      p.benchmark.currentV2Status === 404 &&
      p.benchmark.decision === "RETAIN_FUTURE_URL_RESEARCH_ONLY" &&
      p.benchmark.datasetApproval === null &&
      p.benchmark.publicationApproval === null &&
      p.benchmark.retirementApproved === false,
    "Benchmark retention is not dataset/publication/removal approval",
  );
  const frozen = load(p.source).stockPR;
  assert(
    p.stock.path === "/kalkulator/saham/average" &&
      p.stock.currentMainStatus === 404 &&
      p.stock.parity === "BLOCKED" &&
      p.stock.disposition === "RETAIN_FUTURE_EXACT_PATH" &&
      p.stock.redirectToWeightedAverage === "REJECTED_NOT_EQUIVALENT" &&
      p.stock.publicationApproval === null &&
      same(p.stock.frozenPR, frozen),
    "Stock PR must stay frozen and excluded",
  );
  assert(
    Object.keys(p.seo).sort().join() === "backlinks,ga4,gsc",
    "Three SEO evidence groups required",
  );
  for (const r of Object.values(p.seo))
    assert(
      r.status === "UNKNOWN" && r.exports.length === 0 && r.approval === null,
      "Do not invent SEO data",
    );
  assert(
    same(p.hostRedirect, {
      from: hosts[0],
      to: hosts[1],
      proposedStatus: 308,
      pathAndQuery: "ONE_HOP_FOR_KNOWN_PATHS_AND_UTM_ONLY",
      runtimeEnabled: false,
      activationApproval: null,
    }),
    "Opposed/active host plan forbidden",
  );
  assert(
    same(p.pathRedirects, [
      {
        source: "/kalkulator",
        destination: "/",
        status: 301,
        decision: "PENDING_INTENT_AND_SEO_REVIEW",
        approval: null,
        enabled: false,
      },
      {
        source: "/kalkulator/saham/average",
        destination: null,
        status: null,
        decision: "HOLD_EXACT_URL_NO_WEIGHTED_AVERAGE_REDIRECT",
        approval: null,
        enabled: false,
      },
    ]),
    "No path redirects authorized",
  );
  const keys = [
    "approvedLegacySHA",
    "approvedLegacyDeployment",
    "approvedCandidateSHA",
    "approvedCandidateDeployment",
    "namedOperator",
    "backupOperator",
    "decisionOwner",
    "window",
    "snapshotTicket",
    "tlsDnsRecoveryEvidence",
    "monitoringBaseline",
    "thresholds",
    "observedRecoveryDuration",
  ];
  assert(
    p.rollback.status === "NOT_PLATFORM_REHEARSED" &&
      same(
        Object.keys(p.rollback)
          .filter((k) => k !== "status")
          .sort(),
        keys.sort(),
      ) &&
      keys.every((k) => p.rollback[k] === null),
    "Live rollback evidence not supplied",
  );
  assert(
    p.productionIndexingApproval === null && p.executionApproval === null,
    "Execution/indexing authorization absent",
  );
  return [
    ...p.archives.map((r) => r.id),
    ...p.references.map((r) => r.id),
    "BENCHMARK",
    "STOCK-URL",
    "GSC",
    "GA4",
    "BACKLINKS",
    "WWW-ACTIVATION",
    "ROOT-REDIRECT",
    "ROLLBACK",
    "PRODUCTION-INDEXING",
    "EXECUTION-AUTHORIZATION",
  ];
}

// Only a pure object model: never imported by runtime or translated into platform commands.
function simulate(input, p = plan(), proposedRootRedirect = false) {
  const u = new URL(input);
  assert(
    u.protocol === "https:" &&
      hosts.includes(u.hostname) &&
      !u.port &&
      !u.username &&
      !u.password &&
      !u.hash,
    "Unsupported origin",
  );
  assert(
    p.futureCanonical.origin === "https://www.kalkulatorharga.com" &&
      p.runtimeEnabled === false,
    "Inactive www plan required",
  );
  if (
    [...u.searchParams.keys()].some(
      (k) =>
        ![
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "utm_content",
          "utm_term",
        ].includes(k),
    )
  )
    return { status: "HOLD_QUERY_INTENT", location: null };
  if ([p.stock.path, p.benchmark.path].includes(u.pathname))
    return { status: "HOLD_MISSING_TARGET", location: null };
  if (u.pathname === "/kalkulator" && !proposedRootRedirect)
    return { status: "HOLD_REDIRECT_APPROVAL", location: null };
  const path = u.pathname === "/kalkulator" ? "/" : u.pathname;
  const target = readCsv(`${directory}/candidate-urls.csv`).find(
    (r) => r.path === path,
  );
  if (!target) return { status: "HOLD_UNMAPPED_URL", location: null };
  if (u.hostname !== hosts[1] || u.pathname !== path)
    return {
      status: u.pathname !== path ? 301 : 308,
      location: `${p.futureCanonical.origin}${path}${u.search}`,
      approval: "NOT_GRANTED",
      scope: "HYPOTHETICAL_ONLY",
    };
  return {
    status: 200,
    location: null,
    publication: target.publicationGate,
    scope: "HYPOTHETICAL_ONLY",
  };
}
function report() {
  const p = plan(),
    blocked = validate(p),
    frozen = load(`${directory}/application-freeze.json`);
  assert(
    frozen.files.length === 180 &&
      frozen.baseline === baseline &&
      same(applicationFiles(), frozen.files),
    "Application/config drift during feature freeze",
  );
  // Also compare the new manifest to the pinned Git tree, rather than trusting an editable manifest alone.
  for (const f of frozen.files)
    assert(
      createHash("sha256")
        .update(execFileSync("git", ["show", `${baseline}:${f.path}`]))
        .digest("hex") === f.sha256,
      "Frozen manifest differs from pinned baseline",
    );
  const candidates = readCsv(`${directory}/candidate-urls.csv`),
    current = readCsv("docs/audit/cutover-url-map.csv");
  assert(
    candidates.length === 131 &&
      new Set(candidates.map((r) => r.path)).size === 131,
    "131 unique candidates required",
  );
  assert(
    same(
      candidates.map((r) => r.path),
      current.map((r) => r.v2_route),
    ),
    "Candidate mapping coverage drift",
  );
  for (const r of candidates) {
    assert(
      r.activeCanonical === `https://kalkulatorharga.com${r.path}` &&
        r.plannedCanonical === `${p.futureCanonical.origin}${r.path}` &&
        r.enabled === "false",
      "Inactive www URL mapping mismatch",
    );
    assert(
      r.publicationGate ===
        (p.archives.some((a) => a.path === r.path)
          ? "PENDING_OWNER_APPROVAL"
          : "SEPARATE_RELEASE_AUTHORIZATION_REQUIRED"),
      "Mapping cannot grant publication",
    );
  }
  const routeChecks = hosts.flatMap((host) =>
    candidates.map((r) => {
      const input = `https://${host}${r.path}?utm_source=dry-run`,
        first = simulate(input, p);
      assert(
        first.status === (host === hosts[1] ? 200 : 308),
        "WWW direction mismatch",
      );
      if (first.location)
        assert(simulate(first.location, p).status === 200, "Redirect chain");
      return { input, ...first };
    }),
  );
  const rootProposal = hosts.map((host) => {
    const r = simulate(
      `https://${host}/kalkulator?utm_source=dry-run`,
      p,
      true,
    );
    assert(
      r.status === 301 &&
        r.location === "https://www.kalkulatorharga.com/?utm_source=dry-run",
      "Root proposal must combine host/path in one hop",
    );
    return r;
  });
  assert(
    trace(hosts[1], "/", [{ from: hosts[0], to: hosts[1], status: 308 }])
      .length === 0,
    "Canonical loop",
  );
  const source = load(p.source),
    snapshot = {
      assignments: Object.fromEntries(
        source.aliases.map((a) => [
          a.host,
          {
            projectId: a.projectId,
            deploymentId: a.deploymentId,
            redirect: a.redirect,
            status: a.status,
          },
        ]),
      ),
      canonical: "https://kalkulatorharga.com",
      staging: { sso: true, noindex: true },
    };
  const candidate = structuredClone(snapshot);
  candidate.canonical = p.futureCanonical.origin;
  for (const host of hosts)
    candidate.assignments[host] = {
      projectId: "SIMULATED_V2",
      deploymentId: "SIMULATED_CANDIDATE",
      redirect: host === hosts[0] ? hosts[1] : null,
      status: host === hosts[0] ? 308 : null,
    };
  const rollback = [1, 2, 3].map((stage) => {
    const { restored, ...result } = rollbackFixture(snapshot, candidate, stage);
    assert(result.restoredExactly, "Rollback model failed");
    return result;
  });
  return {
    schemaVersion: 1,
    head: execFileSync("git", ["rev-parse", "HEAD"]).toString().trim(),
    baseline,
    technicalConsistency: "PASS",
    decision: "NO-GO",
    activationAllowed: false,
    frozenApplicationFiles: frozen.files.length,
    futureCanonical: p.futureCanonical,
    blockedDecisionRows: blocked,
    count: {
      archives: 22,
      references: 6,
      sitemap: 131,
      originalCalculators: 100,
    },
    dryRun: {
      simulatedOnly: true,
      routeChecks,
      rootProposal,
      holds: [
        p.stock.path,
        p.benchmark.path,
        "/kalkulator",
        "/unmapped",
        "/?platform=shopee",
      ].map((path) => ({ path, ...simulate(`https://${hosts[1]}${path}`, p) })),
      rollback,
    },
    limits: [
      "No publication or execution approval inferred from tests",
      "Candidate www metadata is not loaded by the application",
      "SSO/noindex in rollback are required model invariants, not a fresh platform access audit",
      "Read-only alias observation is not an approved rollback snapshot or verified recovery duration",
      "No SEO exports/backlink evidence supplied; no live rollback performed",
      "PR64 frozen; no stock features or benchmark data implemented",
    ],
  };
}
module.exports = { validate, simulate, report, plan };
if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    assert(
      args.every((a) => a === "--require-release"),
      "Read-only dry-run only; no apply mode",
    );
    console.log(JSON.stringify(report(), null, 2));
    if (args.includes("--require-release")) process.exitCode = 2;
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
