"use client";

import { useState, useRef, useCallback, useEffect } from "react";

function useVoice(onChange, answer) {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef(null);
  const ansRef = useRef(answer);
  const restartRef = useRef(false);
  ansRef.current = answer;

  useEffect(() => {
    return () => {
      if (recRef.current) {
        restartRef.current = false;
        try { recRef.current.stop(); } catch (_) {}
        recRef.current = null;
      }
    };
  }, []);

  const SR =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const supported = !!SR;

  const buildRec = () => {
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }
      if (finalText.trim()) {
        const cur = ansRef.current;
        const sep = cur && !cur.endsWith(" ") ? " " : "";
        onChange(cur + sep + finalText.trim() + " ");
        setInterim("");
      } else if (interimText) {
        setInterim(interimText);
      }
    };

    rec.onerror = (e) => {
      if (e.error === "aborted" || e.error === "no-speech") return;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setInterim("Microphone access denied. Check browser permissions.");
      }
      setRecording(false);
    };

    rec.onend = () => {
      if (restartRef.current) {
        try {
          rec.start();
        } catch (e) {
          setRecording(false);
        }
        return;
      }
      setRecording(false);
      setInterim("");
    };

    return rec;
  };

  const start = () => {
    if (!SR) return;
    restartRef.current = true;
    const rec = buildRec();
    try {
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch (e) {
      setInterim("Could not start voice input. Check microphone permissions.");
      restartRef.current = false;
    }
  };

  const stop = () => {
    restartRef.current = false;
    recRef.current?.stop();
    recRef.current = null;
    setRecording(false);
    setInterim("");
  };

  return {
    recording,
    supported,
    interim,
    toggle: () => (recording ? stop() : start()),
  };
}

export { useVoice };
