import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, webkit } from "@playwright/test";

const folder = join(process.cwd(), "artifacts", "icon-consistency");
const results = [];
for (const [name, engine, options] of [["edge", chromium, { channel: "msedge" }], ["webkit", webkit, {}]]) {
  const browser = await engine.launch(options);
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  mkdirSync(join(folder, name), { recursive: true });
  try {
    for (const width of [375, 390, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of ["/", "/product", "/app", "/demo-request"]) {
        await page.goto(`http://127.0.0.1:3213${route}`);
        await page.locator("h1").waitFor();
        await page.evaluate(() => document.fonts.ready);
        const check = await page.evaluate(() => {
          const issues = [];
          const nodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const glyphs = /[\u2190-\u21ff\u2300-\u23ff\u25a0-\u27ff\ufe0e\ufe0f\u22ef\u2212]/u;
          while (nodes.nextNode()) {
            const node = nodes.currentNode;
            if (!node.parentElement?.closest("script, style") && glyphs.test(node.textContent ?? "")) issues.push(`Unicode icon: ${node.textContent}`);
          }
          document.querySelectorAll("svg").forEach(svg => {
            const style = getComputedStyle(svg);
            if (svg.getAttribute("aria-hidden") !== "true") issues.push("Decorative SVG is exposed");
            if (svg.getAttribute("stroke") !== "currentColor" || style.stroke !== style.color) issues.push("SVG does not inherit its color");
            if (style.backgroundColor !== "rgba(0, 0, 0, 0)") issues.push("SVG has a background");
          });
          return { issues, icons: document.querySelectorAll("svg").length, overflow: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - innerWidth };
        });
        assert.deepEqual(check.issues, [], `${name}: ${route} at ${width}px`);
        assert.ok(check.overflow <= 1, `${name}: ${route} overflows at ${width}px`);
        const file = `${route === "/" ? "home" : route.slice(1)}-${width}.png`;
        await page.screenshot({ path: join(folder, name, file), animations: "disabled" });
        results.push({ engine: name, version: browser.version(), route, width, ...check });
      }
    }
    const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
    try {
      const mobile = await touch.newPage();
      await mobile.goto("http://127.0.0.1:3213/app");
      await mobile.locator("h1").waitFor();
      const open = mobile.getByRole("button", { name: "Open navigation" });
      const openRect = await open.boundingBox();
      assert.ok(openRect.width >= 44 && openRect.height >= 44);
      await open.tap();
      const close = mobile.getByRole("button", { name: "Close navigation", exact: true }).filter({ has: mobile.locator("svg") });
      const closeRect = await close.boundingBox();
      assert.ok(closeRect.width >= 44 && closeRect.height >= 44);
      await close.tap();
      assert.ok(await open.evaluate(element => element === document.activeElement));
      results.push({ engine: name, touchNavigation: "passed", reducedMotion: "reduce", openRect, closeRect });
    } finally {
      await touch.close();
    }
  } finally {
    await browser.close();
  }
}
writeFileSync(join(folder, "platform-checks.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ engines: ["edge", "webkit"], responsiveChecks: results.filter(result => result.route).length, touchChecks: results.filter(result => result.touchNavigation).length, issues: 0 }));
