"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { ChalkboardTeacher } from "@phosphor-icons/react";

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

export { LoadingEval };
