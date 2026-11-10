"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { AUDIENCES, AudienceIcon } from "@/app/data/audiences";
import { Nav } from "@/app/components/ui";

const AudienceScreen = memo(function AudienceScreen({ onSelect, onBack, selectedAudience }) {
  return (
    <>
      <Nav onHome={onBack} screen="audience" />
      <main className="container screen-top">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <CaretLeft size={16} weight="bold" />
          <span>Back</span>
        </button>

        <motion.div
          className="audience-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="screen-title">Who are you explaining to?</h1>
          <p className="screen-subtitle">
            Your audience determines vocabulary, depth, and which analogies will land.
          </p>
        </motion.div>

        <div className="audience-list" role="radiogroup" aria-label="Select audience">
          {AUDIENCES.map((a, i) => (
            <motion.button
              key={a.id}
              className={`audience-option ${selectedAudience === a.id ? "selected" : ""}`}
              onClick={() => onSelect(a.id)}
              role="radio"
              aria-checked={selectedAudience === a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="audience-option-main">
                <span className="audience-icon">
                  <AudienceIcon id={a.id} size={22} />
                </span>
                <div className="audience-content">
                  <div className="audience-header-row">
                    <span className="audience-label">{a.label}</span>
                    {a.focus && <span className="audience-focus-tag">{a.focus}</span>}
                  </div>
                  <span className="audience-hint">{a.hint}</span>
                  {a.quote && (
                    <p className="audience-quote-bubble">
                      &ldquo;{a.quote}&rdquo;
                    </p>
                  )}
                </div>
                <CaretRight size={18} weight="bold" className="audience-chevron" />
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </>
  );
});

export { AudienceScreen };
