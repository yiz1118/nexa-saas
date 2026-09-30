import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const phase = process.argv[2];
assert.ok(["before", "after"].includes(phase), "Use before or after with NEXA running on port 3213.");
const folder = join(process.cwd(), "test-results", "motion-review");
mkdirSync(join(folder, phase), { recursive: true });
const selectors = [".marketing-header", ".hero-inner", ".hero-copy h1", ".product-preview", ".marketing-section", ".flow-card", ".creator-section", ".app-topbar", ".app-content", ".stat-card", ".surface", ".bar-chart", ".large-chart", ".workflow-step", ".button"];
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const samples = [];
try {
  for (const width of [375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/", "/product", "/app", "/app/analytics", "/app/workflows"]) {
      await page.goto(`http://127.0.0.1:3213${route}`);
      await page.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(selectors => Object.fromEntries(selectors.map(selector => [selector,
        Array.from(document.querySelectorAll(selector)).map(element => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, font: style.font, color: style.color, background: style.backgroundColor, padding: style.padding, gap: style.gap, border: style.border };
        }),
      ])), selectors);
      const overflow = await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - innerWidth);
      assert.ok(overflow <= 1, `${route} overflows at ${width}px`);
      const name = `${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${width}`;
      await page.screenshot({ path: join(folder, phase, `${name}.png`), animations: "disabled" });
      samples.push({ route, width, layout });
    }
  }
} finally {
  await browser.close();
}
writeFileSync(join(folder, `${phase}.json`), JSON.stringify(samples, null, 2));
if (phase === "after") {
  const baseline = JSON.parse(readFileSync(join(folder, "before.json"), "utf8"));
  const differences = [];
  samples.forEach((sample, index) => {
    for (const [selector, elements] of Object.entries(sample.layout)) {
      const original = baseline[index].layout[selector];
      assert.equal(elements.length, original.length, `${selector} count changed`);
      elements.forEach((element, item) => {
        for (const [key, after] of Object.entries(element)) {
          const before = original[item][key];
          if (typeof before === "number" ? Math.abs(before - after) > 0.5 : before !== after) differences.push({ route: sample.route, width: sample.width, selector, item, key, before, after });
        }
      });
    }
  });
  writeFileSync(join(folder, "comparison.json"), JSON.stringify({ samples: samples.length, differences }, null, 2));
  assert.equal(differences.length, 0, "Review layout differences in test-results/motion-review/comparison.json.");
}
console.log(JSON.stringify({ phase, samples: samples.length, overflow: 0 }));
