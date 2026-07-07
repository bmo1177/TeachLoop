"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "teachloop-whiteboards";
const MAX_SKETCHES = 15; // Safe limit to prevent localStorage quota issues

export function useWhiteboardHistory() {
  const [sketches, setSketches] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Sort with newest first
          setSketches(parsed.sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
      }
    } catch {}
  }, []);

  const saveSketch = useCallback((sketch) => {
    setSketches((prev) => {
      // If it has an ID, update it, otherwise create new
      const id = sketch.id || `wb-${Date.now()}`;
      const updatedSketch = {
        ...sketch,
        id,
        date: new Date().toISOString(),
      };

      const filtered = prev.filter((s) => s.id !== id);
      const next = [updatedSketch, ...filtered].slice(0, MAX_SKETCHES);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save whiteboard to localStorage", err);
        // If quota exceeded, try to evict oldest entries manually
        try {
          const reduced = next.slice(0, next.length - 2);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
        } catch {}
      }
      return next;
    });
  }, []);

  const deleteSketch = useCallback((id) => {
    setSketches((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        if (next.length === 0) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch {}
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSketches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return { sketches, saveSketch, deleteSketch, clearHistory };
}
