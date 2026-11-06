# Codex engineering rules — KalkulatorHarga.com v2

## Mission and release policy
Build an Indonesian, SEO-first, utility-first platform with exactly 100 genuinely functional online calculators in a new Next.js + TypeScript application. The existing kalkulatorharga.com website must remain unaffected until a separately approved cutover. Do not change DNS, custom domains, production aliases, or the existing website.

## Workflow
- Work in a task-specific branch. Open a pull request against `main`; do not push feature code to `main` directly.
- Read this document and relevant `docs/` specifications before changing code. Document consequential assumptions and decisions in the PR.
- Run TypeScript checks, unit tests, a production build, and targeted browser tests before claiming completion. Report commands and actual results; never claim tests passed when not run.
- Keep PRs focused. Never auto-merge without explicit approval from the project owner.
- If an issue contains ambiguous fee/rate data, implement a clearly marked source-verified data workflow instead of inventing a figure.

## Required stack
- Next.js App Router + React + TypeScript, strict mode.
- Shared design tokens and reusable accessible UI components; Tailwind CSS and shadcn/ui may be introduced as the consistent design system.
- Pure, testable TypeScript calculator engines; Zod schemas for input validation.
- Vitest for calculator engines, Playwright for critical end-to-end journeys.
- Deployment via GitHub-connected Vercel Preview. No production-domain assignment in development tasks.

## Architecture contract
- Canonical calculator route: `/kalkulator/[slug]`. Preserve live URL paths such as `/kalkulator/tiktok` where appropriate.
- Shared calculator registry drives listing, categorization, metadata, related tools, and sitemap inclusion.
- Calculator implementations must isolate: input schema, computation engine, UI, formula version, sources, SEO copy, and test cases.
- Only mark a calculator `published` when its UI and engine work, edge cases are tested, and content is complete. No fake or placeholder calculators in indexable routes.
- Prefer server rendering or static generation for public SEO content; use client components for interactive inputs.
- Do not fabricate case studies, testimonials, statistics, current tariffs, platform fees, or source citations.
- For dynamic tariffs, store official source URLs, verification timestamp, effective date, version, and changelog; distinguish user-entered assumptions from verified facts.

## Accuracy and UX gates
- Validate finite numbers, integer constraints, null/empty input, zero division, negatives, currency precision, overflow, and meaningful edge cases.
- For monetary calculations, document safe precision/rounding policy; never silently accumulate floating-point errors.
- Mobile-first 320 px and up; WCAG-aligned labels, focus visibility, readable result formatting.
- Core Web Vitals targets at p75: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1. Targets are not guarantees.

## SEO and migration
- Unique intent-aligned titles/descriptions/H1, canonical URLs, breadcrumbs, useful methodology, FAQ only when real, internal links, sitemap, robots.
- Staging and preview deployments must not be indexed. No URL redirects without a migration plan.
- GSC/GA4 baseline audit is deferred during initial coding, but mandatory before production cutover.
- No guarantee of preserved rankings or traffic; minimize risk with a URL mapping and post-launch monitoring.

## Initial delivery order
1. Set up runnable app, package-lock, CI, and design tokens.
2. Build homepage + category hub + HPP vertical slice with tested engine.
3. Finalize 100-calculator inventory, slugs, formulas, risk classification and source requirements.
4. Implement small tested batches, with review gates, until 100 calculators satisfy release criteria.

## Communication
Write user-facing copy and calculator content in natural Indonesian. Technical identifiers and code may be in English. Include a concise PR checklist and screenshots for visual changes.
