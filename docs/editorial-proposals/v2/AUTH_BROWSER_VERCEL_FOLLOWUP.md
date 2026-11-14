# Authenticated-browser feasibility and Vercel observability addendum

**Review date:** 2026-11-15 (Asia/Jakarta). **READ-ONLY.** Related Issue #66 and draft PR #68; base source/main audit previously at `1b8278b37be30bc822bcb42434b01c5190d7cae5`. Do not reclassify any of the 22 archive approvals.

## Further authenticated project checks

| Read-only call | Result | Boundary |
| --- | --- | --- |
| Vercel project integration list (`view=project`) | Empty list `[]` | Does not rule out client tags, Vercel native features, external DNS/CDN tools or integrations at account level |
| Vercel project connector connections | `connectors=[]` and no next pagination cursor | Does not prove no independent external data processors |
| Vercel Observability Plus team configuration | Endpoint returned `404` with message `Observability Plus is not enabled` | Not a proof that base Observability, request metadata, runtime or build logs are disabled |
| Vercel project metadata | `kalkulatorhargav2`, SSO protection enabled for all deployments | Access authorization to staging remains required before browser-level inspection |

No tokens, deployment protection bypass secrets or user data were retrieved.

## Staging browser test outcome

Target was the exact previous READY Preview URL `https://kalkulatorhargav2-3njltvnn8-neodymium-vercel.vercel.app/`. Browser network/storage audit **NOT EXECUTED**. The available web fetch path returned `DisabledError`; a separate HTTP client did not resolve the hostname from the execution environment. No authenticated SSO browser session or approved automation bypass was available. These are access/tool limitations; **do not infer** a website outage, a Vercel deployment failure, absence of cookies, or absence of third-party connections. Earlier provider metadata established READY with SSO protection, not an authenticated app response.

Therefore the following are **UNKNOWN**, not zero: cookies and their attributes, localStorage/sessionStorage/IndexedDB, external browser requests for home/seller/TikTok/policy pages, network-sent calculator inputs, in-page tags added outside reviewed components, and authenticated session cookie behavior.

## External first-party Vercel documentation, not project-specific measurement

- [Vercel Runtime Logs](https://vercel.com/docs/logs/runtime) describes runtime log collection and plan-dependent retention (Hobby 1 hour, Pro 1 day, Enterprise 3 days; Observability Plus up to 30 days). **Account plan for this deployment was not independently established**, so do not assert one of these windows as the actual policy.
- [Vercel Observability](https://vercel.com/docs/observability) describes observability events generated per request in supported configurations. No Observability Plus does not imply no base observability.
- [Vercel Web Analytics](https://vercel.com/docs/analytics) documents that its product can operate without cookies and stores anonymized analytics; that is general product documentation, **not evidence that this project enabled or disabled Vercel Web Analytics**.
- [Vercel Build/Runtime Logs](https://vercel.com/docs/limits) explains distinct retention behavior for build and runtime logs; test/CI artifacts have additional independent retention settings requiring verification.

## Actionable gate

1. Authorized project operator should inspect **project Analytics and Speed Insights status, Observability/Logs and account plan** in the Vercel dashboard; record only settings/capability metadata, never private visitors/IPs, credentials, request logs or secret values.
2. With an **already authorized** SSO-authenticated Preview browser, use clean browser profile; inspect network, cookies, storage, service workers before and after loading homepage, representative seller and TikTok creator calculator, submitting **synthetic input**, and navigating to one policy page. Compare which requests are sent, destinations, cookie names/attributes and any app-side storage. Do not include session tokens, raw headers, IPs, emails or personal data in artifacts.
3. Verify external request hosts and mechanisms, not only package imports; inspect Vercel native browser instrumentation and external marketing tags.
4. Reconcile verified findings with proposed `/kebijakan-editorial` and `/disclaimer`; separately review correction/privacy contact and actual operator obligations.
5. Preserve all outstanding content approval and release controls; **NO MERGE, NO PUBLISH, STRICT CUTOVER NO-GO**.

No application, domain/DNS/alias, staging SSO, host configuration, redirect, active canonical, indexing, or production change took place in this follow-up.
