import { useState, useRef } from "react";

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
  { id: "child",     label: "A curious 10-year-old",     emoji: "🧒", hint: "No jargon. Use everyday analogies." },
  { id: "recruiter", label: "A non-technical recruiter", emoji: "💼", hint: "Focus on impact, not mechanisms." },
  { id: "junior",    label: "A junior developer",        emoji: "💻", hint: "Foundations first, then depth." },
  { id: "executive", label: "A C-suite executive",       emoji: "👔", hint: "Business value over implementation." },
  { id: "engineer",  label: "A senior AI engineer",      emoji: "🤖", hint: "Go deep. Skip the basics." },
];

const N = 5;
function pick(arr, n) { return [...arr].sort(() => Math.random() - 0.5).slice(0, n); }

/* ─── API ───────────────────────────────────────────────────────────────────── */

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const raw = data.content[0].text.replace(/```json|```/g, "").trim();
  return JSON.parse(raw);
}

const evalPrompt = (mode, question, answer, audLabel) => mode === "teach"
  ? `You are a communication coach. Evaluate how this person explains "${question}" to ${audLabel}.
FOCUS ON COMMUNICATION STYLE — HOW they say it, not just whether it's technically correct.
Explanation: """${answer}"""
Return ONLY valid JSON (no fences or preamble):
{"scores":{"clarity":<1-10>,"analogies":<1-10>,"vocabularyFit":<1-10>,"confidence":<1-10>,"structure":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence on their communication pattern>","strongPoint":"<specific thing that worked>","flawToFix":"<single most impactful fix>"}`
  : `You are a senior technical interviewer. Evaluate this answer to: "${question}"
FOCUS ON COMMUNICATION QUALITY — clarity, structure, how confidently ideas are articulated.
Answer: """${answer}"""
Return ONLY valid JSON (no fences or preamble):
{"scores":{"clarity":<1-10>,"depth":<1-10>,"structure":<1-10>,"confidence":<1-10>,"examples":<1-10>},"overallScore":<1-10>,"styleObservation":"<1 sentence on their communication pattern>","strongPoint":"<specific thing that worked>","flawToFix":"<single most impactful fix>"}`;

const reportPrompt = (evals) => {
  const summary = evals.map((e, i) =>
    `Q${i+1} ("${e.q.slice(0, 60)}"): ${e.ev.overallScore}/10 — ${e.ev.styleObservation}`
  ).join("\n");
  return `Analyze the communication style pattern across this 5-answer session:
${summary}
Return ONLY valid JSON (no fences):
{"communicationStyle":"<2-3 sentence description of their overall communication style and personality>","recurringStrength":"<pattern that kept working across answers>","recurringFlaw":"<habit that kept holding them back>","weeklyPractice":"<one specific actionable practice for this week>","overallScore":<average of the 5 scores as a decimal number>}`;
};

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────────── */

const T = {
  bg:         "#FFFAF7",
  primary:    "#E8420D",
  primaryBg:  "#FFF3EF",
  purple:     "#7C3AED",
  dark:       "#1C1917",
  mid:        "#78716C",
  muted:      "#A8A29E",
  border:     "#E7E5E4",
  track:      "#EDEBE6",
  card:       "#FFFFFF",
  green:      "#15803d",
  greenBg:    "#F0FDF4",
  linkedin:   "#0A66C2",
  font:       "'Inter', system-ui, -apple-system, sans-serif",
};

