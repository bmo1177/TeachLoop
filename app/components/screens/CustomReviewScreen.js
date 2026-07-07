"use client";

import { useState, memo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaretLeft, Plus, Trash, ArrowRight, Pencil } from "@phosphor-icons/react";
import { Nav } from "@/app/components/ui";

const CustomReviewScreen = memo(function CustomReviewScreen({ questions, hints, topic, audience, onBack, onStart }) {
  const [items, setItems] = useState(() =>
    questions.map((q, i) => ({ text: q, hints: hints?.[i] || null, id: crypto.randomUUID() }))
  );
  const textareaRefs = useRef({});

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id, text) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  }, []);

  const addItem = useCallback(() => {
    const newItem = { text: "", hints: null, id: crypto.randomUUID() };
    setItems((prev) => [...prev, newItem]);
    setTimeout(() => {
      const textarea = textareaRefs.current[newItem.id];
      if (textarea) textarea.focus();
    }, 50);
  }, []);

  const handleStart = () => {
    const validItems = items.filter((item) => item.text.trim());
    if (validItems.length > 0) {
      onStart(
        validItems.map((item) => item.text.trim()),
        validItems.map((item) => item.hints)
      );
    }
  };

  return (
    <>
      <Nav onHome={onBack} screen="custom-review" />
      <main className="container screen-top">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <CaretLeft size={16} weight="bold" />
          <span>Back</span>
        </button>

        <motion.div
          className="review-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="screen-title">
            <Pencil size={20} weight="duotone" style={{ display: "inline", verticalAlign: "text-bottom", marginRight: "var(--space-2)" }} />
            Review Questions
          </h1>
          <p className="review-count">
            {items.length} question{items.length !== 1 ? "s" : ""} about &ldquo;{topic}&rdquo;
          </p>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            className="review-empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="review-empty-text">
              No questions left. Add one below or go back to regenerate.
            </p>
          </motion.div>
        ) : (
          <div className="review-list">
            <AnimatePresence mode="popLayout">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="review-item"
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                >
                  <span className="review-item-number">{i + 1}</span>
                  <div className="review-item-content">
                    <textarea
                      ref={(el) => { textareaRefs.current[item.id] = el; }}
                      className="review-item-input"
                      value={item.text}
                      onChange={(e) => {
                        updateItem(item.id, e.target.value);
                      }}
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      placeholder="Type your question..."
                      rows={1}
                    />
                  </div>
                  <button
                    className="review-item-delete"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove question ${i + 1}`}
                    title="Remove question"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <motion.div
          className="review-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <button className="review-add-btn" onClick={addItem} type="button">
            <Plus size={16} weight="bold" />
            Add question
          </button>
          <div className="review-start-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleStart}
              disabled={items.filter((item) => item.text.trim()).length === 0}
            >
              Start Session
              <ArrowRight size={18} weight="bold" />
            </button>
          </div>
        </motion.div>
      </main>
    </>
  );
});

export { CustomReviewScreen };
