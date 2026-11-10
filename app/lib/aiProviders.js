export const DEFAULT_NIM_MODEL = "nvidia/nemotron-3.5-bolt-e4b";
export const DEFAULT_OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
export const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

export const EVAL_SYSTEM_PROMPT =
  "You are a warm, encouraging communication coach and fair technical interviewer. Your job is to evaluate COMMUNICATION QUALITY, not perfection. Most answers deserve 7-9. Only truly poor answers get below 6. When an answer was spoken via microphone, ignore speech-to-text quirks entirely; grade the underlying ideas and how clearly they were expressed. Never penalize for transcription artifacts, minor grammar issues from speech recognition, or slightly awkward phrasing that comes from speaking aloud. Focus on: did they communicate the concept clearly? Did they show understanding? Were they engaging? Return valid JSON only.";

export const POLISH_SYSTEM_PROMPT =
  "You are an expert speech-to-text writing assistant. Your task is to reformat the dictated transcription into a clean, well-structured written answer. Preserve the speaker's vocabulary, tone, and intended meaning. NEVER add new technical claims, assumptions, or extra facts. Convert clear spoken enumerations into markdown bullet lists (- ). Fix capitalization, punctuation, and break into natural paragraphs. Return ONLY the polished text without any introductory commentary, code blocks, or extra notes.";

// Provider resolution: NVIDIA NIM (production default) -> OpenRouter -> demo.
// Keys are optional by design: without any, the route serves deterministic
// mocks so the whole product works with zero configuration.
export function resolveProvider() {
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

export function buildProviderRequest(
  provider,
  content,
  {
    systemPrompt = EVAL_SYSTEM_PROMPT,
    maxTokens = 1400,
    temperature = 0.3,
    jsonMode = true,
  } = {}
) {
  const body = {
    model: provider.model,
    max_tokens: maxTokens,
    temperature: temperature,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: content },
    ],
  };

  // NIM specifics: force JSON mode when requested; reasoning-capable models run with
  // thinking disabled so responses stay in `content` within budget.
  if (provider.isNim) {
    if (jsonMode) {
      body.response_format = { type: "json_object" };
    }
    body.chat_template_kwargs = { thinking: false };
  }
  return body;
}

export const rateLimitMap = new Map();
export const RATE_LIMIT_WINDOW = 60000;
export const RATE_LIMIT_MAX = 30;

export function getRateLimitKey(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

export function checkRateLimit(key, { windowMs = RATE_LIMIT_WINDOW, maxRequests = RATE_LIMIT_MAX } = {}) {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now - record.windowStart > windowMs) {
    rateLimitMap.set(key, { windowStart: now, count: 1 });
    return true;
  }
  record.count++;
  return record.count <= maxRequests;
}

export function getAllowedOrigin(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return null;
  try {
    const originHost = new URL(origin).host;
    if (originHost === host) return origin;
  } catch {}
  return null;
}
