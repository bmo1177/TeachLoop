"use client";

import { useState, useEffect, Component } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSessionHistory } from "@/app/hooks/useSessionHistory";
import { TEACH_CONCEPTS, SWE_QUESTIONS } from "@/app/data/questions";
import { AUDIENCES } from "@/app/data/audiences";
import { QUESTIONS_PER_SESSION, pick, callEval, evalPrompt, reportPrompt } from "@/app/lib/api";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { HomeScreen, AudienceScreen, WheelScreen, SessionScreen, FeedbackScreen } from "@/app/components/screens";

/* ─── ERROR BOUNDARY ──────────────────────────────────────────────────────── */

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Something went wrong</p>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}>{this.state.error?.message || "An unexpected error occurred."}</p>
          <button className="btn btn-primary" onClick={() => this.setState({ hasError: false, error: null })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ─── HELPERS ──────────────────────────────────────────────────────────────── */

const N = QUESTIONS_PER_SESSION;

/* ─── THEME ────────────────────────────────────────────────────────────────── */

function AppInner() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState(null);
  const [aud, setAud] = useState(null);
  const [qs, setQs] = useState([]);
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState("");
  const [evals, setEvals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEv, setShowEv] = useState(false);
  const [curEv, setCurEv] = useState(null);
  const [report, setReport] = useState(null);
  const [wheelSpin, setWheelSpin] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [wasVoiceUsed, setWasVoiceUsed] = useState(false);
  const { sessions, addSession, deleteSession } = useSessionHistory();

  useEffect(() => {
    if (report && evals.length === N) {
      addSession({
        date: new Date().toISOString(),
        mode,
        audience: aud,
        overallScore: report.overallScore,
        evals: evals.map((e) => ({ q: e.q.slice(0, 80), score: e.ev.overallScore })),
      });
    }
  }, [report, evals, mode, aud, addSession]);

  useEffect(() => {
    const handler = (e) => {
      if (screen === "session" || screen === "wheel-session") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [screen]);

  const gotoMode = (m) => {
    setMode(m);
    if (m === "teach") {
      setScreen("audience");
    } else {
      setQs(pick(SWE_QUESTIONS, N));
      setScreen("wheel");
      setWheelSpin(true);
    }
  };

  const gotoAud = (a) => {
    setAud(a);
    setQs(pick(TEACH_CONCEPTS, N));
    setScreen("wheel");
    setWheelSpin(true);
  };

  const startSession = () => {
    setIdx(0);
    setAns("");
    setEvals([]);
    setShowEv(false);
    setCurEv(null);
    setEvaluationError(null);
    setReportError(null);
    setReport(null);
    setWasVoiceUsed(false);
    setScreen("session");
  };

  const submit = async () => {
    if (!ans.trim() || loading) return;
    setLoading(true);
    setEvaluationError(null);
    const audLabel =
      mode === "teach"
        ? AUDIENCES.find((a) => a.id === aud)?.label
        : "a technical interviewer";
    try {
      const ev = await callEval(evalPrompt(mode, qs[idx], ans, audLabel, wasVoiceUsed));
      const newEvals = [...evals, { q: qs[idx], ev }];
      setEvals(newEvals);
      setCurEv(ev);
      setShowEv(true);
      if (idx === N - 1) {
        setReportError(null);
        callEval(reportPrompt(newEvals))
          .then((r) => setReport(r))
          .catch((err) => {
            console.error("Report generation failed:", err);
            setReportError("Failed to generate session report. You can still view your answers.");
          });
      }
    } catch (err) {
      setEvaluationError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (idx < N - 1) {
      setIdx(idx + 1);
      setAns("");
      setShowEv(false);
      setCurEv(null);
      setEvaluationError(null);
      setWasVoiceUsed(false);
      setWheelSpin(true);
      setScreen("wheel-session");
    } else {
      setScreen("feedback");
    }
  };

  const finishWheelTransition = () => {
    setScreen("session");
  };

  const reset = () => {
    setScreen("home");
    setMode(null);
    setAud(null);
    setQs([]);
    setIdx(0);
    setAns("");
    setEvals([]);
    setLoading(false);
    setShowEv(false);
    setCurEv(null);
    setEvaluationError(null);
    setReportError(null);
    setReport(null);
    setWheelSpin(false);
    setWasVoiceUsed(false);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div id="main-content">
        <AnimatePresence mode="wait">
          {screen === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <HomeScreen onMode={gotoMode} pastSessions={sessions.slice(0, 5)} onDeleteSession={deleteSession} />
            </motion.div>
          )}
          {screen === "audience" && (
            <motion.div key="audience" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <AudienceScreen onSelect={gotoAud} onBack={() => setScreen("home")} />
            </motion.div>
          )}
          {screen === "wheel" && (
            <motion.div key="wheel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <WheelScreen
                questions={qs}
                mode={mode}
                questionIdx={0}
                spinning={wheelSpin}
                onSpin={() => setWheelSpin(false)}
                onDone={startSession}
                screenName="wheel"
              />
            </motion.div>
          )}
          {screen === "wheel-session" && (
            <motion.div key="wheel-session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <WheelScreen
                questions={qs}
                mode={mode}
                questionIdx={idx}
                spinning={wheelSpin}
                onSpin={() => setWheelSpin(false)}
                onDone={finishWheelTransition}
                screenName="wheel-session"
              />
            </motion.div>
          )}
          {screen === "session" && (
            <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <SessionScreen
                mode={mode}
                q={qs[idx]}
                qIdx={idx}
                audience={aud}
                answer={ans}
                onChange={setAns}
                onSubmit={submit}
                loading={loading}
                evaluationError={evaluationError}
                showEval={showEv}
                evaluation={curEv}
                onNext={next}
                onClearError={() => setEvaluationError(null)}
                isLast={idx === N - 1}
                onVoiceUsed={() => setWasVoiceUsed(true)}
              />
            </motion.div>
          )}
          {screen === "feedback" && (
            <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <FeedbackScreen evals={evals} report={report} reportError={reportError} onReset={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppInner />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
