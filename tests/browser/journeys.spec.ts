import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

test("marketing paths and local demo entry work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Find the thread in everything/i })).toBeVisible();
  for (const path of ["/product", "/features", "/use-cases", "/integrations", "/pricing", "/login", "/signup", "/demo-request"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
  }
  await page.goto("/login");
  await page.getByLabel("Email address").fill("demo@example.com");
  await page.getByRole("button", { name: "Enter demo workspace" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: /Good morning/i })).toBeVisible();
});

test("upload, search, inspect, assign, and persist a local text document", async ({ page }) => {
  await page.goto("/app/documents");
  await page.getByLabel("Choose documents to upload").setInputFiles({ name: "test-brief.md", mimeType: "text/markdown", buffer: Buffer.from("Research note. Portfolios should show connected product journeys.") });
  await expect(page.getByText("1 document added to this browser.")).toBeVisible();
  await page.getByRole("textbox", { name: "Search documents" }).fill("connected product journeys");
  await page.getByRole("button", { name: /test-brief/i }).click();
  await expect(page.getByText(/Portfolios should show connected product journeys/)).toBeVisible();
  await page.getByRole("dialog").getByRole("combobox", { name: "Collection" }).selectOption("research");
  await page.getByRole("button", { name: "Done" }).click();
  await page.reload();
  await page.getByRole("textbox", { name: "Search documents" }).fill("connected product journeys");
  await page.getByRole("button", { name: /test-brief/i }).click();
  await expect(page.getByRole("dialog").getByRole("combobox", { name: "Collection" })).toHaveValue("research");
});

test("chat returns a real source passage and an honest fallback", async ({ page }) => {
  await page.goto("/app/chat");
  await page.getByRole("button", { name: /What is blocking the Atlas release/i }).click();
  await expect(page.getByText(/The Atlas release depends/i)).toBeVisible();
  await page.getByRole("button", { name: /Project Atlas handover.*accessibility review/i }).click();
  await expect(page.getByRole("dialog").getByText(/The team must finish the accessibility review/)).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("textbox", { name: "Ask about the demo documents" }).fill("What is the weather tomorrow?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByText(/no prepared answer for that question/i)).toBeVisible();
});

test("workflow editor validates steps, records failure, and retries successfully", async ({ page }) => {
  await page.goto("/app/workflows");
  await page.getByRole("button", { name: "Remove Summarize" }).click();
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.locator(".workflow-canvas [role=alert]")).toContainText("Summarize");
  await page.getByLabel("Add workflow step").selectOption("summarize");
  await page.getByRole("button", { name: "Move Summarize up" }).click();
  await page.getByRole("button", { name: "Move Summarize up" }).click();
  await page.getByLabel("Source document").selectOption("design-system");
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.getByText("Sample run failed")).toBeVisible();
  await page.getByLabel("Source document").selectOption("atlas-handover");
  await page.getByRole("button", { name: "Retry sample run" }).click();
  await expect(page.getByText("Sample run complete")).toBeVisible();
  await page.goto("/app/documents");
  await page.getByRole("textbox", { name: "Search documents" }).fill("Sample note");
  await expect(page.getByRole("button", { name: /Sample note.*Project Atlas/i })).toBeVisible();
  await page.goto("/app");
  await expect(page.getByText("1", { exact: true }).first()).toBeVisible();
});

