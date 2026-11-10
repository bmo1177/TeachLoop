import { NextResponse } from "next/server";
import {
  validateQuestionsSchema,
  validateEvalSchema,
  validateReportSchema,
  extractJSON,
} from "@/app/lib/evalSchemas";
import { generateDeterministicMock } from "@/app/lib/mockAi";

const MAX_PROMPT_LENGTH = 12000;
const MAX_ATTEMPTS = 2;
const FETCH_TIMEOUT = 25000;
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 30;

const DEFAULT_NIM_MODEL = "nvidia/nemotron-3.5-bolt-e4b";
const DEFAULT_OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT =
  "You are a warm, encouraging communication coach and fair technical interviewer. Your job is to evaluate COMMUNICATION QUALITY, not perfection. Most answers deserve 7-9. Only truly poor answers get below 6. When an answer was spoken via microphone, ignore speech-to-text quirks entirely; grade the underlying ideas and how clearly they were expressed. Never penalize for transcription artifacts, minor grammar issues from speech recognition, or slightly awkward phrasing that comes from speaking aloud. Focus on: did they communicate the concept clearly? Did they show understanding? Were they engaging? Return valid JSON only.";

// Provider resolution: NVIDIA NIM (production default) -> OpenRouter -> demo.
// Keys are optional by design: without any, the route serves deterministic
// mock evaluations so the whole product works with zero configuration.
function resolveProvider() {
  const nvidiaKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY;
  if (nvidiaKey && nvidiaKey.trim()) {
    return {
      name: "nvidia",
      apiKey: nvidiaKey.trim(),
      baseUrl: NIM_BASE_URL,
      model: process.env.NVIDIA_MODEL || DEFAULT_NIM_MODEL,
      isNim: true,
    };
  }
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey && openRouterKey.trim()) {
    return {
      name: "openrouter",
      apiKey: openRouterKey.trim(),
      baseUrl: OPENROUTER_BASE_URL,
      model: process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL,
      isNim: false,
    };
  }
  return null;
}

function buildProviderRequest(provider, prompt) {
  const body = {
    model: provider.model,
    max_tokens: 1400,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  };
  // NIM specifics: force JSON mode; reasoning-capable models run with
  // thinking disabled so responses stay in `content` (short 25s budget).
  if (provider.isNim) {
    body.response_format = { type: "json_object" };
    body.chat_template_kwargs = { thinking: false };
  }
  return body;
}

const rateLimitMap = new Map();

function getRateLimitKey(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

function checkRateLimit(key) {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { windowStart: now, count: 1 });
    return true;
  }
  record.count++;
  return record.count <= RATE_LIMIT_MAX;
}

function getAllowedOrigin(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return null;
  try {
    const originHost = new URL(origin).host;
    if (originHost === host) return origin;
  } catch {}
  return null;
}

export async function POST(request) {
  const rateKey = getRateLimitKey(request);
  if (!checkRateLimit(rateKey)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const allowedOrigin = getAllowedOrigin(request);
  if (allowedOrigin === null) {
    const origin = request.headers.get("origin");
    if (origin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let prompt;
  try {
    const body = await request.json();
    prompt = body.prompt;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: "Prompt too long" }, { status: 400 });
  }

  const provider = resolveProvider();
  if (!provider) {
    const mock = generateDeterministicMock(prompt);
    let isValid = false;
    if (Array.isArray(mock.questions)) {
      isValid = validateQuestionsSchema(mock);
    } else if (mock.scores && typeof mock.scores === "object") {
      isValid = validateEvalSchema(mock);
    } else {
      isValid = validateReportSchema(mock);
    }
    if (isValid) {
      return NextResponse.json(mock);
    }
    return NextResponse.json({ error: "Failed to generate mock response" }, { status: 500 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  let lastError;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(provider.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify(buildProviderRequest(provider, prompt)),
        signal: controller.signal,
      });

      if (res.ok) {
        clearTimeout(timeout);
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";

        const parsed = extractJSON(text);
        if (parsed) {
          let isValid = false;
          if (Array.isArray(parsed.questions)) {
            isValid = validateQuestionsSchema(parsed);
          } else if (parsed.scores && typeof parsed.scores === "object") {
            isValid = validateEvalSchema(parsed);
          } else {
            isValid = validateReportSchema(parsed);
          }
          if (isValid) {
            return NextResponse.json(parsed);
          }
        }

        return NextResponse.json(
          { error: "Failed to parse model response" },
          { status: 502 }
        );
      }

      lastError = await res.text();
      if (res.status === 429 || res.status >= 500) {
        if (attempt < MAX_ATTEMPTS - 1) {
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
          continue;
        }
      }
      clearTimeout(timeout);
      return NextResponse.json({ error: "Request failed" }, { status: res.status });
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        return NextResponse.json({ error: "Request timed out" }, { status: 504 });
      }
      lastError = err.message;
      if (attempt < MAX_ATTEMPTS - 1) continue;
      return NextResponse.json({ error: "Request failed" }, { status: 502 });
    }
  }

  clearTimeout(timeout);
  return NextResponse.json({ error: "Request failed" }, { status: 502 });
}
