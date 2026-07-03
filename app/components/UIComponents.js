"use client";

import { motion } from "motion/react";
import { ThemeContext, THEMES, ThemeSwitcher } from "@/app/providers/ThemeProvider";

/* ─── SCORE RING ──────────────────────────────────────────────────────────── */

function ScoreRing({ score, size = 64, label, delay = 0 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score / 10, 0), 1);

  let color = "var(--color-accent)";
  if (score >= 8) color = "var(--color-success)";
  else if (score < 5) color = "var(--color-error)";

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: `stroke-dashoffset 0.8s var(--ease-out-expo) ${delay}s`,
          }}
        />
      </svg>
      <div className="score-ring-inner">
        <span className="score-ring-value">{score}</span>
        {label && <span className="score-ring-label">{label}</span>}
      </div>
    </div>
  );
}

/* ─── PROGRESS BAR ──────────────────────────────────────────────────────────── */

function ProgressBar({ current, total }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ─── LOGO ──────────────────────────────────────────────────────────────────── */

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="4" width="18" height="20" rx="3" stroke="var(--color-accent)" strokeWidth="2" fill="var(--color-accent-subtle)" />
      <rect x="8" y="2" width="18" height="20" rx="3" stroke="var(--color-accent)" strokeWidth="2" fill="var(--color-surface)" />
      <path d="M13 9h8M13 13h6M13 17h4" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="21" cy="19" r="5" fill="var(--color-accent)" />
      <path d="M19.5 19l1 1 2-2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── NAV ──────────────────────────────────────────────────────────────────── */

function Nav({ onHome, screen }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <button className="nav-back" onClick={onHome} aria-label="Go home">
          <LogoMark />
          <span className="nav-title">TeachLoop</span>
        </button>
        {screen !== "home" && (
          <div className="nav-actions">
            <ThemeSwitcher />
          </div>
        )}
      </div>
    </nav>
  );
}

/* ─── SPARKLINE ────────────────────────────────────────────────────────────── */

function Sparkline({ data, width = 80, height = 24 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`)
    .join(" ");

  return (
    <svg width={width} height={height} className="sparkline" role="img" aria-label="Score trend">
      <polyline points={points} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export { ScoreRing, ProgressBar, LogoMark, Nav, Sparkline, ThemeSwitcher };
