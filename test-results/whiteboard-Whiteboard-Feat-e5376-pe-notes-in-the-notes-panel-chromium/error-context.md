# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: whiteboard.spec.js >> Whiteboard Feature >> TC-06: Type notes in the notes panel
- Location: e2e/whiteboard.spec.js:107:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.mode-card').filter({ hasText: 'Sketch Mode' })
    - locator resolved to <button class="mode-card">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="onboarding-card">…</div> from <div role="dialog" aria-label="Welcome tour" class="onboarding-overlay">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
      - waiting 100ms
    - waiting for element to be visible, enabled and stable
    - element is not stable
  13 × retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div role="dialog" aria-label="Welcome tour" class="onboarding-overlay">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div role="dialog" aria-label="Welcome tour" class="onboarding-overlay">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="onboarding-card">…</div> from <div role="dialog" aria-label="Welcome tour" class="onboarding-overlay">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div role="dialog" aria-label="Welcome tour" class="onboarding-overlay">…</div> intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div role="dialog" aria-label="Welcome tour" class="onboarding-overlay">…</div> intercepts pointer events
  - retrying click action
    - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e4]:
    - dialog "Welcome tour" [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e11]:
          - img [ref=e13]
          - heading "Pick a mode" [level=2] [ref=e16]
          - paragraph [ref=e17]: Choose Teaching Mode to explain AI/ML concepts, or Interview Mode to practice system design answers.
        - generic [ref=e18]:
          - button "Skip tour" [ref=e19] [cursor=pointer]
          - button "Next" [ref=e20] [cursor=pointer]:
            - text: Next
            - img [ref=e21]
    - navigation [ref=e23]:
      - generic [ref=e24]:
        - button "Go home" [ref=e25] [cursor=pointer]:
          - img [ref=e26]
          - generic [ref=e32]: TeachLoop
        - radiogroup "Choose theme" [ref=e34]:
          - generic [ref=e35]: Theme
          - radio "Sunrise Studio" [checked] [ref=e36] [cursor=pointer]
          - radio "Chalkboard" [ref=e37] [cursor=pointer]
          - radio "Blue Hour" [ref=e38] [cursor=pointer]
    - main [ref=e39]:
      - generic [ref=e40]:
        - generic [ref=e41]:
          - generic [ref=e43]: AI-Powered Coaching
          - heading "Train how you communicate, not just what you know." [level=1] [ref=e44]:
            - text: Train how you communicate,
            - text: not just what you know.
          - paragraph [ref=e45]: 5 questions. Real AI feedback on your communication style. Build clarity, confidence, and the right vocabulary for any audience.
          - generic [ref=e46]:
            - generic [ref=e47]: Questions per session
            - radiogroup "Questions per session" [ref=e48]:
              - radio "3 Quick" [ref=e49] [cursor=pointer]:
                - generic [ref=e50]: "3"
                - generic [ref=e51]: Quick
              - radio "5 Standard" [checked] [ref=e52] [cursor=pointer]:
                - generic [ref=e53]: "5"
                - generic [ref=e54]: Standard
              - radio "7 Deep" [ref=e55] [cursor=pointer]:
                - generic [ref=e56]: "7"
                - generic [ref=e57]: Deep
          - generic [ref=e58]:
            - button "Start Practicing" [ref=e59] [cursor=pointer]:
              - text: Start Practicing
              - img [ref=e60]
            - button "Interview Mode" [ref=e62] [cursor=pointer]
        - img [ref=e69]
      - generic [ref=e72]:
        - generic [ref=e73]:
          - heading "Choose your practice" [level=2] [ref=e74]
          - paragraph [ref=e75]: Three modes, all with AI-powered feedback on how you communicate.
        - generic [ref=e76]:
          - button "Teaching Mode Explain an AI/ML concept to a chosen audience. Get rated on clarity, analogies, and vocabulary fit." [ref=e77] [cursor=pointer]:
            - img [ref=e79]
            - generic [ref=e82]:
              - heading "Teaching Mode" [level=3] [ref=e83]
              - paragraph [ref=e84]: Explain an AI/ML concept to a chosen audience. Get rated on clarity, analogies, and vocabulary fit.
            - img [ref=e86]
          - button "Interview Mode Answer system design and AI engineering questions. Evaluated like a real senior technical panel." [ref=e88] [cursor=pointer]:
            - img [ref=e90]
            - generic [ref=e93]:
              - heading "Interview Mode" [level=3] [ref=e94]
              - paragraph [ref=e95]: Answer system design and AI engineering questions. Evaluated like a real senior technical panel.
            - img [ref=e97]
          - button "Sketch Mode Explain concepts visually with an interactive whiteboard. Evaluated on diagram clarity, completeness, and layout." [ref=e99] [cursor=pointer]:
            - img [ref=e101]
            - generic [ref=e104]:
              - heading "Sketch Mode" [level=3] [ref=e105]
              - paragraph [ref=e106]: Explain concepts visually with an interactive whiteboard. Evaluated on diagram clarity, completeness, and layout.
            - img [ref=e108]
          - button "Create Your Own Tell AI what you want to practice, get custom questions generated just for you." [ref=e110] [cursor=pointer]:
            - img [ref=e112]
            - generic [ref=e115]:
              - heading "Create Your Own" [level=3] [ref=e116]
              - paragraph [ref=e117]: Tell AI what you want to practice, get custom questions generated just for you.
            - img [ref=e119]
      - generic [ref=e123]:
        - generic [ref=e124]:
          - img [ref=e126]
          - heading "Audience-Aware Feedback" [level=3] [ref=e129]
          - paragraph [ref=e130]: Practice explaining to a child, recruiter, or senior engineer. Feedback adapts to who you're talking to.
        - generic [ref=e131]:
          - img [ref=e133]
          - heading "Communication Scoring" [level=3] [ref=e136]
          - paragraph [ref=e137]: Clarity, analogies, vocabulary fit, confidence, structure. See exactly where you shine and where to improve.
        - generic [ref=e138]:
          - img [ref=e140]
          - heading "Style Reports" [level=3] [ref=e143]
          - paragraph [ref=e144]: After each session, get a full communication style analysis with recurring patterns and weekly practice tips.
      - generic [ref=e146]:
        - heading "Your Past Sessions" [level=2] [ref=e148]
        - generic [ref=e149]:
          - img [ref=e151]
          - paragraph [ref=e154]: No sessions yet. Complete your first practice to see it here.
      - paragraph [ref=e156]: AI-powered communication coaching
  - button "Open Next.js Dev Tools" [ref=e162] [cursor=pointer]:
    - img [ref=e163]
  - alert [ref=e166]
