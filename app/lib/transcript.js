export const ACRONYM_MAP = {
  api: "API",
  apis: "APIs",
  ai: "AI",
  http: "HTTP",
  https: "HTTPS",
  sql: "SQL",
  json: "JSON",
  css: "CSS",
  html: "HTML",
  ui: "UI",
  ux: "UX",
  db: "DB",
  dbs: "DBs",
  cpu: "CPU",
  gpu: "GPU",
  rest: "REST",
  tcp: "TCP",
  udp: "UDP",
  dns: "DNS",
  cdn: "CDN",
  ci: "CI",
  ram: "RAM",
  url: "URL",
  urls: "URLs",
};

const ACRONYM_REGEX = new RegExp(
  `\\b(${Object.keys(ACRONYM_MAP).join("|")})\\b`,
  "gi"
);

export function applyAcronymCasing(text) {
  if (!text) return "";
  return text.replace(ACRONYM_REGEX, (match) => ACRONYM_MAP[match.toLowerCase()] || match);
}

export const FILLER_PATTERN =
  /\b(um+|uh+|er+|ah+|erm+|hmm+|like,?\s*you know,?|you know,?|I mean,?|basically,?|actually,?|sort of,?|kind of,?|right\?*)\b/gi;

function preserveQuotes(text, fn) {
  const quotes = [];
  const placeholderPrefix = "___TL_QUOTE_";

  // Preserve double-quoted segments
  let masked = text.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
    const key = `${placeholderPrefix}${quotes.length}___`;
    quotes.push(match);
    return key;
  });

  // Preserve balanced single-quoted segments (separated from words to avoid apostrophes like I'm/don't)
  masked = masked.replace(/(^|[\s(])'([^']*)'(?=[.,;:?!\s)]|$)/g, (match, prefix, inner) => {
    const key = `${prefix}${placeholderPrefix}${quotes.length}___`;
    quotes.push(`'${inner}'`);
    return key;
  });

  const processed = fn(masked);

  return processed.replace(
    new RegExp(`${placeholderPrefix}(\\d+)___`, "g"),
    (_, idx) => quotes[Number(idx)] || ""
  );
}

export function removeFillers(text) {
  if (!text) return "";
  return preserveQuotes(text, (str) => {
    let t = str;
    // Remove "like," when used as a clause filler (do not remove similes like "like a toy box")
    t = t.replace(/,\s*like,\s*/gi, " ");
    t = t.replace(/(^|[.,;!?]\s*)like,\s*/gi, "$1");
    t = t.replace(/\s+like,\s*/gi, " ");

    t = t.replace(FILLER_PATTERN, "");
    t = t.replace(/,\s*,/g, ",");
    t = t.replace(/^\s*,\s*/, "");
    return t.replace(/\s{2,}/g, " ").trim();
  });
}

export function deduplicateWords(text) {
  if (!text) return "";
  let result = text;

  // 1. Immediate 3-word phrase repeats (e.g. "in order to in order to")
  result = result.replace(
    /\b([a-zA-Z0-9']+)\s+([a-zA-Z0-9']+)\s+([a-zA-Z0-9']+)[,;]?\s+\1\s+\2\s+\3\b/gi,
    "$1 $2 $3"
  );

  // 2. Immediate 2-word phrase repeats (e.g. "we need we need")
  result = result.replace(
    /\b([a-zA-Z0-9']+)\s+([a-zA-Z0-9']+)[,;]?\s+\1\s+\2\b/gi,
    "$1 $2"
  );

  // 3. Consecutive single words (case-insensitive deduplication)
  result = result.replace(
    /\b([a-zA-Z0-9']+)(?:[,;]?\s+\1\b)+/gi,
    "$1"
  );

  return result.replace(/\s{2,}/g, " ").trim();
}

export function capitalizeFirstLetter(text) {
  if (!text) return "";
  const trimmed = text.trimStart();
  const leadingWhitespace = text.slice(0, text.length - trimmed.length);
  if (!trimmed) return text;
  return leadingWhitespace + trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function capitalizeSentences(text) {
  if (!text) return "";
  let t = text;

  // Pronoun I and common contractions
  t = t.replace(/\bi\b/g, "I");
  t = t.replace(/\bi'm\b/gi, "I'm");
  t = t.replace(/\bi've\b/gi, "I've");
  t = t.replace(/\bi'll\b/gi, "I'll");
  t = t.replace(/\bi'd\b/gi, "I'd");

  // Start of text
  t = t.replace(/^(\s*)([a-z])/g, (_, pre, ch) => pre + ch.toUpperCase());

  // After terminal punctuation + whitespace
  t = t.replace(/([.!?]\s+)([a-z])/g, (_, pre, ch) => pre + ch.toUpperCase());

  // After paragraph breaks
  t = t.replace(/(\n+\s*)([a-z])/g, (_, pre, ch) => pre + ch.toUpperCase());

  // After markdown bullets
  t = t.replace(/(^|\n)(\s*-\s+)([a-z])/g, (_, pre, dash, ch) => pre + dash + ch.toUpperCase());

  return t;
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

export function formatEnumerationsAndParagraphs(text, { pauses = [] } = {}) {
  if (!text) return "";

  // Split into sentences preserving punctuation
  const rawSentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (rawSentences.length === 0) return text;

  const isBulletMarker = (s) =>
    /^(?:first(?:ly)?|second(?:ly)?|third(?:ly)?|fourth(?:ly)?|fifth(?:ly)?|finally|lastly|next|then)\b/i.test(
      s.trim()
    );

  const bulletCandidates = rawSentences.filter(isBulletMarker);

  // Spoken enumerations: convert to markdown bullets if >= 2 markers present
  if (bulletCandidates.length >= 2) {
    const blocks = [];
    let bullets = [];

    for (const s of rawSentences) {
      const trimmed = s.trim();
      if (isBulletMarker(trimmed)) {
        bullets.push(`- ${trimmed}`);
      } else {
        if (bullets.length > 0) {
          blocks.push(bullets.join("\n"));
          bullets = [];
        }
        blocks.push(trimmed);
      }
    }
    if (bullets.length > 0) {
      blocks.push(bullets.join("\n"));
    }
    return blocks.join("\n\n");
  }

  // Paragraph grouping: group 1-3 sentences, split on transition markers or pause hints
  const transitionRegex =
    /^(?:so overall|to summarize|in summary|moving on|in conclusion|overall)\b/i;

  const groups = [];
  let cur = [];

  for (const s of rawSentences) {
    const trimmed = s.trim();
    const isTransition = transitionRegex.test(trimmed);

    if (cur.length >= 3 || (cur.length >= 1 && isTransition)) {
      groups.push(cur.join(" "));
      cur = [trimmed];
    } else {
      cur.push(trimmed);
    }
  }

  if (cur.length > 0) {
    groups.push(cur.join(" "));
  }

  return groups.join("\n\n");
}

export function finalizeTranscript(fullTranscript, options = {}) {
  if (!fullTranscript || !fullTranscript.trim()) return "";
  const cleaned = cleanTranscript(fullTranscript, { isTerminal: true });
  if (!cleaned) return "";

  const withAcronyms = applyAcronymCasing(cleaned);
  const structured = formatEnumerationsAndParagraphs(withAcronyms, options);
  return capitalizeSentences(structured);
}
