export const FILLER_PATTERN =
  /\b(um+|uh+|er+|ah+|like,?\s*you know,?|you know,?|I mean,?|basically,?|actually,?|sort of,?|kind of,?|right\?*)\b/gi;

export function removeFillers(text) {
  if (!text) return "";
  return text.replace(FILLER_PATTERN, "").replace(/\s{2,}/g, " ").trim();
}

export function deduplicateWords(text) {
  if (!text) return "";
  return text
    .split(/(\s+)/)
    .reduce((acc, token) => {
      if (/^\s+$/.test(token)) {
        acc.push(token);
      } else {
        const prev = acc.length > 1 ? acc[acc.length - 2] : "";
        if (token.toLowerCase() !== prev.toLowerCase()) {
          acc.push(token);
        } else if (acc.length > 0 && /^\s+$/.test(acc[acc.length - 1])) {
          acc.pop();
        }
      }
      return acc;
    }, [])
    .join("");
}

export function capitalizeFirstLetter(text) {
  if (!text) return "";
  const trimmed = text.trimStart();
  const leadingWhitespace = text.slice(0, text.length - trimmed.length);
  if (!trimmed) return text;
  return leadingWhitespace + trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function fixPunctuation(text, isTerminal = false) {
  if (!text) return "";
  let t = text.replace(/\s{2,}/g, " ").trim();
  if (isTerminal && t && !/[.!?;:]$/.test(t)) {
    t += ".";
  }
  return t;
}

export function cleanTranscript(text, { isTerminal = false } = {}) {
  if (!text) return text;
  const withoutFillers = removeFillers(text);
  const deduped = deduplicateWords(withoutFillers);
  return fixPunctuation(deduped, isTerminal);
}

export function finalizeTranscript(fullTranscript) {
  if (!fullTranscript || !fullTranscript.trim()) return "";
  const cleaned = cleanTranscript(fullTranscript, { isTerminal: true });
  return capitalizeFirstLetter(cleaned);
}