```

# Test source

```ts
  11  |   styleObservation: "Clear diagram with logical flow and good use of shapes.",
  12  |   strongPoint: "Well-labeled connections showing data flow direction.",
  13  |   flawToFix: "Add error handling paths to make the flow more complete.",
  14  | };
  15  | 
  16  | test.describe("Whiteboard Feature", () => {
  17  |   test.beforeEach(async ({ page }) => {
  18  |     await page.route("**/api/eval", async (route) => {
  19  |       await route.fulfill({
  20  |         status: 200,
  21  |         contentType: "application/json",
  22  |         body: JSON.stringify(MOCK_EVAL_RESPONSE),
  23  |       });
  24  |     });
  25  |   });
  26  | 
  27  |   test("TC-01: Navigate to whiteboard mode from home", async ({ page }) => {
  28  |     await page.goto("/");
  29  |     await page.waitForLoadState("networkidle");
  30  | 
  31  |     const sketchCard = page.locator(".mode-card", { hasText: "Sketch Mode" });
  32  |     await expect(sketchCard).toBeVisible({ timeout: 10000 });
  33  |     await sketchCard.click();
  34  | 
  35  |     await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });
  36  |     await expect(page.locator("text=Select a Practice Concept")).toBeVisible();
  37  |   });
  38  | 
  39  |   test("TC-02: Display exercise cards", async ({ page }) => {
  40  |     await page.goto("/");
  41  |     await page.waitForLoadState("networkidle");
  42  | 
  43  |     await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
  44  |     await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });
  45  | 
  46  |     const exercises = [
  47  |       "Rate Limiter Architecture",
  48  |       "Convolutional Neural Network (CNN) Flow",
  49  |       "DNS Resolution Process",
  50  |       "React Component Lifecycle",
  51  |       "SQL vs NoSQL Scaling",
  52  |       "Freeform (Draw Anything)",
  53  |     ];
  54  | 
  55  |     for (const title of exercises) {
  56  |       await expect(page.locator(`.wb-exercise-card`, { hasText: title })).toBeVisible();
  57  |     }
  58  |   });
  59  | 
  60  |   test("TC-03: Select exercise shows template selector", async ({ page }) => {
  61  |     await page.goto("/");
  62  |     await page.waitForLoadState("networkidle");
  63  | 
  64  |     await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
  65  |     await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });
  66  | 
  67  |     await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
  68  | 
  69  |     await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });
  70  |     await expect(page.locator("text=System Design Starter")).toBeVisible();
  71  |   });
  72  | 
  73  |   test("TC-04: Select template opens editor", async ({ page }) => {
  74  |     await page.goto("/");
  75  |     await page.waitForLoadState("networkidle");
  76  | 
  77  |     await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
  78  |     await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });
  79  | 
  80  |     await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
  81  |     await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });
  82  | 
  83  |     await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
  84  | 
  85  |     await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });
  86  |     await expect(page.locator("text=Practicing")).toBeVisible();
  87  |     await expect(page.locator("text=Rate Limiter Architecture")).toBeVisible();
  88  |   });
  89  | 
  90  |   test("TC-05: Editor has notes panel and evaluate button", async ({ page }) => {
  91  |     await page.goto("/");
  92  |     await page.waitForLoadState("networkidle");
  93  | 
  94  |     await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
  95  |     await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });
  96  | 
  97  |     await page.locator(".wb-exercise-card", { hasText: "DNS Resolution Process" }).click();
  98  |     await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });
  99  | 
  100 |     await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
  101 |     await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });
  102 | 
  103 |     await expect(page.locator("textarea")).toBeVisible();
  104 |     await expect(page.locator("button", { hasText: "Evaluate explanation" })).toBeVisible();
  105 |   });
  106 | 
  107 |   test("TC-06: Type notes in the notes panel", async ({ page }) => {
  108 |     await page.goto("/");
  109 |     await page.waitForLoadState("networkidle");
  110 | 
> 111 |     await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
      |                                                                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
  112 |     await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });
  113 | 
  114 |     await page.locator(".wb-exercise-card", { hasText: "React Component Lifecycle" }).click();
  115 |     await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });
  116 | 
  117 |     await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
  118 |     await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });
  119 | 
  120 |     const textarea = page.locator("textarea");
  121 |     await textarea.fill("The component mounts, updates, and unmounts.");
  122 |     await expect(textarea).toHaveValue("The component mounts, updates, and unmounts.");
  123 |   });
  124 | 
  125 |   test("TC-07: Evaluate shows loading state then results", async ({ page }) => {
  126 |     await page.goto("/");
  127 |     await page.waitForLoadState("networkidle");
  128 | 
  129 |     await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
  130 |     await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });
  131 | 
  132 |     await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
  133 |     await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });
  134 | 
  135 |     await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
  136 |     await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });
  137 | 
  138 |     await page.locator("textarea").fill("A rate limiter controls request flow.");
  139 | 
  140 |     await page.locator("button", { hasText: "Evaluate explanation" }).click();
  141 | 
  142 |     await expect(page.locator("text=Evaluating...")).toBeVisible({ timeout: 5000 });
  143 | 
  144 |     await expect(page.locator("text=AI Evaluation Results")).toBeVisible({ timeout: 15000 });
  145 |     await expect(page.locator(".wb-overall-score", { hasText: "8/10" })).toBeVisible();
  146 |   });
  147 | 
  148 |   test("TC-08: Evaluation shows score breakdown", async ({ page }) => {
  149 |     await page.goto("/");
  150 |     await page.waitForLoadState("networkidle");
  151 | 
  152 |     await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
  153 |     await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });
  154 | 
  155 |     await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
  156 |     await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });
  157 | 
  158 |     await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
  159 |     await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });
  160 | 
  161 |     await page.locator("button", { hasText: "Evaluate explanation" }).click();
  162 |     await expect(page.locator("text=AI Evaluation Results")).toBeVisible({ timeout: 15000 });
  163 | 
  164 |     await expect(page.locator(".wb-score-name", { hasText: "CORRECTNESS" })).toBeVisible();
  165 |     await expect(page.locator(".wb-score-name", { hasText: "COMPLETENESS" })).toBeVisible();
  166 |     await expect(page.locator(".wb-score-name", { hasText: "CLARITY" })).toBeVisible();
  167 |     await expect(page.locator(".wb-score-name", { hasText: "VISUAL STRUCTURE" })).toBeVisible();
  168 |   });
  169 | 
  170 |   test("TC-09: Evaluation shows strong point and flaw", async ({ page }) => {
  171 |     await page.goto("/");
  172 |     await page.waitForLoadState("networkidle");
  173 | 
  174 |     await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
  175 |     await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });
  176 | 
  177 |     await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
  178 |     await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });
  179 | 
  180 |     await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
  181 |     await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });
  182 | 
  183 |     await page.locator("button", { hasText: "Evaluate explanation" }).click();
  184 |     await expect(page.locator("text=AI Evaluation Results")).toBeVisible({ timeout: 15000 });
  185 | 
  186 |     await expect(page.locator(".wb-tip-block.positive", { hasText: "Well-labeled connections" })).toBeVisible();
  187 |     await expect(page.locator(".wb-tip-block.negative", { hasText: "Add error handling paths" })).toBeVisible();
  188 |   });
  189 | 
  190 |   test("TC-10: Save draft persists to history", async ({ page }) => {
  191 |     await page.goto("/");
  192 |     await page.waitForLoadState("networkidle");
  193 | 
  194 |     await page.locator(".mode-card", { hasText: "Sketch Mode" }).click();
  195 |     await expect(page.locator("text=Whiteboard Explainer")).toBeVisible({ timeout: 10000 });
  196 | 
  197 |     await page.locator(".wb-exercise-card", { hasText: "Rate Limiter Architecture" }).click();
  198 |     await expect(page.locator("text=Blank Canvas")).toBeVisible({ timeout: 10000 });
  199 | 
  200 |     await page.locator(".template-card", { hasText: "Blank Canvas" }).click();
  201 |     await expect(page.locator(".wb-editor-workspace")).toBeVisible({ timeout: 15000 });
  202 | 
  203 |     await page.locator("textarea").fill("Test draft notes");
  204 | 
  205 |     page.on("dialog", async (dialog) => {
  206 |       await dialog.accept();
  207 |     });
  208 | 
  209 |     await page.locator("button", { hasText: "Save Draft" }).click();
  210 | 
  211 |     await page.waitForTimeout(500);
```