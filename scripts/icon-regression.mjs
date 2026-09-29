import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const phase = process.argv[2];
assert.ok(["before", "after"].includes(phase), "Use before or after with the production server on port 3213.");
const folder = join(process.cwd(), "artifacts", "icon-consistency");
mkdirSync(join(folder, phase), { recursive: true });
const selectors = [".marketing-header", ".hero-inner", ".hero-copy h1", ".hero-visual", ".hero-note", ".hero-visual-label", ".hero-visual-footer", ".product-preview", ".preview-mini-brand", ".preview-side-item", ".preview-title-row", ".preview-upload", ".feature-band", ".answer-avatar", ".marketing-section", ".button", ".app-topbar", ".app-content", ".sidebar-tip", ".request-card", ".inline-link"];
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const samples = [];
try {
  for (const width of [375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/", "/product", "/app", "/demo-request"]) {
      await page.goto(`http://127.0.0.1:3213${route}`);
      await page.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(selectors => {
        const result = {};
        for (const selector of selectors) {
          result[selector] = Array.from(document.querySelectorAll(selector)).map(element => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, font: style.font, color: style.color, background: style.backgroundColor, border: style.border, padding: style.padding, gap: style.gap };
          });
        }
        return { elements: result, overflow: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - innerWidth };
      }, selectors);
      assert.ok(layout.overflow <= 1, `${phase}: ${route} overflows at ${width}px`);
      const name = `${route === "/" ? "home" : route.slice(1)}-${width}`;
      await page.screenshot({ path: join(folder, phase, `${name}.png`), animations: "disabled" });
      if (route === "/" && [390, 1440].includes(width)) {
        await page.screenshot({ path: join(folder, phase, `${name}-full.png`), fullPage: true, animations: "disabled" });
      }
      samples.push({ route, width, ...layout });
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
    const original = baseline[index];
    for (const [selector, elements] of Object.entries(sample.elements)) {
      assert.equal(elements.length, original.elements[selector].length, `${selector} count changed`);
      elements.forEach((element, item) => {
        for (const key of ["x", "y", "width", "height", "font", "color", "background", "border", "padding", "gap"]) {
          const before = original.elements[selector][item][key];
          const after = element[key];
          const changed = typeof before === "number" ? Math.abs(before - after) > 0.5 : before !== after;
          if (changed) differences.push({ route: sample.route, width: sample.width, selector, item, key, before, after });
        }
      });
    }
  });
  writeFileSync(join(folder, "layout-comparison.json"), JSON.stringify({ samples: samples.length, differences }, null, 2));
  assert.equal(differences.length, 0, "Review before/after layout differences in layout-comparison.json.");
  console.log(JSON.stringify({ phase, samples: samples.length, differences: differences.length }));
} else {
  console.log(JSON.stringify({ phase, samples: samples.length }));
}
