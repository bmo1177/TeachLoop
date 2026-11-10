"use client";

import { memo } from "react";

/**
 * Reusable hand-drawn Möbius coaching loop motif.
 * Symbolizes the continuous cycle of explaining, evaluating, and refining.
 */
const LoopMotif = memo(function LoopMotif({
  size = 48,
  strokeWidth = 2.5,
  color = "var(--color-accent)",
  className = "",
}) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.65)}
      viewBox="0 0 80 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`loop-motif ${className}`}
      aria-hidden="true"
    >
      {/* Outer infinity loop path with hand-drawn organic curvature */}
      <path
        d="M26 14C16 14 8 20 8 28C8 36 16 42 26 42C38 42 46 28 54 18C62 8 70 8 74 16C78 24 74 34 66 38C56 42 46 30 38 20C32 12 24 10 16 14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
      {/* Subtle secondary loop echo giving notebook sketch depth */}
      <path
        d="M24 18C17 18 12 22 12 27C12 33 18 38 25 38C35 38 44 26 52 17C58 9 66 10 70 16"
        stroke={color}
        strokeWidth={Math.max(1, strokeWidth - 1)}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
        strokeDasharray="2 3"
      />
    </svg>
  );
});

export { LoopMotif };
