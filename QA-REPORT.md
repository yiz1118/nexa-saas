# NEXA — Verification and completion audit

**Concept Project · Verified 2026-09-28 · Windows / installed Google Chrome**

The approved interactive-local-demo plan is implemented in this standalone folder. The completion decision is based on source inspection, compiled application tests, rendered screenshots, and production lab measurements. This report does not claim a deployed service, real AI, security enforcement, or certification of accessibility across every assistive technology.

Application root:

```text
C:\Users\alson\Documents\codexProject\Freelance Portfolio\Portfolio website\03 — Technology  AI SaaS Website + Dashboard
```

## Commands and outcomes

Commands were run at the application root with Node 24.13.0 and npm 11.6.2. The browser suite started the compiled application on port 3213 with `reuseExistingServer: false`.

| Command | Current outcome | Saved evidence |
| --- | --- | --- |
| `npm run lint` | Exit 0; no lint errors. | [lint.log](artifacts/reports/lint.log) |
| `npm run typecheck` | Exit 0; strict TypeScript check passed. | [typecheck.log](artifacts/reports/typecheck.log) |
| `npm test` | Exit 0; 4 focused behavior tests passed, 0 failed. | [unit-tests.log](artifacts/reports/unit-tests.log) |
| `npm run build` | Exit 0; production Webpack build completed and routes prerendered. | [build.log](artifacts/reports/build.log) |
| `npm run test:browser` | Exit 0; 16 tests passed, 0 failed. | [browser-tests.log](artifacts/reports/browser-tests.log), [HTML report](playwright-report/index.html) |
| `npm run test:performance` | Exit 0; four production Lighthouse measurements generated. | [performance.log](artifacts/reports/performance.log), [summary](artifacts/reports/performance-summary.json) |

The independent package manifest and lockfile were inspected and agree. Dependency installation completed without reported vulnerabilities during setup. This is an installation result, not a security audit. `README.md` provides `npm ci`, development, production, and verification commands.

The performance helper initially encountered a Windows `EPERM` while Chrome Launcher deleted its temporary profile. The final runner uses a disposable profile inside the project's ignored `test-results/lighthouse-profile` directory and always stops its production server. The final command completed with exit 0. No real browser profile is used.

## Connected browser journeys

| Journey / gate | What the production browser test proves |
| --- | --- |
| Marketing and entry | All public pages load; Explore demo reaches the dashboard; validated login and signup set a local profile. |
| Text upload | Markdown content becomes searchable, opens in a plain-text detail dialog, can be assigned to a collection, and persists after reload. |
| Library editing | PDF metadata-only behavior, rename, type/status/owner filters, sort selection, persistence, and confirmed deletion work. |
| Collections | New collections appear; edited collection names persist after reload. |
| Sample chat | A prepared Atlas answer opens its actual supporting passage; unsupported questions receive the honest fallback. |
| Context limits | Selecting the Support runbook prevents an Atlas citation and produces an unsupported response. |
| Workflow execution | Missing Summarize triggers validation; adding/reordering fixes the sequence; unsupported sources fail; retry succeeds with a supported source. |
| Connected workflow output | A completed note step creates a searchable local document; overview counts and activity reflect the run. |
| Workflow management | New flows, name edits, enable flags, duplication, paused copies, reload persistence, and deletion work. |
| Team / preferences / pricing | Local invitations explicitly state no email was sent; role changes and workspace preferences persist; annual pricing changes displayed values. |
| Analytics | Selecting 30 or 7 days changes the accessible daily-value table; the ArrowRight key selects and focuses the 14-day tab and updates its panel. |
| Forms / errors / reset | Required form fields, prepared-unsent request text, rejected upload types, empty searches, filter clearing, and reset behavior are exercised. |
| Storage recovery | Invalid JSON offers reset; unavailable storage shows a notice; simulated quota failure preserves usable in-memory uploads and navigation. |
| Interactive marketing preview | Search narrows real sample documents, source text opens, and Escape closes its dialog. |
| Mobile keyboard behavior | Drawer opens with focus, Escape returns focus to the trigger, dialog Tab traversal stays inside, and Escape restores the document control's focus under reduced-motion emulation. |
| Screenshots | Six required views and additional responsive product captures are generated from this build. |

