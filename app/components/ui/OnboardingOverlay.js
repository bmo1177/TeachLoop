"use client";

import { useState, memo } from "react";
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
    title: "Pick a mode",
    description:
      "Choose Teaching Mode to explain AI/ML concepts, or Interview Mode to practice system design answers.",
  },
  {
    icon: ChatCircle,
    title: "Speak or type your answer",
    description:
      "Use your voice or keyboard. The AI evaluates your clarity, analogies, vocabulary fit, and structure.",
  },
  {
    icon: ChartBar,
    title: "Get actionable feedback",
    description:
      "Receive a communication score, recurring patterns, and a weekly practice tip to improve over time.",
  },
];

const OnboardingOverlay = memo(function OnboardingOverlay({ onDismiss }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const Icon = STEPS[step].icon;

  return (
    <div className="onboarding-overlay" role="dialog" aria-label="Welcome tour">
      <motion.div
        className="onboarding-card"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="onboarding-step-indicator">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`onboarding-dot ${i === step ? "active" : i < step ? "done" : ""}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="onboarding-content"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div className="onboarding-icon">
              <Icon size={32} weight="duotone" />
            </div>
            <h2 className="onboarding-title">{STEPS[step].title}</h2>
            <p className="onboarding-desc">{STEPS[step].description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="onboarding-actions">
          <button
            className="btn btn-ghost onboarding-skip"
            onClick={onDismiss}
          >
            Skip tour
          </button>
          <button
            className="btn btn-primary"
            onClick={() => (isLast ? onDismiss() : setStep(step + 1))}
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
