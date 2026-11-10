import { test, expect } from "@playwright/test";

test.describe("Core Flow & Demo Mode (Unmocked)", () => {
  // Use reduced motion so wheel spin settles quickly (250ms)
  test.use({
    reducedMotion: "reduce",
  });

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Dismiss onboarding tour if present
    const skipBtn = page.locator("button", { hasText: "Skip tour" });
    try {
      await skipBtn.waitFor({ state: "visible", timeout: 8000 });
      await skipBtn.click();
      await expect(page.locator(".onboarding-overlay")).toBeHidden({ timeout: 5000 });
    } catch {
      // Tour was not displayed or already dismissed
    }
  });

  test("Path A: complete multi-question practice session in demo mode and persist to history", async ({
    page,
  }) => {
    // 1. Verify Home renders
    await expect(page.locator(".home-hero")).toBeVisible({ timeout: 10000 });

    // 2. Select 3-question session length for faster execution
    const lengthBtn = page.locator(".session-length-option", { hasText: "3" });
    if (await lengthBtn.isVisible()) {
      await lengthBtn.click();
    }

    // 3. Start practicing in Teach mode
    await page.locator("button", { hasText: "Start Practicing" }).click();

    // 4. Select an audience
    await expect(
      page.locator("text=Who are you explaining to?")
    ).toBeVisible({ timeout: 10000 });
    await page.locator(".audience-option").first().click();

    // 5. Loop through 3 questions
    for (let q = 1; q <= 3; q++) {
      // Wheel screen appears and stops quickly due to reduced-motion
      const beginBtn = page.locator("button", { hasText: "Begin Session" });
      await expect(beginBtn).toBeVisible({ timeout: 10000 });
      await beginBtn.click();

      // Session screen: enter answer with >= 15 words
      const textarea = page.locator("textarea[aria-label='Your answer']");
      await expect(textarea).toBeVisible({ timeout: 10000 });
      await textarea.fill(
        `In computer science an algorithm is a clear sequence of steps designed to solve a specific computational problem accurately and efficiently for question number ${q}.`
      );

      // Submit answer
      const submitBtn = page.locator("button", { hasText: "Submit Answer" });
      await expect(submitBtn).toBeEnabled({ timeout: 5000 });
      await submitBtn.click();

      // Verify evaluation appears (from real /api/eval demo mock)
      await expect(page.locator(".evaluation-card")).toBeVisible({
        timeout: 15000,
      });

      // Verify demo badge pill is present
      await expect(page.locator(".demo-badge-pill")).toBeVisible();
      await expect(page.locator(".demo-badge-pill")).toContainText(
        "Demo evaluation"
      );

      // Advance to next question or report
      if (q < 3) {
        const nextBtn = page.locator("button", {
          hasText: `Next: Question ${q + 1} of 3`,
        });
        await expect(nextBtn).toBeVisible({ timeout: 5000 });
        await nextBtn.click();
      } else {
        const reportBtn = page.locator("button", {
          hasText: "See Full Report",
        });
        await expect(reportBtn).toBeVisible({ timeout: 5000 });
        await reportBtn.click();
      }
    }

    // 6. Verify Session Report renders on FeedbackScreen
    await expect(page.locator(".feedback-hero")).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.locator("text=Your Communication Style")
    ).toBeVisible();
    await expect(page.locator(".feedback-hero .demo-badge-pill")).toBeVisible();

    // 7. Click Try Again to navigate back to Home
    await page.locator("button", { hasText: "Try Again" }).click();

    // 8. Verify past session is rendered in history on Home
    await expect(page.locator(".home-hero")).toBeVisible({ timeout: 10000 });
    const pastCard = page.locator(".past-session-card").first();
    await expect(pastCard).toBeVisible({ timeout: 10000 });
    await expect(pastCard.locator(".past-session-mode")).toContainText(
      "Teaching"
    );
  });

  test("Path B: verify no-key demo banner pill is displayed on evaluation feedback", async ({
    page,
  }) => {
    // 1. Start Teach mode directly
    await page.locator("button", { hasText: "Start Practicing" }).click();

    // 2. Select audience
    await page.locator(".audience-option").first().click();

    // 3. Wheel -> start
    const beginBtn = page.locator("button", { hasText: "Begin Session" });
    await expect(beginBtn).toBeVisible({ timeout: 10000 });
    await beginBtn.click();

    // 4. Fill >= 15 words
    const textarea = page.locator("textarea[aria-label='Your answer']");
    await textarea.fill(
      "Distributed systems allow multiple computers to coordinate together transparently to achieve high availability and fault tolerance."
    );

    // 5. Submit
    await page.locator("button", { hasText: "Submit Answer" }).click();

    // 6. Assert demo badge pill copy matches requirement exactly
    const demoPill = page.locator(".demo-badge-pill");
    await expect(demoPill).toBeVisible({ timeout: 15000 });
    await expect(demoPill).toHaveText(
      "Demo evaluation: set OPENROUTER_API_KEY to get AI scoring"
    );
  });

  test("Path C: Structure with AI reformats typed text and provides undo restoration", async ({
    page,
  }) => {
    // 1. Start Teach mode directly
    await page.locator("button", { hasText: "Start Practicing" }).click();

    // 2. Select audience
    await page.locator(".audience-option").first().click();

    // 3. Wheel -> start
    const beginBtn = page.locator("button", { hasText: "Begin Session" });
    await expect(beginBtn).toBeVisible({ timeout: 10000 });
    await beginBtn.click();

    // 4. Fill >= 15 words with speech/acronym patterns
    const textarea = page.locator("textarea[aria-label='Your answer']");
    const rawInput =
      "first we set up an api and a rest db using sql. second we deploy the worker queue on cpu and ram.";
    await textarea.fill(rawInput);

    // 5. Structure with AI button is unlocked and clicked
    const polishBtn = page.locator("button", { hasText: "Structure with AI" });
    await expect(polishBtn).toBeEnabled({ timeout: 5000 });
    await polishBtn.click();

    // 6. Verify formatted text appears with acronyms and list markers
    await expect(textarea).toHaveValue(
      "- First we set up an API and a REST DB using SQL.\n- Second we deploy the worker queue on CPU and RAM."
    );

    // 7. Undo bar appears
    const undoBtn = page.locator("button", { hasText: "Undo (restore original)" });
    await expect(undoBtn).toBeVisible({ timeout: 10000 });

    // 8. Click undo and verify original text is cleanly restored
    await undoBtn.click();
    await expect(textarea).toHaveValue(rawInput);
    await expect(undoBtn).toBeHidden();

    // 9. Submit answer continues to work cleanly
    const submitBtn = page.locator("button", { hasText: "Submit Answer" });
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await expect(page.locator(".evaluation-card")).toBeVisible({
      timeout: 15000,
    });
  });
});
