// Shared by the request proxy and the session code, so it must stay free of
// server-only imports. `__Host-` pins the cookie to this exact host over HTTPS.
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-enfinito_session" : "enfinito_session";

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
