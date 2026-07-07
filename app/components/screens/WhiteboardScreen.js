"use client";

import { useState, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CaretLeft,
  Sparkle,
  ArrowRight,
  BookOpen,
  Cloud,
  CheckCircle,
  Clock,
  Warning,
  ArrowsClockwise,
  Pencil,
  Trash,
} from "@phosphor-icons/react";
import { Nav } from "@/app/components/ui/Nav";
import { TemplateSelector } from "@/app/components/ui/TemplateSelector";
import { NotesPanel } from "@/app/components/ui/NotesPanel";
import { WhiteboardCanvas } from "@/app/components/ui/WhiteboardCanvas";
import { useWhiteboardHistory } from "@/app/hooks/useWhiteboardHistory";
import { callEval, whiteboardEvalPrompt, prepareWhiteboardPrompt } from "@/app/lib/api";

const WHITEBOARD_EXERCISES = [
  { id: "rate-limiter", title: "Rate Limiter Architecture", category: "System Design" },
  { id: "cnn", title: "Convolutional Neural Network (CNN) Flow", category: "AI / ML" },
  { id: "dns", title: "DNS Resolution Process", category: "Networking" },
  { id: "react-lifecycle", title: "React Component Lifecycle", category: "Web Dev" },
  { id: "sql-nosql", title: "SQL vs NoSQL Scaling", category: "Databases" },
  { id: "freeform", title: "Freeform (Draw Anything)", category: "Custom" },
];

