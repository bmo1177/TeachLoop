"use client";

import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";

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
  { id: "child",     label: "A curious 10-year-old",     hint: "No jargon. Use everyday analogies." },
  { id: "recruiter", label: "A non-technical recruiter", hint: "Focus on impact, not mechanisms." },
  { id: "junior",    label: "A junior developer",        hint: "Foundations first, then depth." },
  { id: "executive", label: "A C-suite executive",       hint: "Business value over implementation." },
  { id: "engineer",  label: "A senior AI engineer",      hint: "Go deep. Skip the basics." },
];

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

const SCORING_GUIDE = `
SCORING RUBRIC — grade generously, focusing on ideas and communication:
- 10: Exceptional — publishable quality, would impress any audience
- 8-9: Excellent — clear, well-structured, engaging, minor tweaks only
- 7: Good — solid answer that gets the point across well, some room to polish
- 5-6: Okay — understandable but rough edges, needs more clarity or depth
- 1-4: Weak — confusing, missing key points, or off-target
Most well-intentioned answers deserve 7-9. Spoken/transcribed answers lose points for rough edges that are artifacts of speech-to-text (missing punctuation, filler words, minor misrecognitions) — ignore those and grade the underlying ideas. Only award 1-4 for genuinely poor responses.`;

const evalPrompt = (mode, question, answer, audLabel) =>
  mode === "teach"
    ? `You are a warm, encouraging communication coach. Evaluate how this person explains "${question}" to ${audLabel}.
FOCUS ON COMMUNICATION STYLE — HOW they say it, not just whether it's technically correct.
Note: This answer may have been spoken and transcribed via voice-to-text. Ignore transcription artifacts (missing punctuation, filler words, minor misrecognitions) and grade the underlying ideas and communication quality.
Explanation: """${answer}"""
${SCORING_GUIDE}
Return ONLY valid JSON (no fences or preamble):
{"scores":{"clarity":<1-10>,"analogies":<1-10>,"vocabularyFit":<1-10>,"confidence":<1-10>,"structure":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence on their communication pattern>","strongPoint":"<specific thing that worked>","flawToFix":"<single most impactful fix>"}`
    : `You are a senior technical interviewer who is fair but encouraging. Evaluate this answer to: "${question}"
FOCUS ON COMMUNICATION QUALITY — clarity, structure, how confidently ideas are articulated.
Note: This answer may have been spoken and transcribed via voice-to-text. Ignore transcription artifacts (missing punctuation, filler words, minor misrecognitions) and grade the underlying ideas and communication quality.
Answer: """${answer}"""
${SCORING_GUIDE}
Return ONLY valid JSON (no fences or preamble):
{"scores":{"clarity":<1-10>,"depth":<1-10>,"structure":<1-10>,"confidence":<1-10>,"examples":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence on their communication pattern>","strongPoint":"<specific thing that worked>","flawToFix":"<single most impactful fix>"}`;

const reportPrompt = (evals) => {
  const summary = evals
    .map(
      (e, i) =>
        `Q${i + 1} ("${e.q.slice(0, 60)}"): ${e.ev.overallScore}/10 — ${e.ev.styleObservation}`
    )
    .join("\n");
  return `Analyze the communication style pattern across this 5-answer session. Be encouraging and constructive:
${summary}
SCORING RUBRIC: 10=exceptional, 8-9=excellent, 7=good, 5-6=okay, 1-4=weak. Most well-intentioned answers deserve 7-9. Answers may have been spoken and transcribed — ignore transcription artifacts and grade the underlying ideas.
Return ONLY valid JSON (no fences):
{"communicationStyle":"<2-3 sentence description of their overall communication style and personality>","recurringStrength":"<pattern that kept working across answers>","recurringFlaw":"<habit that kept holding them back — phrase it gently>","weeklyPractice":"<one specific actionable practice for this week>","overallScore":<average of the 5 scores as a decimal number>}`;
};

/* ─── ICONS ─────────────────────────────────────────────────────────────────── */

const Icon = ({ name, size = 20, color = "currentColor", ...props }) => {
  const icons = {
    refresh: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
    graduationCap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 6 3 12 0v-5" />
      </svg>
    ),
    messageCircle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
      </svg>
    ),
    user: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    briefcase: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    laptop: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
      </svg>
    ),
    barChart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" x2="12" y1="20" y2="10" />
        <line x1="18" x2="18" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="16" />
      </svg>
    ),
    cpu: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="16" height="16" x="4" y="4" rx="2" />
        <rect width="6" height="6" x="9" y="9" rx="1" />
        <path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" />
      </svg>
    ),
    dice: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="18" x="3" y="3" rx="3" />
        <circle cx="8" cy="8" r="1" fill={color} />
        <circle cx="16" cy="8" r="1" fill={color} />
        <circle cx="8" cy="16" r="1" fill={color} />
        <circle cx="16" cy="16" r="1" fill={color} />
        <circle cx="12" cy="12" r="1" fill={color} />
      </svg>
    ),
    arrowUp: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m18 15-6-6-6 6" />
      </svg>
    ),
    arrowDown: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    ),
    pin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" x2="12" y1="17" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    arrowRight: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
      </svg>
    ),
    chevronLeft: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m15 18-6-6 6-6" />
      </svg>
    ),
    chevronDown: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    ),
    chevronRight: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    ),

  };

  return icons[name] || null;
};

