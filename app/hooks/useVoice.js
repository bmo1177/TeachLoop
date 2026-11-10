"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  cleanTranscript,
  capitalizeFirstLetter,
  finalizeTranscript,
} from "@/app/lib/transcript";

function useVoice(onChange, answer) {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [wasSpoken, setWasSpoken] = useState(false);
  const [micError, setMicError] = useState(null);
  const [micStatus, setMicStatus] = useState("");

  const recRef = useRef(null);
  const ansRef = useRef(answer);
  const restartRef = useRef(false);
  const retryCountRef = useRef(0);
  const timestampsRef = useRef([]);

  ansRef.current = answer;

  useEffect(() => {
    return () => {
      if (recRef.current) {
        restartRef.current = false;
        try {
          recRef.current.stop();
        } catch (_) {}
        recRef.current = null;
      }
    };
  }, []);

  const SR =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const supported = !!SR;

  const buildRec = useCallback(() => {
    if (!SR) return null;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      const now = Date.now();

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += transcript;
          timestampsRef.current.push(now);
        } else {
          interimText += transcript;
        }
      }

      if (finalText.trim()) {
        const cleaned = cleanTranscript(finalText, { isTerminal: false });
        if (!cleaned) return;
        const cur = ansRef.current;
        const sep = cur && !cur.endsWith(" ") ? " " : "";
        let combined = cur + sep + cleaned;
        if (!cur) {
          combined = capitalizeFirstLetter(combined);
        }
        onChange(combined + " ");
        setWasSpoken(true);
        setInterim("");
        setMicStatus("");
        retryCountRef.current = 0; // Reset retries on successful input
      } else if (interimText) {
        setInterim(interimText);
      }
    };

    rec.onerror = (e) => {
      if (e.error === "aborted") return;

      // Handle transient errors with up to 2 retries
      if (e.error === "no-speech" || e.error === "network") {
        if (restartRef.current && retryCountRef.current < 2) {
          retryCountRef.current += 1;
          setMicStatus(
            `Reconnecting microphone (attempt ${retryCountRef.current} of 2)...`
          );
          try {
            rec.abort();
            setTimeout(() => {
              if (restartRef.current && recRef.current) {
                try {
                  recRef.current.start();
                } catch (_) {}
              }
            }, 300);
          } catch (_) {}
          return;
        }
        if (e.error === "no-speech") {
          // If no speech detected after retries, keep quiet without harsh error
          return;
        }
        setMicError("Microphone network interrupted. You can type your answer below or try again.");
        setRecording(false);
        setMicStatus("");
        return;
      }

      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setMicError("Microphone access blocked. Type your answer directly below.");
      } else {
        setMicError("Microphone unavailable. You can type your answer directly below.");
      }
      setRecording(false);
      setMicStatus("");
      restartRef.current = false;
    };

    rec.onend = () => {
      if (restartRef.current) {
        try {
          rec.start();
        } catch (_) {
          setRecording(false);
          setMicStatus("");
        }
        return;
      }
      setRecording(false);
      setInterim("");
      setMicStatus("");
      retryCountRef.current = 0;

      const cur = ansRef.current;
      if (cur && cur.trim()) {
        onChange(finalizeTranscript(cur));
      }
    };

    return rec;
  }, [SR, onChange]);

  const start = useCallback(() => {
    if (!SR) return;
    setMicError(null);
    setMicStatus("");
    retryCountRef.current = 0;
    timestampsRef.current = [];
    restartRef.current = true;

    const rec = buildRec();
    if (!rec) return;

    try {
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch (_) {
      setMicError("Could not start microphone. Type your answer directly below.");
      restartRef.current = false;
      setRecording(false);
    }
  }, [SR, buildRec]);

  const stop = useCallback(() => {
    restartRef.current = false;
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch (_) {}
      recRef.current = null;
    }
    setRecording(false);
    setInterim("");
    setMicStatus("");
    retryCountRef.current = 0;

    const cur = ansRef.current;
    if (cur && cur.trim()) {
      onChange(finalizeTranscript(cur));
    }
  }, [onChange]);

  return {
    recording,
    supported,
    interim,
    wasSpoken,
    micError,
    micStatus,
    toggle: () => (recording ? stop() : start()),
  };
}

export { useVoice };
