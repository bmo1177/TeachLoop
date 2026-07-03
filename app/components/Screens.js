"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  ChatCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  PushPin,
  Check,
  Lightning,
  ChalkboardTeacher,
  Microphone,
  MicrophoneSlash,
  SpeakerSimpleHigh,
  SpeakerSimpleSlash,
  CaretLeft,
  CaretDown,
  CaretRight,
  ChartBar,
  Lightbulb,
} from "@phosphor-icons/react";
import { AUDIENCES, AudienceIcon } from "@/app/data/audiences";
import { TEACH_HINTS, SWE_HINTS } from "@/app/data/hints";
import { QUESTIONS_PER_SESSION, callEval, evalPrompt, reportPrompt } from "@/app/lib/api";
import { ScoreRing, ProgressBar, Nav, Sparkline } from "./UIComponents";
import { useVoice } from "@/app/hooks/useVoice";
import { useTheme, useWheelColors } from "@/app/providers/ThemeProvider";

const N = QUESTIONS_PER_SESSION;

const scoreLabels = {
  clarity: "Clarity",
  analogies: "Use of Analogies",
  vocabularyFit: "Vocabulary Fit",
  confidence: "Confidence",
  structure: "Structure",
  depth: "Depth",
  examples: "Examples",
};

const HomeScreen = memo(function HomeScreen({ onMode, pastSessions }) {
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
                  Practice explaining to a child, recruiter, or senior engineer. Feedback adapts to who you&apos;re talking to.
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
});

const AudienceScreen = memo(function AudienceScreen({ onSelect, onBack }) {
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
});

const RevealScreen = memo(function RevealScreen({ mode, firstQ, revealed, onReveal, onStart }) {
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
});

const WheelScreen = memo(function WheelScreen({ questions, mode, questionIdx, spinning, onSpin, onDone, screenName }) {
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
});

const LoadingEval = memo(function LoadingEval({ hasError, onRetry, onDismiss }) {
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
});

const SessionScreen = memo(function SessionScreen({
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
                  role="region"
                  aria-live="polite"
                  aria-label={`Hint ${hintLevel} of 3`}
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
              role="region"
              aria-live="polite"
              aria-label="Evaluation results"
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
});

const FeedbackScreen = memo(function FeedbackScreen({ evals, report, reportError, onReset }) {
  const [open, setOpen] = useState(null);

  if (!report && !reportError) {
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

  if (reportError) {
    return (
      <>
        <Nav onHome={onReset} screen="feedback" />
        <main className="container screen-center">
          <div className="loading-state">
            <div className="loading-icon" style={{ color: "var(--color-error)" }}>
              <ChalkboardTeacher size={48} weight="duotone" />
            </div>
            <p style={{ color: "var(--color-error)", fontWeight: 500 }}>Report generation failed</p>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>{reportError}</p>
            <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-3)" }}>
              <button className="btn btn-primary" onClick={onReset}>Start New Session</button>
            </div>
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
});

export { HomeScreen, AudienceScreen, WheelScreen, LoadingEval, SessionScreen, FeedbackScreen };
