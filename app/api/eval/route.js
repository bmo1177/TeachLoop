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
  if (!data.questions.every((q) => typeof q === "string" && q.length > 0)) return false;
  if (data.hints !== undefined) {
    if (!Array.isArray(data.hints)) return false;
    if (data.hints.length !== data.questions.length) return false;
    return data.hints.every(
      (h) => Array.isArray(h) && h.length === 3 && h.every((s) => typeof s === "string" && s.length > 0)
    );
  }
  return true;
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

function validateReportSchema(data) {
  if (!data || typeof data !== "object") return false;
  if (typeof data.overallScore !== "number" && (typeof data.overallScore !== "string" || isNaN(Number(data.overallScore)))) return false;
  if (typeof data.communicationStyle !== "string") return false;
  if (typeof data.recurringStrength !== "string") return false;
  if (typeof data.recurringFlaw !== "string") return false;
  if (typeof data.weeklyPractice !== "string") return false;
  if (typeof data.overallScore === "string") {
    data.overallScore = Number(data.overallScore);
  }
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

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateDeterministicMock(prompt) {
  // 1. Question generation
  if (prompt.includes("practice questions") || (prompt.includes("Return JSON:") && prompt.includes("\"questions\":"))) {
    const topicMatch = prompt.match(/related to "([^"]+)"/);
    const topic = topicMatch ? topicMatch[1] : "Software Engineering";
    const questions = [
      `How would you explain the core concepts and architecture behind ${topic}?`,
      `What are the most critical performance and scalability trade-offs when implementing ${topic}?`,
      `How would you compare ${topic} with alternative paradigms or solutions?`,
      `What is a common failure mode or subtle bug encountered when working with ${topic}?`,
      `How would you articulate the business value and engineering ROI of ${topic} to leadership?`,
    ];
    const hints = [
      [
        `Start with a high-level definition and the primary problem ${topic} was created to solve.`,
        `Break down the essential components, data structures, or workflows.`,
        `Explain the end-to-end execution flow with a concise, practical scenario.`,
      ],
      [
        `Consider resource utilization (CPU, memory, I/O) versus developer velocity.`,
        `Focus on bottlenecks that emerge as concurrency or data volume increases.`,
        `Discuss caching, horizontal scaling, or asynchronous decoupling techniques.`,
      ],
      [
        `Identify the primary competitor or legacy pattern often replaced by ${topic}.`,
        `Highlight scenarios where the alternative is actually simpler or more cost-effective.`,
        `Formulate a clear decision rubric for when to adopt ${topic}.`,
      ],
      [
        `Think about race conditions, silent data corruption, or unhandled exceptions.`,
        `Describe how an engineer would diagnose the issue using metrics or logs.`,
        `Provide a defensive programming or architectural remedy to prevent it.`,
      ],
      [
        `Frame the discussion around developer productivity, system reliability, or cost.`,
        `Avoid internal jargon; emphasize delivery velocity and risk mitigation.`,
        `Quantify the impact with an illustrative before-and-after business metric.`,
      ],
    ];
    return { questions, hints, demo: true };
  }

  // 2. Report analysis
  if (prompt.includes("communicationStyle") || prompt.includes("Analyze this")) {
    const scores = [...prompt.matchAll(/Q\d+:\s*(\d+(\.\d+)?)\/10/g)].map((m) => Number(m[1]));
    const avg = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 7.8;

    return {
      communicationStyle:
        "Structured and methodical. You consistently organize your explanations with a logical progression, anchoring complex concepts in clear high-level frameworks.",
      recurringStrength:
        "Strong conceptual framing and deliberate emphasis on architectural fundamentals.",
      recurringFlaw:
        "Tendency to dive into low-level mechanics before clearly establishing operational constraints.",
      weeklyPractice:
        "Practice spending the first 20 seconds stating the 'why' and core trade-offs before walking through technical implementation.",
      overallScore: avg,
      demo: true,
    };
  }

  // 3. Whiteboard visual explanation
  if (prompt.includes("visual explanation") || prompt.includes("whiteboard sketch") || prompt.includes("WHITEBOARD CANVAS")) {
    const conceptMatch = prompt.match(/concept:\s*"([^"]+)"/i) || prompt.match(/CONCEPT:\s*"([^"]+)"/);
    const concept = conceptMatch ? conceptMatch[1] : "Architecture Diagram";

    return {
      scores: {
        correctness: 8,
        completeness: 7,
        clarity: 8,
        visualStructure: 8,
      },
      overallScore: 7.8,
      styleObservation: `Well-structured diagram for "${concept}" featuring logical grouping and intuitive layout hierarchy.`,
      strongPoint: "Clear directionality of components and clean separation of architectural layers.",
      flawToFix: "Add annotations or labels along connector arrows to specify data flow protocols.",
      demo: true,
    };
  }

  // 4. Teach mode explanation
  if (prompt.includes("Evaluate explaining") || prompt.includes('"analogies":<1-10>')) {
    const qMatch = prompt.match(/Evaluate explaining "([^"]+)" to ([^.]+)\./);
    const question = qMatch ? qMatch[1] : "the concept";
    const audLabel = qMatch ? qMatch[2] : "your audience";
    const aMatch = prompt.match(/Answer:\s*"""([\s\S]*?)"""/);
    const answer = aMatch ? aMatch[1].trim() : "";
    const words = answer ? answer.split(/\s+/).length : 0;
    const hash = simpleHash(answer || question);

    const base = words >= 80 ? 8 : words >= 35 ? 7 : 6;
    const clarity = Math.min(10, Math.max(5, base + (hash % 2)));
    const analogies = Math.min(10, Math.max(5, base - ((hash >> 1) % 2)));
    const vocabularyFit = Math.min(10, Math.max(5, base + ((hash >> 2) % 2)));
    const confidence = Math.min(10, Math.max(5, base));
    const structure = Math.min(10, Math.max(5, base + ((hash >> 3) % 2)));
    const overall = Math.round(((clarity + analogies + vocabularyFit + confidence + structure) / 5) * 10) / 10;

    return {
      scores: {
        clarity,
        analogies,
        vocabularyFit,
        confidence,
        structure,
      },
      overallScore: overall,
      styleObservation: `Engaging and thoughtful explanation tailored reasonably well for ${audLabel}.`,
      strongPoint: `Effective breakdown of "${question}" with clear pacing and approachable terminology.`,
      flawToFix: "Introduce a more memorable real-world analogy early on to anchor understanding before technical terms.",
      demo: true,
    };
  }

  // 5. Interview mode system design answer
  const qMatch = prompt.match(/Evaluate answer to:\s*"([^"]+)"/);
  const question = qMatch ? qMatch[1] : "system design question";
  const aMatch = prompt.match(/Answer:\s*"""([\s\S]*?)"""/);
  const answer = aMatch ? aMatch[1].trim() : "";
  const words = answer ? answer.split(/\s+/).length : 0;
  const hash = simpleHash(answer || question);

  const base = words >= 80 ? 8 : words >= 35 ? 7 : 6;
  const clarity = Math.min(10, Math.max(5, base + (hash % 2)));
  const depth = Math.min(10, Math.max(5, base - ((hash >> 1) % 2)));
  const structure = Math.min(10, Math.max(5, base + ((hash >> 2) % 2)));
  const confidence = Math.min(10, Math.max(5, base));
  const examples = Math.min(10, Math.max(5, base + ((hash >> 3) % 2)));
  const overall = Math.round(((clarity + depth + structure + confidence + examples) / 5) * 10) / 10;

  return {
    scores: {
      clarity,
      depth,
      structure,
      confidence,
      examples,
    },
    overallScore: overall,
    styleObservation: "Structured, engineering-centric answer following a logical top-down approach.",
    strongPoint: `Demonstrates clear understanding of system boundaries and trade-offs for "${question}".`,
    flawToFix: "Explicitly state capacity and traffic estimations upfront to justify your architectural choices.",
    demo: true,
  };
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
  if (!apiKey || !apiKey.trim()) {
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
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
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
