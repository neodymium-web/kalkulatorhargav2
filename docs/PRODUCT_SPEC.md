# Product specification — KalkulatorHarga.com v2

## Product objective
SEO → utility → revenue. Relaunch the existing domain after the new site has 100 fully functional, tested calculators. Deadline is flexible; quality is a release gate.

## Audience and information architecture
Indonesian visitors needing accurate, fast calculations for business, seller marketplace, finance, social media, and everyday life. The homepage prioritizes calculator search, popular tools and clear categories. Templates: homepage, category hub, calculator detail, evergreen explanatory guide.

## Design direction
Utility-first premium; light background #FFFFFF, secondary #F8FAFC, text #0F172A, border #E2E8F0, primary #2563EB. Use semantic theme tokens, not hard-coded per-page styles. Container max 1200px, 4px spacing scale, consistent responsive cards, mobile-first forms. Prefer calm hierarchy, excellent numeric readability, no arbitrary glassmorphism or oversized animated hero.

## Required calculator detail page
Breadcrumb, descriptive H1, brief direct answer, calculator form, clearly labeled results, formula/methodology, worked example, assumptions and limits, source and last verification for dynamic rates, relevant FAQ, related tools. Users must reach forms and results before long explanatory articles on mobile.

## Registry concept
Each tool has stable id, slug, primary category, optional additional categories, keyword intent, schema, engine, formula version, official source references, effective date if needed, test cases, SEO metadata and release status. Do not create 100 page shells without validated computation engines.

## MVP vertical slice
Working landing page, category hub `/bisnis`, and `/kalkulator/hpp`. HPP (production cost per unit) inputs: nonnegative material costs, direct labor, overhead, positive integer units. Outputs: total production costs and cost per unit. Define cost-of-production scope clearly; it does not automatically equal cost of goods sold after inventory changes. Document assumptions and precision.

## Technical delivery gates
Next.js App Router, TypeScript strict mode, Zod, pure TS engines, Vitest, Playwright, search, appropriate server-rendered SEO, sitemap/robots, design tokens and reusable templates. `npm ci`, typecheck, tests and build must run in CI.

## Launch and migration
The live site stays untouched. Preserve URLs and intent when practicable, especially `/kalkulator/tiktok`. The existing SEO/GSC/GA4 baseline is deliberately deferred while building, but required before domain cutover. Protected preview environment, no indexing, explicit QA and approval before production DNS/alias changes.