Focused unit checks cover supporting-passage integrity and source permissions, TXT/MD/PDF/DOCX rules including 1 MB and 10 MB boundaries and empty-file rejection, workflow validation and unsupported output, and versioned saved-state validation including malformed nested values.

All three prepared question scenarios and all three supported workflow sources were also directly exercised through the current data helpers. Each prepared answer returned one citation whose passage exists in the source, and each supported workflow source returned a sample summary/action list. Evidence: [scenario-check.json](artifacts/reports/scenario-check.json).

## Viewport coverage and visual inspection

Every one of the **17 UI routes** was visited at **375, 390, 430, 768, 1024, and 1440 px**: **102 route/width combinations**. The automated gate checks a visible page heading and no horizontal document overflow greater than 1 px. It does not imply a pixel-level visual inspection of every possible state.

Routes checked: `/`, `/product`, `/features`, `/use-cases`, `/integrations`, `/pricing`, `/login`, `/signup`, `/demo-request`, `/app`, `/app/documents`, `/app/knowledge`, `/app/chat`, `/app/workflows`, `/app/analytics`, `/app/team`, and `/app/settings`.

Manual visual review of captured images covered:

- Desktop hero, product section, overview, source-linked chat, and the full workflow builder/result/log at 1440 px.
- Marketing hero and overview at 375, 430, 768, and 1024 px.
- Full mobile website, labeled document cards, and the stacked workflow builder at 390 px.

The desktop grid, restrained accent colors, source references, readable product text, stacked mobile sections, and document card labels remain coherent in these captures. The homepage's full question text fits its preview; the workflow capture includes all four steps and the sample result. Team/analytics tables scroll within their own regions. The narrow-screen navigation is a focus-managed drawer.

| Required screenshot | Dimensions | File |
| --- | --- | --- |
| SaaS hero | 1440 × 900 | [saas-hero.png](artifacts/screenshots/saas-hero.png) |
| Product section | 1440 × 900 | [product-section.png](artifacts/screenshots/product-section.png) |
| Dashboard | 1440 × 900 | [dashboard.png](artifacts/screenshots/dashboard.png) |
| AI chat | 1440 × 900 | [ai-chat.png](artifacts/screenshots/ai-chat.png) |
| Workflow builder, result, and log | 1440 × 1752 | [workflow-builder.png](artifacts/screenshots/workflow-builder.png) |
| Full mobile website | 390 × 6043 | [mobile-website.png](artifacts/screenshots/mobile-website.png) |

Extra captures include `mobile-documents.png`, `mobile-workflow.png`, `tablet-dashboard.png`, and `responsive-home-*` / `responsive-dashboard-*` images. They provide inspection evidence beyond the six delivery images.

## Accessibility

The axe scan used `wcag2a`, `wcag2aa`, `wcag21a`, and `wcag21aa` tags on all 17 routes. **Zero violations were reported** in the default scanned states. The saved report is [accessibility-scan.json](artifacts/reports/accessibility-scan.json).

Lighthouse separately reported **100 accessibility** for the homepage and dashboard in both measured profiles after the preview's heading sequence was corrected. These automated results apply to the tested states and rules; they are not a claim of full WCAG conformance.

Source inspection confirms semantic headings and table headers, labeled inputs/selects, visible focus rings, selected-state attributes, status/error announcements, native dialogs, an app skip link, inert closed mobile navigation, and accessible chart summaries. The analytics table supplies exact daily sample values, and its scrolling region is keyboard-focusable. The overview chart links to the analytics screen.

Keyboard behavior was exercised through browser automation: navigation drawer focus, Escape focus return, dialog focus containment, source-dialog closing, and analytics tab selection/focus with ArrowRight. The reusable tabs also implement Home, End, and ArrowLeft. Reduced motion was emulated during the mobile test; CSS suppresses motion and chat uses immediate scrolling. Manual visual inspection checked contrast and readable hierarchy in the captured images. No real screen-reader, touch-device, Safari, or Firefox session was performed.

