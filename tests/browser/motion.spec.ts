import { expect, test, webkit } from "@playwright/test";

test("reveals run once, cancel for reduced motion, and keep content readable without JavaScript", async ({ page, browser }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const cards = page.locator(".flow-grid").first();
  await expect(cards).toBeVisible();
  // Unobserved content is never hidden by a CSS or hydration gate.
  expect(await cards.evaluate(element => getComputedStyle(element).opacity)).toBe("1");
  await cards.scrollIntoViewIfNeeded();
  await expect(cards).toHaveAttribute("data-revealed", "true");
  expect(await cards.evaluate(element => element.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === "running").length)).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await cards.scrollIntoViewIfNeeded();
  expect(await cards.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);

  const noJs = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce" });
  try {
    const staticPage = await noJs.newPage();
    await staticPage.goto("http://127.0.0.1:3213/");
    await expect(staticPage.getByRole("heading", { name: /Find the thread/i })).toBeVisible();
    await expect(staticPage.locator(".flow-card").first()).toBeVisible();
    await expect(staticPage.getByRole("link", { name: "View Portfolio" })).toBeVisible();
  } finally { await noJs.close(); }
});

test("tabs update immediately and workflow motion tracks one running step", async ({ page }) => {
  await page.goto("/app/analytics");
  await page.getByRole("tab", { name: "7 days", exact: true }).click();
  await expect(page.locator(".analytics-table tbody tr")).toHaveCount(7);
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "14 days", exact: true })).toBeFocused();
  await expect(page.locator(".analytics-table tbody tr")).toHaveCount(14);
  await page.goto("/app/workflows");
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.locator('.workflow-step-wrap[data-running="true"]')).toHaveCount(1);
  await expect(page.getByText("Sample run complete")).toBeVisible();
  await expect(page.locator('.workflow-step-wrap[data-running="true"]')).toHaveCount(0);
});

test("WebKit preserves all routes, mobile navigation, and reduced motion", async () => {
  test.setTimeout(180000);
  const browser = await webkit.launch({ channel: "" });
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3213", reducedMotion: "no-preference" });
  const watchErrors = (page: import("@playwright/test").Page) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    return errors;
  };
  const routes = ["/", "/product", "/features", "/use-cases", "/integrations", "/pricing", "/login", "/signup", "/demo-request", "/app", "/app/documents", "/app/knowledge", "/app/chat", "/app/workflows", "/app/analytics", "/app/team", "/app/settings"];
  try {
    for (const width of [375, 390, 430, 768, 1024, 1440]) {
      for (const route of routes) {
        // Isolate each responsive sample; actual client navigation is checked below.
        const sample = await context.newPage();
        const errors = watchErrors(sample);
        try {
          await sample.setViewportSize({ width, height: 1000 });
          await sample.goto(route);
          await expect(sample.locator("h1")).toBeVisible();
          await sample.waitForLoadState("networkidle");
          expect(await sample.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - innerWidth), `${route} at ${width}`).toBeLessThanOrEqual(1);
          expect(errors, `${route} at ${width}`).toEqual([]);
        } finally { await sample.close(); }
      }
    }
    const page = await context.newPage();
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    for (const [label, path] of [["Product", "/product"], ["Features", "/features"], ["Use cases", "/use-cases"], ["Integrations", "/integrations"], ["Pricing", "/pricing"]]) {
      await page.locator(".marketing-nav").getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(`http://127.0.0.1:3213${path}`);
      await expect(page.locator("h1")).toBeVisible();
      await page.waitForLoadState("networkidle");
    }
    await page.locator(".marketing-header").getByRole("link", { name: "Explore demo", exact: true }).click();
    for (const label of ["Documents", "Knowledge base", "AI chat", "Workflows", "Analytics", "Team", "Settings", "Overview"]) {
      await page.locator(".app-nav").getByRole("link", { name: label, exact: true }).click();
      await expect(page.locator("h1")).toBeVisible();
      await page.waitForLoadState("networkidle");
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("link", { name: "Overview", exact: true })).toBeFocused();
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeFocused();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.locator(".app-nav").getByRole("link", { name: "Documents", exact: true }).click();
    await page.getByRole("button", { name: /Project Atlas handover/i }).click();
    await expect(page.getByRole("dialog", { name: "Document details" })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("link", { name: "Website", exact: true }).click();
    await expect(page).toHaveURL("http://127.0.0.1:3213/");
    await page.waitForLoadState("networkidle");
    await expect.poll(() => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === "running").length)).toBe(0);
    expect(errors).toEqual([]);
  } finally { await browser.close(); }
});
