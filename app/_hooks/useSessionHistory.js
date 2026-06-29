"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "teachloop-sessions";
const MAX_SESSIONS = 20;

export function useSessionHistory() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSessions(parsed);
      }
    } catch {}
  }, []);

  const addSession = useCallback((session) => {
    setSessions((prev) => {
      const next = [{ id: Date.now(), ...session }, ...prev].slice(0, MAX_SESSIONS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSessions([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { sessions, addSession, clearHistory };
}
