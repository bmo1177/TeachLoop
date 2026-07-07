import { NextResponse } from "next/server";

const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const MAX_PROMPT_LENGTH = 12000;
const MAX_ATTEMPTS = 2;
const FETCH_TIMEOUT = 15000;
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 30;

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

function validateQuestionsSchema(data) {
  if (!data || typeof data !== "object") return false;
  if (!Array.isArray(data.questions)) return false;
  if (data.questions.length === 0) return false;
  return data.questions.every((q) => typeof q === "string" && q.length > 0);
}

function validateEvalSchema(data) {
  if (!data || typeof data !== "object") return false;
  if (typeof data.overallScore !== "number") return false;
  if (typeof data.styleObservation !== "string") return false;
  if (typeof data.strongPoint !== "string") return false;
  if (typeof data.flawToFix !== "string") return false;
  if (!data.scores || typeof data.scores !== "object") return false;
  return true;
}

function extractJSON(text) {
  const fence = text.replace(/```json\n?|```/g, "").trim();
  try { return JSON.parse(fence); } catch {}

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }

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

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Service configuration error" }, { status: 500 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  let lastError;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 768,
          temperature: 0.3,
          messages: [
            { role: "system", content: "You are a warm, encouraging communication coach and fair technical interviewer. Your job is to evaluate COMMUNICATION QUALITY, not perfection. Most answers deserve 7-9. Only truly poor answers get below 6. When an answer was spoken via microphone, ignore speech-to-text quirks entirely — grade the underlying ideas and how clearly they were expressed. Never penalize for transcription artifacts, minor grammar issues from speech recognition, or slightly awkward phrasing that comes from speaking aloud. Focus on: did they communicate the concept clearly? Did they show understanding? Were they engaging? Return valid JSON only." },
            { role: "user", content: prompt },
          ],
        }),
        signal: controller.signal,
      });

      if (res.ok) {
        clearTimeout(timeout);
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";

        const parsed = extractJSON(text);
        if (parsed) {
          const isQuestionResponse = Array.isArray(parsed.questions);
          const isValid = isQuestionResponse
            ? validateQuestionsSchema(parsed)
            : validateEvalSchema(parsed);
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
