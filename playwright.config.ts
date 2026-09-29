import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser", timeout: 45000, workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:3213", browserName: "chromium", channel: "chrome", trace: "retain-on-failure" },
  webServer: { command: "npm run start", url: "http://127.0.0.1:3213", reuseExistingServer: false, timeout: 60000, env: { NEXT_TELEMETRY_DISABLED: "1" } },
});
