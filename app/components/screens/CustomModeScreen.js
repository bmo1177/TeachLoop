"use client";

import { useState, memo } from "react";
import { motion } from "motion/react";
import { CaretLeft, Sparkle, ArrowRight, Robot } from "@phosphor-icons/react";
import { Nav } from "@/app/components/ui";
import { AUDIENCES, AudienceIcon } from "@/app/data/audiences";
import { callEval, generateQuestionsPrompt } from "@/app/lib/api";

const EXAMPLE_TOPICS = [
  "Kubernetes",
  "React Hooks",
  "System Design",
  "GraphQL",
  "Machine Learning",
  "TypeScript",
  "Docker",
  "REST APIs",
];

const CustomModeScreen = memo(function CustomModeScreen({ onBack, onGenerated }) {
  const [topic, setTopic] = useState("");
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const canGenerate = topic.trim().length > 0 && !generating;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setError(null);
    try {
      const audLabel = selectedAudience
        ? AUDIENCES.find((a) => a.id === selectedAudience)?.label
        : null;
      const prompt = generateQuestionsPrompt(topic.trim(), audLabel, 5);
      const data = await callEval(prompt);
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions were generated. Please try again.");
      }
      onGenerated({
        questions: data.questions,
        topic: topic.trim(),
        audience: selectedAudience,
      });
    } catch (err) {
      setError(err.message || "Failed to generate questions. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <>
        <Nav onHome={onBack} screen="custom" />
        <main className="container screen-top">
          <div className="generating-section">
            <motion.div
              className="generating-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Robot size={32} weight="duotone" />
            </motion.div>
            <motion.p
              className="generating-text"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Generating your questions...
            </motion.p>
            <motion.p
              className="generating-subtext"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Creating {5} practice questions about &ldquo;{topic}&rdquo;
            </motion.p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav onHome={onBack} screen="custom" />
      <main className="container screen-top">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <CaretLeft size={16} weight="bold" />
          <span>Back</span>
        </button>

        <motion.div
          className="custom-mode-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="screen-title">Create Your Own</h1>
          <p className="screen-subtitle">
            Tell us what you want to practice, and AI will generate custom questions for you.
          </p>
        </motion.div>

        <motion.div
          className="topic-input-section"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="topic-input-card">
            <label className="topic-input-label" htmlFor="topic-input">
              What topic do you want to practice explaining?
            </label>
            <input
              id="topic-input"
              className="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Kubernetes, GraphQL, System Design..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && canGenerate) handleGenerate();
              }}
              autoFocus
            />
            <div className="topic-examples">
              {EXAMPLE_TOPICS.map((t) => (
                <button
                  key={t}
                  className="topic-example-tag"
                  onClick={() => setTopic(t)}
                  type="button"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="custom-audience-section"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <span className="custom-audience-label">Who will you explain it to?</span>
          <span className="custom-audience-hint">
            Optional — helps tailor question difficulty and vocabulary.
          </span>
          <div className="custom-audience-grid" role="radiogroup" aria-label="Select audience">
            {AUDIENCES.map((a) => (
              <button
                key={a.id}
                className={`custom-audience-btn ${selectedAudience === a.id ? "selected" : ""}`}
                role="radio"
                aria-checked={selectedAudience === a.id}
                onClick={() => setSelectedAudience(selectedAudience === a.id ? null : a.id)}
                type="button"
              >
                <span className="custom-audience-btn-icon">
                  <AudienceIcon id={a.id} size={18} />
                </span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span>{error}</span>
            <button className="btn btn-ghost" onClick={() => setError(null)}>
              Dismiss
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            <Sparkle size={18} weight="bold" />
            Generate Questions
            <ArrowRight size={18} weight="bold" />
          </button>
        </motion.div>
      </main>
    </>
  );
});

export { CustomModeScreen };
