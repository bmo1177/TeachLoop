export function validateQuestionsSchema(data) {
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

export function validateEvalSchema(data) {
  if (!data || typeof data !== "object") return false;
  if (typeof data.overallScore !== "number") return false;
  if (typeof data.styleObservation !== "string") return false;
  if (typeof data.strongPoint !== "string") return false;
  if (typeof data.flawToFix !== "string") return false;
  if (!data.scores || typeof data.scores !== "object") return false;
  return true;
}

export function validateReportSchema(data) {
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

export function extractJSON(text) {
  if (!text || typeof text !== "string") return null;
  // Reasoning models may wrap their answer in think/thinking fences even in
  // JSON mode; strip those (plus normal code fences) before both strategies.
  const fence = text
    .replace(/```(?:json|think|thinking)\n?|```/g, "")
    .replace(/<\/?(?:think|thinking)>/g, "")
    .trim();
  try { return JSON.parse(fence); } catch {}

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }

  return null;
}