test("forms, empty state, rejected upload, reset, and keyboard dialog work", async ({ page }) => {
  await page.goto("/demo-request");
  await page.getByRole("button", { name: "Prepare request" }).click();
  await expect(page.getByLabel("Your name")).toHaveAttribute("required", "");
  await page.getByLabel("Your name").fill("Alex");
  await page.getByLabel("Email address").fill("alex@example.com");
  await page.getByLabel("What would you want to see?").fill("Trace an answer to source material.");
  await page.getByRole("button", { name: "Prepare request" }).click();
  await expect(page.getByText("Prepared locally — not sent")).toBeVisible();
  await page.goto("/app/documents");
  await page.getByLabel("Choose documents to upload").setInputFiles({ name: "unsafe.exe", mimeType: "application/octet-stream", buffer: Buffer.from("123") });
  await expect(page.locator(".alert-box[role=alert]")).toContainText("Use a TXT");
  await page.getByRole("textbox", { name: "Search documents" }).fill("zzzz-no-match");
  await expect(page.getByText("No matching documents")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("button", { name: /Project Atlas handover/i }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.goto("/app/settings");
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByText(/Sample workspace restored/)).toBeVisible();
});

test("all requested viewports render without horizontal page overflow", async ({ page }) => {
  for (const width of [375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/product", "/features", "/use-cases", "/integrations", "/pricing", "/login", "/signup", "/demo-request", "/app", "/app/documents", "/app/knowledge", "/app/chat", "/app/workflows", "/app/analytics", "/app/team", "/app/settings"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test("automated accessibility checks on primary screens", async ({ page }) => {
  const failures: { path: string; id: string; nodes: { target: string; summary: string }[] }[] = [];
  for (const path of ["/", "/product", "/features", "/use-cases", "/integrations", "/pricing", "/login", "/signup", "/demo-request", "/app", "/app/documents", "/app/knowledge", "/app/chat", "/app/workflows", "/app/analytics", "/app/team", "/app/settings"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    failures.push(...results.violations.map(v => ({ path, id: v.id, nodes: v.nodes.map(n => ({ target: String(n.target), summary: n.failureSummary?.split("\n")[1] ?? "" })) })));
  }
  const reportDir = join(process.cwd(), "artifacts", "reports");
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(join(reportDir, "accessibility-scan.json"), JSON.stringify({ checked: 17, failures }, null, 2));
  expect(failures.map(f => ({ path: f.path, id: f.id, targets: f.nodes.map(n => n.target) }))).toEqual([]);
});

test("corrupt and unavailable browser storage remain recoverable", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("nexa-concept-v1", "{invalid-json"));
  await page.goto("/app");
  await expect(page.getByText("Saved demo data needs a reset.")).toBeVisible();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByText("Saved demo data needs a reset.")).not.toBeVisible();
  await page.addInitScript(() => {
    const read = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) { if (key === "nexa-concept-v1") throw new DOMException("Storage disabled"); return read.call(this, key); };
  });
  await page.reload();
  await expect(page.getByText("Browser storage is unavailable.")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Good morning/i })).toBeVisible();
});

test("collection, team, settings, and pricing controls remain local", async ({ page }) => {
  await page.goto("/pricing");
  await page.getByRole("button", { name: /Annual/i }).click();
  await expect(page.getByText("$19")).toBeVisible();
  await page.goto("/app/knowledge");
  await page.getByRole("button", { name: "New collection" }).click();
  await page.getByRole("dialog").getByLabel("Collection name").fill("Client onboarding");
  await page.getByRole("dialog").getByRole("button", { name: "Save collection" }).click();
  await expect(page.getByRole("button", { name: "Open Client onboarding collection" })).toBeVisible();
  await page.goto("/app/team");
  await page.getByRole("button", { name: "Invite teammate" }).click();
  await page.getByRole("dialog").getByLabel("Email address").fill("new@example.test");
  await page.getByRole("dialog").getByRole("button", { name: "Add demo member" }).click();
  await expect(page.getByRole("status")).toContainText("No email was sent");
  await page.goto("/app/settings");
  await page.getByLabel("Workspace name").fill("Demo Studio");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.reload();
  await expect(page.getByLabel("Workspace name")).toHaveValue("Demo Studio");
});

test("a storage write failure preserves usable in-memory changes", async ({ page }) => {
  await page.addInitScript(() => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "nexa-concept-v1") throw new DOMException("Quota exceeded", "QuotaExceededError");
      return write.call(this, key, value);
    };
  });
  await page.goto("/app/documents");
  await expect(page.getByText("Browser storage is unavailable.")).toBeVisible();
  await page.getByLabel("Choose documents to upload").setInputFiles({ name: "memory-note.txt", mimeType: "text/plain", buffer: Buffer.from("This note stays usable during this visit.") });
  await page.getByRole("textbox", { name: "Search documents" }).fill("stays usable");
  await expect(page.getByRole("button", { name: "memory-note" })).toBeVisible();
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(page.locator(".stat-card").filter({ hasText: "Documents" }).getByText("13", { exact: true })).toBeVisible();
});

