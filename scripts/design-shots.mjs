import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const channel = process.env.PW_CHANNEL || "chrome";
const systemChrome = [
  process.env.PLAYWRIGHT_CHROME_PATH,
  "/run/current-system/sw/bin/google-chrome",
  "/usr/bin/google-chrome",
].find((p) => p && fs.existsSync(p));

const stage = process.argv[2] || "before";
const baseUrl = process.env.BASE_URL || "http://localhost:3120";
const outDir = path.join("/tmp/opencode/design-shots", stage);
fs.mkdirSync(outDir, { recursive: true });

console.log(`[design-shots] Stage: ${stage}`);
console.log(`[design-shots] Base URL: ${baseUrl}`);
console.log(`[design-shots] Output dir: ${outDir}`);

const browser = await chromium.launch({
  executablePath: systemChrome,
  channel: systemChrome ? undefined : channel,
  headless: true,
  args: ["--hide-scrollbars", "--disable-gpu", "--no-sandbox"],
});

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

async function captureThemes(page, filePrefix, vp, { fullPage = false } = {}) {
  for (const theme of ["sunrise", "chalkboard", "blue-hour"]) {
    await page.evaluate((t) => {
      document.documentElement.setAttribute("data-theme", t);
      window.localStorage.setItem("teachloop-theme", t);
    }, theme);
    await page.waitForTimeout(200);
    await page.screenshot({
      path: path.join(outDir, `${filePrefix}-${theme}-${vp.name}.png`),
      fullPage,
    });
    console.log(`✓ ${filePrefix}-${theme}-${vp.name}.png`);
  }
  // Reset back to sunrise
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "sunrise");
    window.localStorage.setItem("teachloop-theme", "sunrise");
  });
  await page.waitForTimeout(100);
}

