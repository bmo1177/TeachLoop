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

export function getWhiteboardSummary(elements) {
  if (!elements || elements.length === 0) return "Empty whiteboard canvas (no shapes or annotations drawn).";

  const rectangles = elements.filter(e => e.type === "rectangle" && !e.isDeleted);
  const ellipses = elements.filter(e => e.type === "ellipse" && !e.isDeleted);
  const diamonds = elements.filter(e => e.type === "diamond" && !e.isDeleted);
  const texts = elements.filter(e => e.type === "text" && !e.isDeleted);
  const arrows = elements.filter(e => e.type === "arrow" && !e.isDeleted);
  const lines = elements.filter(e => (e.type === "line" || e.type === "draw") && !e.isDeleted);

  const shapeMap = new Map();
  [...rectangles, ...ellipses, ...diamonds].forEach(s => shapeMap.set(s.id, s));
  texts.forEach(t => shapeMap.set(t.id, t));

  const getShapeLabel = (shape) => {
    const boundText = texts.find(t => t.containerId === shape.id);
    if (boundText) return boundText.text;

    let nearestText = null;
    let minDist = 150;
    texts.forEach(t => {
      const dx = (shape.x + shape.width/2) - (t.x + t.width/2);
      const dy = (shape.y + shape.height/2) - (t.y + t.height/2);
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < minDist) {
        minDist = dist;
        nearestText = t.text;
      }
    });
    return nearestText || `Unnamed ${shape.type}`;
  };

  const shapesList = [...rectangles, ...ellipses, ...diamonds].map((s) => {
    const label = getShapeLabel(s);
    return `- [ID: ${s.id}] ${s.type.toUpperCase()}: "${label}" located at (${Math.round(s.x)}, ${Math.round(s.y)})`;
  });

  const freeTexts = texts.filter(t => !t.containerId).map(t => {
    return `- Text Note: "${t.text}" at (${Math.round(t.x)}, ${Math.round(t.y)})`;
  });

  const arrowConnections = arrows.map(a => {
    const startId = a.startBinding?.elementId;
    const endId = a.endBinding?.elementId;
    const startShape = startId ? shapeMap.get(startId) : null;
    const endShape = endId ? shapeMap.get(endId) : null;

    const startLabel = startShape ? (startShape.type === "text" ? startShape.text : getShapeLabel(startShape)) : "unconnected start";
    const endLabel = endShape ? (endShape.type === "text" ? endShape.text : getShapeLabel(endShape)) : "unconnected end";

    const boundText = texts.find(t => t.containerId === a.id);
    const arrowLabel = boundText ? ` labeled "${boundText.text}"` : "";

    return `- Arrow${arrowLabel} connecting "${startLabel}" to "${endLabel}"`;
  });

  return `WHITEBOARD CANVAS CONTENT SUMMARY:
Total Elements: ${elements.length}
Shapes:
${shapesList.length > 0 ? shapesList.join("\n") : "None"}

Floating Text / Notes:
${freeTexts.length > 0 ? freeTexts.join("\n") : "None"}

Connections / Arrows:
${arrowConnections.length > 0 ? arrowConnections.join("\n") : "None"}

Other Drawings (Lines/Sketches):
- Number of freehand sketches/lines: ${lines.length}
`;
}

export const whiteboardEvalPrompt = (concept, elementsSummary, notes) => {
  return `You are evaluating a user's visual explanation (diagram/whiteboard sketch) of the concept: "${concept}".
They have drawn a diagram and accompanied it with a text explanation.

Here is the structured representation of what they drew on the whiteboard:
"""
${elementsSummary}
"""

Here is their accompanying written explanation / notes:
"""
${notes}
"""

Evaluate their explanation. Focus on:
1. Correctness: Are the drawn relationships and concepts correct?
2. Completeness: Did they include key components of the concept?
3. Clarity: Is the diagram logical, easy to follow, and not overly cluttered?
4. Visual Structure: Is there a good layout flow, proper hierarchy, and connections?

Return JSON: {"scores":{"correctness":<1-10>,"completeness":<1-10>,"clarity":<1-10>,"visualStructure":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence style observation>","strongPoint":"<specific strong visual or text explanation point>","flawToFix":"<single most impactful improvement to the diagram or explanation>"}`;
};

