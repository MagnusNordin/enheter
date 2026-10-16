// localStorage can be missing or throw (private mode, blocked site data, full
// quota), so every access is guarded and the app works without it.

/** Parsed JSON stored under `key`, or null when missing, unreadable or invalid. */
export function loadJson(key: string): unknown {
  try {
    const text = globalThis.localStorage?.getItem(key);
    return text == null ? null : (JSON.parse(text) as unknown);
  } catch {
    return null;
  }
}

/** Stores `value` as JSON. Returns false when storage is unavailable. */
export function saveJson(key: string, value: unknown): boolean {
  try {
    if (!globalThis.localStorage) return false;
    globalThis.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
