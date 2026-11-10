import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildProviderRequest,
  resolveProvider,
  checkRateLimit,
  rateLimitMap,
  POLISH_SYSTEM_PROMPT,
} from "@/app/lib/aiProviders";
import { POST } from "@/app/api/polish/route";

describe("AI Polish & Provider System", () => {
  const origEnv = process.env;

  beforeEach(() => {
    process.env = { ...origEnv };
    rateLimitMap.clear();
  });

  afterEach(() => {
    process.env = origEnv;
  });

  describe("buildProviderRequest", () => {
    it("configures text-mode (no json_object response_format) and thinking:false for NIM", () => {
      const mockNimProvider = {
        name: "nvidia",
        apiKey: "test-nim-key",
        baseUrl: "https://integrate.api.nvidia.com/v1/chat/completions",
        model: "nvidia/nemotron-3.5-bolt-e4b",
        isNim: true,
      };

      const requestBody = buildProviderRequest(
        mockNimProvider,
        "Here is spoken text to polish",
        {
          systemPrompt: POLISH_SYSTEM_PROMPT,
          maxTokens: 800,
          temperature: 0.2,
          jsonMode: false,
        }
      );

      expect(requestBody.model).toBe("nvidia/nemotron-3.5-bolt-e4b");
      expect(requestBody.max_tokens).toBe(800);
      expect(requestBody.temperature).toBe(0.2);
      expect(requestBody.messages[0].content).toBe(POLISH_SYSTEM_PROMPT);
      expect(requestBody.messages[1].content).toBe("Here is spoken text to polish");
      expect(requestBody.chat_template_kwargs).toEqual({ thinking: false });
      expect(requestBody.response_format).toBeUndefined();
    });

    it("configures JSON-mode for evaluation requests", () => {
      const mockNimProvider = {
        name: "nvidia",
        apiKey: "test-nim-key",
        baseUrl: "https://integrate.api.nvidia.com/v1/chat/completions",
        model: "nvidia/nemotron-3.5-bolt-e4b",
        isNim: true,
      };

      const requestBody = buildProviderRequest(
        mockNimProvider,
        "Evaluate this answer",
        { jsonMode: true }
      );

      expect(requestBody.response_format).toEqual({ type: "json_object" });
      expect(requestBody.chat_template_kwargs).toEqual({ thinking: false });
    });
  });

  describe("POST /api/polish route", () => {
    it("returns 400 for empty or missing text", async () => {
      const req = new Request("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Missing text");
    });

    it("returns 400 when text exceeds 8000 characters", async () => {
      const longText = "a".repeat(8001);
      const req = new Request("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: longText }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Text too long");
    });

    it("returns deterministic structured text tagged demo:true when no API key configured", async () => {
      delete process.env.NVIDIA_API_KEY;
      delete process.env.NVIDIA_NIM_API_KEY;
      delete process.env.OPENROUTER_API_KEY;

      const rawTranscript =
        "um so basically we built an api using sql and json. first, we load the data. second, we serve it.";

      const req = new Request("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawTranscript }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.demo).toBe(true);
      expect(json.text).toContain("API");
      expect(json.text).toContain("SQL");
      expect(json.text).toContain("JSON");
      expect(json.text).toContain("- First, we load the data.");
      expect(json.text).toContain("- Second, we serve it.");
    });
  });
});
