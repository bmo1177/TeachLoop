"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const FILLER_PATTERN =
  /\b(um+|uh+|er+|ah+|like,?\s*you know,?|you know,?|I mean,?|basically,?|actually,?|sort of,?|kind of,?|right\?*)\b/gi;

function removeFillers(text) {
  return text.replace(FILLER_PATTERN, "").replace(/\s{2,}/g, " ").trim();
}

function deduplicateWords(text) {
  return text
    .split(/(\s+)/)
    .reduce((acc, token) => {
      if (/^\s+$/.test(token)) {
        acc.push(token);
      } else {
        const prev = acc.length > 1 ? acc[acc.length - 2] : "";
        if (token.toLowerCase() !== prev.toLowerCase()) {
          acc.push(token);
        }
      }
      return acc;
    }, [])
    .join("");
}

function fixPunctuation(text) {
  let t = text.replace(/\s{2,}/g, " ").trim();
  if (t && !/[.!?;:]$/.test(t)) t += ".";
  return t;
}

function cleanTranscript(text) {
  if (!text) return text;
  return fixPunctuation(deduplicateWords(removeFillers(text)));
}

function useVoice(onChange, answer) {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [wasSpoken, setWasSpoken] = useState(false);
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
        const cleaned = cleanTranscript(finalText);
        if (!cleaned) return;
        const cur = ansRef.current;
        const sep = cur && !cur.endsWith(" ") ? " " : "";
        onChange(cur + sep + cleaned + " ");
        setWasSpoken(true);
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
    wasSpoken,
    toggle: () => (recording ? stop() : start()),
  };
}

export { useVoice };
