"use client";

import React, { useState, useEffect, useRef } from "react";
import "@excalidraw/excalidraw/index.css";

function WhiteboardCanvas({ initialElements, onChange, theme = "light", excalidrawRef }) {
  const [Comp, setComp] = useState(null);

  useEffect(() => {
    let active = true;
    import("@excalidraw/excalidraw").then((m) => {
      if (active) {
        setComp(() => m.Excalidraw);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!Comp) {
    return (
      <div className="whiteboard-canvas-loading">
        <div className="spinner"></div>
        <p>Initializing drawing workspace...</p>
      </div>
    );
  }

  const ExcalidrawComponent = Comp;

  return (
    <div className="whiteboard-canvas-container" style={{ width: "100%", height: "100%", position: "relative" }}>
      <ExcalidrawComponent
        ref={excalidrawRef}
        initialData={{
          elements: initialElements || [],
          appState: {
            viewBackgroundColor: theme === "dark" ? "#1e1e24" : "#ffffff",
            currentItemStrokeColor: theme === "dark" ? "#ffffff" : "#1e1e24",
          },
        }}
        onChange={onChange}
        theme={theme}
      />
    </div>
  );
}

export default WhiteboardCanvas;
export { WhiteboardCanvas };
