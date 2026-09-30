# NEXA motion polish

Scope: the standalone `nexa-saas` concept website. Reviewed on 30 September 2026. The existing brand, layout, typography, colors, content, routes, product CTA, and creator links are preserved. No animation package was added.

## Audit and decisions

| Surface | Opportunity | Implemented decision |
| --- | --- | --- |
| Home and public page heroes | The product introduction arrived as one static frame | Coordinate the heading, actions, and product preview with small vertical movements. Keep the heading and copy readable from the first paint. |
| Home and product narrative | Source, answer, and action sections did not have an entrance hierarchy | Reveal selected section introductions and stagger small product groups once as they enter view. |
| Features and use cases | Long sections appeared abruptly during scrolling | Use a short slide on feature rows and use-case panels. Do not animate individual words or paragraphs. |
| Integrations and pricing | Comparison and plan selection need quick scanning | Leave card grids, numbers, prices, and tables static; retain immediate selection behavior. |
| Dashboard overview | Statistics, charts, and supporting panels arrived together | Stagger the four statistic cards and paired panels. Grow chart bars from their base without changing data or dimensions. |
| Analytics | Range changes were visually abrupt | Add a short transition to the existing tab panel in place. Change the displayed data immediately and preserve keyboard navigation. |
| Workflows | The simulation status did not identify the current canvas step | Highlight exactly one step while the existing simulation runs and briefly extend its incoming connector. Clear the highlight when the run finishes. |
| Documents, knowledge, chat, and team | Dialogs could enter more deliberately | Give native dialogs a short transform entrance. Leave document rows, source passages, responses, and editable lists static. |
| Settings, login, signup, and demo request | These are reading and form tasks | Keep fields, validation, and form state changes immediate. Use existing shared button feedback. |
| Navigation and creator contacts | SVG arrows and touch controls needed consistent feedback | Add small SVG arrow movement, navigation underline feedback, and tap feedback. Refine the drawer timing and restore menu-trigger focus on button/backdrop dismissal. |

No parallax, scroll interception, page-exit delays, decorative loops, count-up metrics, or loading gate was introduced. Existing status animations remain status indicators; reduced motion disables them.

## Motion system

- `components/motion.tsx` provides an IntersectionObserver scope for surface, stagger, and chart reveals plus a tab-panel hook. It reuses existing DOM geometry.
- Surface text stays at full opacity throughout movement. Chart bars and the drawer backdrop may fade; no readable text is faded below its normal contrast.
- Desktop sections move 16px over 480ms. Chart bars animate over 520ms. Stagger delays are capped at 160ms, including charts with many bars.
- At widths up to 600px, sections move 10px over 360ms and stagger delays are capped at 72ms.
- The hero preview entrance finishes within 720ms on desktop and 480ms on small screens. Headings remain visible throughout.
- Controls and tabs use 180ms feedback, dialogs 160ms, and the drawer 200ms. Workflow connectors follow the existing 270ms simulation steps.
- The shared easing is `cubic-bezier(0.22, 0.68, 0, 1)`. Movement uses transforms rather than changes to width, height, position, or spacing.
- Content is visible before JavaScript, while offscreen, and when browser animation APIs are unavailable. Reveal observers run once per target and clean up on route changes/unmount.
- Keyboard focus cancels active section reveals. Tabs retain the same panel DOM and controls. `prefers-reduced-motion` disables CSS motion and cancels active Web Animations, including when changed during a visit.

## Reproducing review

Run the production server on port 3213 and capture the original layout with `node scripts/motion-review.mjs before` before editing. After editing and rebuilding, run `node scripts/motion-review.mjs after`. The comparison samples home, product, dashboard, analytics, and workflows at 375, 390, 430, 768, 1024, and 1440px with reduced motion enabled. Screenshots and comparison JSON are kept in the ignored `test-results/motion-review` directory.

Use a nested Playwright output directory to preserve those measurements:

```sh
npx playwright test tests/browser/journeys.spec.ts tests/browser/creator-contact.spec.ts tests/browser/icon-consistency.spec.ts tests/browser/motion.spec.ts --output test-results/browser-motion
```

The screenshot-export test is intentionally separate from behavior testing because it overwrites existing portfolio image exports. The motion review produces its own 30 screenshots for each phase.

Performance reports accept an optional output directory, so a new measurement does not overwrite the existing project reports:

```sh
npm run test:performance -- test-results/motion-current
```

## Final verification

- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test` passed. The unit test suite had 4 passing tests.
- The Chrome browser suite had 20 passing tests. It exercised all 17 routes at all six requested widths with no horizontal overflow or console errors, plus creator links, SVG icons, touch targets, the interactive local demo, keyboard navigation, and 17 route-level accessibility scans with no violations.
- The separate WebKit run passed its 102 route and width samples, client-side navigation through the public and dashboard pages, mobile drawer and dialog focus, reduced motion, and console checks. This is a WebKit engine check on Windows; physical iPhone, Android, and macOS Safari devices were not tested.
- The 30 representative before/after layout samples reported zero differences beyond the 0.5px tolerance. Measured Lighthouse layout shift remained 0 for home and 0.02/0.04 for the dashboard on desktop/mobile, matching the baseline.
- Lighthouse desktop performance remained 100 for both home and dashboard. Two final mobile runs measured home at 93/94 and dashboard at 95/96; both were 97 in the single baseline run. All final accessibility and best-practices scores were 100. These are local synthetic measurements and vary between runs; the mobile difference is recorded here rather than hidden.
