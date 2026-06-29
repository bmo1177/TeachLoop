"use client";

import { useState, useRef, useEffect, useCallback, createContext, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSessionHistory } from "@/app/_hooks/useSessionHistory";
import {
  GraduationCap,
  ChatCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  PushPin,
  Check,
  Lightning,
  User,
  Briefcase,
  Laptop,
  ChartBar,
  Cpu,
  ChalkboardTeacher,
  Microphone,
  MicrophoneSlash,
  SpeakerSimpleHigh,
  SpeakerSimpleSlash,
  CaretLeft,
  CaretDown,
  CaretRight,
  House,
  Lightbulb,
} from "@phosphor-icons/react";

/* ─── DATA ─────────────────────────────────────────────────────────────────── */

const TEACH_CONCEPTS = [
  "Backpropagation",
  "The Attention Mechanism in Transformers",
  "Gradient Descent",
  "Overfitting vs Underfitting",
  "Convolutional Neural Networks",
  "Transfer Learning",
  "Tokenization in Large Language Models",
  "Retrieval-Augmented Generation (RAG)",
  "The Bias-Variance Tradeoff",
  "Reinforcement Learning from Human Feedback (RLHF)",
];

const SWE_QUESTIONS = [
  "Design a URL shortening service. Walk through the key architecture decisions.",
  "Explain the CAP theorem and give a real example of a system that trades each property.",
  "What is database indexing? When would you avoid using it?",
  "Compare microservices vs monolithic architecture. When would you choose each?",
  "How would you design a real-time notification system for 10 million users?",
  "Explain eventual consistency. Where is it acceptable and where is it dangerous?",
  "SQL vs NoSQL — how do you decide which to use for a new product?",
  "How would you design the backend for a live collaborative document editor?",
];

const AUDIENCES = [
  { id: "child", label: "A curious 10-year-old", hint: "No jargon. Use everyday analogies." },
  { id: "recruiter", label: "A non-technical recruiter", hint: "Focus on impact, not mechanisms." },
  { id: "junior", label: "A junior developer", hint: "Foundations first, then depth." },
  { id: "executive", label: "A C-suite executive", hint: "Business value over implementation." },
  { id: "engineer", label: "A senior AI engineer", hint: "Go deep. Skip the basics." },
];

const TEACH_HINTS = {
  "Backpropagation": [
    "Think about how information flows backward through a network — what's the goal of that backward pass?",
    "It's chain rule applied at scale. Explain how errors at the output layer propagate to earlier layers, and how each layer's weights get updated.",
    "Start with forward pass → compute loss → then for each layer, calculate the gradient of the loss w.r.t. weights using the chain rule. Mention learning rate, gradient vanishing, and how backprop is what makes deep learning feasible."
  ],
  "The Attention Mechanism in Transformers": [
    "Focus on the core idea of weighing how much each input word matters to every other word.",
    "Attention lets each token look at all other tokens and decide which ones are most relevant. Explain query, key, value vectors and the softmax weighting.",
    "In 'Attention Is All You Need', each token is projected into Q, K, V. Attention scores = softmax(QK^T/√d)V. This gives a context-aware representation. Multi-head attention runs this in parallel. It's why Transformers handle long-range dependencies so well."
  ],
  "Gradient Descent": [
    "Imagine standing on a hill in fog — how do you find the bottom step by step?",
    "You compute the gradient (slope) of the loss function and take steps in the opposite direction. The learning rate controls step size. Too big = overshoot, too small = slow.",
    "Gradient descent: initialize weights, compute loss, calculate ∂loss/∂weights, update: w = w − η·∇w. Variants: SGD (one sample per step), mini-batch (small subset), Adam (adaptive learning rates). Convergence depends on loss surface shape."
  ],
  "Overfitting vs Underfitting": [
    "Think about a student who memorizes answers vs one who barely studies — which problems does each face?",
    "Overfitting: model learns training noise, performs poorly on new data. Underfitting: model is too simple, can't capture patterns even in training data.",
    "Overfitting: high variance, low bias. Signs: training loss ≪ validation loss. Fixes: more data, regularization (L1/L2), dropout, simpler architecture. Underfitting: high bias, low variance. Signs: both losses high. Fixes: more complex model, better features, reduce regularization."
  ],
  "Convolutional Neural Networks": [
    "Think about how a sliding window scanning an image can detect patterns at different positions.",
    "CNNs use filters (kernels) that slide over the input detecting local patterns like edges, textures. Pooling layers downsample, and deeper layers combine low-level features into high-level ones.",
    "Conv layer: filter slides over input, computing dot products → feature map. Multiple filters learn different patterns. ReLU adds non-linearity. Pooling (max/avg) reduces spatial size. Stack: conv → ReLU → pool → conv → ReLU → pool → FC. Great for images because of translation invariance and parameter sharing."
  ],
  "Transfer Learning": [
    "Why start from scratch when someone else has already done most of the hard work?",
    "Take a model pre-trained on a large dataset (e.g., ImageNet) and fine-tune it on your specific smaller task. The pre-trained layers already know useful features.",
    "Transfer learning: freeze early layers (generic features like edges), retrain later layers (task-specific features). Saves data, compute, and time. Common in vision (ImageNet → medical imaging) and NLP (BERT → sentiment analysis). Alternatives: feature extraction vs full fine-tuning."
  ],
  "Tokenization in Large Language Models": [
    "How do you chop a sentence into pieces an AI can understand?",
    "Tokenization splits text into tokens (words, subwords, or characters). LLMs use subword tokenization (BPE, WordPiece) to handle any word while keeping common words as single tokens.",
    "Subword tokenization: common words stay whole (\"the\" → [\"the\"]), rare words are split into known pieces (\"tokenization\" → [\"token\", \"ization\"]). BPE merges most frequent character pairs iteratively. Token limit (e.g., 4096) constrains context length. Different tokenizers affect model behavior and language efficiency."
  ],
  "Retrieval-Augmented Generation (RAG)": [
    "What if the model could look up facts in a knowledge base before answering?",
    "RAG combines a retrieval system (search relevant documents) with a generative model (summarize/fill in). The model's answer is grounded in retrieved facts.",
    "Pipeline: user query → embed query → search vector DB for similar docs → prepend retrieved docs to prompt → LLM generates grounded answer. Benefits: reduces hallucinations, keeps knowledge up-to-date without retraining, cites sources. Key components: chunking strategy, embedding model, vector DB (Pinecone, Weaviate)."
  ],
  "The Bias-Variance Tradeoff": [
    "Can a model be too simple and too complex at the same time? Hint: it's about balancing two kinds of errors.",
    "Bias: error from wrong assumptions (underfitting). Variance: error from sensitivity to training data (overfitting). Total error = bias² + variance + irreducible error.",
    "High bias: model misses relevant patterns (e.g., linear model on quadratic data). High variance: model learns noise (e.g., deep tree on small data). Sweet spot: add complexity until validation error starts rising again. Controlled via regularization, model selection, and the amount of training data."
  ],
  "Reinforcement Learning from Human Feedback (RLHF)": [
    "How do you teach an AI to follow human preferences instead of just optimizing a fixed metric?",
    "RLHF uses human comparisons to train a reward model, then fine-tunes the LLM via reinforcement learning (PPO) to maximize that reward.",
    "Step 1: collect human preference data (which output is better?). Step 2: train a reward model to predict human preferences. Step 3: fine-tune LLM with PPO to maximize reward while staying close to original model (KL penalty). This is what makes ChatGPT helpful and harmless. Key challenge: reward hacking."
  ],
};

