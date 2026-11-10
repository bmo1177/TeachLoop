import { describe, it, expect } from "vitest";
import {
  STORAGE_KEY,
  MAX_SESSIONS,
  parseSessions,
  addSessionToList,
  deleteSessionFromList,
  serializeSessions,
} from "@/app/lib/sessionHistory";

describe("sessionHistory pure utilities", () => {
  describe("STORAGE_KEY and MAX_SESSIONS constants", () => {
    it("has expected storage key and default cap of 20", () => {
      expect(STORAGE_KEY).toBe("teachloop-sessions");
      expect(MAX_SESSIONS).toBe(20);
    });
  });

  describe("parseSessions", () => {
    it("returns empty array for non-string or empty inputs", () => {
      expect(parseSessions("")).toEqual([]);
      expect(parseSessions(null)).toEqual([]);
      expect(parseSessions(undefined)).toEqual([]);
      expect(parseSessions(123)).toEqual([]);
    });

    it("returns empty array for malformed JSON", () => {
      expect(parseSessions("not valid json {[[")).toEqual([]);
      expect(parseSessions('{"justAnObject": true}')).toEqual([]);
    });

    it("parses valid array and filters out entries without an id", () => {
      const validData = [
        { id: "sess-1", mode: "teach", overallScore: 8 },
        { mode: "teach", overallScore: 7 }, // missing id
        null, // invalid item
        { id: "sess-2", mode: "interview", overallScore: 9 },
      ];
      const parsed = parseSessions(JSON.stringify(validData));
      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe("sess-1");
      expect(parsed[1].id).toBe("sess-2");
    });
  });

  describe("addSessionToList", () => {
    it("prepends the new session to the list", () => {
      const existing = [{ id: "sess-1", mode: "teach" }];
      const newSession = { id: "sess-2", mode: "interview" };
      const result = addSessionToList(existing, newSession);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("sess-2");
      expect(result[1].id).toBe("sess-1");
    });

    it("generates an id and date if not provided in newSession", () => {
      const result = addSessionToList([], { mode: "teach", overallScore: 8.5 });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBeDefined();
      expect(typeof result[0].id).toBe("number");
      expect(result[0].date).toBeDefined();
      expect(new Date(result[0].date).getTime()).not.toBeNaN();
    });

    it("strictly enforces the 20-session cap", () => {
      const initial = Array.from({ length: 25 }, (_, i) => ({
        id: `sess-${i}`,
        score: i,
      }));
      const updated = addSessionToList(initial, { id: "new-sess" });
      expect(updated).toHaveLength(20);
      expect(updated[0].id).toBe("new-sess");
    });

    it("respects custom max parameter", () => {
      const initial = [{ id: "1" }, { id: "2" }];
      const updated = addSessionToList(initial, { id: "3" }, 2);
      expect(updated).toHaveLength(2);
      expect(updated[0].id).toBe("3");
      expect(updated[1].id).toBe("1");
    });

    it("handles non-array sessions argument safely", () => {
      const updated = addSessionToList(null, { id: "fresh" });
      expect(updated).toHaveLength(1);
      expect(updated[0].id).toBe("fresh");
    });

    it("handles non-object newSession safely", () => {
      const existing = [{ id: "1" }];
      expect(addSessionToList(existing, null)).toEqual(existing);
      expect(addSessionToList(existing, "invalid")).toEqual(existing);
    });
  });

  describe("deleteSessionFromList", () => {
    it("removes session matching the given id", () => {
      const sessions = [
        { id: "sess-1", score: 8 },
        { id: "sess-2", score: 9 },
        { id: "sess-3", score: 7 },
      ];
      const result = deleteSessionFromList(sessions, "sess-2");
      expect(result).toHaveLength(2);
      expect(result.map((s) => s.id)).toEqual(["sess-1", "sess-3"]);
    });

    it("returns same items if id is not found", () => {
      const sessions = [{ id: "sess-1" }];
      expect(deleteSessionFromList(sessions, "non-existent")).toHaveLength(1);
    });

    it("handles non-array sessions safely", () => {
      expect(deleteSessionFromList(null, "sess-1")).toEqual([]);
    });
  });

  describe("serializeSessions", () => {
    it("serializes array of sessions to a JSON string", () => {
      const sessions = [{ id: "1", score: 8.5 }];
      const json = serializeSessions(sessions);
      expect(JSON.parse(json)).toEqual(sessions);
    });

    it("serializes non-array to empty array JSON string", () => {
      expect(serializeSessions(null)).toBe("[]");
      expect(serializeSessions(undefined)).toBe("[]");
    });
  });
});
