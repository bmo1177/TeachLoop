"use client";

import { useState, useEffect, Component, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import { useSessionHistory } from "@/app/hooks/useSessionHistory";
import { TEACH_CONCEPTS, SWE_QUESTIONS } from "@/app/data/questions";
import { AUDIENCES } from "@/app/data/audiences";
import { QUESTIONS_PER_SESSION, pick, callEval, evalPrompt, reportPrompt } from "@/app/lib/api";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { HomeScreen, CustomModeScreen, CustomReviewScreen } from "@/app/components/screens";

const AudienceScreen = dynamic(() => import("@/app/components/screens/AudienceScreen").then((m) => m.AudienceScreen), { loading: () => null });
const WheelScreen = dynamic(() => import("@/app/components/screens/WheelScreen").then((m) => m.WheelScreen), { loading: () => null });
const SessionScreen = dynamic(() => import("@/app/components/screens/SessionScreen").then((m) => m.SessionScreen), { loading: () => null });
const FeedbackScreen = dynamic(() => import("@/app/components/screens/FeedbackScreen").then((m) => m.FeedbackScreen), { loading: () => null });

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

const DEFAULT_SESSION_LENGTH = QUESTIONS_PER_SESSION;
const SESSION_LENGTH_OPTIONS = [3, 5, 7];

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
  const [sessionLength, setSessionLength] = useState(DEFAULT_SESSION_LENGTH);
  const [customTopic, setCustomTopic] = useState("");
  const [customAudience, setCustomAudience] = useState(null);
  const [customHints, setCustomHints] = useState(null);
  const { sessions, addSession, deleteSession } = useSessionHistory();

  const N = sessionLength;

  useEffect(() => {
    if (report && evals.length === sessionLength) {
      addSession({
        date: new Date().toISOString(),
        mode,
        audience: aud,
        overallScore: report.overallScore,
        evals: evals.map((e) => ({ q: e.q.slice(0, 80), score: e.ev.overallScore })),
      });
    }
  }, [report, evals, mode, aud, addSession, sessionLength]);

  useEffect(() => {
    const handler = (e) => {
      if (screen === "session" || screen === "wheel-session" || screen === "custom" || screen === "custom-review") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [screen]);

  const gotoMode = (m, length) => {
    setMode(m);
    setSessionLength(length || DEFAULT_SESSION_LENGTH);
    if (m === "teach") {
      setScreen("audience");
    } else if (m === "custom") {
      setScreen("custom");
    } else {
      setQs(pick(SWE_QUESTIONS, length || DEFAULT_SESSION_LENGTH));
      setScreen("wheel");
      setWheelSpin(true);
    }
  };

  const gotoAud = (a) => {
    setAud(a);
    setQs(pick(TEACH_CONCEPTS, sessionLength));
    setScreen("wheel");
    setWheelSpin(true);
  };

  const onCustomGenerated = ({ questions, hints, topic, audience }) => {
    setCustomTopic(topic);
    setCustomAudience(audience);
    setCustomHints(hints);
    setQs(questions);
    setScreen("custom-review");
  };

  const startCustomSession = (validatedQuestions, hintsForQuestions) => {
    setMode("custom");
    setQs(validatedQuestions);
    setSessionLength(validatedQuestions.length);
    const hintsMap = {};
    if (hintsForQuestions) {
      validatedQuestions.forEach((q, i) => {
        if (hintsForQuestions[i]) hintsMap[q] = hintsForQuestions[i];
      });
    }
    setCustomHints(hintsMap);
    setIdx(0);
    setAns("");
    setEvals([]);
    setShowEv(false);
    setCurEv(null);
    setEvaluationError(null);
    setReportError(null);
    setReport(null);
    setWasVoiceUsed(false);
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
        : mode === "custom" && customAudience
        ? AUDIENCES.find((a) => a.id === customAudience)?.label
        : "a technical interviewer";
    const evalMode = mode === "custom" ? (customAudience ? "custom-teach" : "interview") : mode;
    try {
      const ev = await callEval(evalPrompt(evalMode, qs[idx], ans, audLabel, wasVoiceUsed));
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

  const retryReport = () => {
    setReportError(null);
    setReport(null);
    callEval(reportPrompt(evals))
      .then((r) => setReport(r))
      .catch((err) => {
        console.error("Report retry failed:", err);
        setReportError("Failed to generate session report. You can still view your answers.");
      });
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
    setCustomTopic("");
    setCustomAudience(null);
    setCustomHints(null);
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
              <HomeScreen
                onMode={gotoMode}
                pastSessions={sessions.slice(0, 5)}
                onDeleteSession={deleteSession}
                sessionLength={sessionLength}
                sessionLengthOptions={SESSION_LENGTH_OPTIONS}
                onSessionLengthChange={setSessionLength}
              />
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
                completedCount={0}
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
                completedCount={idx}
              />
            </motion.div>
          )}
          {screen === "session" && (
            <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <SessionScreen
                mode={mode}
                q={qs[idx]}
                qIdx={idx}
                totalQuestions={N}
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
                hintsMap={mode === "custom" ? customHints : null}
              />
            </motion.div>
          )}
          {screen === "feedback" && (
            <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <FeedbackScreen evals={evals} report={report} reportError={reportError} onReset={reset} onRetryReport={retryReport} />
            </motion.div>
          )}
          {screen === "custom" && (
            <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <CustomModeScreen onBack={() => setScreen("home")} onGenerated={onCustomGenerated} />
            </motion.div>
          )}
          {screen === "custom-review" && (
            <motion.div key="custom-review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <CustomReviewScreen
                questions={qs}
                hints={customHints}
                topic={customTopic}
                audience={customAudience}
                onBack={() => setScreen("custom")}
                onStart={startCustomSession}
              />
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
