import { describe, it, expect } from "vitest";
import { simpleHash, generateDeterministicMock } from "@/app/lib/mockAi";
import {
  validateQuestionsSchema,
  validateEvalSchema,
  validateReportSchema,
} from "@/app/lib/evalSchemas";

describe("mockAi deterministic generator", () => {
  describe("simpleHash", () => {
    it("returns consistent positive integers", () => {
      const h1 = simpleHash("testing");
      const h2 = simpleHash("testing");
      expect(h1).toBe(h2);
      expect(typeof h1).toBe("number");
      expect(h1).toBeGreaterThanOrEqual(0);
    });

    it("returns different values for different strings", () => {
      expect(simpleHash("abc")).not.toBe(simpleHash("xyz"));
    });
  });

  describe("generateDeterministicMock", () => {
    it("handles falsy prompt by returning a valid fallback eval object", () => {
      const fallback = generateDeterministicMock("");
      expect(fallback.demo).toBe(true);
      expect(validateEvalSchema(fallback)).toBe(true);
    });

    it("generates deterministic questions matching questions schema for question prompts", () => {
      const prompt =
        'You are a communication coach creating practice questions related to "Distributed Systems".\nReturn JSON: {"questions":["..."],"hints":[]}';
      const mock = generateDeterministicMock(prompt);

      expect(mock.demo).toBe(true);
      expect(validateQuestionsSchema(mock)).toBe(true);
      expect(mock.questions).toHaveLength(5);
      expect(mock.hints).toHaveLength(5);
      expect(mock.questions[0]).toContain("Distributed Systems");

      // Determinism
      const mock2 = generateDeterministicMock(prompt);
      expect(mock).toEqual(mock2);
    });

    it("generates deterministic session reports matching report schema for report prompts", () => {
      const prompt = `Analyze this 3-answer session:
Q1: 8/10 — Strong intuition and clean phrasing.
Q2: 6/10 — A bit too rushed on edge cases.
Q3: 10/10 — Exceptional depth and clear real-world examples.
Return JSON: {"communicationStyle":"...","recurringStrength":"...","recurringFlaw":"...","weeklyPractice":"...","overallScore":8}`;

      const mock = generateDeterministicMock(prompt);
      expect(mock.demo).toBe(true);
      expect(validateReportSchema(mock)).toBe(true);
      expect(mock.overallScore).toBe(8); // (8 + 6 + 10) / 3 = 8
      expect(mock.communicationStyle).toContain("Structured");
      expect(mock.weeklyPractice).toBeTruthy();

      // Determinism
      const mock2 = generateDeterministicMock(prompt);
      expect(mock).toEqual(mock2);
    });

    it("generates deterministic whiteboard evaluations matching eval schema", () => {
      const prompt =
        'WHITEBOARD CANVAS CONTENT SUMMARY:\nconcept: "Microservices Architecture"\nShapes: rectangle, arrow';
      const mock = generateDeterministicMock(prompt);

      expect(mock.demo).toBe(true);
      expect(validateEvalSchema(mock)).toBe(true);
      expect(mock.scores.visualStructure).toBeDefined();
      expect(mock.scores.completeness).toBeDefined();
      expect(mock.styleObservation).toContain("Microservices Architecture");

      const mock2 = generateDeterministicMock(prompt);
      expect(mock).toEqual(mock2);
    });

    it("generates deterministic teach-mode evaluations matching eval schema", () => {
      const prompt = `Evaluate explaining "How HTTPS Works" to a 10-year-old.
Answer: """HTTPS uses encryption like a secret lockbox with two keys so bad actors cannot read your messages."""
Return JSON: {"scores":{"clarity":<1-10>,"analogies":<1-10>,"vocabularyFit":<1-10>,"confidence":<1-10>,"structure":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence>","strongPoint":"<specific thing>","flawToFix":"<single most impactful fix>"}`;

      const mock = generateDeterministicMock(prompt);
      expect(mock.demo).toBe(true);
      expect(validateEvalSchema(mock)).toBe(true);
      expect(mock.scores.analogies).toBeDefined();
      expect(mock.scores.vocabularyFit).toBeDefined();
      expect(mock.overallScore).toBeGreaterThanOrEqual(5);
      expect(mock.overallScore).toBeLessThanOrEqual(10);

      const mock2 = generateDeterministicMock(prompt);
      expect(mock).toEqual(mock2);
    });

    it("generates deterministic interview-mode evaluations matching eval schema", () => {
      const prompt = `Evaluate answer to: "Design a Rate Limiter"
Answer: """We can implement a token bucket algorithm stored in Redis with atomic increments."""
Return JSON: {"scores":{"clarity":<1-10>,"depth":<1-10>,"structure":<1-10>,"confidence":<1-10>,"examples":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence>","strongPoint":"<specific thing>","flawToFix":"<single most impactful fix>"}`;

      const mock = generateDeterministicMock(prompt);
      expect(mock.demo).toBe(true);
      expect(validateEvalSchema(mock)).toBe(true);
      expect(mock.scores.depth).toBeDefined();
      expect(mock.scores.examples).toBeDefined();
      expect(mock.strongPoint).toContain("Design a Rate Limiter");

      const mock2 = generateDeterministicMock(prompt);
      expect(mock).toEqual(mock2);
    });
  });
});
