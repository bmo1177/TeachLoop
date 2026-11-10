"use client";

import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUp,
  ArrowDown,
  ArrowRight,
  PushPin,
  Check,
  CaretDown,
  ChalkboardTeacher,
  Copy,
} from "@phosphor-icons/react";
import { ScoreRing, Nav } from "@/app/components/ui";

const FeedbackScreen = memo(function FeedbackScreen({ evals, report, reportError, onReset, onRetryReport }) {
  const [open, setOpen] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = useCallback(() => {
    if (!report) return;
    const lines = [
      "# TeachLoop Practice Report",
      `Overall Score: ${Math.round((Number(report.overallScore) || 0) * 10) / 10}/10`,
      "",
      "## Communication Style",
      report.communicationStyle || "",
      "",
      "## Insights",
      `- Recurring Strength: ${report.recurringStrength || ""}`,
      `- Recurring Flaw: ${report.recurringFlaw || ""}`,
      `- This Week's Practice: ${report.weeklyPractice || ""}`,
      "",
      "## Question Breakdown",
      ...(evals || []).map((e, idx) => [
        `### Question ${idx + 1}: ${e.q}`,
        `Score: ${e.ev.overallScore}/10`,
        `Style observation: ${e.ev.styleObservation}`,
        `- Worked well: ${e.ev.strongPoint}`,
        `- Fix this: ${e.ev.flawToFix}`,
        "",
      ].join("\n")),
    ];

    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [report, evals]);

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
              {onRetryReport && (
                <button className="btn btn-secondary" onClick={onRetryReport}>Retry</button>
              )}
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
          <div className="feedback-score-center">
            <ScoreRing score={rounded} size={108} />
          </div>
          <h1 className="feedback-verdict">
            {verdict} <span className="tabular-nums">{rounded}/10</span>
          </h1>
          <p className="feedback-hero-subtitle">Overall Communication Quality</p>
          {report?.demo && (
            <div className="demo-badge-pill" role="status">
              Demo evaluation: set OPENROUTER_API_KEY to get AI scoring
            </div>
          )}
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
          <button
            type="button"
            className="btn btn-secondary btn-full btn-lg copy-report-btn"
            onClick={handleCopyMarkdown}
            aria-label="Copy report as markdown"
          >
            {copied ? (
              <>
                <Check size={18} weight="bold" color="var(--color-success)" />
                <span>Report copied to clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={18} weight="duotone" />
                <span>Copy report as markdown</span>
              </>
            )}
          </button>
          <button className="btn btn-primary btn-full btn-lg" onClick={onReset}>
            Try Again
          </button>
        </div>
      </main>
    </>
  );
});

export { FeedbackScreen };
