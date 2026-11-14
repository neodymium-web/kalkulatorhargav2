# Privacy, logging and analytics inventory — v2 review (15 Nov 2026)

> **READ-ONLY audit; evidence for draft PR #68. No policy publication approval.** Base source: `main@1b8278b37be30bc822bcb42434b01c5190d7cae5`; connected Vercel project `kalkulatorhargav2` (project ID `prj_p1VRZQiOB0BHJrQSC5JS2rDhYoF7`, team `neodymium-vercel`). No sensitive environment values, IPs, visitors, full runtime logs, token values or personal data copied into this document.

## Evidence classification

| Surface | Observed evidence | What this does **not** establish |
| --- | --- | --- |
| App dependencies | `package.json` has Next.js, React, Zod, decimal.js; no separately declared GA4, Google Tag Manager, Vercel Analytics, Speed Insights, Sentry or PostHog dependency in the reviewed direct dependencies. | Absence in direct dependencies does not prove all scripts, third-party SDKs, injected scripts, hosting integrations or outgoing traffic absent. |
| Global layout | `app/layout.tsx` renders navigation, content and footer; no observed embedded tracker or third-party script in this file. | No proof for all 131 routes, historical pages, browser extensions or injected analytics. |
| Form data flow | `components/ui/structured-form.tsx` intercepts submit, reads `new FormData(event.currentTarget)`, calls `onResult(input)`; `components/calculators/creator-form.tsx` invokes `tool.engine(input)` via client component state; `app/kalkulator/[slug]/page.tsx` imports forms server-side. | **Client-side calculation for inspected forms only.** No complete proof that every calculator input never reaches a server, nor that middleware, logs, browser or third parties cannot observe request metadata. |
| Headers | `next.config.ts` sets `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy-Report-Only`, and staging noindex header conditional on `lib/seo.ts`. | **CSP is Report-Only, not enforcement.** Cannot claim cross-site requests blocked. Referrer policy can still share origin on cross-origin requests. |
| Indexing | `lib/seo.ts`: SITE_INDEXABLE must equal `true`, plus environment not preview/development. `app/robots.ts` disallows crawling when not indexable. | Search protection is not privacy protection or a retention policy. |
| Vercel project | Authenticated project read confirmed project id above; SSO protection `enabled=true, deploymentType=all`, password protection disabled. | SSO does not certify no logs or third-party data collection; deployment access may affect who can test browser behavior. |
| Vercel env key metadata | `filter_project_envs(decrypt=false)` returned **one visible key:** `SITE_INDEXABLE`, scoped to preview, production, development, plain type. Values intentionally not recorded. | Does not exclude settings external to project envs, build/integration configuration or other inaccessible secrets. Never publish secrets. |
| Drains | Authenticated `list_drains` for this project/team returned `drains=[]` at review time. | Absence of configured **drains** is not absence of built-in runtime/request/build logs, analytics, observability, edge logs or Vercel-controlled retention. |
| Runtime logs | Query of Vercel preview runtime logs in recent 50-minute window grouped by source returned no group entries in output. | **Zero results within one query window is not zero collection or zero retention.** Request/build/platform logging, past requests and unobserved sources are out of scope. |
| CI artifacts | `.github/workflows/ci.yml` uploads browser evidence, desktop/mobile screenshots, performance/lab data and test-results from CI. | Need separate review of artifact access, retention and whether production/real visitor data could ever enter evidence. Existing evidence appears test-oriented; do not assert absence of PII without access and scan. |
| Privacy policy | No verified project-specific active privacy notice, cookie banner, contact channel, analytics dashboard settings, retention policy, hosting DPA or identity of controller established in this audit. | **Do not state** “no cookies,” “no personal data,” “data never saved,” “100% local,” “no tracking,” or fixed retention period. |

## Findings / risk rating

1. **P0 — Policy gap:** external hosting/logging retention, IP/request metadata, browser storage/cookies, and actual external analytics/integrations remain unverified. **Do not publish a definitive privacy claim.** Owner and platform operator must verify through project settings and a tested browser network/storage audit in authorized staging environment.
2. **P0 — Editorial accuracy:** historical `/kebijakan-editorial` claims about TikTok username lookup and non-retention are not valid descriptions of the reviewed creator form; draft #68 removes them. Never infer platform-level retention from UI implementation.
3. **P1 — Browser security:** CSP is Report-Only, so it currently observes/reports intended restrictions rather than actively blocking disallowed connections. Propose separate explicitly approved security review before any enforcement change (could break features).
4. **P1 — Evidence artifacts:** GitHub CI uploads browser screenshots and logs; verify access/retention and avoid real user input/PII before claiming all artifacts are safe.
5. **P1 — Editorial contact:** owner has selected public label `Admin KalkulatorHarga`, but no contact email/address or legally accountable operator was verified; do not invent one.

## Concrete follow-up verification (read-only first)

- In Vercel dashboard, inspect Web Analytics, Speed Insights, Observability, firewall/request logs, build/runtime logs, data retention and external integrations; capture **setting names and enabled/disabled values only**, not keys or visitor data.
- Execute authorized browser audit on *SSO-accessible staging* with browser devtools/Playwright: clean profile, network request inventory, cookies, local/session storage and IndexedDB before and after representative calculator input, plus consent flows if present. Test homepage, seller, TikTok and policy routes.
- Verify whether custom analytics/marketing embeds, connected apps or DNS-level scripts are configured outside the source repo; distinguish production legacy (out of scope) from v2.
- Define a truthful editorial/privacy contact and actual channel for corrections or privacy requests, and identify who handles requests. Do not fabricate support mailbox.
- Review GitHub artifact retention/access and whether screenshots/test-results contain user data; document tested scope.
- After evidence and explicit owner review of *each exact draft*, amend proposed text. Updating archive pages or implementing live replacements requires **separate approval and a separate staging-only PR**.

**No modifications:** application, active `/redaksi`/`/metodologi`/`/kebijakan-editorial`/`/disclaimer`, archive approvals, domain/DNS/aliases, canonical, redirects, indexing/robots, Vercel SSO/protection, hosting config, production. PR #68 remains draft; **CUTOVER STRICT NO-GO**.
