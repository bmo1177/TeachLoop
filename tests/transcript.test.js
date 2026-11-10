import { describe, it, expect } from "vitest";
import {
  removeFillers,
  deduplicateWords,
  capitalizeFirstLetter,
  fixPunctuation,
  cleanTranscript,
  finalizeTranscript,
} from "@/app/lib/transcript";

describe("transcript processing", () => {
  describe("removeFillers", () => {
    it("returns empty string for falsy input", () => {
      expect(removeFillers("")).toBe("");
      expect(removeFillers(null)).toBe("");
      expect(removeFillers(undefined)).toBe("");
    });

    it("removes common speech fillers case-insensitively", () => {
      const input = "Um so basically you know I mean actually it works";
      expect(removeFillers(input)).toBe("so it works");

      const inputWithLikeYouKnow = "This is like you know a test";
      expect(removeFillers(inputWithLikeYouKnow)).toBe("This is a test");
    });

    it("collapses multiple consecutive spaces after removal", () => {
      const input = "Hello    uh   world";
      expect(removeFillers(input)).toBe("Hello world");
    });
  });

  describe("deduplicateWords", () => {
    it("returns empty string for falsy input", () => {
      expect(deduplicateWords("")).toBe("");
      expect(deduplicateWords(null)).toBe("");
    });

    it("removes consecutive duplicate words case-insensitively", () => {
      expect(deduplicateWords("the the machine")).toBe("the machine");
      expect(deduplicateWords("We We need need more more data")).toBe("We need more data");
      expect(deduplicateWords("The the THE system")).toBe("The system");
    });

    it("preserves non-consecutive duplicates", () => {
      expect(deduplicateWords("the model and the system")).toBe("the model and the system");
    });
  });

  describe("capitalizeFirstLetter", () => {
    it("handles empty or whitespace strings", () => {
      expect(capitalizeFirstLetter("")).toBe("");
      expect(capitalizeFirstLetter("   ")).toBe("   ");
    });

    it("capitalizes the first non-whitespace character", () => {
      expect(capitalizeFirstLetter("hello world")).toBe("Hello world");
      expect(capitalizeFirstLetter("  gradient descent")).toBe("  Gradient descent");
      expect(capitalizeFirstLetter("Already capital")).toBe("Already capital");
    });
  });

  describe("fixPunctuation and voice fragmentation", () => {
    it("does NOT add punctuation on non-terminal interim chunks", () => {
      expect(fixPunctuation("in computer science", false)).toBe("in computer science");
      expect(fixPunctuation("gradient descent", false)).toBe("gradient descent");
    });

    it("adds terminal period when isTerminal is true and trailing punctuation is missing", () => {
      expect(fixPunctuation("helps optimize models", true)).toBe("helps optimize models.");
    });

    it("does not duplicate punctuation if already present", () => {
      expect(fixPunctuation("helps optimize models.", true)).toBe("helps optimize models.");
      expect(fixPunctuation("is it ready?", true)).toBe("is it ready?");
      expect(fixPunctuation("great job!", true)).toBe("great job!");
    });
  });

  describe("cleanTranscript", () => {
    it("cleans fillers and dedupes while respecting terminal flag", () => {
      const streamChunk = "um um in computer computer science";
      expect(cleanTranscript(streamChunk, { isTerminal: false })).toBe("in computer science");

      const finalChunk = "um um in computer computer science";
      expect(cleanTranscript(finalChunk, { isTerminal: true })).toBe("in computer science.");
    });
  });

  describe("finalizeTranscript", () => {
    it("cleans, capitalizes first letter, and terminates full transcript with a period", () => {
      const input = "  um so basically gradient descent helps optimize the the neural net";
      const result = finalizeTranscript(input);
      expect(result).toBe("So gradient descent helps optimize the neural net.");
    });

    it("avoids mid-sentence period fragmentation across multi-clause speech", () => {
      const rawStreamingText = "in computer science gradient descent helps optimize models";
      const finalized = finalizeTranscript(rawStreamingText);
      expect(finalized).toBe("In computer science gradient descent helps optimize models.");
      expect(finalized).not.toContain("science.");
      expect(finalized).not.toContain("descent.");
    });

    it("returns empty string when transcript is empty or only whitespace/fillers", () => {
      expect(finalizeTranscript("")).toBe("");
      expect(finalizeTranscript("   ")).toBe("");
      expect(finalizeTranscript("um uh")).toBe("");
    });
  });
});
