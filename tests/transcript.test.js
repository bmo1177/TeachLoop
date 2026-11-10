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

    it("applies conservative technical acronym casing", () => {
      const input = "we built an api and a rest db using sql and json with ui and ux on http and https";
      const result = finalizeTranscript(input);
      expect(result).toBe("We built an API and a REST DB using SQL and JSON with UI and UX on HTTP and HTTPS.");
      // Ambiguous words like cd, seo, okrs, kubernetes remain un-mutated
      const ambiguousInput = "we run cd into kubernetes to check seo and okrs";
      expect(finalizeTranscript(ambiguousInput)).toBe("We run cd into kubernetes to check seo and okrs.");
    });

    it("preserves similes and protects quoted strings during filler removal", () => {
      // Similes like 'like a toy box' must NOT be stripped
      const simileInput = "the memory pool acts like a toy box for incoming buffers";
      expect(finalizeTranscript(simileInput)).toBe("The memory pool acts like a toy box for incoming buffers.");

      // Quoted strings must never have words removed inside them
      const quotedInput = `he explained "um you know this is essential" to the team`;
      expect(finalizeTranscript(quotedInput)).toBe(`He explained "um you know this is essential" to the team.`);

      // True filler 'like,' at clause start or pause is cleanly removed
      const fillerLike = "we should, like, deploy the new cache layer";
      expect(finalizeTranscript(fillerLike)).toBe("We should deploy the new cache layer.");
    });

    it("deduplicates immediate 2-word and 3-word phrase repeats", () => {
      const twoWordRepeat = "we need we need more memory";
      expect(finalizeTranscript(twoWordRepeat)).toBe("We need more memory.");

      const threeWordRepeat = "in order to in order to scale the system";
      expect(finalizeTranscript(threeWordRepeat)).toBe("In order to scale the system.");
    });

    it("capitalizes sentence starts, pronoun I, contractions, and after paragraph breaks", () => {
      const input = "as i said, i'm sure i'll need more gpu power. i've checked it and i'd agree.";
      const result = finalizeTranscript(input);
      expect(result).toBe("As I said, I'm sure I'll need more GPU power. I've checked it and I'd agree.");
    });

    it("converts spoken enumerations to markdown bullets when >= 2 list markers are present", () => {
      const enumeratedInput = "There are three primary layers. First, we ingest telemetry data. Second, we batch write to the db. Finally, we notify the ui.";
      const result = finalizeTranscript(enumeratedInput);
      expect(result).toContain("There are three primary layers.");
      expect(result).toContain("- First, we ingest telemetry data.");
      expect(result).toContain("- Second, we batch write to the DB.");
      expect(result).toContain("- Finally, we notify the UI.");

      // Single marker is kept as prose
      const proseInput = "First we check if the user is authenticated and then return.";
      const proseResult = finalizeTranscript(proseInput);
      expect(proseResult).not.toContain("- ");
      expect(proseResult).toBe("First we check if the user is authenticated and then return.");
    });

    it("groups sentences into paragraphs and breaks on spoken transition markers", () => {
      const transitionInput = "We deployed the redis cluster. The latency dropped below five milliseconds. So overall the architecture handles peak load cleanly.";
      const result = finalizeTranscript(transitionInput);
      expect(result).toContain("We deployed the redis cluster. The latency dropped below five milliseconds.\n\nSo overall the architecture handles peak load cleanly.");
    });

    it("ensures output is plain text and markdown-lite with zero HTML tags", () => {
      const input = "first, we define schema. second, we run migrations.";
      const result = finalizeTranscript(input);
      expect(result).not.toMatch(/<[^>]+>/);
    });
  });
});