const AUDIENCE_ICONS = {
  child: "user",
  recruiter: "briefcase",
  junior: "laptop",
  executive: "barChart",
  engineer: "cpu",
};

const WHEEL_COLORS_DEFAULT = [
  { bg: "#D94A0D", text: "#FFFFFF" },
  { bg: "#7C3AED", text: "#FFFFFF" },
  { bg: "#16A34A", text: "#FFFFFF" },
  { bg: "#C2420B", text: "#FFFFFF" },
  { bg: "#6D28D9", text: "#FFFFFF" },
];

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
  const [colors, setColors] = useState(WHEEL_COLORS_DEFAULT);

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const get = (v) => style.getPropertyValue(v).trim();
    setColors([
      { bg: get("--wheel-1") || "#D94A0D", text: "#FFFFFF" },
      { bg: get("--wheel-2") || "#7C3AED", text: "#FFFFFF" },
      { bg: get("--wheel-3") || "#16A34A", text: "#FFFFFF" },
      { bg: get("--wheel-4") || "#C2420B", text: "#FFFFFF" },
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

function ModeCard({ icon, title, desc, color, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className="mode-card"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        "--card-color": color,
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `var(--shadow-md)` : "var(--shadow-xs)",
      }}
    >
      <div className="mode-card-icon" style={{ background: `color-mix(in oklch, ${color} 12%, transparent)` }}>
        <Icon name={icon} size={22} color={color} />
      </div>
      <div className="mode-card-content">
        <h3 className="mode-card-title">{title}</h3>
        <p className="mode-card-desc">{desc}</p>
      </div>
      <div className="mode-card-arrow" style={{ color }}>
        <Icon name="arrowRight" size={20} />
      </div>
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button className="back-button" onClick={onClick} aria-label="Go back">
      <Icon name="chevronLeft" size={18} />
      <span>Back</span>
    </button>
  );
}

/* ─── SCREENS ───────────────────────────────────────────────────────────────── */

function HomeScreen({ onMode }) {
  return (
    <div className="screen screen-center">
      <div className="container">
        <header className="home-header">
          <div className="logo">
            <div className="logo-icon">
              <Icon name="refresh" size={24} color="white" />
            </div>
            <span className="logo-text">TeachLoop</span>
          </div>

          <h1 className="home-title">
            Train how you communicate,
            <br />
            not just what you know.
          </h1>
          <p className="home-subtitle">
            5 questions. Real AI feedback on your communication style.
          </p>
        </header>

        <ThemeSwitcher />

        <div className="mode-cards">
          <ModeCard
            icon="graduationCap"
            title="Teaching Mode"
            desc="Explain an AI/ML concept to a chosen audience. Get rated on clarity, analogies, and vocabulary fit."
            color="var(--color-accent)"
            onClick={() => onMode("teach")}
          />
          <ModeCard
            icon="messageCircle"
            title="Interview Mode"
            desc="Answer system design and AI engineering questions. Evaluated like a real senior technical panel."
            color="var(--color-secondary)"
            onClick={() => onMode("interview")}
          />
        </div>

        <p className="home-footer">
          AI-powered communication coaching
        </p>
      </div>
    </div>
  );
}

