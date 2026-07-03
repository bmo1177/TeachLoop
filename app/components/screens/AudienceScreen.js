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
              className="audience-option"
              onClick={() => onSelect(a.id)}
              role="radio"
              aria-checked={selectedAudience === a.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="audience-icon">
                <AudienceIcon id={a.id} />
              </span>
              <div className="audience-content">
                <span className="audience-label">{a.label}</span>
                <span className="audience-hint">{a.hint}</span>
              </div>
              <CaretRight size={16} weight="bold" className="audience-chevron" />
            </motion.button>
          ))}
        </div>
      </main>
    </>
  );
});

export { AudienceScreen };
