"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ArrowRight,
  Microphone,
  MicrophoneSlash,
  Lightbulb,
} from "@phosphor-icons/react";
import { AUDIENCES, AudienceIcon } from "@/app/data/audiences";
import { TEACH_HINTS, SWE_HINTS } from "@/app/data/hints";
import { QUESTIONS_PER_SESSION } from "@/app/lib/api";
import { ScoreRing, ProgressBar, Nav } from "@/app/components/ui";
import { useVoice } from "@/app/hooks/useVoice";
import { LoadingEval } from "./LoadingEval";

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

export { SessionScreen };
