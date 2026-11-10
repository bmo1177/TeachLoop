import { NextResponse } from "next/server";
import {
  validateQuestionsSchema,
  validateEvalSchema,
  validateReportSchema,
  extractJSON,
} from "@/app/lib/evalSchemas";
import { generateDeterministicMock } from "@/app/lib/mockAi";
import {
  resolveProvider,
  buildProviderRequest,
  getRateLimitKey,
  checkRateLimit,
  getAllowedOrigin,
} from "@/app/lib/aiProviders";

const MAX_PROMPT_LENGTH = 12000;
const MAX_ATTEMPTS = 2;
const FETCH_TIMEOUT = 25000;

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
