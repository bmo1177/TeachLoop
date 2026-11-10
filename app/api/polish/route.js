import { NextResponse } from "next/server";
import {
  resolveProvider,
  buildProviderRequest,
  getRateLimitKey,
  checkRateLimit,
  getAllowedOrigin,
  POLISH_SYSTEM_PROMPT,
} from "@/app/lib/aiProviders";
import { finalizeTranscript } from "@/app/lib/transcript";

const MAX_POLISH_LENGTH = 8000;
const MAX_ATTEMPTS = 2;
const FETCH_TIMEOUT = 25000;

function stripThinkTags(text) {
  if (!text) return "";
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
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

  let text;
  try {
    const body = await request.json();
    text = body.text;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  if (text.length > MAX_POLISH_LENGTH) {
    return NextResponse.json({ error: "Text too long" }, { status: 400 });
  }

  const provider = resolveProvider();

  // Demo fallback when no API key is configured:
  // Deterministic pass through local finalizer (zero hallucinated claims),
  // tagged with demo: true.
  if (!provider) {
    const localPolished = finalizeTranscript(text);
    return NextResponse.json({
      text: localPolished,
      demo: true,
    });
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
        body: JSON.stringify(
          buildProviderRequest(provider, text, {
            systemPrompt: POLISH_SYSTEM_PROMPT,
            maxTokens: 800,
            temperature: 0.2,
            jsonMode: false,
          })
        ),
        signal: controller.signal,
      });

      if (res.ok) {
        clearTimeout(timeout);
        const data = await res.json();
        const rawContent = data.choices?.[0]?.message?.content || "";
        const cleaned = stripThinkTags(rawContent);

        if (cleaned) {
          return NextResponse.json({ text: cleaned });
        }

        // Fallback to deterministic finalizer if empty content returned
        return NextResponse.json({
          text: finalizeTranscript(text),
          demo: false,
        });
      }

      lastError = await res.text();
      if (res.status === 429 || res.status >= 500) {
        if (attempt < MAX_ATTEMPTS - 1) {
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
          continue;
        }
      }
      clearTimeout(timeout);
      return NextResponse.json({ error: "Polish request failed" }, { status: res.status });
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        return NextResponse.json({ error: "Request timed out" }, { status: 504 });
      }
      lastError = err.message;
      if (attempt < MAX_ATTEMPTS - 1) continue;
      return NextResponse.json({ error: "Polish request failed" }, { status: 502 });
    }
  }

  clearTimeout(timeout);
  return NextResponse.json({ error: "Polish request failed" }, { status: 502 });
}
