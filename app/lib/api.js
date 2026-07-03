export const QUESTIONS_PER_SESSION = 5;

export function pick(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

export async function callEval(prompt) {
  const res = await fetch("/api/eval", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Evaluation failed");
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export const evalPrompt = (mode, question, answer, audLabel) =>
  mode === "teach"
    ? `Evaluate explaining "${question}" to ${audLabel}.
Answer: """${answer}"""
Return JSON: {"scores":{"clarity":<1-10>,"analogies":<1-10>,"vocabularyFit":<1-10>,"confidence":<1-10>,"structure":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence>","strongPoint":"<specific thing>","flawToFix":"<single most impactful fix>"}`
    : `Evaluate answer to: "${question}"
Answer: """${answer}"""
Return JSON: {"scores":{"clarity":<1-10>,"depth":<1-10>,"structure":<1-10>,"confidence":<1-10>,"examples":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence>","strongPoint":"<specific thing>","flawToFix":"<single most impactful fix>"}`;

export const reportPrompt = (evals) => {
  const summary = evals
    .map(
      (e, i) =>
        `Q${i + 1}: ${e.ev.overallScore}/10 — ${e.ev.styleObservation}`
    )
    .join("\n");
  return `Analyze this 5-answer session:
${summary}
Return JSON: {"communicationStyle":"<2-3 sentences>","recurringStrength":"<pattern>","recurringFlaw":"<habit>","weeklyPractice":"<actionable practice>","overallScore":<average score>}`;
};
