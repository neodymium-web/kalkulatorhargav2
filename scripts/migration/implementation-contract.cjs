const fs = require("node:fs"),
  crypto = require("node:crypto");
const allowed = [
  "app/kalkulator/page.tsx",
  "app/layout.tsx",
  "app/sitemap.ts",
  "app/kalkulator/saham/average/page.tsx",
  "app/kalkulator/tiktok/benchmark/page.tsx",
  "components/calculators/creator-form.tsx",
  "components/stock-parity/form.tsx",
  "lib/published-paths.ts",
  "lib/seo.ts",
  "lib/supplemental/routes.ts",
  "lib/migration/release.ts",
  "lib/migration/routes.ts",
  "lib/stock-parity/engine.ts",
  "lib/stock-parity/fields.ts",
  "lib/legacy/links.ts",
  "components/legacy-page.tsx",
];
exports.project = (files) => {
  const manifest = JSON.parse(
    fs.readFileSync(
      "docs/audit/migration-implementation/application-changes.json",
      "utf8",
    ),
  );
  if (
    JSON.stringify(manifest.map((f) => f.path).sort()) !==
    JSON.stringify([...allowed].sort())
  )
    throw Error("Unexpected implementation scope");
  const expected = structuredClone(files);
  for (const f of manifest) {
    const hash = crypto
      .createHash("sha256")
      .update(require('../design/contract.cjs').previousContent(f.path))
      .digest("hex");
    if (hash !== f.sha256) throw Error("Implementation hash drift " + f.path);
    const old = expected.find((x) => x.path === f.path);
    if (old) old.sha256 = hash;
    else expected.push(f);
  }
  return require('../design/contract.cjs').project(expected).sort((a, b) =>
    a.path < b.path ? -1 : a.path > b.path ? 1 : 0,
  );
};
