"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  GraduationCap,
  ChatCircle,
  ChartBar,
} from "@phosphor-icons/react";

const STEPS = [
  {
    icon: GraduationCap,
    title: "Pick a practice mode",
    description:
      "Choose Teaching Mode to explain AI and engineering concepts, or Interview Mode to practice technical system design.",
  },
  {
    icon: ChatCircle,
    title: "Speak or type your answer",
    description:
      "Use your voice or keyboard. The coach evaluates clarity, analogies, vocabulary fit, and logical structure.",
  },
  {
    icon: ChartBar,
    title: "Get actionable feedback",
    description:
      "Receive a communication score, recurring patterns, and weekly practice drills to build long-term intuition.",
  },
];

const OnboardingOverlay = memo(function OnboardingOverlay({ onDismiss }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const Icon = STEPS[step].icon;

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    },
    [onDismiss]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <motion.div
        className="onboarding-card"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="onboarding-step-indicator" role="tablist" aria-label="Tour progress">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`onboarding-dot ${i === step ? "active" : i < step ? "done" : ""}`}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1} of ${STEPS.length}`}
              aria-current={i === step ? "step" : undefined}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="onboarding-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="onboarding-icon">
              <Icon size={28} weight="duotone" />
            </div>
            <h2 className="onboarding-title">{STEPS[step].title}</h2>
            <p className="onboarding-desc">{STEPS[step].description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="onboarding-actions">
          <button
            type="button"
            className="btn btn-ghost onboarding-skip"
            onClick={onDismiss}
            aria-label="Skip onboarding tour"
          >
            Skip tour
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => (isLast ? onDismiss() : setStep(step + 1))}
            aria-label={isLast ? "Finish tour and get started" : "Go to next step"}
          >
            {isLast ? "Get Started" : "Next"}
            {!isLast && <ArrowRight size={16} weight="bold" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
});

export { OnboardingOverlay };