for (const vp of viewports) {
  console.log(`\n--- Capturing viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });

  const page = await context.newPage();

  // 1. Tour overlay
  await page.goto(`${baseUrl}/`);
  await page.waitForLoadState("networkidle");
  try {
    await page.waitForSelector(".onboarding-overlay", { timeout: 4000 });
    await page.screenshot({
      path: path.join(outDir, `01-tour-${vp.name}.png`),
      fullPage: false,
    });
    console.log(`✓ 01-tour-${vp.name}.png`);
  } catch (err) {
    console.log(`(Tour not shown: ${err.message})`);
  }

  // 2. Home - 3 Themes
  await context.addInitScript(() => {
    window.localStorage.setItem("teachloop-onboarded", "1");
    window.localStorage.setItem("teachloop-theme", "sunrise");
  });
  await page.goto(`${baseUrl}/?tour=off`);
  await page.waitForLoadState("networkidle");
  await page.waitForSelector(".home-hero", { timeout: 10000 });
  await captureThemes(page, "02-home", vp, { fullPage: false });

  // 3. Select 3-question length and Start Practicing -> Audience (3 Themes)
  const length3 = page.locator(".session-length-option", { hasText: "3" });
  if (await length3.isVisible().catch(() => false)) {
    await length3.click();
  }
  await page.locator("button", { hasText: "Start Practicing" }).click();
  await page.waitForSelector(".audience-list", { timeout: 10000 });
  await captureThemes(page, "03-audience", vp, { fullPage: false });

  // 4. Audience -> Wheel (3 Themes)
  await page.locator(".audience-option").first().click();
  await page.waitForSelector(".wheel-container", { timeout: 10000 });
  await page.waitForSelector("button:has-text('Begin Session')", { timeout: 10000 });
  await captureThemes(page, "04-wheel", vp, { fullPage: false });

  // 5. Wheel -> Session Screen (idle & typing state in 3 Themes)
  await page.locator("button", { hasText: "Begin Session" }).click();
  await page.waitForSelector("textarea[aria-label='Your answer']", { timeout: 10000 });
  await page.locator("textarea[aria-label='Your answer']").fill(
    "In computer science, an algorithm is a clear sequence of instructions"
  );
  await captureThemes(page, "05-session-in-progress", vp, { fullPage: false });

  // Complete Question 1 to show eval card in 3 themes
  await page.locator("textarea[aria-label='Your answer']").fill(
    "In computer science an algorithm is a clear sequence of steps designed to solve a specific computational problem accurately and efficiently."
  );
  await page.locator("button", { hasText: "Submit Answer" }).click();
  await page.waitForSelector(".evaluation-card", { timeout: 15000 });
  await captureThemes(page, "05-session-eval-card", vp, { fullPage: false });

  // Complete Question 2 & 3 to get Full Report
  // Q2:
  await page.locator("button", { hasText: "Next: Question 2 of 3" }).click();
  await page.waitForSelector("button:has-text('Begin Session')", { timeout: 10000 });
  await page.locator("button", { hasText: "Begin Session" }).click();
  await page.waitForSelector("textarea[aria-label='Your answer']", { timeout: 10000 });
  await page.locator("textarea[aria-label='Your answer']").fill(
    "Deep neural networks use multiple layers of artificial neurons to progressively extract higher-level features from raw input data."
  );
  await page.locator("button", { hasText: "Submit Answer" }).click();
  await page.waitForSelector(".evaluation-card", { timeout: 15000 });

  // Q3:
  await page.locator("button", { hasText: "Next: Question 3 of 3" }).click();
  await page.waitForSelector("button:has-text('Begin Session')", { timeout: 10000 });
  await page.locator("button", { hasText: "Begin Session" }).click();
  await page.waitForSelector("textarea[aria-label='Your answer']", { timeout: 10000 });
  await page.locator("textarea[aria-label='Your answer']").fill(
    "Gradient descent iteratively computes loss gradients and adjusts model parameters to minimize error across batches."
  );
  await page.locator("button", { hasText: "Submit Answer" }).click();
  await page.waitForSelector("button:has-text('See Full Report')", { timeout: 15000 });
  await page.locator("button", { hasText: "See Full Report" }).click();

  // 6. Feedback Screen / Report (3 Themes)
  await page.waitForSelector(".feedback-hero", { timeout: 15000 });
  await page.waitForTimeout(600);
  await captureThemes(page, "06-feedback-report", vp, { fullPage: true });

  // 7. Whiteboard Screen (Single theme)
  await page.goto(`${baseUrl}/?tour=off`);
  await page.waitForLoadState("networkidle");
  await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
  await page.waitForSelector(".wb-exercise-card", { timeout: 10000 });
  await page.screenshot({
    path: path.join(outDir, `07-whiteboard-exercises-${vp.name}.png`),
    fullPage: false,
  });
  console.log(`✓ 07-whiteboard-exercises-${vp.name}.png`);

  // Select exercise -> template selector
  await page.locator(".wb-exercise-card").first().click();
  await page.waitForSelector(".template-card", { timeout: 10000 });
  await page.screenshot({
    path: path.join(outDir, `07-whiteboard-templates-${vp.name}.png`),
    fullPage: false,
  });
  console.log(`✓ 07-whiteboard-templates-${vp.name}.png`);

  // 8. Custom Mode
  await page.goto(`${baseUrl}/?tour=off`);
  await page.waitForLoadState("networkidle");
  const customModeCard = page.locator(".mode-card", { hasText: "Custom Practice" });
  if (await customModeCard.isVisible().catch(() => false)) {
    await customModeCard.click();
    await page.waitForSelector(".custom-mode-header", { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(outDir, `08-custom-mode-${vp.name}.png`),
      fullPage: false,
    });
    console.log(`✓ 08-custom-mode-${vp.name}.png`);
  }

  // 9. Pricing
  await page.goto(`${baseUrl}/pricing`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(outDir, `09-pricing-${vp.name}.png`),
    fullPage: true,
  });
  console.log(`✓ 09-pricing-${vp.name}.png`);

  // 10. Privacy / Legal
  await page.goto(`${baseUrl}/privacy`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(outDir, `10-privacy-${vp.name}.png`),
    fullPage: true,
  });
  console.log(`✓ 10-privacy-${vp.name}.png`);

  // 11. 404
  await page.goto(`${baseUrl}/non-existent-page-slug`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(outDir, `11-404-${vp.name}.png`),
    fullPage: false,
  });
  console.log(`✓ 11-404-${vp.name}.png`);

  await context.close();
}

await browser.close();
console.log(`\nDone! All screenshots captured in ${outDir}`);