function AudienceScreen({ onSelect, onBack }) {
  return (
    <div className="screen screen-top">
      <div className="container">
        <BackButton onClick={onBack} />

        <div className="audience-header">
          <h1 className="screen-title">Who are you explaining to?</h1>
          <p className="screen-subtitle">
            Your audience determines vocabulary, depth, and which analogies will land.
          </p>
        </div>

        <div className="audience-list" role="radiogroup" aria-label="Select audience">
          {AUDIENCES.map((a) => (
            <button
              key={a.id}
              className="audience-option"
              onClick={() => onSelect(a.id)}
              role="radio"
              aria-checked={false}
            >
              <span className="audience-icon">
                <Icon name={AUDIENCE_ICONS[a.id]} size={22} color="var(--color-text-secondary)" />
              </span>
              <div className="audience-content">
                <span className="audience-label">{a.label}</span>
                <span className="audience-hint">{a.hint}</span>
              </div>
              <Icon name="chevronRight" size={18} className="audience-chevron" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevealScreen({ mode, firstQ, revealed, onReveal, onStart }) {
  return (
    <div className="screen screen-center">
      <div className="container">
        <div className="reveal-content">
          <div className="reveal-icon">
            <Icon name="dice" size={48} color="var(--color-accent)" />
          </div>
          <h1 className="reveal-title">Your session is ready.</h1>
          <p className="reveal-subtitle">
            {mode === "teach"
              ? "5 concepts to explain. Feedback after each."
              : "5 interview questions. Feedback after each."}
            <br />
            Full communication style report at the end.
          </p>
        </div>

        <div className={`reveal-card ${revealed ? "revealed" : ""}`}>
          <span className="reveal-card-label">
            {mode === "teach" ? "Concept to explain" : "Question 1 of 5"}
          </span>
          <div className="reveal-card-text">
            {firstQ || "Loading…"}
          </div>
          {!revealed && (
            <div className="reveal-card-overlay">
              <span>Tap to reveal</span>
            </div>
          )}
        </div>

        {!revealed ? (
          <button className="btn btn-primary btn-lg" onClick={onReveal}>
            Reveal
          </button>
        ) : (
          <div className="reveal-actions">
            <button className="btn btn-primary btn-full" onClick={onStart}>
              Begin Session
            </button>
            <p className="reveal-hint">Questions 2–5 reveal as you go</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WheelScreen({ questions, mode, questionIdx, spinning, onSpin, onDone }) {
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
    <div className="screen screen-center">
      <div className="container">
        <div className="wheel-header">
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
        </div>

        <div className="wheel-container">
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
                const truncated = q.length > 40 ? q.slice(0, 38) + "…" : q;
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
        </div>

        {phase === "stopped" && (
          <div className="wheel-result">
            <div className="wheel-result-card">
              <span className="wheel-result-label">
                {mode === "teach" ? "Concept to explain" : "Your question"}
              </span>
              <p className="wheel-result-text">{activeQuestion}</p>
            </div>
            <button className="btn btn-primary btn-full" onClick={onDone}>
              Begin Session
            </button>
          </div>
        )}
      </div>
    </div>
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
  showEval,
  evaluation,
  onNext,
  isLast,
}) {
  const aud = AUDIENCES.find((a) => a.id === audience);
  const voice = useVoice(onChange, answer);
  const displayText =
    voice.recording && voice.interim
      ? answer + (answer && !answer.endsWith(" ") ? " " : "") + voice.interim
      : answer;
  const wc = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const canSubmit = wc >= 15 && !loading && !showEval && !voice.recording;
  const modeColor =
    mode === "teach" ? "var(--color-accent)" : "var(--color-secondary)";

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
    <div className="screen screen-top">
      <div className="container">
        <ProgressBar current={qIdx + 1} total={N} />

        {mode === "teach" && aud && (
          <div className="audience-badge">
            <Icon name={AUDIENCE_ICONS[aud.id]} size={16} color="var(--color-accent)" />
            <span>To: {aud.label}</span>
          </div>
        )}

        <div className="question-card" style={{ borderColor: `color-mix(in oklch, ${modeColor} 30%, transparent)` }}>
          <span className="question-label" style={{ color: modeColor }}>
            {mode === "teach" ? "Explain this concept" : "Interview question"}
          </span>
          <h2 className="question-text">{q}</h2>
        </div>

        {!showEval && (
          <>
            <div className="textarea-wrapper">
              <textarea
                value={voice.recording ? displayText : answer}
                onChange={(e) => onChange(e.target.value)}
                disabled={loading || voice.recording}
                placeholder={
                  mode === "teach"
                    ? `Explain to ${aud?.label || "your audience"}…`
                    : "Write your answer here…"
                }
                className="textarea"
                style={{
                  borderColor: voice.recording ? "var(--color-accent)" : undefined,
                  background: voice.recording ? "var(--color-accent-subtle)" : undefined,
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
                  animation: voice.recording ? "micPulse 1.5s ease-in-out infinite" : "none",
                  opacity: voice.supported ? 1 : 0.4,
                }}
              >
                {voice.recording ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
                    <rect x="3" y="3" width="10" height="10" rx="2" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>
            </div>

            {voice.recording && (
              <div className="recording-indicator">
                <span className="recording-dot" />
                <span>
                  {voice.interim || "Listening — speak clearly…"}
                </span>
              </div>
            )}

            <div className="textarea-meta">
              <span className={`word-count ${wc >= 15 ? "" : "warning"}`}>
                {wc} words{wc < 15 ? ` — ${15 - wc} more to unlock` : ""}
              </span>
              <span className="word-ideal">80–200 words ideal</span>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={onSubmit}
              disabled={!canSubmit}
              style={{ opacity: canSubmit ? 1 : 0.5 }}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Evaluating…
                </span>
              ) : (
                "Submit Answer"
              )}
            </button>
          </>
        )}

        {showEval && evaluation && (
          <div className="evaluation-card">
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
                  .slice(0, 4)
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
                  <Icon name="check" size={16} color="var(--color-success)" />
                </span>
                <div>
                  <strong>Worked well:</strong> {evaluation.strongPoint}
                </div>
              </div>
              <div className="feedback-item feedback-improve">
                <span className="feedback-icon">
                  <Icon name="arrowRight" size={16} color="var(--color-accent)" />
                </span>
                <div>
                  <strong>Fix this:</strong> {evaluation.flawToFix}
                </div>
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={onNext}>
              {isLast ? "See Full Report" : `Next: Question ${qIdx + 2} of ${N}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackScreen({ evals, report, onReset }) {
  const [open, setOpen] = useState(null);

  if (!report) {
    return (
      <div className="screen screen-center">
        <div className="loading-state">
          <div className="loading-icon">
            <Icon name="refresh" size={48} color="var(--color-accent)" />
          </div>
          <p>Analyzing your communication style…</p>
        </div>
      </div>
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
    <div className="screen screen-top">
      <div className="container">
        <header className="feedback-hero">
          <span className="feedback-eyebrow">Session Complete</span>
          <ScoreRing score={rounded} size={100} />
          <h1 className="feedback-verdict">
            {verdict} {rounded}/10
          </h1>
        </header>

        <section className="feedback-style" aria-labelledby="style-heading">
          <h2 id="style-heading" className="section-label">Your Communication Style</h2>
          <p className="style-description">{report.communicationStyle}</p>

          <div className="style-insights">
            <div className="insight-card insight-strength">
              <span className="insight-icon">
                <Icon name="arrowUp" size={20} color="var(--color-success)" />
              </span>
              <div>
                <strong>Recurring Strength</strong>
                <p>{report.recurringStrength}</p>
              </div>
            </div>
            <div className="insight-card insight-flaw">
              <span className="insight-icon">
                <Icon name="arrowDown" size={20} color="var(--color-accent)" />
              </span>
              <div>
                <strong>Recurring Flaw</strong>
                <p>{report.recurringFlaw}</p>
              </div>
            </div>
            <div className="insight-card insight-practice">
              <span className="insight-icon">
                <Icon name="pin" size={20} color="var(--color-accent)" />
              </span>
              <div>
                <strong>This Week&apos;s Practice</strong>
                <p>{report.weeklyPractice}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="feedback-breakdown" aria-labelledby="breakdown-heading">
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
                      {e.q.length > 50 ? e.q.slice(0, 50) + "…" : e.q}
                    </span>
                    <Icon
                      name="chevronDown"
                      size={16}
                      className={`breakdown-chevron ${isOpen ? "open" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="breakdown-content">
                      <blockquote className="breakdown-quote">
                        &ldquo;{e.ev.styleObservation}&rdquo;
                      </blockquote>
                      <div className="breakdown-feedback">
                        <span className="feedback-success">
                          <Icon name="check" size={14} color="var(--color-success)" /> {e.ev.strongPoint}
                        </span>
                        <span className="feedback-improve">
                          <Icon name="arrowRight" size={14} color="var(--color-accent)" /> {e.ev.flawToFix}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="feedback-actions">
          <button className="btn btn-primary btn-full" onClick={onReset}>
            Try Again
          </button>
        </div>
      </div>
    </div>
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
    setReport(null);
    setScreen("session");
  };

  const submit = async () => {
    if (!ans.trim() || loading) return;
    setLoading(true);
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
      console.error("Eval error:", err);
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
    setReport(null);
    setWheelSpin(false);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content">
        {screen === "home" && <HomeScreen onMode={gotoMode} />}
        {screen === "audience" && (
          <AudienceScreen onSelect={gotoAud} onBack={() => setScreen("home")} />
        )}
        {screen === "wheel" && (
          <WheelScreen
            questions={qs}
            mode={mode}
            questionIdx={0}
            spinning={wheelSpin}
            onSpin={() => setWheelSpin(false)}
            onDone={startSession}
          />
        )}
        {screen === "wheel-session" && (
          <WheelScreen
            questions={qs}
            mode={mode}
            questionIdx={idx}
            spinning={wheelSpin}
            onSpin={() => setWheelSpin(false)}
            onDone={finishWheelTransition}
          />
        )}
        {screen === "session" && (
          <SessionScreen
            mode={mode}
            q={qs[idx]}
            qIdx={idx}
            audience={aud}
            answer={ans}
            onChange={setAns}
            onSubmit={submit}
            loading={loading}
            showEval={showEv}
            evaluation={curEv}
            onNext={next}
            isLast={idx === N - 1}
          />
        )}
        {screen === "feedback" && (
          <FeedbackScreen evals={evals} report={report} onReset={reset} />
        )}
      </main>
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