## Production performance

Lighthouse **13.5.0** measured the compiled application locally on 2026-09-28, from 08:45:59 to 08:46:18 UTC. The final command made one synthetic lab run per page/profile. Desktop uses Lighthouse's desktop configuration; mobile uses simulated throttling with 150 ms RTT, approximately 1.6 Mbps throughput, and 4× CPU slowdown. Raw settings are preserved in each report.

| Page / profile | Performance | Accessibility | Best practices | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage / desktop | 100 | 100 | 100 | 0.530 s | 0.00 | 0 ms |
| Dashboard / desktop | 100 | 100 | 100 | 0.510 s | 0.02 | 0 ms |
| Homepage / mobile | 97 | 100 | 100 | 2.499 s | 0.00 | 42 ms |
| Dashboard / mobile | 96 | 100 | 100 | 2.655 s | 0.04 | 38 ms |

Evidence: [homepage desktop](artifacts/reports/lighthouse-home-desktop.json), [dashboard desktop](artifacts/reports/lighthouse-dashboard-desktop.json), [homepage mobile](artifacts/reports/lighthouse-home-mobile.json), [dashboard mobile](artifacts/reports/lighthouse-dashboard-mobile.json).

Local fonts are preloaded through `next/font/local`; the app supplies a real SVG icon, eliminating the original favicon 404. Marketing remains server-rendered around isolated interactive components. Charts use lightweight CSS/markup. No external fonts, decorative AI media, or chart framework are required at runtime.

These scores are local lab observations, not field measurements or an all-route performance guarantee. The mobile dashboard's 2.655 s LCP and 0.04 CLS remain opportunities for further load/hydration optimization on constrained devices. Lighthouse also identifies unused framework JavaScript and legacy transforms; they do not prevent the demonstrated journeys from working. SEO was not scored because this unpublished fictional concept intentionally uses `noindex, nofollow`.

## Requirement-by-requirement completion evidence

The [deliverable audit snapshot](artifacts/reports/deliverable-audit.json) records the current build ID, manifest/lock agreement, all 17 route files, all 12 case-study topics, and validated PNG dimensions for the six required captures. Functional completion is supported by the source inspection and production journeys below, not just artifact existence.

