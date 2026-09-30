import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/lr-desktop-config.js";
import { launch } from "chrome-launcher";

const origin = "http://127.0.0.1:3213";
const folder = resolve(process.argv[2] ?? "artifacts/reports");
// Keep the disposable Chrome profile inside this project's ignored test output.
// Chrome Launcher can hit EPERM deleting its Windows Temp profile while logs close.
const chromeProfile = resolve("test-results/lighthouse-profile");
const summaries = [];
let server;
let chrome;
let serverLog = "";
let occupied = false;
try {
  await fetch(origin, { signal: AbortSignal.timeout(1000) });
  occupied = true;
} catch { /* An available port is required to measure this build. */ }
if (occupied) throw new Error("Port 3213 is in use. Stop this project's server before running test:performance.");

try {
  await mkdir(folder, { recursive: true });
  await mkdir(chromeProfile, { recursive: true });
  server = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "start", "--port", "3213"], {
    windowsHide: true,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", data => { serverLog += String(data); });
  server.stderr.on("data", data => { serverLog += String(data); });
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw new Error(`Production server exited: ${serverLog}`);
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch { /* Wait for Next.js to finish starting. */ }
    await delay(500);
  }
  if (!ready) throw new Error(`Production server did not become ready: ${serverLog}`);
  chrome = await launch({ userDataDir: chromeProfile, chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"], logLevel: "error" });
  for (const profile of ["desktop", "mobile"]) {
    for (const [name, path] of [["home", "/"], ["dashboard", "/app"]]) {
      const result = await lighthouse(`${origin}${path}`, {
        port: chrome.port, output: "json", logLevel: "error",
        onlyCategories: ["performance", "accessibility", "best-practices"],
      }, profile === "desktop" ? desktopConfig : undefined);
      if (!result || result.lhr.runtimeError) throw new Error(JSON.stringify(result?.lhr.runtimeError ?? "Missing Lighthouse report"));
      await writeFile(resolve(folder, `lighthouse-${name}-${profile}.json`), result.report);
      const { lhr } = result;
      const metric = key => Math.round(lhr.audits[key].numericValue * 100) / 100;
      const summary = {
        page: path, profile, measuredAt: lhr.fetchTime, lighthouseVersion: lhr.lighthouseVersion,
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories["best-practices"].score * 100),
        lcpMs: metric("largest-contentful-paint"), cls: metric("cumulative-layout-shift"),
        tbtMs: metric("total-blocking-time"), fcpMs: metric("first-contentful-paint"),
        settings: { formFactor: lhr.configSettings.formFactor, throttlingMethod: lhr.configSettings.throttlingMethod, throttling: lhr.configSettings.throttling },
      };
      summaries.push(summary);
      process.stdout.write(`${JSON.stringify(summary)}\n`);
    }
  }
  await writeFile(resolve(folder, "performance-summary.json"), JSON.stringify({ environment: "Local production build; synthetic lab measurements; one run per page and profile", reports: summaries }, null, 2));
} finally {
  try {
    if (chrome) await chrome.kill();
  } finally {
    if (server && server.exitCode === null) server.kill();
  }
}
