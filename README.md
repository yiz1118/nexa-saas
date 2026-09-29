# NEXA — AI Knowledge Workspace

**Concept Project.** A standalone SaaS marketing website and connected, interactive browser workspace. The product promise is: **“Turn scattered project documents into answers your team can trace.”**

NEXA demonstrates document organization, text search, source-linked sample answers, workflow editing, and local state persistence. It requires no API key, backend, password, or external account. All organizations, people, documents, activity, and usage figures in the seed workspace are fictional.

## Run locally

Use Node.js 24 LTS and npm. Verification on this Windows host used Node 24.13.0 and npm 11.6.2. Open PowerShell in this application folder, not the parent portfolio:

```powershell
Set-Location -LiteralPath 'C:\Users\alson\Documents\codexProject\Freelance Portfolio\Portfolio website\03 — Technology  AI SaaS Website + Dashboard'
npm ci
npm run dev
```

Open **http://localhost:3213**. The website is `/`; the workspace is `/app`. Select **Explore demo** to enter immediately, or use `/signup` to personalize the local profile. No real account is created.

For the compiled application:

```powershell
npm run build
npm run start
```

Stop the development server before starting the production server; both use port 3213. The scripts explicitly use Webpack for development and builds because Turbopack failed in this Windows path containing an em dash. Keep these scripts when running from the supplied folder.

## Verification

Run these commands from the NEXA application folder:

```powershell
npm run lint
npm run build
npm run typecheck
npm test
npm run test:browser
npm run test:performance
```

Browser tests and performance measurements each start and stop their own production server. **Port 3213 must be free**, and `npm run build` must have completed first. Run the two commands sequentially. Browser tests use installed Google Chrome through Playwright's `chrome` channel. Performance checks use Lighthouse and Chrome Launcher; Chrome must be installed and discoverable (or configured through `CHROME_PATH`).

`test:browser` covers connected journeys, all 17 routes at six widths, axe accessibility scans, and screenshots. `test:performance` produces four Lighthouse JSON reports for the homepage and dashboard in desktop and mobile profiles. It measures a local production build, with one synthetic lab run per page/profile; results are not real-user measurements.

Generated evidence:

- `playwright-report/index.html` — browser test report.
- `artifacts/reports/accessibility-scan.json` — axe results.
- `artifacts/reports/lighthouse-*.json` and `performance-summary.json` — production performance evidence.
- `artifacts/screenshots/` — finished application screenshots, including extra responsive inspection captures.
- [QA-REPORT.md](QA-REPORT.md) — outcomes, coverage, and limitations.
- [CASE-STUDY.md](CASE-STUDY.md) — product and design rationale.

The performance runner keeps its disposable Chrome profile in the ignored `test-results/lighthouse-profile` folder. This avoids Chrome Launcher's Windows Temp cleanup error; no real browser profile is used. Playwright recreates its own test-output folder on subsequent browser runs.

## Routes

| Surface | Routes |
| --- | --- |
| Marketing | `/`, `/product`, `/features`, `/use-cases`, `/integrations`, `/pricing` |
| Local entry and request forms | `/login`, `/signup`, `/demo-request` |
| Workspace | `/app`, `/app/documents`, `/app/knowledge`, `/app/chat`, `/app/workflows`, `/app/analytics`, `/app/team`, `/app/settings` |

Marketing pages are server-rendered where practical. Interactive previews, pricing, forms, and workspace views are isolated client components. The application uses Next.js App Router, React, strict TypeScript, Tailwind CSS, custom CSS design tokens, Lucide icons, and locally packaged Manrope fonts.

## A connected demo journey

1. Open `/app/documents` and upload a TXT or Markdown file. Inspect its plain text, search a phrase, and assign it to a collection. Reload to confirm persistence.
2. Open `/app/chat` and ask **“What is blocking the Atlas release?”** Select the cited source to inspect the original passage. Selecting a different document context prevents an answer from using the Atlas source. Unsupported questions receive an honest fallback with prepared prompts.
3. Open `/app/workflows`. Edit the Handover digest, then simulate a run using **Project Atlas handover**. Its final note step creates a searchable local Markdown document and updates counts and activity.
4. Select **Design system principles** as the workflow source to see the retryable failure. Choose a supported document and retry.
5. Open `/app/settings` to change the workspace/profile or reset all demo changes.

