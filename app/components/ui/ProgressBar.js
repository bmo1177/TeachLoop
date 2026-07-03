"use client";

function ProgressBar({ current, total }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export { ProgressBar };