const S = {
  page: { minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.dark, display: "flex", flexDirection: "column", alignItems: "center" },
  center: { justifyContent: "center", padding: "40px 24px" },
  top: { padding: "32px 24px 72px" },
  wrap: { maxWidth: 520, width: "100%" },
  h1: { fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 10px", color: T.dark },
  sub: { color: T.mid, fontSize: 15, margin: "0 0 28px", lineHeight: 1.6 },
  label: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.3px", color: T.mid, marginBottom: 10, display: "block" },
  card: { background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: "22px" },
  btn: { background: T.primary, color: "#fff", border: "none", borderRadius: 14, padding: "15px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px", transition: "transform 0.15s, box-shadow 0.15s" },
  ghost: { background: T.card, color: T.dark, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "15px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer" },
};

/* ─── SCORE RING ────────────────────────────────────────────────────────────── */

function Ring({ score, size = 70, label }) {
  const s = Math.min(Math.max(Number(score) || 0, 0), 10);
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const f = (s / 10) * c;
  const col = s >= 8 ? T.green : s >= 5 ? T.primary : "#dc2626";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.track} strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={5}
          strokeDasharray={`${f} ${c}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
        <text x={size/2} y={size/2+5} textAnchor="middle" fill={T.dark} fontSize={s >= 10 ? 11 : 13} fontWeight={700}>{s}</text>
      </svg>
      {label && <span style={{ fontSize: 10, color: T.mid, textAlign: "center", maxWidth: size, lineHeight: 1.3 }}>{label}</span>}
    </div>
  );
}

/* ─── MODE CARD ─────────────────────────────────────────────────────────────── */

function ModeCard({ emoji, title, desc, color, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: T.card, border: `2px solid ${h ? color : T.border}`, borderRadius: 18, padding: "22px", textAlign: "left", cursor: "pointer", width: "100%", transition: "all 0.18s", transform: h ? "translateY(-2px)" : "none", boxShadow: h ? `0 8px 28px ${color}22` : `0 1px 4px rgba(0,0,0,0.04)` }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 48, height: 48, background: `${color}18`, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          {emoji}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: T.dark, marginBottom: 5 }}>{title}</div>
          <div style={{ color: T.mid, fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
        </div>
      </div>
      <div style={{ marginTop: 14, color: color, fontWeight: 600, fontSize: 14 }}>Start session →</div>
    </button>
  );
}

/* ─── HOME ──────────────────────────────────────────────────────────────────── */

function Home({ onMode }) {
  return (
    <div style={{ ...S.page, ...S.center }}>
      <div style={S.wrap}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <div style={{ width: 40, height: 40, background: T.primary, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 22, lineHeight: 1 }}>↺</span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>TeachLoop</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-1px", margin: "0 0 14px", color: T.dark }}>
            Train how you communicate,<br />not just what you know.
          </h1>
          <p style={{ color: T.mid, fontSize: 16, margin: 0 }}>
            5 questions. Real AI feedback on your communication style.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ModeCard emoji="🎓" title="Teaching Mode"
            desc="Explain an AI/ML concept to a chosen audience. Get rated on clarity, analogies, and vocabulary fit."
            color={T.primary} onClick={() => onMode("teach")} />
          <ModeCard emoji="💡" title="Interview Mode"
            desc="Answer system design and AI engineering questions. Evaluated like a real senior technical panel."
            color={T.purple} onClick={() => onMode("interview")} />
        </div>
        <p style={{ textAlign: "center", color: T.muted, fontSize: 12, marginTop: 28 }}>
          AI-powered communication coaching
        </p>
      </div>
    </div>
  );
}

/* ─── AUDIENCE ──────────────────────────────────────────────────────────────── */

function Audience({ onSelect, onBack }) {
  return (
    <div style={{ ...S.page, ...S.top }}>
      <div style={{ ...S.wrap, paddingTop: 8 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: T.mid, fontSize: 14, padding: "0 0 24px", display: "flex", alignItems: "center", gap: 6 }}>
          ← Back
        </button>
        <h1 style={S.h1}>Who are you explaining to?</h1>
        <p style={S.sub}>Your audience determines vocabulary, depth, and which analogies will land.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {AUDIENCES.map(a => (
            <button key={a.id} onClick={() => onSelect(a.id)}
              style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 13, padding: "15px 18px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, width: "100%", transition: "border-color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}>
              <span style={{ fontSize: 26 }}>{a.emoji}</span>
              <div>
                <div style={{ fontWeight: 600, color: T.dark, fontSize: 15 }}>{a.label}</div>
                <div style={{ color: T.mid, fontSize: 13, marginTop: 2 }}>{a.hint}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SURPRISE ──────────────────────────────────────────────────────────────── */

function Surprise({ mode, firstQ, revealed, onReveal, onStart }) {
  return (
    <div style={{ ...S.page, ...S.center }}>
      <div style={{ ...S.wrap, textAlign: "center" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 56, marginBottom: 18 }}>🎲</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 10px", color: T.dark }}>
            Your session is ready.
          </h1>
          <p style={{ color: T.mid, fontSize: 15, margin: 0, lineHeight: 1.6 }}>
            {mode === "teach" ? "5 concepts to explain. Feedback after each." : "5 interview questions. Feedback after each."}
            <br />Full communication style report at the end.
          </p>
        </div>

        {/* Blurred question card */}
        <div style={{ marginBottom: 24, position: "relative" }}>
          <div style={{ background: T.card, border: `2px solid ${revealed ? T.primary : T.border}`, borderRadius: 18, padding: "24px", textAlign: "left", filter: revealed ? "none" : "blur(7px)", transition: "filter 0.55s ease, border-color 0.4s ease", userSelect: revealed ? "auto" : "none" }}>
            <span style={{ ...S.label, color: T.primary }}>
              {mode === "teach" ? "Concept to explain" : "Question 1 of 5"}
            </span>
            <div style={{ fontSize: 19, fontWeight: 700, color: T.dark, lineHeight: 1.45 }}>
              {firstQ || "Loading…"}
            </div>
          </div>
          {!revealed && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: T.mid }}>
                Press to reveal
              </span>
            </div>
          )}
        </div>

        {!revealed ? (
          <button onClick={onReveal} style={{ ...S.btn, padding: "17px 56px", fontSize: 17, boxShadow: "0 8px 24px rgba(232,66,13,0.28)" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
            Reveal →
          </button>
        ) : (
          <div style={{ animation: "rise 0.45s ease both" }}>
            <button onClick={onStart} style={{ ...S.btn, width: "100%", fontSize: 16, boxShadow: "0 6px 20px rgba(232,66,13,0.28)" }}>
              Begin Session →
            </button>
            <p style={{ color: T.muted, fontSize: 12, marginTop: 12 }}>Questions 2–5 reveal as you go</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── VOICE HOOK ────────────────────────────────────────────────────────────── */

function useVoice(onChange, answer) {
  const [recording, setRecording] = useState(false);
  const recRef = useRef(null);
  const ansRef = useRef(answer);
  ansRef.current = answer; // always current, no stale closure

  const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const supported = !!SR;

  const start = () => {
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) text += e.results[i][0].transcript + " ";
      }
      if (text.trim()) {
        const cur = ansRef.current;
        onChange(cur + (cur && !cur.endsWith(" ") ? " " : "") + text);
      }
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    rec.start();
    recRef.current = rec;
    setRecording(true);
  };

  const stop = () => {
    recRef.current?.stop();
    recRef.current = null;
    setRecording(false);
  };

  return { recording, supported, toggle: () => recording ? stop() : start() };
}

/* ─── SESSION ───────────────────────────────────────────────────────────────── */

function Session({ mode, q, qIdx, audience, answer, onChange, onSubmit, loading, showEval, evaluation, onNext, isLast }) {
  const aud = AUDIENCES.find(a => a.id === audience);
  const voice = useVoice(onChange, answer);
  const wc = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const canSubmit = wc >= 15 && !loading && !showEval && !voice.recording;
  const modeColor = mode === "teach" ? T.primary : T.purple;

  const scoreLabels = { clarity: "Clarity", analogies: "Analogies", vocabularyFit: "Vocab Fit", confidence: "Confidence", structure: "Structure", depth: "Depth", examples: "Examples" };

  return (
    <div style={{ ...S.page, ...S.top }}>
      <div style={S.wrap}>
        {/* Progress */}
        <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 24 }}>
          {Array.from({ length: N }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, transition: "background 0.3s", background: i < qIdx ? T.primary : i === qIdx ? "#FF6B35" : T.track }} />
          ))}
          <span style={{ fontSize: 12, color: T.mid, fontWeight: 600, flexShrink: 0, marginLeft: 4 }}>{qIdx+1}/{N}</span>
        </div>

        {mode === "teach" && aud && (
          <div style={{ marginBottom: 14 }}>
            <span style={{ background: T.primaryBg, color: T.primary, borderRadius: 8, padding: "5px 12px", fontSize: 13, fontWeight: 600 }}>
              {aud.emoji} To: {aud.label}
            </span>
          </div>
        )}

        {/* Question */}
        <div style={{ ...S.card, marginBottom: 16, borderColor: `${modeColor}40` }}>
          <span style={{ ...S.label, color: modeColor }}>{mode === "teach" ? "🎓 Explain this concept" : "💡 Interview question"}</span>
          <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.45 }}>{q}</div>
        </div>

        {/* Text input */}
        {!showEval && (
          <>
            <div style={{ position: "relative" }}>
              <textarea value={answer} onChange={e => onChange(e.target.value)} disabled={loading || voice.recording}
                placeholder={mode === "teach" ? `Explain to ${aud?.label || "your audience"}…` : "Write your answer here…"}
                style={{ width: "100%", minHeight: 190, border: `1.5px solid ${voice.recording ? T.primary : T.border}`, borderRadius: 14, padding: "15px", paddingBottom: "54px", fontSize: 15, fontFamily: T.font, lineHeight: 1.75, color: T.dark, background: voice.recording ? "#FFFCFB" : T.card, resize: "vertical", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, background 0.2s" }}
                onFocus={e => { if (!voice.recording) e.target.style.borderColor = T.primary; }}
                onBlur={e => { if (!voice.recording) e.target.style.borderColor = T.border; }} />

              {/* Mic button */}
              <button
                onClick={voice.toggle}
                disabled={!voice.supported || loading}
                title={!voice.supported ? "Voice input not supported in this browser" : voice.recording ? "Stop recording" : "Speak your answer"}
                style={{ position: "absolute", bottom: 12, right: 12, width: 40, height: 40, borderRadius: "50%", background: voice.recording ? T.primary : "#F0EEE8", border: `2px solid ${voice.recording ? T.primary : T.border}`, cursor: (voice.supported && !loading) ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", animation: voice.recording ? "micpulse 1.5s ease-in-out infinite" : "none", opacity: voice.supported ? 1 : 0.35 }}>
                {voice.recording ? (
                  <svg width={13} height={13} viewBox="0 0 16 16" fill="white">
                    <rect x={3} y={3} width={10} height={10} rx={2} />
                  </svg>
                ) : (
                  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={T.mid} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1={12} y1={19} x2={12} y2={23}/>
                    <line x1={8} y1={23} x2={16} y2={23}/>
                  </svg>
                )}
              </button>
            </div>

            {/* Recording indicator */}
            {voice.recording && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 0", padding: "9px 14px", background: T.primaryBg, borderRadius: 10, animation: "rise 0.2s ease" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.primary, flexShrink: 0, animation: "blink 1s ease-in-out infinite" }} />
                <span style={{ fontSize: 13, color: T.primary, fontWeight: 600 }}>Recording — speak clearly, tap ■ to stop</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0 16px" }}>
              <span style={{ fontSize: 12, color: wc >= 15 ? T.mid : T.primary }}>{wc} words{wc < 15 ? ` — ${15 - wc} more to unlock` : ""}</span>
              <span style={{ fontSize: 12, color: T.mid }}>80–200 words ideal</span>
            </div>
            <button onClick={onSubmit} disabled={!canSubmit}
              style={{ ...S.btn, width: "100%", opacity: canSubmit ? 1 : 0.42, cursor: canSubmit ? "pointer" : "not-allowed", boxShadow: canSubmit ? "0 6px 20px rgba(232,66,13,0.28)" : "none" }}>
              {loading ? "Evaluating your communication…" : "Submit Answer →"}
            </button>
          </>
        )}

        {/* Evaluation */}
        {showEval && evaluation && (
          <div style={{ animation: "rise 0.4s ease both" }}>
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
                <div>
                  <span style={S.label}>Communication Score</span>
                  <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: T.dark }}>
                    {evaluation.overallScore}
                    <span style={{ fontSize: 16, color: T.mid, fontWeight: 500 }}>/10</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {Object.entries(evaluation.scores).slice(0, 4).map(([k, v]) => (
                    <Ring key={k} score={v} size={52} label={scoreLabels[k] || k} />
                  ))}
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${T.track}`, paddingTop: 14, marginBottom: 14 }}>
                <p style={{ color: T.mid, fontSize: 13, fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>
                  "{evaluation.styleObservation}"
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={{ background: T.greenBg, borderRadius: 10, padding: "12px 14px" }}>
                  <span style={{ fontWeight: 700, color: T.green, fontSize: 13 }}>✓ Worked well: </span>
                  <span style={{ color: T.dark, fontSize: 13 }}>{evaluation.strongPoint}</span>
                </div>
                <div style={{ background: T.primaryBg, borderRadius: 10, padding: "12px 14px" }}>
                  <span style={{ fontWeight: 700, color: T.primary, fontSize: 13 }}>✗ Fix this: </span>
                  <span style={{ color: T.dark, fontSize: 13 }}>{evaluation.flawToFix}</span>
                </div>
              </div>
            </div>
            <button onClick={onNext} style={{ ...S.btn, width: "100%", fontSize: 16, boxShadow: "0 6px 20px rgba(232,66,13,0.28)" }}>
              {isLast ? "See Full Report →" : `Next: Question ${qIdx + 2} of ${N} →`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── FEEDBACK ──────────────────────────────────────────────────────────────── */

function Feedback({ evals, report, onReset }) {
  const [open, setOpen] = useState(null);

  if (!report) {
    return (
      <div style={{ ...S.page, ...S.center }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 18, display: "inline-block", animation: "spin 1.2s linear infinite", color: T.primary }}>↺</div>
          <div style={{ color: T.mid, fontSize: 16 }}>Analyzing your communication style…</div>
        </div>
      </div>
    );
  }

  const sc = Number(report.overallScore) || 0;
  const rounded = Math.round(sc * 10) / 10;
  const verdict = sc >= 8 ? "Strong communicator." : sc >= 6 ? "Solid foundation." : "Room to grow.";

  return (
    <div style={{ ...S.page, ...S.top }}>
      <div style={S.wrap}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.primary, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 16 }}>
            Session Complete
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Ring score={rounded} size={110} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", margin: 0, color: T.dark }}>
            {verdict} {rounded}/10
          </h1>
        </div>

        {/* Style analysis */}
        <div style={{ ...S.card, marginBottom: 14 }}>
          <span style={S.label}>Your Communication Style</span>
          <p style={{ color: T.dark, fontSize: 15, lineHeight: 1.75, margin: "0 0 20px" }}>{report.communicationStyle}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: T.greenBg, borderRadius: 11, padding: "14px 16px" }}>
              <div style={{ fontWeight: 700, color: T.green, fontSize: 13, marginBottom: 4 }}>↑ Recurring Strength</div>
              <div style={{ color: T.dark, fontSize: 14 }}>{report.recurringStrength}</div>
            </div>
            <div style={{ background: T.primaryBg, borderRadius: 11, padding: "14px 16px" }}>
              <div style={{ fontWeight: 700, color: T.primary, fontSize: 13, marginBottom: 4 }}>↓ Recurring Flaw</div>
              <div style={{ color: T.dark, fontSize: 14 }}>{report.recurringFlaw}</div>
            </div>
            <div style={{ background: "#FFFBF5", border: `1.5px dashed ${T.primary}`, borderRadius: 11, padding: "14px 16px" }}>
              <div style={{ fontWeight: 700, color: T.dark, fontSize: 13, marginBottom: 4 }}>📌 This Week's Practice</div>
              <div style={{ color: T.dark, fontSize: 14 }}>{report.weeklyPractice}</div>
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div style={{ marginBottom: 20 }}>
          <span style={S.label}>Question Breakdown</span>
          {evals.map((e, i) => {
            const s = e.ev.overallScore;
            const c = s >= 8 ? T.green : s >= 5 ? T.primary : "#dc2626";
            const isOpen = open === i;
            return (
              <div key={i} style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
                <button onClick={() => setOpen(isOpen ? null : i)}
                  style={{ width: "100%", background: "none", border: "none", padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 800, color: c, fontSize: 14, minWidth: 34 }}>{s}/10</span>
                    <span style={{ color: T.dark, fontSize: 13, fontWeight: 500 }}>{e.q.length > 54 ? e.q.slice(0, 54) + "…" : e.q}</span>
                  </div>
                  <span style={{ color: T.muted, fontSize: 11, flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 16px 14px", borderTop: `1px solid ${T.track}`, animation: "rise 0.2s ease" }}>
                    <p style={{ color: T.mid, fontSize: 13, fontStyle: "italic", margin: "12px 0 8px", lineHeight: 1.6 }}>
                      "{e.ev.styleObservation}"
                    </p>
                    <div style={{ fontSize: 13, color: T.green, marginBottom: 5 }}>✓ {e.ev.strongPoint}</div>
                    <div style={{ fontSize: 13, color: T.primary }}>✗ {e.ev.flawToFix}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onReset} style={{ ...S.ghost, flex: 1, textAlign: "center" }}>Try Again</button>
          <button
            onClick={() => {
              const txt = `🎓 TeachLoop — Communication Report\n\nScore: ${rounded}/10\n\n${report.communicationStyle}\n\nThis week's focus: ${report.weeklyPractice}\n\n#BuildInPublic #AI #TechnicalCommunication`;
              navigator.clipboard.writeText(txt).then(() => alert("Copied to clipboard — paste on LinkedIn!")).catch(() => alert(txt));
            }}
            style={{ flex: 1, background: T.linkedin, color: "#fff", border: "none", borderRadius: 14, padding: "15px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Share on LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── ROOT ──────────────────────────────────────────────────────────────────── */

export default function App() {
  const [screen,  setScreen]  = useState("home");
  const [mode,    setMode]    = useState(null);
  const [aud,     setAud]     = useState(null);
  const [qs,      setQs]      = useState([]);
  const [idx,     setIdx]     = useState(0);
  const [ans,     setAns]     = useState("");
  const [rev,     setRev]     = useState(false);
  const [evals,   setEvals]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEv,  setShowEv]  = useState(false);
  const [curEv,   setCurEv]   = useState(null);
  const [report,  setReport]  = useState(null);

  const gotoMode = (m) => {
    setMode(m); setRev(false);
    if (m === "teach") { setScreen("audience"); }
    else { setQs(pick(SWE_QUESTIONS, N)); setScreen("surprise"); }
  };

  const gotoAud = (a) => {
    setAud(a); setRev(false);
    setQs(pick(TEACH_CONCEPTS, N));
    setScreen("surprise");
  };

  const startSession = () => {
    setIdx(0); setAns(""); setEvals([]); setShowEv(false); setCurEv(null); setReport(null);
    setScreen("session");
  };

  const submit = async () => {
    if (!ans.trim() || loading) return;
    setLoading(true);
    const audLabel = mode === "teach" ? AUDIENCES.find(a => a.id === aud)?.label : "a technical interviewer";
    try {
      const ev = await callClaude(evalPrompt(mode, qs[idx], ans, audLabel));
      const newEvals = [...evals, { q: qs[idx], ev }];
      setEvals(newEvals);
      setCurEv(ev);
      setShowEv(true);
      if (idx === N - 1) {
        callClaude(reportPrompt(newEvals)).then(r => setReport(r)).catch(console.error);
      }
    } catch (err) {
      console.error("Eval error:", err);
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (idx < N - 1) { setIdx(idx + 1); setAns(""); setShowEv(false); setCurEv(null); }
    else { setScreen("feedback"); }
  };

  const reset = () => {
    setScreen("home"); setMode(null); setAud(null); setQs([]); setIdx(0);
    setAns(""); setRev(false); setEvals([]); setLoading(false);
    setShowEv(false); setCurEv(null); setReport(null);
  };

  return (
    <>
      <style>{`
        @keyframes rise { from { opacity:0; transform:translateY(13px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes micpulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(232,66,13,0.45); } 50% { box-shadow: 0 0 0 9px rgba(232,66,13,0); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      {screen === "home"      && <Home onMode={gotoMode} />}
      {screen === "audience"  && <Audience onSelect={gotoAud} onBack={() => setScreen("home")} />}
      {screen === "surprise"  && <Surprise mode={mode} firstQ={qs[0]} revealed={rev} onReveal={() => setRev(true)} onStart={startSession} />}
      {screen === "session"   && <Session mode={mode} q={qs[idx]} qIdx={idx} audience={aud} answer={ans} onChange={setAns} onSubmit={submit} loading={loading} showEval={showEv} evaluation={curEv} onNext={next} isLast={idx === N - 1} />}
      {screen === "feedback"  && <Feedback evals={evals} report={report} onReset={reset} />}
    </>
  );
}
