import { NextResponse } from "next/server";

const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const MAX_PROMPT_LENGTH = 12000;
const MAX_ATTEMPTS = 2;
const FETCH_TIMEOUT = 15000;

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
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: "Prompt too long" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 });
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
          temperature: 0.1,
          messages: [
            { role: "system", content: "You are a warm, encouraging communication coach and fair technical interviewer. Grade the underlying ideas generously (7-9 for most). Ignore speech-to-text artifacts. Return valid JSON only." },
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
      if (parsed) return NextResponse.json(parsed);

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
