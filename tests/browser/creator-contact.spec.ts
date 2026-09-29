import { expect, test } from "@playwright/test";
import { creator } from "@/config/creator";

const marketingRoutes = ["/", "/product", "/features", "/use-cases", "/integrations", "/pricing"];

test("creator contact is visible and usable on each marketing page at six widths", async ({ page }, testInfo) => {
  for (const width of [375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of marketingRoutes) {
      await page.goto(route);
      const section = page.getByRole("region", { name: creator.name });
      await expect(section).toBeVisible();
      await expect(section).toContainText("DESIGNED & DEVELOPED BY");
      await expect(section).toContainText(creator.title);
      await expect(section).toContainText(creator.location);
      await expect(section).toContainText(creator.availability);
      await expect(page.getByText("Independent Concept Project · Fictional product")).toBeVisible();

      const portfolio = section.getByRole("link", { name: "View Portfolio" });
      await expect(portfolio).toHaveAttribute("href", creator.portfolioUrl);
      await expect(portfolio.locator("svg")).toHaveAttribute("aria-hidden", "true");
      const project = section.getByRole("link", { name: "Start a Project" });
      const projectUrl = new URL(await project.getAttribute("href") ?? "");
      expect(projectUrl.origin + projectUrl.pathname).toBe(creator.whatsappUrl);
      expect(projectUrl.searchParams.get("text")).toContain("NEXA concept project");
      await expect(section.getByRole("link", { name: "Email" })).toHaveAttribute("href", `mailto:${creator.email}`);
      await expect(section.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", creator.whatsappUrl);
      await expect(section.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", creator.linkedinUrl);
      await expect(section.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", creator.githubUrl);
      expect(await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - innerWidth)).toBeLessThanOrEqual(1);
      expect(await section.evaluate(element => /[\u2190-\u21ff\ufe0e\ufe0f\u{1F300}-\u{1FAFF}]/u.test(element.textContent ?? ""))).toBe(false);
      if (route === "/" && [390, 1440].includes(width)) {
        await section.screenshot({ path: testInfo.outputPath(`creator-${width}.png`), animations: "disabled" });
      }
    }
  }

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Explore the demo" })).toHaveAttribute("href", "/app");
});
