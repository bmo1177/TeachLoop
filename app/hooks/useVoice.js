"use client";

import { useState, useRef, useEffect } from "react";
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
      } else if (interimText) {
        setInterim(interimText);
      }
    };

    rec.onerror = (e) => {
      if (e.error === "aborted" || e.error === "no-speech") return;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setMicError("Microphone access blocked. Type your answer directly below.");
      } else {
        setMicError("Microphone unavailable. You can type your answer directly below.");
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
      const cur = ansRef.current;
      if (cur && cur.trim()) {
        onChange(finalizeTranscript(cur));
      }
    };

    return rec;
  };

  const start = () => {
    if (!SR) return;
    setMicError(null);
    restartRef.current = true;
    const rec = buildRec();
    try {
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch (e) {
      setMicError("Could not start microphone. Type your answer directly below.");
      restartRef.current = false;
    }
  };

  const stop = () => {
    restartRef.current = false;
    recRef.current?.stop();
    recRef.current = null;
    setRecording(false);
    setInterim("");
    const cur = ansRef.current;
    if (cur && cur.trim()) {
      onChange(finalizeTranscript(cur));
    }
  };

  return {
    recording,
    supported,
    interim,
    wasSpoken,
    micError,
    toggle: () => (recording ? stop() : start()),
  };
}

export { useVoice };
