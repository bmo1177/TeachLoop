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
} from "@phosphor-icons/react";
import { AUDIENCES } from "@/app/data/audiences";
import { Nav, Sparkline } from "@/app/components/ui";
import { OnboardingOverlay } from "@/app/components/ui/OnboardingOverlay";
import { useOnboarding } from "@/app/hooks/useOnboarding";

const SESSION_LENGTH_META = {
  3: "Quick",
  5: "Standard",
  7: "Deep",
};

const HomeScreen = memo(function HomeScreen({ onMode, pastSessions, onDeleteSession, sessionLength, sessionLengthOptions, onSessionLengthChange }) {
  const onboarding = useOnboarding();
  return (
    <>
      {onboarding.show && <OnboardingOverlay onDismiss={onboarding.dismiss} />}
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
              {sessionLength} questions. Real AI feedback on your communication style.
              Build clarity, confidence, and the right vocabulary for any audience.
            </motion.p>

            <motion.div
              className="session-length-picker"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="session-length-label">Questions per session</span>
              <div className="session-length-options" role="radiogroup" aria-label="Questions per session">
                {sessionLengthOptions.map((len) => (
                  <button
                    key={len}
                    className={`session-length-option ${sessionLength === len ? "active" : ""}`}
                    role="radio"
                    aria-checked={sessionLength === len}
                    onClick={() => onSessionLengthChange(len)}
                  >
                    <span className="session-length-option-count">{len}</span>
                    <span className="session-length-option-label">{SESSION_LENGTH_META[len]}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="home-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <button className="btn btn-primary btn-lg" onClick={() => onMode("teach", sessionLength)}>
                Start Practicing
                <ArrowRight size={18} weight="bold" />
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => onMode("interview", sessionLength)}>
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
            <button className="mode-card" onClick={() => onMode("teach", sessionLength)}>
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

            <button className="mode-card" onClick={() => onMode("interview", sessionLength)}>
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

export { HomeScreen };
