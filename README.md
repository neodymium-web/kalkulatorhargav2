# KalkulatorHarga.com v2

SEO-first, utility-first Indonesian calculator platform built with Next.js and TypeScript.

## Delivery principles
- 100 fully functioning calculators before replacing the existing website.
- Development through pull requests and automated checks.
- Preserve existing URLs and search intent where possible.
- Do not connect the existing production domain until migration review and explicit approval.

See `AGENTS.md` for engineering rules and `docs/` for project specifications.

## Local development

Use Node.js 22. Run `npm ci` and `npm run dev`, then open http://localhost:3000.

Run the same checks as CI:

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run e2e
```

Playwright starts the local production build on port 3100 and saves desktop and mobile screenshots in `test-results/`.

Indexing is disabled by default. Only set `SITE_INDEXABLE=true` at build time for an approved production cutover. Vercel preview and development builds ignore that opt-in.

## Migration release gate

Status migrasi kalkulatorharga.com: **NO-GO untuk cutover** sampai blocker dan approval owner selesai. Rujukan terkini: [register dan keputusan](docs/MIGRATION_RELEASE.md), [runbook cutover/rollback](docs/MIGRATION_CUTOVER_RUNBOOK.md). Periksa lokal dengan `node scripts/migration/release-gates.cjs`; exit 0 adalah konsistensi laporan, bukan izin launch.
