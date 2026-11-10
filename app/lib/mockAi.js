export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateDeterministicMock(prompt) {
  if (!prompt || typeof prompt !== "string") {
    return {
      scores: { clarity: 7, depth: 7, structure: 7, confidence: 7, examples: 7 },
      overallScore: 7,
      styleObservation: "Clear communication with structured progression.",
      strongPoint: "Good organization and foundational definitions.",
      flawToFix: "Provide more concrete real-world context.",
      demo: true,
    };
  }

  // 1. Question generation
  if (
    prompt.includes("practice questions") ||
    (prompt.includes("Return JSON:") && prompt.includes('"questions":'))
  ) {
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
    const scores = [...prompt.matchAll(/Q\d+:\s*(\d+(\.\d+)?)\/10/g)].map((m) =>
      Number(m[1])
    );
    const avg =
      scores.length > 0
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
  if (
    prompt.includes("visual explanation") ||
    prompt.includes("whiteboard sketch") ||
    prompt.includes("WHITEBOARD CANVAS")
  ) {
    const conceptMatch =
      prompt.match(/concept:\s*"([^"]+)"/i) || prompt.match(/CONCEPT:\s*"([^"]+)"/);
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
      strongPoint:
        "Clear directionality of components and clean separation of architectural layers.",
      flawToFix:
        "Add annotations or labels along connector arrows to specify data flow protocols.",
      demo: true,
    };
  }

  // 4. Teach mode explanation
  if (
    prompt.includes("Evaluate explaining") ||
    prompt.includes('"analogies":<1-10>')
  ) {
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
    const overall =
      Math.round(
        ((clarity + analogies + vocabularyFit + confidence + structure) / 5) * 10
      ) / 10;

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
      flawToFix:
        "Introduce a more memorable real-world analogy early on to anchor understanding before technical terms.",
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
  const overall =
    Math.round(((clarity + depth + structure + confidence + examples) / 5) * 10) /
    10;

  return {
    scores: {
      clarity,
      depth,
      structure,
      confidence,
      examples,
    },
    overallScore: overall,
    styleObservation:
      "Structured, engineering-centric answer following a logical top-down approach.",
    strongPoint: `Demonstrates clear understanding of system boundaries and trade-offs for "${question}".`,
    flawToFix:
      "Explicitly state capacity and traffic estimations upfront to justify your architectural choices.",
    demo: true,
  };
}
