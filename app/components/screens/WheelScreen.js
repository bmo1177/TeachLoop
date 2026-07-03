"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion } from "motion/react";
import { useWheelColors } from "@/app/providers/ThemeProvider";
import { Nav } from "@/app/components/ui";

const WheelScreen = memo(function WheelScreen({ questions, mode, questionIdx, spinning, onSpin, onDone, screenName }) {
  const [rotation, setRotation] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState("idle");
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const currentRotationRef = useRef(0);
  const wheelColors = useWheelColors();

  useEffect(() => {
    setPhase("idle");
  }, [questionIdx]);

  const n = questions.length;
  const segAngle = 360 / n;
  const targetIdx = questionIdx;

  const spin = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("spinning");
    onSpin();

    const extraSpins = 3 + Math.floor(Math.random() * 3);
    const currentMod = currentRotationRef.current % 360;
    const targetOffset = (360 - targetIdx * segAngle - segAngle / 2);
    const totalDelta = extraSpins * 360 + ((targetOffset - currentMod + 360) % 360);
    const startRotation = currentRotationRef.current;
    const finalRotation = startRotation + totalDelta;
    const duration = 3000 + Math.random() * 500;
    startTimeRef.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = startRotation + totalDelta * eased;

      setRotation(current);
      const normalized = ((current % 360) + 360) % 360;
      const idx = Math.floor(((360 - normalized + segAngle / 2) % 360) / segAngle) % n;
      setActiveIdx(idx);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        currentRotationRef.current = finalRotation;
        setActiveIdx(targetIdx);
        setPhase("stopped");
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [phase, targetIdx, segAngle, n, onSpin]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (spinning && phase === "idle") {
      spin();
    }
  }, [spinning, phase, spin]);

  const activeQuestion = questions[activeIdx] || questions[0];

  const gradientStops = questions.map((_, i) => {
    const start = (i * segAngle);
    const end = ((i + 1) * segAngle);
    return `${wheelColors[i % wheelColors.length].bg} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <>
      <Nav onHome={() => {}} screen={screenName || "wheel"} />
      <main className="container screen-center">
        <div style={{ width: "100%", maxWidth: "28rem" }}>
          <motion.div
            className="wheel-header"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="wheel-title">
              {phase === "stopped"
                ? "Your question is ready!"
                : "Spinning the wheel..."}
            </h1>
            <p className="wheel-subtitle">
              {mode === "teach"
                ? `Question ${questionIdx + 1} of ${questions.length}`
                : `Interview question ${questionIdx + 1} of ${questions.length}`}
            </p>
          </motion.div>

          <motion.div
            className="wheel-container"
            role="img"
            aria-label={`Wheel spinning to select question ${questionIdx + 1} of ${questions.length}. ${phase === "stopped" ? `Selected: ${activeQuestion}` : "Spinning..."}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="wheel-pointer">
              <svg width="32" height="28" viewBox="0 0 32 28" aria-hidden="true">
                <polygon points="16,28 0,0 32,0" fill="var(--color-text-primary)" />
              </svg>
            </div>
            <div
              className={`wheel-circle ${phase === "spinning" ? "wheel-spinning" : ""} ${phase === "stopped" ? "wheel-stopped" : ""}`}
            >
              <div
                className="wheel-inner"
                style={{
                  background: `conic-gradient(from 0deg, ${gradientStops})`,
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {questions.map((q, i) => {
                  const angle = i * segAngle + segAngle / 2;
                  const rad = (angle * Math.PI) / 180;
                  const labelR = 55;
                  const tx = Math.cos(rad) * labelR;
                  const ty = Math.sin(rad) * labelR;
                  const truncated = q.length > 40 ? q.slice(0, 38) + "..." : q;
                  return (
                    <div
                      key={i}
                      className={`wheel-label ${activeIdx === i && phase === "stopped" ? "wheel-label-active" : ""}`}
                      style={{
                        transform: `translate(${tx - 50}%, ${ty - 50}%) rotate(${angle + 90}deg)`,
                      }}
                    >
                      <span className="wheel-label-num">{i + 1}</span>
                      <span className="wheel-label-text">{truncated}</span>
                    </div>
                  );
                })}
              </div>
              <div className="wheel-center-dot" />
            </div>
            {phase === "spinning" && <div className="wheel-glow" aria-hidden="true" />}
          </motion.div>

          {phase === "stopped" && (
            <motion.div
              className="wheel-result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="wheel-result-card">
                <span className="wheel-result-label">
                  {mode === "teach" ? "Concept to explain" : "Your question"}
                </span>
                <p className="wheel-result-text">{activeQuestion}</p>
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={onDone}>
                Begin Session
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
});

export { WheelScreen };