const SWE_HINTS = {
  "Design a URL shortening service. Walk through the key architecture decisions.": [
    "Start with the core operation: mapping a short string to a long URL. What data do you need to store and serve?",
    "Consider: hash function choice (base62, murmur), collision handling, redirection (301 vs 302), read/write ratio, and how to handle 10M+ URLs.",
    "Architecture: API (POST /shorten, GET/{shortCode}) → hash service (Base62 encode a unique ID or use a distributed ID generator) → DB (key-value store like Redis + Cassandra for persistence). Cache hot URLs in Redis. Use 301 redirects for permanent URLs, 302 for analytics tracking. Estimate storage: 10M URLs × ~500 bytes ≈ 5GB."
  ],
  "Explain the CAP theorem and give a real example of a system that trades each property.": [
    "CAP says you can only pick two out of three in a distributed system — what are the three properties?",
    "Consistency (every read gets the latest write), Availability (every request gets a response), Partition tolerance (system works despite network splits). Under a partition, you must choose C or A.",
    "CP example (sacrifices A): traditional databases during network split stop accepting writes until consistency restored. AP example (sacrifices C): DNS — always responds, but may serve stale data. CA example (sacrifices P, theoretical): single-node DB — no partitions possible. In practice, partitions are inevitable, so it's really CP vs AP."
  ],
  "What is database indexing? When would you avoid using it?": [
    "Think of a book's index vs reading every page to find a topic — what's the tradeoff?",
    "Indexes speed up reads (O(log n) lookup vs O(n) full scan) but slow down writes (must update index on INSERT/UPDATE/DELETE) and use extra storage.",
    "B-tree indexes are most common — good for range queries and point lookups. Hash indexes fast for exact match only. Avoid indexes on: small tables (full scan is fine), low-cardinality columns (boolean), columns rarely used in WHERE/JOIN/ORDER BY, write-heavy tables (index maintenance cost exceeds read benefit)."
  ],
  "Compare microservices vs monolithic architecture. When would you choose each?": [
    "Imagine one big codebase vs many small services — what problems does each solve or create?",
    "Monolith: simpler dev/debug/deploy, shared memory, but scales as a unit and tight coupling. Microservices: independent scaling/deploy, polyglot, but adds network overhead, distributed complexity, eventual consistency.",
    "Choose monolith for: early-stage products, small teams, simple domains, when speed to market > scale. Choose microservices for: large teams, complex domains needing independent deploy cycles, different scaling needs per component. Many successful companies start monolithic and split services when the monolith's boundaries become clear."
  ],
  "How would you design a real-time notification system for 10 million users?": [
    "Think about push vs pull, and what happens when 10M users get notified simultaneously.",
    "Core components: notification producer (service events) → message queue (Kafka/RabbitMQ) → delivery service (WebSocket for online, push notification for mobile, email/SMS fallback). Need batching, rate limiting, and deduplication.",
    "Design: Notification service API → Kafka topic per notification type → consumer groups process → user preference service checks opt-ins → delivery handler (WebSocket server for real-time, push for mobile via FCM/APNs, email queue for async). Use Redis for presence detection, connection pools for WebSockets. Rate limit per user (max 10/min). Store delivery status for retry. Estimate: 10M users × 10 notifications/day = 100M/day ≈ 1150/sec."
  ],
  "Explain eventual consistency. Where is it acceptable and where is it dangerous?": [
    "What does 'eventually' mean in a distributed system — and what happens during the window before consistency?",
    "Eventual consistency means given enough time with no updates, all replicas will converge to the same value. The window of inconsistency is the risk zone.",
    "Acceptable: social media feeds (seeing a like count slightly stale is fine), DNS (TTL-based propagation), content delivery networks. Dangerous: financial transactions (bank balance must be immediately consistent), inventory management (double-selling), medical records. Mitigations for eventual consistency: read-repair, hinted handoff, version vectors."
  ],
  "SQL vs NoSQL — how do you decide which to use for a new product?": [
    "Start with: how structured is your data, and do you need joins or flexible schemas?",
    "SQL (PostgreSQL, MySQL): structured schemas, ACID transactions, joins, strong consistency. NoSQL (MongoDB, Cassandra): flexible schemas, horizontal scaling, eventual consistency, specialized query patterns.",
    "Pick SQL when: data is relational (users ↔ orders), need transactions, complex queries/aggregations, data integrity is critical. Pick NoSQL when: schema evolves rapidly, need massive horizontal scale, simple key-value access patterns, high write throughput. Hybrid approach is common: SQL for core transactions + NoSQL for caching, analytics, or event logs."
  ],
  "How would you design the backend for a live collaborative document editor?": [
    "Multiple people editing the same document — how do you prevent one person's edits from overwriting another's?",
    "Core problems: conflict resolution, operational transformation (OT) or CRDTs, real-time sync via WebSockets, and persistence.",
    "Architecture: WebSocket server (socket.io or custom) manages document state in memory. Each edit is an operation (OT: insert 'a' at position 5). Server transforms concurrent operations so they apply in any order → same result. CRDTs (used by Figma, Google Docs) are a newer approach — each character has a unique ID, merges automatically. Store: Redis for active document state, DB for persistence/tombstone. Handle reconnection by replaying missed ops from an event log."
  ],
};

