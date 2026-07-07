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

export const evalPrompt = (mode, question, answer, audLabel, wasSpoken = false) => {
  const spokenNote = wasSpoken
    ? "\n\n[This answer was spoken via microphone and transcribed automatically. Grade the ideas and communication, not the transcription quality. Ignore any awkward phrasing caused by speech-to-text conversion.]"
    : "";
  if (mode === "teach" || mode === "custom-teach") {
    return `Evaluate explaining "${question}" to ${audLabel}.
Answer: """${answer}"""
Return JSON: {"scores":{"clarity":<1-10>,"analogies":<1-10>,"vocabularyFit":<1-10>,"confidence":<1-10>,"structure":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence>","strongPoint":"<specific thing>","flawToFix":"<single most impactful fix>"}${spokenNote}`;
  }
  return `Evaluate answer to: "${question}"
Answer: """${answer}"""
Return JSON: {"scores":{"clarity":<1-10>,"depth":<1-10>,"structure":<1-10>,"confidence":<1-10>,"examples":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence>","strongPoint":"<specific thing>","flawToFix":"<single most impactful fix>"}${spokenNote}`;
};

export const generateQuestionsPrompt = (topic, audienceLabel, count) => {
  return `You are a communication coach creating practice questions for a user who wants to practice explaining concepts related to "${topic}" to ${audienceLabel || "a general audience"}.

Generate exactly ${count} practice questions. Each question should:
- Be specific and thought-provoking (not vague or too broad)
- Require the person to explain, compare, or analyze something related to "${topic}"
- Be appropriate for explaining to ${audienceLabel || "a general audience"}
- Vary in difficulty and focus (some conceptual, some practical, some comparative)

For each question, provide 3 progressive hints:
- Hint 1: A gentle nudge that points them in the right direction without giving away the answer
- Hint 2: A medium scaffold that provides more context or a key concept to consider
- Hint 3: A comprehensive summary of what a strong answer should cover

Return JSON: {"questions":["<question 1>","<question 2>","<question 3>","<question 4>","<question 5>"],"hints":[["<hint 1 for q1>","<hint 2 for q1>","<hint 3 for q1>"],["<hint 1 for q2>","<hint 2 for q2>","<hint 3 for q2>"],["<hint 1 for q3>","<hint 2 for q3>","<hint 3 for q3>"],["<hint 1 for q4>","<hint 2 for q4>","<hint 3 for q4>"],["<hint 1 for q5>","<hint 2 for q5>","<hint 3 for q5>"]]}

Only return the JSON. No extra text.`;
};

export const reportPrompt = (evals) => {
  const count = evals.length;
  const summary = evals
    .map(
      (e, i) =>
        `Q${i + 1}: ${e.ev.overallScore}/10 — ${e.ev.styleObservation}`
    )
    .join("\n");
  return `Analyze this ${count}-answer session:
${summary}
Return JSON: {"communicationStyle":"<2-3 sentences>","recurringStrength":"<pattern>","recurringFlaw":"<habit>","weeklyPractice":"<actionable practice>","overallScore":<average score>}`;
};
