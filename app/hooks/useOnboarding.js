"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "teachloop-onboarded";

export function useOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("tour") === "off") {
          setShow(false);
          return;
        }
      }
      const onboarded = localStorage.getItem(STORAGE_KEY);
      if (!onboarded) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    setShow(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }, []);

  return { show, dismiss };
}
