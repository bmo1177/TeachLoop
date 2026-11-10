"use client";

import { memo } from "react";
import { WHITEBOARD_TEMPLATES } from "@/app/data/templates";
import { CaretLeft } from "@phosphor-icons/react";

function TemplateBlueprint({ id }) {
  if (id === "system-design") {
    return (
      <svg width="56" height="36" viewBox="0 0 72 48" fill="none" className="template-blueprint-svg" aria-hidden="true">
        <rect x="2" y="16" width="16" height="16" rx="3" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-surface-raised)" />
        <path d="M18 24h6" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" />
        <rect x="26" y="14" width="20" height="20" rx="3" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-surface-raised)" />
        <path d="M46 24h6" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="61" cy="24" rx="9" ry="12" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-surface-raised)" />
      </svg>
    );
  }
  if (id === "flowchart") {
    return (
      <svg width="56" height="36" viewBox="0 0 72 48" fill="none" className="template-blueprint-svg" aria-hidden="true">
        <rect x="26" y="2" width="20" height="12" rx="3" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-surface-raised)" />
        <path d="M36 14v6" stroke="var(--color-accent)" strokeWidth="1.2" />
        <path d="M36 20l12 7-12 7-12-7z" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-surface-raised)" />
        <path d="M24 27h-8v7" stroke="var(--color-accent)" strokeWidth="1.2" />
        <path d="M48 27h8v7" stroke="var(--color-accent)" strokeWidth="1.2" />
      </svg>
    );
  }
  if (id === "neural-net") {
    return (
      <svg width="56" height="36" viewBox="0 0 72 48" fill="none" className="template-blueprint-svg" aria-hidden="true">
        <circle cx="10" cy="12" r="4" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-surface-raised)" />
        <circle cx="10" cy="36" r="4" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-surface-raised)" />
        <circle cx="36" cy="8" r="4" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-surface-raised)" />
        <circle cx="36" cy="24" r="4" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-surface-raised)" />
        <circle cx="36" cy="40" r="4" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-surface-raised)" />
        <circle cx="62" cy="24" r="4" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-surface-raised)" />
        <path d="M14 12l18-4M14 12l18 12M14 36l18-12M14 36l18 4M40 8l18 16M40 24h18M40 40l18-16" stroke="var(--color-accent)" strokeWidth="0.8" opacity="0.6" />
      </svg>
    );
  }
  // blank
  return (
    <svg width="56" height="36" viewBox="0 0 72 48" fill="none" className="template-blueprint-svg" aria-hidden="true">
      <rect x="4" y="4" width="64" height="40" rx="4" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="3 3" fill="var(--color-surface-raised)" />
      <path d="M36 20v8M32 24h8" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const TemplateSelector = memo(function TemplateSelector({ onSelect, onBack }) {
  return (
    <div className="template-selector">
      <div className="template-selector-header">
        <button className="btn btn-secondary back-btn" onClick={onBack} aria-label="Go back">
          <CaretLeft size={18} weight="bold" />
          Back
        </button>
        <h2 className="template-title">Choose a Starter Template</h2>
        <p className="template-subtitle">
          Select a layout to jumpstart your visual explanation. You can customize, move, or delete any element on the canvas.
        </p>
      </div>

      <div className="template-grid">
        {WHITEBOARD_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            className="template-card"
            onClick={() => onSelect(tmpl)}
          >
            <div className="template-card-blueprint">
              <TemplateBlueprint id={tmpl.id} />
            </div>
            <div className="template-card-content">
              <h3 className="template-card-title">{tmpl.title}</h3>
              <p className="template-card-desc">{tmpl.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

export { TemplateSelector };
