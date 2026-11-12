// Who is playing on this device, and how they got here.

const PLAYER_ID_KEY = "pgc_player_id";
const ATTRIBUTION_KEY = "pgc_attribution";

export interface Attribution {
  eventCode?: string;
  source?: string;
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private mode: the session just won't survive a reload.
  }
}

export const getStoredPlayerId = () => read(PLAYER_ID_KEY);
export const storePlayerId = (id: string | null) => write(PLAYER_ID_KEY, id);

/**
 * Print a different link on each QR code or NFC tag:
 *   ?e=usask-career-fair&src=qr
 * e is the event, src is the entry point. Both are saved with the sign-up.
 */
export function captureAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const fromUrl: Attribution = {
    eventCode: params.get("e") ?? params.get("event") ?? undefined,
    source: params.get("src") ?? undefined,
  };
  let stored: Attribution = {};
  try {
    stored = JSON.parse(read(ATTRIBUTION_KEY) ?? "{}");
  } catch {
    stored = {};
  }
  const merged = { ...stored, ...Object.fromEntries(Object.entries(fromUrl).filter(([, v]) => v)) };
  write(ATTRIBUTION_KEY, JSON.stringify(merged));
  return merged;
}

/** Turns a ConvexError (or anything else) into a line of text for the UI. */
export function errorMessage(err: unknown, fallback: string) {
  const data = (err as { data?: unknown } | null)?.data;
  return typeof data === "string" ? data : fallback;
}
