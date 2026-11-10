"use client";

import { memo } from "react";
import { motion } from "motion/react";
import {
  GraduationCap,
  ChatCircle,
  ArrowRight,
  ChalkboardTeacher,
  ChartBar,
  Trash,
  Sparkle,
  Target,
} from "@phosphor-icons/react";
import { AUDIENCES, AudienceIcon } from "@/app/data/audiences";
import { Nav, Sparkline, Footer, LoopMotif } from "@/app/components/ui";
import { OnboardingOverlay } from "@/app/components/ui/OnboardingOverlay";
import { useOnboarding } from "@/app/hooks/useOnboarding";

const SESSION_LENGTH_META = {
  3: "Quick",
  5: "Standard",
  7: "Deep",
};

const HomeScreen = memo(function HomeScreen({
  onMode,
  pastSessions,
  onDeleteSession,
  sessionLength,
  sessionLengthOptions,
  onSessionLengthChange,
}) {
  const onboarding = useOnboarding();
  return (
    <>
      {onboarding.show && <OnboardingOverlay onDismiss={onboarding.dismiss} />}
      <Nav onHome={() => {}} screen="home" />
      <main className="container">
        <section className="home-hero">
          <div className="home-hero-content">
            <motion.h1
              className="home-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Train how you{" "}
              <span className="home-title-accent">
                communicate,
                <svg
                  className="loop-underline"
                  viewBox="0 0 240 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M4 14C45 4 195 2 232 12C200 17 65 21 28 17C18 16 12 12 18 8C26 3 85 5 125 7"
                    stroke="var(--color-accent)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <br />
              not just what you know.
            </motion.h1>

            <motion.p
              className="home-subtitle"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Explain technical ideas to any audience. Instant AI coaching on clarity,
              analogies, vocabulary, and structure.
            </motion.p>

            <motion.div
              className="session-length-picker"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="session-length-label">Session length</span>
              <div
                className="session-length-options"
                role="radiogroup"
                aria-label="Questions per session"
              >
                {sessionLengthOptions.map((len) => (
                  <button
                    key={len}
                    className={`session-length-option ${sessionLength === len ? "active" : ""}`}
                    role="radio"
                    aria-checked={sessionLength === len}
                    onClick={() => onSessionLengthChange(len)}
                  >
                    <span className="session-length-option-count tabular-nums">{len}</span>
                    <span className="session-length-option-label">{SESSION_LENGTH_META[len]}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="home-actions"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                className="btn btn-primary btn-lg"
                onClick={() => onMode("teach", sessionLength)}
              >
                Start Practicing
                <ArrowRight size={18} weight="bold" />
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => onMode("interview", sessionLength)}
              >
                Interview Mode
              </button>
            </motion.div>
          </div>

          <motion.div
            className="home-hero-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-notebook-card" aria-hidden="true">
              <div className="hero-notebook-header">
                <span className="hero-notebook-tag">
                  <Target size={14} weight="bold" /> Live Coaching Card
                </span>
                <span className="hero-notebook-status">
                  <span className="hero-notebook-status-dot" /> Instant evaluation
                </span>
              </div>
              <div className="hero-notebook-body">
                <div className="hero-notebook-prompt">
                  <span className="hero-notebook-label">Target Concept</span>
                  <p className="hero-notebook-concept">The Bias-Variance Tradeoff</p>
                </div>
                <div className="hero-notebook-audience">
                  <span className="hero-notebook-label">Audience</span>
                  <span className="hero-notebook-audience-badge">A curious 10-year-old</span>
                </div>
                <div className="hero-notebook-metrics">
                  <div className="hero-metric-tile">
                    <span className="hero-metric-num tabular-nums">9.2</span>
                    <span className="hero-metric-name">Analogies</span>
                  </div>
                  <div className="hero-metric-tile">
                    <span className="hero-metric-num tabular-nums">8.8</span>
                    <span className="hero-metric-name">Clarity</span>
                  </div>
                  <div className="hero-metric-tile">
                    <span className="hero-metric-num tabular-nums">8.5</span>
                    <span className="hero-metric-name">Structure</span>
                  </div>
                </div>
                <p className="hero-notebook-quote">
                  &ldquo;The archery target analogy anchored the concept naturally before mathematical definitions.&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <motion.section
          className="mode-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mode-section-header">
            <h2 className="mode-section-title">Choose your practice</h2>
            <p className="mode-section-subtitle">
              Tailored modes with real-time feedback on your clarity, vocabulary, and flow.
            </p>
          </div>

          <div className="mode-cards">
            <button
              className="mode-card mode-card-featured"
              onClick={() => onMode("teach", sessionLength)}
            >
              <div className="mode-card-top">
                <div className="mode-card-icon">
                  <GraduationCap size={24} weight="duotone" />
                </div>
                <span className="mode-card-badge mode-badge-primary">Featured Rehearsal</span>
              </div>
              <div className="mode-card-content">
                <h3 className="mode-card-title">Teaching Mode</h3>
                <p className="mode-card-desc">
                  Explain AI and computer science concepts to 5 persona tiers, from a 10-year-old to a staff research scientist.
                </p>
                <div className="mode-card-meta">
                  <span>5 Audience Levels</span>
                  <span>&middot;</span>
                  <span>Analogy Rubric</span>
                </div>
              </div>
              <div className="mode-card-arrow">
                <ArrowRight size={18} weight="bold" />
              </div>
            </button>

            <button
              className="mode-card"
              onClick={() => onMode("interview", sessionLength)}
            >
              <div className="mode-card-top">
                <div
                  className="mode-card-icon"
                  style={{
                    background: "var(--color-secondary-subtle)",
                    color: "var(--color-secondary)",
                  }}
                >
                  <ChatCircle size={24} weight="duotone" />
                </div>
                <span className="mode-card-badge">System Design</span>
              </div>
              <div className="mode-card-content">
                <h3 className="mode-card-title">Interview Mode</h3>
                <p className="mode-card-desc">
                  Defend distributed systems and architectural tradeoffs under questions modeled after senior tech panels.
                </p>
                <div className="mode-card-meta">
                  <span>Tradeoff Analysis</span>
                  <span>&middot;</span>
                  <span>Scalability Criteria</span>
                </div>
              </div>
              <div className="mode-card-arrow">
                <ArrowRight size={18} weight="bold" />
              </div>
            </button>

            <button className="mode-card" onClick={() => onMode("whiteboard")}>
              <div className="mode-card-top">
                <div
                  className="mode-card-icon"
                  style={{
                    background: "rgba(194, 65, 12, 0.1)",
                    color: "var(--color-accent)",
                  }}
                >
                  <ChalkboardTeacher size={24} weight="duotone" />
                </div>
                <span className="mode-card-badge">Visual Canvas</span>
              </div>
              <div className="mode-card-content">
                <h3 className="mode-card-title">Sketch Mode</h3>
                <p className="mode-card-desc">
                  Draw and annotate architecture diagrams on an interactive canvas, scored on visual hierarchy and completeness.
                </p>
                <div className="mode-card-meta">
                  <span>Excalidraw Engine</span>
                  <span>&middot;</span>
                  <span>Starter Templates</span>
                </div>
              </div>
              <div className="mode-card-arrow">
                <ArrowRight size={18} weight="bold" />
              </div>
            </button>

            <button
              className="mode-card"
              onClick={() => onMode("custom", sessionLength)}
            >
              <div className="mode-card-top">
                <div
                  className="mode-card-icon"
                  style={{
                    background: "var(--color-success-subtle)",
                    color: "var(--color-success)",
                  }}
                >
                  <Sparkle size={24} weight="duotone" />
                </div>
                <span className="mode-card-badge">Custom Prompts</span>
              </div>
              <div className="mode-card-content">
                <h3 className="mode-card-title">Custom Practice</h3>
                <p className="mode-card-desc">
                  Input any subject or domain to generate custom prompt sequences and progressive hint scaffolds.
                </p>
                <div className="mode-card-meta">
                  <span>Dynamic Scaffolds</span>
                  <span>&middot;</span>
                  <span>Any Domain</span>
                </div>
              </div>
              <div className="mode-card-arrow">
                <ArrowRight size={18} weight="bold" />
              </div>
            </button>
          </div>
        </motion.section>

        <motion.section
          className="personas-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="personas-header">
            <span className="section-eyebrow">Audience Calibration</span>
            <h2 className="personas-title">Five audiences. Zero generic grading.</h2>
            <p className="personas-subtitle">
              TeachLoop shifts its rubric dynamically based on who is listening to you.
            </p>
          </div>

          <div className="personas-grid">
            {AUDIENCES.map((aud) => (
              <div
                key={aud.id}
                className="persona-card"
                onClick={() => onMode("teach", sessionLength)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onMode("teach", sessionLength);
                }}
              >
                <div className="persona-card-header">
                  <div className="persona-card-icon">
                    <AudienceIcon id={aud.id} size={20} />
                  </div>
                  <span className="persona-card-name">{aud.label}</span>
                </div>
                <blockquote className="persona-card-quote">
                  &ldquo;{aud.quote}&rdquo;
                </blockquote>
                <div className="persona-card-focus">
                  <span>{aud.focus}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="proof-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="proof-header">
            <span className="section-eyebrow">The Rubric</span>
            <h2 className="proof-title">How TeachLoop coaches your delivery</h2>
            <p className="proof-subtitle">
              Deliberate communication practice with calibrated constraints before stepping in front of panels or classrooms.
            </p>
          </div>
          <div className="proof-bento">
            <div className="proof-bento-card proof-card-featured">
              <div className="proof-bento-top">
                <span className="proof-bento-tag">5-Point Rubric</span>
                <span className="proof-bento-metric tabular-nums">1-10 Scale</span>
              </div>
              <h3 className="proof-bento-headline">Comprehensive delivery metrics</h3>
              <p className="proof-bento-desc">
                Every explanation is graded across 5 distinct axes to isolate exactly what needs tightening.
              </p>
              <div className="rubric-bars-preview">
                <div className="rubric-bar-item">
                  <div className="rubric-bar-header">
                    <span>Clarity & Framing</span>
                    <span className="tabular-nums">9.2</span>
                  </div>
                  <div className="rubric-bar-track"><div className="rubric-bar-fill" style={{ width: "92%" }} /></div>
                </div>
                <div className="rubric-bar-item">
                  <div className="rubric-bar-header">
                    <span>Use of Analogies</span>
                    <span className="tabular-nums">8.6</span>
                  </div>
                  <div className="rubric-bar-track"><div className="rubric-bar-fill" style={{ width: "86%" }} /></div>
                </div>
                <div className="rubric-bar-item">
                  <div className="rubric-bar-header">
                    <span>Vocabulary Fit</span>
                    <span className="tabular-nums">8.9</span>
                  </div>
                  <div className="rubric-bar-track"><div className="rubric-bar-fill" style={{ width: "89%" }} /></div>
                </div>
                <div className="rubric-bar-item">
                  <div className="rubric-bar-header">
                    <span>Confidence & Pace</span>
                    <span className="tabular-nums">8.4</span>
                  </div>
                  <div className="rubric-bar-track"><div className="rubric-bar-fill" style={{ width: "84%" }} /></div>
                </div>
                <div className="rubric-bar-item">
                  <div className="rubric-bar-header">
                    <span>Logical Progression</span>
                    <span className="tabular-nums">9.0</span>
                  </div>
                  <div className="rubric-bar-track"><div className="rubric-bar-fill" style={{ width: "90%" }} /></div>
                </div>
              </div>
            </div>

            <div className="proof-bento-stacked">
              <div className="proof-bento-card">
                <div className="proof-bento-icon">
                  <ChatCircle size={22} weight="duotone" />
                </div>
                <div className="proof-bento-content">
                  <span className="proof-bento-tag">Speech Intelligence</span>
                  <h3 className="proof-bento-headline">Automatic answer structuring</h3>
                  <p className="proof-bento-desc">
                    Dictate your answers naturally. TeachLoop strips filler stutters, preserves similes, cases tech acronyms, and formats enumerations into clean markdown.
                  </p>
                </div>
              </div>

              <div className="proof-bento-card">
                <div className="proof-bento-icon">
                  <ChartBar size={22} weight="duotone" />
                </div>
                <div className="proof-bento-content">
                  <span className="proof-bento-tag">Longitudinal Growth</span>
                  <h3 className="proof-bento-headline">Recurring patterns over time</h3>
                  <p className="proof-bento-desc">
                    Pinpoint repeated strengths, recurring blindspots, and targeted weekly habits in your personal rehearsal history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="past-sessions-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
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
                      <span className="past-session-score tabular-nums" style={{ color }}>
                        {sc}/10
                      </span>
                      <div className="past-session-info">
                        <span className="past-session-mode">
                          {s.mode === "teach"
                            ? "Teaching"
                            : s.mode === "custom"
                            ? "Custom"
                            : "Interview"}
                          {s.audience
                            ? ` \u00B7 ${AUDIENCES.find((a) => a.id === s.audience)?.label || ""}`
                            : ""}
                        </span>
                        <span className="past-session-date">{dateStr}</span>
                      </div>
                    </div>
                    <div className="past-session-right">
                      <span className="past-session-verdict">
                        {sc >= 8 ? "Strong" : sc >= 5 ? "Solid" : "Growing"}
                      </span>
                      {onDeleteSession && (
                        <button
                          className="past-session-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(s.id);
                          }}
                          aria-label={`Delete session from ${dateStr}`}
                          title="Delete session"
                        >
                          <Trash size={14} weight="bold" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="past-sessions-empty">
              <span className="past-sessions-empty-icon">
                <LoopMotif size={44} strokeWidth={2.4} />
              </span>
              <h3 className="past-sessions-empty-title">Your rehearsal notebook is empty</h3>
              <p className="past-sessions-empty-text">
                Complete a session above to record your communication score, vocabulary fit, and recurring strengths.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onMode("teach", sessionLength)}
              >
                Start First Practice
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          )}
        </motion.section>

        <Footer />
      </main>
    </>
  );
});

export { HomeScreen };
