import { describe, it, expect } from "vitest";
import {
  validateQuestionsSchema,
  validateEvalSchema,
  validateReportSchema,
  extractJSON,
} from "@/app/lib/evalSchemas";

describe("evalSchemas validation and extraction", () => {
  describe("validateQuestionsSchema", () => {
    it("validates a standard questions array", () => {
      const valid = {
        questions: ["Question 1", "Question 2", "Question 3"],
      };
      expect(validateQuestionsSchema(valid)).toBe(true);
    });

    it("validates questions with matching 3-step progressive hints", () => {
      const validWithHints = {
        questions: ["Q1", "Q2"],
        hints: [
          ["h1", "h2", "h3"],
          ["h4", "h5", "h6"],
        ],
      };
      expect(validateQuestionsSchema(validWithHints)).toBe(true);
    });

    it("rejects invalid questions payloads", () => {
      expect(validateQuestionsSchema(null)).toBe(false);
      expect(validateQuestionsSchema({})).toBe(false);
      expect(validateQuestionsSchema({ questions: [] })).toBe(false);
      expect(validateQuestionsSchema({ questions: [""] })).toBe(false);
      expect(validateQuestionsSchema({ questions: [123] })).toBe(false);
    });

    it("rejects mismatched or malformed hints", () => {
      expect(
        validateQuestionsSchema({
          questions: ["Q1", "Q2"],
          hints: [["h1", "h2", "h3"]], // length mismatch
        })
      ).toBe(false);

      expect(
        validateQuestionsSchema({
          questions: ["Q1"],
          hints: [["h1", "h2"]], // not 3 hints
        })
      ).toBe(false);

      expect(
        validateQuestionsSchema({
          questions: ["Q1"],
          hints: [["h1", "h2", ""]], // empty hint string
        })
      ).toBe(false);
    });
  });

  describe("validateEvalSchema", () => {
    it("validates a full eval payload", () => {
      const valid = {
        overallScore: 8.5,
        styleObservation: "Clear structure and good pacing.",
        strongPoint: "Great intuition behind distributed hash tables.",
        flawToFix: "Explain replication lag trade-offs.",
        scores: {
          clarity: 9,
          depth: 8,
          structure: 9,
          confidence: 8,
          examples: 8,
        },
      };
      expect(validateEvalSchema(valid)).toBe(true);
    });

    it("rejects payloads missing required fields or having wrong types", () => {
      expect(validateEvalSchema(null)).toBe(false);
      expect(validateEvalSchema({})).toBe(false);
      expect(
        validateEvalSchema({
          overallScore: "8", // string instead of number
          styleObservation: "obs",
          strongPoint: "strong",
          flawToFix: "fix",
          scores: {},
        })
      ).toBe(false);

      expect(
        validateEvalSchema({
          overallScore: 8,
          styleObservation: "obs",
          strongPoint: "strong",
          // missing flawToFix
          scores: {},
        })
      ).toBe(false);

      expect(
        validateEvalSchema({
          overallScore: 8,
          styleObservation: "obs",
          strongPoint: "strong",
          flawToFix: "fix",
          scores: "not an object",
        })
      ).toBe(false);
    });
  });

  describe("validateReportSchema", () => {
    it("validates a correct report payload", () => {
      const valid = {
        communicationStyle: "Crisp and analytical.",
        recurringStrength: "Consistent mental models.",
        recurringFlaw: "Rushing past assumptions.",
        weeklyPractice: "Outline 3 constraints upfront.",
        overallScore: 7.9,
      };
      expect(validateReportSchema(valid)).toBe(true);
    });

    it("coerces string overallScore into a number if valid", () => {
      const data = {
        communicationStyle: "Crisp and analytical.",
        recurringStrength: "Consistent mental models.",
        recurringFlaw: "Rushing past assumptions.",
        weeklyPractice: "Outline 3 constraints upfront.",
        overallScore: "8.2",
      };
      expect(validateReportSchema(data)).toBe(true);
      expect(data.overallScore).toBe(8.2);
    });

    it("rejects missing or non-string fields", () => {
      expect(validateReportSchema(null)).toBe(false);
      expect(validateReportSchema({})).toBe(false);
      expect(
        validateReportSchema({
          communicationStyle: 123,
          recurringStrength: "str",
          recurringFlaw: "flaw",
          weeklyPractice: "practice",
          overallScore: 8,
        })
      ).toBe(false);
      expect(
        validateReportSchema({
          communicationStyle: "style",
          recurringStrength: "str",
          recurringFlaw: "flaw",
          weeklyPractice: "practice",
          overallScore: "not-a-number",
        })
      ).toBe(false);
    });
  });

  describe("extractJSON", () => {
    it("extracts clean JSON objects", () => {
      const obj = { key: "value", number: 42 };
      expect(extractJSON(JSON.stringify(obj))).toEqual(obj);
    });

    it("extracts JSON embedded in markdown triple-backtick fences", () => {
      const markdown = "```json\n{\n  \"message\": \"success\",\n  \"score\": 10\n}\n```";
      expect(extractJSON(markdown)).toEqual({ message: "success", score: 10 });
    });

    it("extracts JSON embedded in surrounding conversational text", () => {
      const text = 'Here is the result you requested:\n{"status": "ok", "count": 5}\nHope this helps!';
      expect(extractJSON(text)).toEqual({ status: "ok", count: 5 });
    });

    it("returns null for non-JSON or unparseable input", () => {
      expect(extractJSON("")).toBeNull();
      expect(extractJSON(null)).toBeNull();
      expect(extractJSON("plain text without brackets")).toBeNull();
      expect(extractJSON("{ broken json: true ")).toBeNull();
    });
  });
});
