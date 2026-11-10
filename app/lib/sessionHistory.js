export const STORAGE_KEY = "teachloop-sessions";
export const MAX_SESSIONS = 20;

export function parseSessions(rawJson) {
  if (!rawJson || typeof rawJson !== "string") return [];
  try {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item === "object" && item.id !== undefined
    );
  } catch {
    return [];
  }
}

export function addSessionToList(sessions = [], newSession = {}, max = MAX_SESSIONS) {
  if (!newSession || typeof newSession !== "object") return [...sessions].slice(0, max);
  const entry = {
    id: newSession.id || Date.now(),
    date: newSession.date || new Date().toISOString(),
    ...newSession,
  };
  const list = Array.isArray(sessions) ? sessions : [];
  return [entry, ...list].slice(0, max);
}

export function deleteSessionFromList(sessions = [], id) {
  if (!Array.isArray(sessions)) return [];
  return sessions.filter((s) => s && s.id !== id);
}

export function serializeSessions(sessions = []) {
  return JSON.stringify(Array.isArray(sessions) ? sessions : []);
}
