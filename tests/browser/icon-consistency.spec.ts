import { expect, test } from "@playwright/test";

const routes = ["/", "/product", "/features", "/use-cases", "/integrations", "/pricing", "/login", "/signup", "/demo-request", "/app", "/app/documents", "/app/knowledge", "/app/chat", "/app/workflows", "/app/analytics", "/app/team", "/app/settings"];

test("UI icons are decorative SVGs across marketing and workspace routes", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      const issues = await page.evaluate(() => {
        const issues: string[] = [];
        const glyphs = /[\u2190-\u21ff\u2300-\u23ff\u25a0-\u27ff\ufe0e\ufe0f\u22ef\u2212]/u;
        const nodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (nodes.nextNode()) {
          const node = nodes.currentNode;
          if (!node.parentElement?.closest("script, style") && glyphs.test(node.textContent ?? "")) issues.push(`Unicode icon: ${node.textContent}`);
        }
        document.querySelectorAll("svg").forEach(svg => {
          if (svg.getAttribute("aria-hidden") !== "true") issues.push(`Unhidden decorative icon: ${svg.classList.value}`);
          if (svg.getAttribute("stroke") !== "currentColor") issues.push(`Non-inheriting stroke: ${svg.classList.value}`);
          if (getComputedStyle(svg).backgroundColor !== "rgba(0, 0, 0, 0)") issues.push(`SVG background: ${svg.classList.value}`);
        });
        document.querySelectorAll("a, button").forEach(control => {
          if (control.querySelector("svg") && !control.textContent?.trim() && !control.getAttribute("aria-label") && !control.getAttribute("aria-labelledby")) issues.push(`Unlabelled icon control: ${control.className}`);
        });
        return issues;
      });
      expect(issues, `${route} at ${width}px`).toEqual([]);
    }
  }
});

test("SVG controls preserve desktop hover, mobile touch targets, and reduced motion", async ({ browser, page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const preview = page.getByRole("link", { name: "Preview: AI chat" });
  await expect(preview.locator("svg")).toHaveAttribute("aria-hidden", "true");
  const button = page.locator(".hero-buttons .button-dark");
  const color = await button.evaluate(element => getComputedStyle(element).backgroundColor);
  await button.hover();
  await expect.poll(() => button.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(color);

  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  try {
    const mobile = await touch.newPage();
    await mobile.goto("http://127.0.0.1:3213/app");
    await expect(mobile.locator("h1")).toBeVisible();
    const open = mobile.getByRole("button", { name: "Open navigation" });
    const rect = await open.boundingBox();
    expect(rect?.width).toBeGreaterThanOrEqual(44);
    expect(rect?.height).toBeGreaterThanOrEqual(44);
    await open.tap();
    const close = mobile.getByRole("button", { name: "Close navigation", exact: true }).filter({ has: mobile.locator("svg") });
    const closeRect = await close.boundingBox();
    expect(closeRect?.width).toBeGreaterThanOrEqual(44);
    expect(closeRect?.height).toBeGreaterThanOrEqual(44);
    await expect(close.locator("svg")).toHaveAttribute("aria-hidden", "true");
    await close.tap();
    await expect(open).toBeFocused();
    const duration = await open.evaluate(element => getComputedStyle(element).transitionDuration);
    expect(duration.split(",").every(value => parseFloat(value) <= 0.001)).toBe(true);
    await mobile.goto("http://127.0.0.1:3213/demo-request");
    await mobile.getByRole("link", { name: "Back to website" }).tap();
    await expect(mobile).toHaveURL("http://127.0.0.1:3213/");
  } finally {
    await touch.close();
  }
});
