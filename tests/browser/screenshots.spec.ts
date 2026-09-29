import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

test("capture the six requested portfolio screens", async ({ page }) => {
  const folder = join(process.cwd(), "artifacts", "screenshots");
  mkdirSync(folder, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Find the thread/i })).toBeVisible();
  await page.screenshot({ path: join(folder, "saas-hero.png"), animations: "disabled" });
  await page.locator("#product").scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(folder, "product-section.png"), animations: "disabled" });
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: /Good morning/i })).toBeVisible();
  await page.screenshot({ path: join(folder, "dashboard.png"), animations: "disabled" });
  await page.goto("/app/chat");
  await page.getByRole("button", { name: /What is blocking the Atlas release/i }).click();
  await expect(page.getByText(/The Atlas release depends/i)).toBeVisible();
  await page.screenshot({ path: join(folder, "ai-chat.png"), animations: "disabled" });
  await page.goto("/app/workflows");
  await expect(page.getByRole("heading", { name: "Workflows" })).toBeVisible();
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.getByText("Sample run complete")).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1250 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: join(folder, "workflow-builder.png"), animations: "disabled", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/documents");
  await page.screenshot({ path: join(folder, "mobile-documents.png"), animations: "disabled" });
  await page.goto("/app/workflows");
  await page.screenshot({ path: join(folder, "mobile-workflow.png"), animations: "disabled", fullPage: true });
  await page.setViewportSize({ width: 1024, height: 1000 });
  await page.goto("/app");
  await page.screenshot({ path: join(folder, "tablet-dashboard.png"), animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: join(folder, "mobile-website.png"), animations: "disabled", fullPage: true });
  for (const width of [375, 430, 768, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await page.screenshot({ path: join(folder, `responsive-home-${width}.png`), animations: "disabled" });
    await page.goto("/app");
    await expect(page.getByRole("heading", { name: /Good morning/i })).toBeVisible();
    await page.screenshot({ path: join(folder, `responsive-dashboard-${width}.png`), animations: "disabled" });
  }
});