The homepage preview also supports searching three seeded sources, opening their text, selecting a sample question, and opening its cited document.

## Storage and simulation boundaries

State uses the versioned localStorage key **`nexa-concept-v1`**. Documents, collections, messages, citations, workflows, runs, fictional members, and preferences share one typed service in `components/workspace-provider.tsx`. Data persists on the current browser origin; `localhost` and `127.0.0.1` have separate storage.

| Capability | Implemented behavior |
| --- | --- |
| TXT / Markdown upload | Up to 1 MB per file. Text and metadata are read locally, rendered as plain text, and saved in browser storage. |
| PDF / DOCX upload | Up to 10 MB per file. Only metadata is saved; no binary content, parsing, indexing, or preview of file contents. |
| Sample answers | Three curated scenarios. Only permitted sources with the actual supporting passage can be cited. Uploaded files are never analyzed by an AI model. |
| Workflow simulation | Ordered steps, validation, brief progress, sample summary/actions, run log, failure/retry, and a real local note when the note step is included. |
| Workflow enable flag | Saved presentation state. No background trigger or scheduler executes; runs start manually. |
| Analytics | Fixed September 2026 sample series, with local runs/documents counted separately. |
| Login / signup / roles | Local presentation flows; no passwords, authentication, or permission enforcement. |
| Invitations / demo requests | Local preparation only. No email or message is sent. Request text can be copied. |
| Integrations / pricing | Clearly labeled concepts. No connections, payment collection, or subscriptions. |

Uploads and questions are never sent externally by this application. This is browser storage, not a secure document vault or a cross-device service. Storage quotas depend on the browser: a 1 MB text file may fit individually while cumulative uploads can exceed the origin quota. On storage failure, a visible notice explains that changes continue in memory for the current visit. Invalid saved data exposes a reset action. Reset clears this demo's local state and restores the seed workspace; it does not clear unrelated browser data.

## Source map

| Path | Responsibility |
| --- | --- |
| `app/` | Routes, metadata, root styles, and workspace provider layout. |
| `components/marketing.tsx` | Marketing structure, content, diagrams, navigation, and footer. |
| `components/product-preview.tsx` | Interactive marketing document/answer preview. |
| `components/app-shell.tsx` | Sidebar, mobile drawer, navigation, hydration state, storage notices. |
| `components/ui.tsx` | Shared badges, dialogs, headings, keyboard-operated tabs, skeletons, and empty states. |
| `components/views/` | Eight connected workspace screens. |
| `components/workspace-provider.tsx` | Shared local state and related actions. |
| `lib/demo.ts` | Typed models, seed data, search, upload rules, curated answers, workflow rules, state validation. |
| `tests/` | Focused unit checks and production browser journeys. |
| `scripts/performance.mjs` | Reproducible production Lighthouse measurements. |

## Parent portfolio boundary

This folder has its own `package.json`, lockfile, dependencies, Next.js configuration, TypeScript configuration, ESLint configuration, and port. It does not import the parent portfolio's components, email service, styles, environment, or application data. No parent portfolio integration or publication is included.

The parent `Freelance Portfolio/tsconfig.json` currently includes broad `**/*.ts` and `**/*.tsx` globs. It excludes other nested examples but does **not** exclude NEXA; its `@/*` alias resolves at the parent root. The parent ESLint ignores likewise do not exclude NEXA. Running parent-wide tooling may therefore include this application's source under the parent's configuration. Run NEXA checks inside this folder. Parent configuration was inspected and left untouched; parent-wide validation is not claimed.

Deployment, payments, live AI, external messaging, server authentication, binary document parsing, background automation, and parent portfolio publication are outside this implementation.
