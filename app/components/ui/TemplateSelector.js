"use client";

import { memo } from "react";
import { WHITEBOARD_TEMPLATES } from "@/app/data/templates";
import { Square, Cloud, GitFork, TreeStructure, CaretLeft } from "@phosphor-icons/react";

const ICON_MAP = {
  Square: Square,
  Cloud: Cloud,
  GitFork: GitFork,
  TreeStructure: TreeStructure,
};

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
        {WHITEBOARD_TEMPLATES.map((tmpl) => {
          const IconComp = ICON_MAP[tmpl.icon] || Square;
          return (
            <button
              key={tmpl.id}
              className="template-card"
              onClick={() => onSelect(tmpl)}
            >
              <div className="template-card-icon">
                <IconComp size={32} weight="duotone" />
              </div>
              <div className="template-card-content">
                <h3 className="template-card-title">{tmpl.title}</h3>
                <p className="template-card-desc">{tmpl.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export { TemplateSelector };
