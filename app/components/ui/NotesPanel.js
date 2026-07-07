"use client";

import { memo } from "react";
import { BookOpen } from "@phosphor-icons/react";

const NotesPanel = memo(function NotesPanel({ value, onChange, placeholder = "Type your written explanation, notes, or talk track here..." }) {
  return (
    <div className="notes-panel">
      <div className="notes-panel-header">
        <BookOpen size={20} weight="duotone" />
        <h3 className="notes-panel-title">Written Explanation</h3>
      </div>
      <p className="notes-panel-instructions">
        Use this space to explain what is happening in your diagram. The AI grader will read both your visual shapes/structure and these notes.
      </p>
      <textarea
        className="notes-panel-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Notes explaining the diagram"
      />
    </div>
  );
});

export { NotesPanel };
