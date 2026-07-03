"use client";

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

export { ScoreRing };