const WhiteboardScreen = memo(function WhiteboardScreen({ onBack }) {
  const { sketches, saveSketch, deleteSketch } = useWhiteboardHistory();
  const [step, setStep] = useState("exercise-select"); // exercise-select, template-select, editor
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Editor states
  const [sketchId, setSketchId] = useState(null);
  const [canvasElements, setCanvasElements] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const excalidrawRef = useRef(null);

  // Pick an exercise
  const handleSelectExercise = (ex) => {
    setSelectedExercise(ex);
    setStep("template-select");
  };

  // Pick a template and start drawing
  const handleSelectTemplate = (tmpl) => {
    setSelectedTemplate(tmpl);
    setSketchId(null);
    setCanvasElements(tmpl.elements || []);
    setNotes("");
    setEvaluation(null);
    setStep("editor");
  };

  // Load a saved sketch from history
  const handleLoadSketch = (sketch) => {
    setSelectedExercise(WHITEBOARD_EXERCISES.find(e => e.title === sketch.title) || { title: sketch.title });
    setSketchId(sketch.id);
    setCanvasElements(sketch.elements || []);
    setNotes(sketch.notes || "");
    setEvaluation(sketch.evaluation || null);
    setStep("editor");
  };

  const handleCanvasChange = (elements) => {
    // Excalidraw outputs all elements including deleted ones. Save the raw list for rendering.
    setCanvasElements(elements);
  };

  const handleSubmitEvaluation = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Build structured prompt from canvas elements + notes
      const outline = prepareWhiteboardPrompt(canvasElements, notes, selectedExercise.title);

      // 2. Generate eval prompt and call evaluation api
      const prompt = whiteboardEvalPrompt(selectedExercise.title, outline, notes);
      const res = await callEval(prompt);

      // 3. Update evaluation state
      setEvaluation(res);

      // 4. Save sketch to localStorage history
      saveSketch({
        id: sketchId,
        title: selectedExercise.title,
        elements: canvasElements,
        notes,
        evaluation: res,
      });

    } catch (err) {
      console.error(err);
      setError(err.message || "Evaluation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    saveSketch({
      id: sketchId,
      title: selectedExercise.title,
      elements: canvasElements,
      notes,
      evaluation,
    });
    alert("Draft saved to history!");
  };

  const handleBackToSelect = () => {
    setStep("exercise-select");
    setSelectedExercise(null);
    setSelectedTemplate(null);
    setEvaluation(null);
  };

  return (
    <>
      <Nav onHome={onBack} screen="whiteboard" />
      <main className="container whiteboard-screen-main">
        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT EXERCISE */}
          {step === "exercise-select" && (
            <motion.section
              key="exercise-select"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="wb-selection-section"
            >
              <div className="wb-section-header">
                <button className="btn btn-secondary back-btn" onClick={onBack} aria-label="Go home">
                  <CaretLeft size={18} weight="bold" />
                  Home
                </button>
                <h1 className="home-title" style={{ marginTop: "1rem" }}>Whiteboard Explainer</h1>
                <p className="home-subtitle">
                  Choose a technical concept, draw a diagram to explain it, and get direct grading on correctness, completeness, and visual structure.
                </p>
              </div>

              <div className="wb-layout-grid">
                {/* Exercise Cards */}
                <div className="wb-exercises-col">
                  <h2 className="wb-col-title">Select a Practice Concept</h2>
                  <div className="wb-exercises-grid">
                    {WHITEBOARD_EXERCISES.map((ex) => (
                      <button
                        key={ex.id}
                        className="wb-exercise-card"
                        onClick={() => handleSelectExercise(ex)}
                      >
                        <span className="wb-exercise-category">{ex.category}</span>
                        <h3 className="wb-exercise-title">{ex.title}</h3>
                        <div className="wb-exercise-action">
                          Draw & Explain
                          <ArrowRight size={16} weight="bold" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* History Column */}
                <div className="wb-history-col">
                  <h2 className="wb-col-title">Past Whiteboard Sketches</h2>
                  {sketches.length > 0 ? (
                    <div className="wb-history-list">
                      {sketches.map((s) => (
                        <div key={s.id} className="wb-history-item" onClick={() => handleLoadSketch(s)}>
                          <div className="wb-history-details">
                            <span className="wb-history-name">{s.title}</span>
                            <span className="wb-history-date">
                              {new Date(s.date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="wb-history-meta">
                            {s.evaluation ? (
                              <span className="wb-history-score">
                                {s.evaluation.overallScore}/10
                              </span>
                            ) : (
                              <span className="wb-history-draft">Draft</span>
                            )}
                            <button
                              className="wb-history-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Delete this sketch?")) {
                                  deleteSketch(s.id);
                                }
                              }}
                              title="Delete sketch"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="wb-history-empty">
                      <Clock size={32} weight="duotone" />
                      <p>Your saved whiteboard explanations will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {/* STEP 2: SELECT TEMPLATE */}
          {step === "template-select" && (
            <motion.section
              key="template-select"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <TemplateSelector
                onSelect={handleSelectTemplate}
                onBack={handleBackToSelect}
              />
            </motion.section>
          )}

          {/* STEP 3: WHITEBOARD EDITOR & CANVAS */}
          {step === "editor" && (
            <motion.section
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="wb-editor-workspace"
            >
              {/* Header bar */}
              <div className="wb-editor-header">
                <div className="wb-header-left">
                  <button className="btn btn-secondary back-btn" onClick={handleBackToSelect}>
                    <CaretLeft size={16} weight="bold" />
                    Exit
                  </button>
                  <div className="wb-header-title-block">
                    <span className="wb-header-badge">Practicing</span>
                    <h2 className="wb-header-title">{selectedExercise?.title}</h2>
                  </div>
                </div>

                <div className="wb-header-actions">
                  <button className="btn btn-secondary" onClick={handleSaveDraft} disabled={loading}>
                    Save Draft
                  </button>
                  <button className="btn btn-primary" onClick={handleSubmitEvaluation} disabled={loading}>
                    {loading ? (
                      <>
                        <ArrowsClockwise size={16} className="animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Sparkle size={16} weight="fill" />
                        Evaluate explanation
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Workspace grid layout */}
              <div className="wb-workspace-grid">
                {/* Notes and feedback side panel */}
                <div className="wb-workspace-side-panel">
                  <NotesPanel value={notes} onChange={setNotes} />

                  {/* Feedback Card */}
                  {evaluation && (
                    <div className="wb-feedback-section">
                      <div className="wb-feedback-header">
                        <CheckCircle size={24} weight="duotone" color="var(--color-success)" />
                        <h3>AI Evaluation Results</h3>
                        <span className="wb-overall-score">{evaluation.overallScore}/10</span>
                      </div>

                      <p className="wb-feedback-observation">{evaluation.styleObservation}</p>

                      <div className="wb-scores-breakdown">
                        <h4 className="wb-breakdown-title">Scores Breakdown</h4>
                        <div className="wb-scores-grid">
                          {Object.entries(evaluation.scores || {}).map(([key, val]) => (
                            <div key={key} className="wb-score-item">
                              <span className="wb-score-name">
                                {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                              </span>
                              <div className="wb-score-bar-container">
                                <div
                                  className="wb-score-bar-fill"
                                  style={{
                                    width: `${val * 10}%`,
                                    backgroundColor: val >= 8 ? "var(--color-success)" : val >= 5 ? "var(--color-accent)" : "var(--color-error)"
                                  }}
                                />
                              </div>
                              <span className="wb-score-val">{val}/10</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="wb-tips-box">
                        <div className="wb-tip-block positive">
                          <strong>Strong Point:</strong>
                          <p>{evaluation.strongPoint}</p>
                        </div>
                        <div className="wb-tip-block negative">
                          <strong>Flaw to Fix:</strong>
                          <p>{evaluation.flawToFix}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="wb-error-box">
                      <Warning size={20} weight="fill" />
                      <p>{error}</p>
                    </div>
                  )}
                </div>

                {/* Excalidraw canvas wrapper container */}
                <div className="wb-workspace-canvas-panel">
                  <WhiteboardCanvas
                    initialElements={canvasElements}
                    onChange={handleCanvasChange}
                    excalidrawRef={excalidrawRef}
                    theme="light"
                  />
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </>
  );
});

export { WhiteboardScreen };