| Approved-plan requirement | Current evidence / decision |
| --- | --- |
| Standalone English NEXA concept, selected local-demo/light-technical direction | Independent package/configuration; English route content; concept labels in marketing and app shell; rendered captures. Complete. |
| Off-white, graphite, teal, grids, typography, honest product UI | `app/globals.css`, shared brand, interactive product preview, reviewed screenshots; no fabricated customer proof. Complete. |
| Reusable buttons/fields/cards/tables/navigation/tabs/badges/dialogs/dropdowns/notices/loading/empty/error patterns | `components/ui.tsx` including keyboard-operated `Tabs`, shared class patterns, native fields/dialogs, segmented controls, storage/loading/form/run states; production journey tests. Complete. |
| Home: promise, interactive preview, walkthrough, use cases, pricing preview, CTA | `HomePage` in `components/marketing.tsx`, `ProductPreview`, homepage screenshot and preview/entry tests. Complete. |
| Product, Features, Use cases, Integrations, Pricing | Separate route files and content; proposed integrations and pricing labeled as concepts; route and pricing-toggle tests. Complete. |
| Login/signup and prepared demo request | `components/marketing-forms.tsx`; native validation and local state; request summary and Clipboard API copy control; no account/password or send service. Complete. |
| App Overview with material, knowledge, activity, sample analytics, workflow status | `components/views/overview.tsx`; shared current counts and sample labels; screenshots and connected-run tests. Complete. |
| Documents: upload/search/filter/sort/detail/rename/assign/delete | `components/views/documents.tsx`, `document-detail.tsx`, provider; upload and library-editing browser tests. Complete. |
| Knowledge: create/edit collections, membership, title/tag/text search | Knowledge view, shared `searchDocuments`, document assignment; create/edit/persistence tests. Complete. |
| Chat: history/prompts/context/states/clickable references/fallback | Chat view, `sampleAnswer`, source modal; supported, unsupported, and restricted-context tests; source-integrity checks for all scenarios. Complete. |
| Workflow CRUD, enable flag, ordered builder, validation, progress, sample results, failure/retry/log | Workflows view, `validateWorkflow`, `sampleWorkflowOutput`, provider; execution/management tests and full result screenshot. Complete for manual simulations. |
| Analytics ranges and accessible sample chart summaries | Analytics view and numeric data table; range controls tested; sample labels distinguish local metrics. Complete. |
| Team presentation and simulated invitation | Team view/provider; role persistence and unsent invitation test; visual-only role notice. Complete. |
| Settings/profile/storage/reset | Settings view/provider; preference persistence, reset, corrupt-storage, read-failure, and quota-failure tests. Complete. |
| Typed shared model/data architecture | `lib/demo.ts`, provider, strict TypeScript; version and nested-data validator tests. Complete. |
| Approximate seeded dataset and 30-day samples | Current helper inspection: 12 documents, 8 text sources, 4 collections, 5 members, 3 workflows; 30 activity events spanning Aug 29–Sep 27; 30 daily usage samples. Complete. |
| File size/type limits, metadata-only binary entries, plain text, no external upload | `documentType`, `file.text()` only for TXT/MD, React text rendering, provider, source inspection for transport calls; unit/browser checks. Complete. |
| Local changes reflected across screens; history marked sample | Provider actions add run/note/activity, overview counts update, analytics has separate local metrics; connected-run test. Complete. |
| Authentication/permissions/invitations/integrations remain presentation flows | Explicit UI notices and local-only handlers; no password inputs, API transport, send service, or payment code. Complete. |
| Parent boundary inspected, self-contained child, overlap documented | Child package/config; inspected parent TypeScript/ESLint globs; README boundary section. Complete. Parent checks are not claimed. |
| Lint/types/focused tests/build/production journeys | All command results above have exit 0 and saved evidence. Complete. |
| All six widths, drawer, mobile document rows, stacked chat, appropriate scrolling | 102 route-width checks, mobile focus test, CSS rules, manually reviewed responsive captures. Complete within desktop browser emulation. |
| Keyboard/labels/dialogs/chart alternatives/reduced motion/a11y/performance checks | Source inspection, focus/reduced-motion test, 17-route axe scan, four production Lighthouse reports, manual screenshot review. Complete within the stated verification scope. |
| Runnable application and setup commands | Compiled server exercised by browser/performance runners; README includes independent install/start/check commands. Complete. |
| CASE-STUDY.md: all 12 requested topics | File inspected: Problem, concept, target users, business model, marketing strategy, dashboard architecture, IA, design system, AI UX, responsive approach, technology, and demonstrated skills. Complete. |
| Six actual screenshots and QA report | PNG files inspected with valid dimensions; current report records commands, coverage, observations, and limitations. Complete. |

## Demo limitations and scope

- Answers and workflow output are curated examples; there is no AI provider, embedding/indexing service, or accuracy guarantee.
- TXT/MD content supports local preview/search. PDF/DOCX content is not parsed or saved; metadata only. Browser storage has a cumulative quota even when individual file size checks pass.
- State is tied to the browser origin/device, with no synchronization or secure storage service. The in-memory fallback lasts for the current visit.
- Workflow flags do not schedule jobs. Simulation is manual and supports the three named seeded sources; other sources produce the documented retry state.
- Login/signup, team roles, and notification preferences are presentation flows. They do not authenticate, enforce permissions, or send alerts.
- Invitations and requests are not sent. Pricing and integrations are illustrative and cannot be purchased or connected.
- Historical activity and usage, organizations, people, and research documents are fictional. No users, customers, funding, revenue, or product impact results are claimed.
- Browser verification used Chrome with viewport emulation; real devices, other browsers, and assistive technologies remain unverified.
- The parent portfolio's broad tool globs can include this nested source. Its configuration was not silently changed, and parent-wide validation is outside this report.
- No deployment, payment collection, external messaging, real AI, or parent portfolio publication was performed.

The delivered state satisfies the approved concept implementation and evidence deliverables within those explicit boundaries.
