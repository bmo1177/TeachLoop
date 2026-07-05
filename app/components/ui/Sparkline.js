"use client";

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
    <svg width={width} height={height} className="sparkline" role="img" aria-label={`Score trend: ${data.join(", ")}`}>
      <polyline points={points} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const cx = i * step;
        const cy = height - ((v - min) / range) * (height - 4) - 2;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={2.5}
            fill="var(--color-accent)"
            stroke="var(--color-surface, #fff)"
            strokeWidth={1}
          >
            <title>{v}/10</title>
          </circle>
        );
      })}
    </svg>
  );
}

export { Sparkline };