test("interactive preview opens a real source and narrows its document list", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Search preview documents" }).fill("Atlas");
  await expect(page.locator(".preview-table-row")).toHaveCount(1);
  await page.locator(".preview-table-row").click();
  await expect(page.getByRole("dialog").getByText(/finish the accessibility review/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("metadata uploads, rename, filters, sorting, and deletion update the local library", async ({ page }) => {
  await page.goto("/app/documents");
  await page.getByLabel("Choose documents to upload").setInputFiles({ name: "client-brief.pdf", mimeType: "application/pdf", buffer: Buffer.from("Metadata test fixture, no PDF parser is invoked.") });
  await page.getByRole("button", { name: "client-brief" }).click();
  const dialog = page.getByRole("dialog", { name: "Document details" });
  await expect(dialog.getByText(/Their contents are not parsed/)).toBeVisible();
  await dialog.getByLabel("Document name").fill("A client brief");
  await dialog.getByLabel("Document name").press("Enter");
  await dialog.getByRole("button", { name: "Done" }).click();
  await page.getByLabel("Filter by type").selectOption("PDF");
  await page.getByLabel("Filter by status").selectOption("Metadata only");
  await page.getByLabel("Filter by owner").selectOption("Alex Morgan");
  await page.getByLabel("Sort documents").selectOption("name");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.reload();
  await page.getByRole("textbox", { name: "Search documents" }).fill("A client brief");
  await page.getByRole("button", { name: "A client brief" }).click();
  page.once("dialog", browserDialog => browserDialog.accept());
  await dialog.getByRole("button", { name: "Delete document" }).click();
  await expect(page.getByText("No matching documents")).toBeVisible();
});

test("signup, edited collections, roles, and analytics controls persist or display their scope", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore demo", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: /Good morning/ })).toBeVisible();
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("Taylor Park");
  await page.getByLabel("Email address").fill("taylor@example.test");
  await page.getByLabel("Workspace name").fill("Paper Studio");
  await page.getByRole("button", { name: "Create local workspace" }).click();
  await expect(page.getByRole("heading", { name: "Good morning, Taylor." })).toBeVisible();
  await page.goto("/app/knowledge");
  await page.locator(".collection-card").filter({ has: page.getByRole("button", { name: "Open Product collection" }) }).getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByRole("dialog").getByLabel("Collection name").fill("Product decisions");
  await page.getByRole("dialog").getByRole("button", { name: "Save collection" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Open Product decisions collection" })).toBeVisible();
  await page.goto("/app/team");
  await page.getByLabel("Role for Nora Kim").selectOption("Editor");
  await page.reload();
  await expect(page.getByLabel("Role for Nora Kim")).toHaveValue("Editor");
  await page.goto("/app/analytics");
  await page.getByRole("tab", { name: "30 days", exact: true }).click();
  await expect(page.locator(".analytics-table tbody tr")).toHaveCount(30);
  await page.getByRole("tab", { name: "7 days", exact: true }).click();
  await expect(page.locator(".analytics-table tbody tr")).toHaveCount(7);
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "14 days", exact: true })).toBeFocused();
  await expect(page.locator(".analytics-table tbody tr")).toHaveCount(14);
});

test("chat context excludes other sources and workflow creation and duplication remain editable", async ({ page }) => {
  await page.goto("/app/chat");
  await page.getByLabel("Document context").selectOption("support-runbook");
  await page.getByRole("button", { name: "What is blocking the Atlas release?", exact: true }).click();
  await expect(page.getByText(/no prepared answer for that question/)).toBeVisible();
  await expect(page.locator(".chat-citations")).toHaveCount(0);
  await page.goto("/app/workflows");
  await page.getByRole("button", { name: "New workflow", exact: true }).click();
  await page.getByLabel("Workflow name").fill("Client digest");
  await page.getByLabel("Enabled", { exact: true }).check();
  await page.getByRole("button", { name: "Duplicate workflow", exact: true }).click();
  await expect(page.locator(".workflow-list-item").filter({ hasText: "Client digest copy" })).toBeVisible();
  await page.reload();
  await page.locator(".workflow-list-item").filter({ hasText: "Client digest copy" }).click();
  await expect(page.getByLabel("Enabled", { exact: true })).not.toBeChecked();
  page.once("dialog", browserDialog => browserDialog.accept());
  await page.getByRole("button", { name: "Delete workflow", exact: true }).click();
  await expect(page.locator(".workflow-list-item").filter({ hasText: "Client digest copy" })).toHaveCount(0);
});

test("mobile drawer and dialogs keep keyboard focus usable with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/app/documents");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog", { name: "Workspace navigation" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Overview", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeFocused();
  await page.getByRole("button", { name: /Project Atlas handover/i }).click();
  const dialog = page.getByRole("dialog", { name: "Document details" });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /Project Atlas handover/i })).toBeFocused();
});
