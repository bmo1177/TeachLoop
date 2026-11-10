import { describe, it, expect } from "vitest";
import {
  evalPrompt,
  generateQuestionsPrompt,
  reportPrompt,
  whiteboardEvalPrompt,
  prepareWhiteboardPrompt,
  getWhiteboardSummary,
} from "@/app/lib/api";

describe("api prompt builders", () => {
  describe("evalPrompt", () => {
    it("builds a teach mode prompt with audience and teach scoring dimensions", () => {
      const prompt = evalPrompt("teach", "What is recursion?", "A function calling itself.", "a 5-year-old");
      expect(prompt).toContain('Evaluate explaining "What is recursion?" to a 5-year-old.');
      expect(prompt).toContain('Answer: """A function calling itself."""');
      expect(prompt).toContain('"analogies":<1-10>');
      expect(prompt).toContain('"vocabularyFit":<1-10>');
      expect(prompt).not.toContain("undefined");
      expect(prompt).not.toContain("[This answer was spoken");
    });

    it("appends speech transcription disclaimer when wasSpoken is true", () => {
      const prompt = evalPrompt("teach", "Explain DNS", "Domain Name System", "a high schooler", true);
      expect(prompt).toContain("[This answer was spoken via microphone and transcribed automatically.");
    });

    it("builds an interview mode prompt with technical interview scoring dimensions", () => {
      const prompt = evalPrompt("interview", "Design TinyURL", "Use MD5 hash of URL truncated to 7 chars.", "interviewer");
      expect(prompt).toContain('Evaluate answer to: "Design TinyURL"');
      expect(prompt).toContain('"depth":<1-10>');
      expect(prompt).toContain('"examples":<1-10>');
      expect(prompt).not.toContain("undefined");
    });
  });

  describe("generateQuestionsPrompt", () => {
    it("interpolates topic, audience, and count into a structured prompt", () => {
      const prompt = generateQuestionsPrompt("Quantum Computing", "undergraduates", 5);
      expect(prompt).toContain('related to "Quantum Computing"');
      expect(prompt).toContain("undergraduates");
      expect(prompt).toContain("Generate exactly 5 practice questions.");
      expect(prompt).toContain('Return JSON: {"questions":');
      expect(prompt).toContain('"hints":');
      expect(prompt).not.toContain("undefined");
    });

    it("defaults audience to general audience if omitted", () => {
      const prompt = generateQuestionsPrompt("Kubernetes", "", 3);
      expect(prompt).toContain("a general audience");
      expect(prompt).not.toContain("undefined");
    });
  });

  describe("reportPrompt", () => {
    it("formats multiple evaluations into a session analysis summary", () => {
      const evals = [
        { ev: { overallScore: 8, styleObservation: "Clear analogies." } },
        { ev: { overallScore: 9, styleObservation: "Structured breakdown." } },
      ];
      const prompt = reportPrompt(evals);
      expect(prompt).toContain("Analyze this 2-answer session:");
      expect(prompt).toContain("Q1: 8/10 — Clear analogies.");
      expect(prompt).toContain("Q2: 9/10 — Structured breakdown.");
      expect(prompt).toContain('"communicationStyle"');
      expect(prompt).toContain('"recurringStrength"');
      expect(prompt).toContain('"recurringFlaw"');
      expect(prompt).toContain('"weeklyPractice"');
      expect(prompt).toContain('"overallScore"');
      expect(prompt).not.toContain("undefined");
    });
  });

  describe("whiteboard prompts", () => {
    it("formats prepareWhiteboardPrompt with empty canvas fallback", () => {
      const prompt = prepareWhiteboardPrompt([], "My notes here", "OAuth Flow");
      expect(prompt).toContain('CONCEPT: "OAuth Flow"');
      expect(prompt).toContain("CANVAS: Empty — no shapes or annotations drawn.");
      expect(prompt).toContain("NOTES:\nMy notes here");
    });

    it("formats prepareWhiteboardPrompt with shapes and arrows", () => {
      const elements = [
        { id: "box1", type: "rectangle", x: 10, y: 10, width: 100, height: 50 },
        { id: "t1", type: "text", x: 12, y: 12, text: "Client App", containerId: "box1" },
        { id: "box2", type: "rectangle", x: 200, y: 10, width: 100, height: 50 },
        { id: "t2", type: "text", x: 202, y: 12, text: "Auth Server", containerId: "box2" },
        {
          id: "arr1",
          type: "arrow",
          startBinding: { elementId: "box1" },
          endBinding: { elementId: "box2" },
        },
      ];
      const prompt = prepareWhiteboardPrompt(elements, "Tokens exchange", "OAuth");
      expect(prompt).toContain('"Client App" [rectangle, medium]');
      expect(prompt).toContain('"Client App" → "Auth Server"');
      expect(prompt).not.toContain("undefined");
    });

    it("builds whiteboardEvalPrompt with criteria and json schema", () => {
      const prompt = whiteboardEvalPrompt("Event Loop", "Summary of canvas", "Explanation notes");
      expect(prompt).toContain('concept: "Event Loop"');
      expect(prompt).toContain("Summary of canvas");
      expect(prompt).toContain("Explanation notes");
      expect(prompt).toContain('"correctness":<1-10>');
      expect(prompt).toContain('"visualStructure":<1-10>');
      expect(prompt).not.toContain("undefined");
    });

    it("getWhiteboardSummary handles empty and active elements", () => {
      expect(getWhiteboardSummary([])).toContain("Empty whiteboard canvas");
      const summary = getWhiteboardSummary([
        { id: "1", type: "rectangle", x: 0, y: 0, width: 100, height: 100 },
        { id: "2", type: "text", x: 10, y: 10, text: "Service" },
      ]);
      expect(summary).toContain("Total Elements: 2");
    });
  });
});
