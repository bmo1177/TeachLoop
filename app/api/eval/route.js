import { NextResponse } from "next/server";

const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

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

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 });
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a warm, encouraging communication coach and fair technical interviewer. You give honest but supportive feedback. Grade generously — most well-intentioned work deserves 7-9. Answers may have been spoken and transcribed via voice-to-text, so ignore transcription artifacts (missing punctuation, filler words, misrecognitions) and grade the underlying ideas and communication. Always return valid JSON — no markdown fences, no preamble, no explanation outside the JSON." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";

  const parsed = extractJSON(text);
  if (parsed) return NextResponse.json(parsed);

  return NextResponse.json(
    { error: "Failed to parse model response", raw: text.slice(0, 500) },
    { status: 502 }
  );
}
