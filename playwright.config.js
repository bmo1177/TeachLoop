import { defineConfig } from "@playwright/test";
import fs from "node:fs";

const systemChrome = [
  process.env.PLAYWRIGHT_CHROME_PATH,
  "/run/current-system/sw/bin/google-chrome",
  "/usr/bin/google-chrome",
].find((p) => p && fs.existsSync(p));

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        ...(process.env.PW_CHANNEL === "chrome" && systemChrome
          ? { launchOptions: { executablePath: systemChrome } }
          : process.env.PW_CHANNEL
            ? { channel: process.env.PW_CHANNEL }
            : {}),
      },
    },
  ],
});