const audienceIcons = {
  child: User,
  recruiter: Briefcase,
  junior: Laptop,
  executive: ChartBar,
  engineer: Cpu,
};

function AudienceIcon({ id, size = 20, weight = "duotone" }) {
  const Icon = audienceIcons[id];
  return Icon ? <Icon size={size} weight={weight} /> : null;
}

const N = 5;
function pick(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

/* ─── API ───────────────────────────────────────────────────────────────────── */

async function callEval(prompt) {
  const res = await fetch("/api/eval", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

const evalPrompt = (mode, question, answer, audLabel) =>
  mode === "teach"
    ? `Evaluate explaining "${question}" to ${audLabel}.
Answer: """${answer}"""
Return JSON: {"scores":{"clarity":<1-10>,"analogies":<1-10>,"vocabularyFit":<1-10>,"confidence":<1-10>,"structure":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence>","strongPoint":"<specific thing>","flawToFix":"<single most impactful fix>"}`
    : `Evaluate answer to: "${question}"
Answer: """${answer}"""
Return JSON: {"scores":{"clarity":<1-10>,"depth":<1-10>,"structure":<1-10>,"confidence":<1-10>,"examples":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence>","strongPoint":"<specific thing>","flawToFix":"<single most impactful fix>"}`;

const reportPrompt = (evals) => {
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

/* ─── THEME ────────────────────────────────────────────────────────────────── */

const ThemeContext = createContext({ theme: "sunrise", switchTheme: () => {} });

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("sunrise");

  useEffect(() => {
    const saved = localStorage.getItem("teachloop-theme");
    if (saved && ["sunrise", "chalkboard", "blue-hour"].includes(saved)) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const switchTheme = (t) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("teachloop-theme", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useWheelColors() {
  const { theme } = useContext(ThemeContext);
  const [colors, setColors] = useState([
    { bg: "#C2410C", text: "#FFFFFF" },
    { bg: "#7C3AED", text: "#FFFFFF" },
    { bg: "#16A34A", text: "#FFFFFF" },
    { bg: "#B45309", text: "#FFFFFF" },
    { bg: "#6D28D9", text: "#FFFFFF" },
  ]);

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const get = (v) => style.getPropertyValue(v).trim();
    setColors([
      { bg: get("--wheel-1") || "#C2410C", text: "#FFFFFF" },
      { bg: get("--wheel-2") || "#7C3AED", text: "#FFFFFF" },
      { bg: get("--wheel-3") || "#16A34A", text: "#FFFFFF" },
      { bg: get("--wheel-4") || "#B45309", text: "#FFFFFF" },
      { bg: get("--wheel-5") || "#6D28D9", text: "#FFFFFF" },
    ]);
  }, [theme]);

  return colors;
}

const THEMES = [
  { id: "sunrise", label: "Sunrise Studio", dotClass: "theme-dot-sunrise" },
  { id: "chalkboard", label: "Chalkboard", dotClass: "theme-dot-chalkboard" },
  { id: "blue-hour", label: "Blue Hour", dotClass: "theme-dot-blue-hour" },
];

function ThemeSwitcher() {
  const { theme, switchTheme } = useContext(ThemeContext);

  return (
    <div className="theme-switcher" role="radiogroup" aria-label="Choose theme">
      <span className="theme-switcher-label">Theme</span>
      {THEMES.map((t) => (
        <button
          key={t.id}
          className={`theme-dot ${t.dotClass}`}
          role="radio"
          aria-checked={theme === t.id}
          aria-label={t.label}
          title={t.label}
          onClick={() => switchTheme(t.id)}
        />
      ))}
    </div>
  );
}

/* ─── HOOKS ─────────────────────────────────────────────────────────────────── */

function useVoice(onChange, answer) {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef(null);
  const ansRef = useRef(answer);
  const restartRef = useRef(false);
  ansRef.current = answer;

  const SR =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const supported = !!SR;

  const buildRec = () => {
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }
      if (finalText.trim()) {
        const cur = ansRef.current;
        const sep = cur && !cur.endsWith(" ") ? " " : "";
        onChange(cur + sep + finalText.trim() + " ");
        setInterim("");
      } else if (interimText) {
        setInterim(interimText);
      }
    };

    rec.onerror = (e) => {
      if (e.error === "aborted" || e.error === "no-speech") return;
      setRecording(false);
    };

    rec.onend = () => {
      if (restartRef.current) {
        try {
          rec.start();
        } catch {}
        return;
      }
      setRecording(false);
      setInterim("");
    };

    return rec;
  };

  const start = () => {
    if (!SR) return;
    restartRef.current = true;
    const rec = buildRec();
    try {
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {}
  };

  const stop = () => {
    restartRef.current = false;
    recRef.current?.stop();
    recRef.current = null;
    setRecording(false);
    setInterim("");
  };

  return {
    recording,
    supported,
    interim,
    toggle: () => (recording ? stop() : start()),
  };
}

/* ─── COMPONENTS ────────────────────────────────────────────────────────────── */

function ScoreRing({ score, size = 64, label, delay = 0 }) {
  const s = Math.min(Math.max(Number(score) || 0, 0), 10);
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const f = (s / 10) * c;
  const color =
    s >= 8 ? "var(--color-success)" : s >= 5 ? "var(--color-accent)" : "var(--color-error)";

  return (
    <div className="score-ring" style={{ animationDelay: `${delay}ms` }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={`${f} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dasharray 0.8s var(--ease-out-quart)",
          }}
        />
        <text
          x={size / 2}
          y={size / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--color-text-primary)"
          fontSize={s >= 10 ? 11 : 13}
          fontWeight="700"
          fontFamily="var(--font-family)"
        >
          {s}
        </text>
      </svg>
      {label && <span className="score-ring-label">{label}</span>}
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = (current / total) * 100;
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total} aria-label={`Question ${current} of ${total}`}>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="progress-bar-label">
        {current}/{total}
      </span>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="logo-icon">
      <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <rect className="logo-icon-shape" x="0" y="0" width="36" height="36" rx="10" />
        <path className="logo-icon-stroke" d="M6 14 C6 7 12 5 18 11 C24 5 30 7 30 14 C30 21 24 25 18 19 C12 25 6 21 6 14 Z" />
        <line className="logo-icon-spine" x1="18" y1="11" x2="18" y2="19" />
      </svg>
    </div>
  );
}

function Nav({ onHome, screen }) {
  const isHome = screen === "home";
  return (
    <nav className="nav">
      <button className={`logo ${!isHome ? "logo-home-visible" : ""}`} onClick={onHome} aria-label={isHome ? "TeachLoop" : "Go to home"}>
        <LogoMark />
        <span className="logo-text">TeachLoop</span>
        <span className="logo-home-hint">
          <House size={12} weight="fill" />
          Home
        </span>
      </button>
      <ThemeSwitcher />
    </nav>
  );
}

/* ─── SCREENS ───────────────────────────────────────────────────────────────── */

function Sparkline({ data, width = 80, height = 24 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline" aria-hidden="true">
      <polyline fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function HomeScreen({ onMode, pastSessions }) {
  return (
    <>
      <Nav onHome={() => {}} screen="home" />
      <main className="container">
        <section className="home-hero">
          <div className="home-hero-content">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="home-hero-eyebrow">
                AI-Powered Coaching
              </span>
            </motion.div>

            <motion.h1
              className="home-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Train how you{" "}
              <span className="home-title-accent">communicate,</span>
              <br />
              not just what you know.
            </motion.h1>

            <motion.p
              className="home-subtitle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              5 questions. Real AI feedback on your communication style.
              Build clarity, confidence, and the right vocabulary for any audience.
            </motion.p>

            <motion.div
              className="home-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <button className="btn btn-primary btn-lg" onClick={() => onMode("teach")}>
                Start Practicing
                <ArrowRight size={18} weight="bold" />
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => onMode("interview")}>
                Interview Mode
              </button>
            </motion.div>
          </div>

          <motion.div
            className="home-hero-visual"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-visual">
              <div className="hero-visual-orb hero-visual-orb-1" />
              <div className="hero-visual-orb hero-visual-orb-2" />
              <div className="hero-visual-orb hero-visual-orb-3" />
              <div className="hero-visual-center">
                <ChalkboardTeacher size={48} weight="duotone" />
              </div>
            </div>
          </motion.div>
        </section>

        <motion.section
          className="mode-section"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mode-section-header">
            <h2 className="mode-section-title">Choose your practice</h2>
            <p className="mode-section-subtitle">
              Two modes, both with AI-powered feedback on how you communicate.
            </p>
          </div>

          <div className="mode-cards">
            <button className="mode-card" onClick={() => onMode("teach")}>
              <div className="mode-card-icon">
                <GraduationCap size={24} weight="duotone" />
              </div>
              <div className="mode-card-content">
                <h3 className="mode-card-title">Teaching Mode</h3>
                <p className="mode-card-desc">
                  Explain an AI/ML concept to a chosen audience. Get rated on clarity, analogies, and vocabulary fit.
                </p>
              </div>
              <div className="mode-card-arrow">
                <ArrowRight size={18} weight="bold" />
              </div>
            </button>

            <button className="mode-card" onClick={() => onMode("interview")}>
              <div className="mode-card-icon" style={{ background: "var(--color-secondary-subtle)", color: "var(--color-secondary)" }}>
                <ChatCircle size={24} weight="duotone" />
              </div>
              <div className="mode-card-content">
                <h3 className="mode-card-title">Interview Mode</h3>
                <p className="mode-card-desc">
                  Answer system design and AI engineering questions. Evaluated like a real senior technical panel.
                </p>
              </div>
              <div className="mode-card-arrow">
                <ArrowRight size={18} weight="bold" />
              </div>
            </button>
          </div>
        </motion.section>

        <motion.section
          className="features-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="container-wide">
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon feature-icon-1">
                  <ChatCircle size={22} weight="duotone" />
                </div>
                <h3 className="feature-title">Audience-Aware Feedback</h3>
                <p className="feature-desc">
                  Practice explaining to a child, recruiter, or senior engineer. Feedback adapts to who you're talking to.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon feature-icon-2">
                  <ChartBar size={22} weight="duotone" />
                </div>
                <h3 className="feature-title">Communication Scoring</h3>
                <p className="feature-desc">
                  Clarity, analogies, vocabulary fit, confidence, structure. See exactly where you shine and where to improve.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon feature-icon-3">
                  <GraduationCap size={22} weight="duotone" />
                </div>
                <h3 className="feature-title">Style Reports</h3>
                <p className="feature-desc">
                  After each session, get a full communication style analysis with recurring patterns and weekly practice tips.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="past-sessions-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="container-wide">
            <div className="past-sessions-header">
              <h2 className="past-sessions-title">Your Past Sessions</h2>
              {pastSessions && pastSessions.length > 1 && (
                <Sparkline
                  data={pastSessions.map((s) => Number(s.overallScore)).reverse()}
                  width={120}
                  height={32}
                />
              )}
            </div>
            {pastSessions && pastSessions.length > 0 ? (
              <div className="past-sessions-list">
                {pastSessions.slice(0, 5).map((s) => {
                  const sc = Number(s.overallScore) || 0;
                  const color =
                    sc >= 8
                      ? "var(--color-success)"
                      : sc >= 5
                      ? "var(--color-accent)"
                      : "var(--color-error)";
                  const dateStr = new Date(s.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <div key={s.id} className="past-session-card">
                      <div className="past-session-left">
                        <span className="past-session-score" style={{ color }}>
                          {sc}/10
                        </span>
                        <div className="past-session-info">
                          <span className="past-session-mode">
                            {s.mode === "teach" ? "Teaching" : "Interview"}
                            {s.audience ? ` \u00B7 ${AUDIENCES.find((a) => a.id === s.audience)?.label || ""}` : ""}
                          </span>
                          <span className="past-session-date">{dateStr}</span>
                        </div>
                      </div>
                      <span className="past-session-verdict">
                        {sc >= 8 ? "Strong" : sc >= 5 ? "Solid" : "Growing"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="past-sessions-empty">
                <span className="past-sessions-empty-icon">
                  <GraduationCap size={24} weight="duotone" />
                </span>
                <p className="past-sessions-empty-text">No sessions yet. Complete your first practice to see it here.</p>
              </div>
            )}
          </div>
        </motion.section>

        <footer className="home-footer">
          <p className="home-footer-text">
            AI-powered communication coaching
          </p>
        </footer>
      </main>
    </>
  );
}

function AudienceScreen({ onSelect, onBack }) {
  return (
    <>
      <Nav onHome={onBack} screen="audience" />
      <main className="container screen-top">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <CaretLeft size={16} weight="bold" />
          <span>Back</span>
        </button>

        <motion.div
          className="audience-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="screen-title">Who are you explaining to?</h1>
          <p className="screen-subtitle">
            Your audience determines vocabulary, depth, and which analogies will land.
          </p>
        </motion.div>

        <div className="audience-list" role="radiogroup" aria-label="Select audience">
          {AUDIENCES.map((a, i) => (
            <motion.button
              key={a.id}
              className="audience-option"
              onClick={() => onSelect(a.id)}
              role="radio"
              aria-checked={false}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="audience-icon">
                <AudienceIcon id={a.id} />
              </span>
              <div className="audience-content">
                <span className="audience-label">{a.label}</span>
                <span className="audience-hint">{a.hint}</span>
              </div>
              <CaretRight size={16} weight="bold" className="audience-chevron" />
            </motion.button>
          ))}
        </div>
      </main>
    </>
  );
}

function RevealScreen({ mode, firstQ, revealed, onReveal, onStart }) {
  return (
    <>
      <Nav onHome={() => {}} screen="reveal" />
      <main className="container screen-center">
        <div style={{ width: "100%", maxWidth: "28rem" }}>
          <motion.div
            className="reveal-content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="reveal-icon">
              <Lightning size={36} weight="duotone" />
            </div>
            <h1 className="reveal-title">Your session is ready.</h1>
            <p className="reveal-subtitle">
              {mode === "teach"
                ? "5 concepts to explain. Feedback after each."
                : "5 interview questions. Feedback after each."}
              <br />
              Full communication style report at the end.
            </p>
          </motion.div>

          <motion.div
            className={`reveal-card ${revealed ? "revealed" : ""}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="reveal-card-label">
              {mode === "teach" ? "Concept to explain" : "Question 1 of 5"}
            </span>
            <div className="reveal-card-text">
              {firstQ || "Loading..."}
            </div>
            {!revealed && (
              <div className="reveal-card-overlay">
                <span>Tap to reveal</span>
              </div>
            )}
          </motion.div>

          {!revealed ? (
            <motion.button
              className="btn btn-primary btn-full btn-lg"
              onClick={onReveal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Reveal
            </motion.button>
          ) : (
            <motion.div
              className="reveal-actions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <button className="btn btn-primary btn-full btn-lg" onClick={onStart}>
                Begin Session
              </button>
              <p className="reveal-hint">Questions 2-5 reveal as you go</p>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}

function WheelScreen({ questions, mode, questionIdx, spinning, onSpin, onDone, screenName }) {
  const [rotation, setRotation] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState("idle");
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const currentRotationRef = useRef(0);
  const wheelColors = useWheelColors();

  useEffect(() => {
    setPhase("idle");
  }, [questionIdx]);

  const n = questions.length;
  const segAngle = 360 / n;
  const targetIdx = questionIdx;

  const spin = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("spinning");
    onSpin();

    const extraSpins = 3 + Math.floor(Math.random() * 3);
    const currentMod = currentRotationRef.current % 360;
    const targetOffset = (360 - targetIdx * segAngle - segAngle / 2);
    const totalDelta = extraSpins * 360 + ((targetOffset - currentMod + 360) % 360);
    const startRotation = currentRotationRef.current;
    const finalRotation = startRotation + totalDelta;
    const duration = 3000 + Math.random() * 500;
    startTimeRef.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = startRotation + totalDelta * eased;

      setRotation(current);
      const normalized = ((current % 360) + 360) % 360;
      const idx = Math.floor(((360 - normalized + segAngle / 2) % 360) / segAngle) % n;
      setActiveIdx(idx);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        currentRotationRef.current = finalRotation;
        setActiveIdx(targetIdx);
        setPhase("stopped");
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [phase, targetIdx, segAngle, n, onSpin]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (spinning && phase === "idle") {
      spin();
    }
  }, [spinning, phase, spin]);

  const activeQuestion = questions[activeIdx] || questions[0];

  const gradientStops = questions.map((_, i) => {
    const start = (i * segAngle);
    const end = ((i + 1) * segAngle);
    return `${wheelColors[i % wheelColors.length].bg} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <>
      <Nav onHome={() => {}} screen={screenName || "wheel"} />
      <main className="container screen-center">
        <div style={{ width: "100%", maxWidth: "28rem" }}>
          <motion.div
            className="wheel-header"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="wheel-title">
              {phase === "stopped"
                ? "Your question is ready!"
                : "Spinning the wheel..."}
            </h1>
            <p className="wheel-subtitle">
              {mode === "teach"
                ? `Question ${questionIdx + 1} of ${questions.length}`
                : `Interview question ${questionIdx + 1} of ${questions.length}`}
            </p>
          </motion.div>

          <motion.div
            className="wheel-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="wheel-pointer">
              <svg width="32" height="28" viewBox="0 0 32 28">
                <polygon points="16,28 0,0 32,0" fill="var(--color-text-primary)" />
              </svg>
            </div>
            <div
              className={`wheel-circle ${phase === "spinning" ? "wheel-spinning" : ""} ${phase === "stopped" ? "wheel-stopped" : ""}`}
            >
              <div
                className="wheel-inner"
                style={{
                  background: `conic-gradient(from 0deg, ${gradientStops})`,
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {questions.map((q, i) => {
                  const angle = i * segAngle + segAngle / 2;
                  const rad = (angle * Math.PI) / 180;
                  const labelR = 55;
                  const tx = Math.cos(rad) * labelR;
                  const ty = Math.sin(rad) * labelR;
                  const truncated = q.length > 40 ? q.slice(0, 38) + "..." : q;
                  return (
                    <div
                      key={i}
                      className={`wheel-label ${activeIdx === i && phase === "stopped" ? "wheel-label-active" : ""}`}
                      style={{
                        transform: `translate(${tx - 50}%, ${ty - 50}%) rotate(${angle + 90}deg)`,
                      }}
                    >
                      <span className="wheel-label-num">{i + 1}</span>
                      <span className="wheel-label-text">{truncated}</span>
                    </div>
                  );
                })}
              </div>
              <div className="wheel-center-dot" />
            </div>
            {phase === "spinning" && <div className="wheel-glow" />}
          </motion.div>

          {phase === "stopped" && (
            <motion.div
              className="wheel-result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="wheel-result-card">
                <span className="wheel-result-label">
                  {mode === "teach" ? "Concept to explain" : "Your question"}
                </span>
                <p className="wheel-result-text">{activeQuestion}</p>
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={onDone}>
                Begin Session
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}

function LoadingEval({ hasError, onRetry, onDismiss }) {
  return (
    <motion.div
      className="loading-eval"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="loading-eval-header">
        <div className="loading-eval-status">
          <div className="loading-eval-icon">
            <ChalkboardTeacher size={20} weight="duotone" />
          </div>
          <div className="loading-eval-status-text">
            <span className="loading-eval-status-label">Your Coach</span>
            <span className="loading-eval-status-message">
              {hasError ? "Something went wrong" : "Reviewing your answer"}
              {!hasError && (
                <>
                  <span className="loading-eval-status-dot" />
                  <span className="loading-eval-status-dot" />
                  <span className="loading-eval-status-dot" />
                </>
              )}
            </span>
          </div>
        </div>
        <div className="loading-eval-rings">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="loading-ring-skeleton">
              <div className="loading-ring-circle" />
              <div className="loading-ring-label-skeleton" />
            </div>
          ))}
        </div>
      </div>
      <div className="loading-eval-block" />
      <div className="loading-eval-feedback">
        <div className="loading-eval-line loading-eval-line-success" />
        <div className="loading-eval-line loading-eval-line-improve" />
      </div>
      {hasError ? (
        <div className="loading-eval-actions">
          <button className="btn btn-primary btn-full btn-lg" onClick={onRetry}>
            Try Again
          </button>
          <button className="btn btn-ghost btn-full" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      ) : (
        <div className="loading-eval-btn" />
      )}
    </motion.div>
  );
}

function SessionScreen({
  mode,
  q,
  qIdx,
  audience,
  answer,
  onChange,
  onSubmit,
  loading,
  evaluationError,
  onClearError,
  showEval,
  evaluation,
  onNext,
  isLast,
}) {
  const aud = useMemo(() => AUDIENCES.find((a) => a.id === audience), [audience]);
  const voice = useVoice(onChange, answer);
  const displayText =
    voice.recording && voice.interim
      ? answer + (answer && !answer.endsWith(" ") ? " " : "") + voice.interim
      : answer;
  const wc = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const canSubmit = wc >= 15 && !loading && !showEval && !voice.recording;
  const modeColor =
    mode === "teach" ? "var(--color-accent)" : "var(--color-secondary)";

  const [hintLevel, setHintLevel] = useState(0);
  const hintsForQuestion = useMemo(() => {
    const allHints = mode === "teach" ? TEACH_HINTS : SWE_HINTS;
    return allHints[q] || null;
  }, [mode, q]);

  const toggleHint = useCallback(() => {
    if (!hintsForQuestion) return;
    setHintLevel((prev) => (prev < 3 ? prev + 1 : prev));
  }, [hintsForQuestion]);

  useEffect(() => {
    setHintLevel(0);
  }, [q]);

  const scoreLabels = {
    clarity: "Clarity",
    analogies: "Analogies",
    vocabularyFit: "Vocab Fit",
    confidence: "Confidence",
    structure: "Structure",
    depth: "Depth",
    examples: "Examples",
  };

  return (
    <>
      <Nav onHome={() => {}} screen="session" />
      <main className="container screen-top">
        <ProgressBar current={qIdx + 1} total={N} />

        {mode === "teach" && aud && (
          <motion.div
            className="audience-badge"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AudienceIcon id={aud.id} size={14} />
            <span>To: {aud.label}</span>
          </motion.div>
        )}

        <motion.div
          className="question-card"
          key={q}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="question-label" style={{ color: modeColor }}>
            {mode === "teach" ? "Explain this concept" : "Interview question"}
          </span>
          <h2 className="question-text">{q}</h2>
        </motion.div>

        {hintsForQuestion && !showEval && !loading && (
          <motion.div
            className="hint-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <button
              className={`hint-button ${hintLevel > 0 ? "hint-active" : ""}`}
              onClick={toggleHint}
              disabled={hintLevel >= 3}
              aria-label={
                hintLevel === 0
                  ? "Get a hint"
                  : hintLevel < 3
                  ? "Get a stronger hint"
                  : "All hints revealed"
              }
            >
              <Lightbulb size={16} weight={hintLevel > 0 ? "fill" : "duotone"} />
              <span>
                {hintLevel === 0
                  ? "Get a Hint"
                  : hintLevel < 3
                  ? "Need a Stronger Hint?"
                  : "All Hints Revealed"}
              </span>
              <span className="hint-level-indicator">{hintLevel}/3</span>
            </button>

            <AnimatePresence>
              {hintLevel > 0 && (
                <motion.div
                  className="hint-content"
                  key={hintLevel}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="hint-content-level">Hint {hintLevel} of 3</div>
                  <p className="hint-content-text">
                    {hintsForQuestion[hintLevel - 1]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {loading && !showEval && (
          <LoadingEval
            hasError={!!evaluationError}
            onRetry={onSubmit}
            onDismiss={onClearError}
          />
        )}

        {!showEval && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="textarea-wrapper">
              <textarea
                value={voice.recording ? displayText : answer}
                onChange={(e) => onChange(e.target.value)}
                disabled={loading || voice.recording}
                placeholder={
                  mode === "teach"
                    ? `Explain to ${aud?.label || "your audience"}...`
                    : "Write your answer here..."
                }
                className="textarea"
                style={{
                  borderColor: voice.recording ? "var(--color-accent)" : undefined,
                  boxShadow: voice.recording ? "0 0 0 3px var(--color-accent-muted)" : undefined,
                }}
                aria-label="Your answer"
              />

              <button
                className="mic-button"
                onClick={voice.toggle}
                disabled={!voice.supported || loading}
                title={
                  !voice.supported
                    ? "Voice input not supported in this browser"
                    : voice.recording
                    ? "Stop recording"
                    : "Speak your answer"
                }
                aria-label={
                  voice.recording ? "Stop recording" : "Start voice input"
                }
                style={{
                  background: voice.recording ? "var(--color-accent)" : undefined,
                  color: voice.recording ? "white" : undefined,
                  animation: voice.recording ? "micPulse 1.5s ease-in-out infinite" : "none",
                }}
              >
                {voice.recording ? (
                  <MicrophoneSlash size={18} weight="bold" />
                ) : (
                  <Microphone size={18} weight="duotone" />
                )}
              </button>
              {!voice.supported && (
                <div className="voice-unsupported-hint" role="status">
                  Voice input not supported in your browser. Type your answer instead.
                </div>
              )}
            </div>

            {voice.recording && (
              <motion.div
                className="recording-indicator"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="recording-dot" />
                <span>
                  {voice.interim || "Listening — speak clearly..."}
                </span>
              </motion.div>
            )}

            <div className="textarea-meta">
              <span className={`word-count ${wc >= 15 ? "" : "warning"}`}>
                {wc} words{wc < 15 ? ` — ${15 - wc} more to unlock` : ""}
              </span>
              <span className="word-ideal">80-200 words ideal</span>
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={onSubmit}
              disabled={!canSubmit}
            >
              Submit Answer
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {showEval && evaluation && (
            <motion.div
              className="evaluation-card"
              key="evaluation"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="evaluation-header">
                <div className="evaluation-score">
                  <span className="evaluation-score-label">Communication Score</span>
                  <div className="evaluation-score-value">
                    {evaluation.overallScore}
                    <span className="evaluation-score-max">/10</span>
                  </div>
                </div>
                <div className="evaluation-rings">
                  {Object.entries(evaluation.scores)
                    .map(([k, v], i) => (
                      <ScoreRing
                        key={k}
                        score={v}
                        size={48}
                        label={scoreLabels[k] || k}
                        delay={i * 80}
                      />
                    ))}
                </div>
              </div>

              <blockquote className="evaluation-quote">
                &ldquo;{evaluation.styleObservation}&rdquo;
              </blockquote>

              <div className="evaluation-feedback">
                <div className="feedback-item feedback-success">
                  <span className="feedback-icon">
                    <Check size={16} weight="bold" color="var(--color-success)" />
                  </span>
                  <div>
                    <strong>Worked well:</strong> {evaluation.strongPoint}
                  </div>
                </div>
                <div className="feedback-item feedback-improve">
                  <span className="feedback-icon">
                    <ArrowRight size={16} weight="bold" color="var(--color-accent)" />
                  </span>
                  <div>
                    <strong>Fix this:</strong> {evaluation.flawToFix}
                  </div>
                </div>
              </div>

              <button className="btn btn-primary btn-full btn-lg" onClick={onNext}>
                {isLast ? "See Full Report" : `Next: Question ${qIdx + 2} of ${N}`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

function FeedbackScreen({ evals, report, onReset }) {
  const [open, setOpen] = useState(null);

  if (!report) {
    return (
      <>
        <Nav onHome={() => {}} screen="feedback" />
        <main className="container screen-center">
          <div className="loading-state">
            <div className="loading-icon">
              <ChalkboardTeacher size={48} weight="duotone" />
            </div>
            <p>Analyzing your communication style...</p>
          </div>
        </main>
      </>
    );
  }

  const sc = Number(report.overallScore) || 0;
  const rounded = Math.round(sc * 10) / 10;
  const verdict =
    sc >= 8
      ? "Strong communicator."
      : sc >= 6
      ? "Solid foundation."
      : "Room to grow.";

  return (
    <>
      <Nav onHome={onReset} screen="feedback" />
      <main className="container screen-top">
        <motion.header
          className="feedback-hero"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="feedback-eyebrow">Session Complete</span>
          <ScoreRing score={rounded} size={100} />
          <h1 className="feedback-verdict">
            {verdict} {rounded}/10
          </h1>
        </motion.header>

        <motion.section
          className="feedback-style"
          aria-labelledby="style-heading"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 id="style-heading" className="section-label">Your Communication Style</h2>
          <p className="style-description">{report.communicationStyle}</p>

          <div className="style-insights">
            <motion.div
              className="insight-card insight-strength"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <span className="insight-icon">
                <ArrowUp size={18} weight="bold" />
              </span>
              <div>
                <strong>Recurring Strength</strong>
                <p>{report.recurringStrength}</p>
              </div>
            </motion.div>

            <motion.div
              className="insight-card insight-flaw"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <span className="insight-icon">
                <ArrowDown size={18} weight="bold" />
              </span>
              <div>
                <strong>Recurring Flaw</strong>
                <p>{report.recurringFlaw}</p>
              </div>
            </motion.div>

            <motion.div
              className="insight-card insight-practice"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <span className="insight-icon">
                <PushPin size={18} weight="bold" />
              </span>
              <div>
                <strong>This Week&apos;s Practice</strong>
                <p>{report.weeklyPractice}</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="feedback-breakdown"
          aria-labelledby="breakdown-heading"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 id="breakdown-heading" className="section-label">Question Breakdown</h2>
          <div className="breakdown-list">
            {evals.map((e, i) => {
              const s = e.ev.overallScore;
              const color =
                s >= 8
                  ? "var(--color-success)"
                  : s >= 5
                  ? "var(--color-accent)"
                  : "var(--color-error)";
              const isOpen = open === i;

              return (
                <div
                  key={i}
                  className={`breakdown-item ${isOpen ? "open" : ""}`}
                >
                  <button
                    className="breakdown-toggle"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="breakdown-score" style={{ color }}>
                      {s}/10
                    </span>
                    <span className="breakdown-question">
                      {e.q.length > 50 ? e.q.slice(0, 50) + "..." : e.q}
                    </span>
                    <CaretDown
                      size={16}
                      weight="bold"
                      className={`breakdown-chevron ${isOpen ? "open" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        className="breakdown-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <blockquote className="breakdown-quote">
                          &ldquo;{e.ev.styleObservation}&rdquo;
                        </blockquote>
                        <div className="breakdown-feedback">
                          <span className="feedback-success">
                            <Check size={14} weight="bold" color="var(--color-success)" /> {e.ev.strongPoint}
                          </span>
                          <span className="feedback-improve">
                            <ArrowRight size={14} weight="bold" color="var(--color-accent)" /> {e.ev.flawToFix}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.section>

        <div className="feedback-actions">
          <button className="btn btn-primary btn-full btn-lg" onClick={onReset}>
            Try Again
          </button>
        </div>
      </main>
    </>
  );
}

/* ─── ROOT ──────────────────────────────────────────────────────────────────── */

function AppInner() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState(null);
  const [aud, setAud] = useState(null);
  const [qs, setQs] = useState([]);
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState("");
  const [evals, setEvals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEv, setShowEv] = useState(false);
  const [curEv, setCurEv] = useState(null);
  const [report, setReport] = useState(null);
  const [wheelSpin, setWheelSpin] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);
  const { sessions, addSession } = useSessionHistory();

  useEffect(() => {
    if (report && evals.length === N) {
      addSession({
        date: new Date().toISOString(),
        mode,
        audience: aud,
        overallScore: report.overallScore,
        evals: evals.map((e) => ({ q: e.q.slice(0, 80), score: e.ev.overallScore })),
      });
    }
  }, [report]);

  const gotoMode = (m) => {
    setMode(m);
    if (m === "teach") {
      setScreen("audience");
    } else {
      setQs(pick(SWE_QUESTIONS, N));
      setScreen("wheel");
      setWheelSpin(true);
    }
  };

  const gotoAud = (a) => {
    setAud(a);
    setQs(pick(TEACH_CONCEPTS, N));
    setScreen("wheel");
    setWheelSpin(true);
  };

  const startSession = () => {
    setIdx(0);
    setAns("");
    setEvals([]);
    setShowEv(false);
    setCurEv(null);
    setEvaluationError(null);
    setReport(null);
    setScreen("session");
  };

  const submit = async () => {
    if (!ans.trim() || loading) return;
    setLoading(true);
    setEvaluationError(null);
    const audLabel =
      mode === "teach"
        ? AUDIENCES.find((a) => a.id === aud)?.label
        : "a technical interviewer";
    try {
      const ev = await callEval(evalPrompt(mode, qs[idx], ans, audLabel));
      const newEvals = [...evals, { q: qs[idx], ev }];
      setEvals(newEvals);
      setCurEv(ev);
      setShowEv(true);
      if (idx === N - 1) {
        callEval(reportPrompt(newEvals))
          .then((r) => setReport(r))
          .catch(console.error);
      }
    } catch (err) {
      setEvaluationError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (idx < N - 1) {
      setIdx(idx + 1);
      setAns("");
      setShowEv(false);
      setCurEv(null);
      setEvaluationError(null);
      setWheelSpin(true);
      setScreen("wheel-session");
    } else {
      setScreen("feedback");
    }
  };

  const finishWheelTransition = () => {
    setScreen("session");
  };

  const reset = () => {
    setScreen("home");
    setMode(null);
    setAud(null);
    setQs([]);
    setIdx(0);
    setAns("");
    setEvals([]);
    setLoading(false);
    setShowEv(false);
    setCurEv(null);
    setEvaluationError(null);
    setReport(null);
    setWheelSpin(false);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div id="main-content">
        <AnimatePresence mode="wait">
          {screen === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <HomeScreen onMode={gotoMode} pastSessions={sessions.slice(0, 5)} />
            </motion.div>
          )}
          {screen === "audience" && (
            <motion.div key="audience" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <AudienceScreen onSelect={gotoAud} onBack={() => setScreen("home")} />
            </motion.div>
          )}
          {screen === "wheel" && (
            <motion.div key="wheel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <WheelScreen
                questions={qs}
                mode={mode}
                questionIdx={0}
                spinning={wheelSpin}
                onSpin={() => setWheelSpin(false)}
                onDone={startSession}
                screenName="wheel"
              />
            </motion.div>
          )}
          {screen === "wheel-session" && (
            <motion.div key="wheel-session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <WheelScreen
                questions={qs}
                mode={mode}
                questionIdx={idx}
                spinning={wheelSpin}
                onSpin={() => setWheelSpin(false)}
                onDone={finishWheelTransition}
                screenName="wheel-session"
              />
            </motion.div>
          )}
          {screen === "session" && (
            <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <SessionScreen
                mode={mode}
                q={qs[idx]}
                qIdx={idx}
                audience={aud}
                answer={ans}
                onChange={setAns}
                onSubmit={submit}
                loading={loading}
                evaluationError={evaluationError}
                showEval={showEv}
                evaluation={curEv}
                onNext={next}
                onClearError={() => setEvaluationError(null)}
                isLast={idx === N - 1}
              />
            </motion.div>
          )}
          {screen === "feedback" && (
            <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <FeedbackScreen evals={evals} report={report} onReset={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
