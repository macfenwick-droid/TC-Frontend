/** FastAPI backend origin used when API_PROXY_TARGET is not set. */
export const DEFAULT_API_PROXY_TARGET = "https://ticket-cricket-be.onrender.com";

/** Backend origin (no trailing slash). Server-side only value; the browser uses `/api`. */
export const apiProxyTarget = () =>
  (process.env.API_PROXY_TARGET || DEFAULT_API_PROXY_TARGET).replace(/\/+$/, "");

/**
 * API base for code that runs on both server and client: the browser goes through the
 * same-origin `/api` proxy; server components call the backend directly.
 */
export const universalApiBase = () =>
  typeof window === "undefined"
    ? `${apiProxyTarget()}/api`
    : process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
