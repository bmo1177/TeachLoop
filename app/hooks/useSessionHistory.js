"use client";
import { useState, useEffect, useCallback } from "react";
import {
  STORAGE_KEY,
  parseSessions,
  addSessionToList,
  deleteSessionFromList,
  serializeSessions,
} from "@/app/lib/sessionHistory";

export function useSessionHistory() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSessions(parseSessions(raw));
      }
    } catch {}
  }, []);

  const addSession = useCallback((session) => {
    setSessions((prev) => {
      const next = addSessionToList(prev, session);
      try {
        localStorage.setItem(STORAGE_KEY, serializeSessions(next));
      } catch {}
      return next;
    });
  }, []);

  const deleteSession = useCallback((id) => {
    setSessions((prev) => {
      const next = deleteSessionFromList(prev, id);
      try {
        if (next.length === 0) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          localStorage.setItem(STORAGE_KEY, serializeSessions(next));
        }
      } catch {}
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSessions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return { sessions, addSession, deleteSession, clearHistory };
}

export { STORAGE_KEY };
