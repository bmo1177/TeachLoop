import { test, expect } from "@playwright/test";

const MOCK_EVAL_RESPONSE = {
  scores: {
    correctness: 8,
    completeness: 7,
    clarity: 9,
    visualStructure: 8,
  },
  overallScore: 8,
  styleObservation: "Clear diagram with logical flow and good use of shapes.",
  strongPoint: "Well-labeled connections showing data flow direction.",
  flawToFix: "Add error handling paths to make the flow more complete.",
};

test.describe("Whiteboard Feature", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/eval", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_EVAL_RESPONSE),
      });
    });
  });

  test("TC-01: Navigate to whiteboard mode from home", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const sketchCard = page.locator(".mode-card", { hasText: "Sketch Mode" });
    await expect(sketchCard).toBeVisible({ timeout: 10000 });
    await sketchCard.click();

    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Select a Practice Concept")).toBeVisible();
  });

  test("TC-02: Display exercise cards", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    const exercises = [
      "Rate Limiter Architecture",
      "Convolutional Neural Network (CNN) Flow",
      "DNS Resolution Process",
      "React Component Lifecycle",
      "SQL vs NoSQL Scaling",
      "Freeform (Draw Anything)",
    ];

    for (const title of exercises) {
      await expect(page.locator(`.wb-exercise-card`, { hasText: title })).toBeVisible();
    }
  });

  test("TC-03: Select exercise shows template selector", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();

    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=System Design Starter")).toBeVisible();
  });

  test("TC-04: Select template opens editor", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });

    await page.locator(".template-card", { hasText: "Blank Canvas" }).click();

    await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Practicing")).toBeVisible();
    await expect(page.locator("text=Rate Limiter Architecture")).toBeVisible();
  });

  test("TC-05: Editor has notes panel and evaluate button", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "DNS Resolution Process" }).click();
    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });

    await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
    await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });

    await expect(page.locator("textarea")).toBeVisible();
    await expect(page.locator("button", { hasText: "Evaluate explanation" })).toBeVisible();
  });

  test("TC-06: Type notes in the notes panel", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "React Component Lifecycle" }).click();
    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });

    await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
    await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });

    const textarea = page.locator("textarea");
    await textarea.fill("The component mounts, updates, and unmounts.");
    await expect(textarea).toHaveValue("The component mounts, updates, and unmounts.");
  });

  test("TC-07: Evaluate shows loading state then results", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });

    await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
    await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });

    await page.locator("textarea").fill("A rate limiter controls request flow.");

    await page.locator("button", { hasText: "Evaluate explanation" }).click();

    await expect(page.locator("text=Evaluating...")).toBeVisible({ timeout: 5000 });

    await expect(page.locator("text=AI Evaluation Results")).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".wb-overall-score", { hasText: "8/10" })).toBeVisible();
  });

  test("TC-08: Evaluation shows score breakdown", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });

    await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
    await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });

    await page.locator("button", { hasText: "Evaluate explanation" }).click();
    await expect(page.locator("text=AI Evaluation Results")).toBeVisible({ timeout: 15000 });

    await expect(page.locator(".wb-score-name", { hasText: "CORRECTNESS" })).toBeVisible();
    await expect(page.locator(".wb-score-name", { hasText: "COMPLETENESS" })).toBeVisible();
    await expect(page.locator(".wb-score-name", { hasText: "CLARITY" })).toBeVisible();
    await expect(page.locator(".wb-score-name", { hasText: "VISUAL STRUCTURE" })).toBeVisible();
  });

  test("TC-09: Evaluation shows strong point and flaw", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });

    await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
    await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });

    await page.locator("button", { hasText: "Evaluate explanation" }).click();
    await expect(page.locator("text=AI Evaluation Results")).toBeVisible({ timeout: 15000 });

    await expect(page.locator(".wb-tip-block.positive", { hasText: "Well-labeled connections" })).toBeVisible();
    await expect(page.locator(".wb-tip-block.negative", { hasText: "Add error handling paths" })).toBeVisible();
  });

  test("TC-10: Save draft persists to history", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });

    await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
    await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });

    await page.locator("textarea").fill("Test draft notes");

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.locator("button", { hasText: "Save Draft" }).click();

    await page.waitForTimeout(500);

    await page.locator("button", { hasText: "Exit" }).click();

    await expect(page.locator("text=Past Whiteboard Sketches")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".wb-history-item", { hasText: "Rate Limiter Architecture" })).toBeVisible();
  });

  test("TC-11: Exit returns to exercise selection", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });

    await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
    await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });

    await page.locator("button", { hasText: "Exit" }).click();

    await expect(page.locator("text=Select a Practice Concept")).toBeVisible({ timeout: 10000 });
  });

  test("TC-12: Home button returns to main screen", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".nav-back").first().click();

    await expect(page.locator("text=Train how you communicate")).toBeVisible({ timeout: 10000 });
  });

  test("TC-13: Freeform exercise selectable", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "Freeform (Draw Anything)" }).click();

    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });
  });

  test("TC-14: Multiple exercises can be selected sequentially", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });

    await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
    await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Practicing")).toBeVisible();

    await page.locator("button", { hasText: "Exit" }).click();
    await expect(page.locator("text=Select a Practice Concept")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "DNS Resolution Process" }).click();
    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });

    await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
    await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".wb-header-title", { hasText: "DNS Resolution Process" })).toBeVisible();
  });

  test("TC-15: Empty canvas evaluation works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
    await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });

    await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
    await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });

    await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
    await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });

    await page.locator("button", { hasText: "Evaluate explanation" }).click();

    await expect(page.locator("text=AI Evaluation Results")).toBeVisible({ timeout: 15000 });
  });
});
