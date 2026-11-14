# Four active-v2 policy draft candidates — owner review gate

**Base:** merged `main@1b8278b37be30bc822bcb42434b01c5190d7cae5`; Issue #66. These Markdown files are *editorial proposals*, not route/content implementation. None of the 22 archive statuses is approved or changed.

| Public route (future) | Draft | Disposition | Outstanding |
| --- | --- | --- | --- |
| `/redaksi` | `redaksi.md` | PENDING_OWNER_APPROVAL | contact, real editorial workflow, identity and byline rights |
| `/metodologi` | `metodologi.md` | PENDING_OWNER_APPROVAL | line-by-line product-method check, official source scope |
| `/kebijakan-editorial` | `kebijakan-editorial.md` | PENDING_OWNER_APPROVAL | actual privacy/log/analytics/retention, commercial disclosures, editorial process |
| `/disclaimer` | `disclaimer.md` | PENDING_OWNER_APPROVAL | responsible operator, any affiliation, legal/privacy review |

**Owner decisions recorded:** the owner has authority for content review and chose `Admin KalkulatorHarga` as the future editorial display name. Neither decision authorizes publication or represents a verified legal entity, author credentials, contact address, or permission to rewrite archival authorship.

**Required before route changes or publication:** (1) owner approval of exact revised texts *per URL*; (2) evidence of rights to republish content/bylines and historical source treatment; (3) verified contact and privacy/hosting claims; (4) independent staging-only implementation PR and its tests; (5) separate exact-head merge authorization; (6) final cutover decision only after all release gates. The original archival pages, source snapshots, redirects and technical gates must remain untouched pending those approvals.

**Non-negotiable:** no changes to application, sitemap, active canonical, indexing, production, domain/DNS/aliases, staging SSO, or existing legacy website. **CUTOVER STRICT NO-GO.**
