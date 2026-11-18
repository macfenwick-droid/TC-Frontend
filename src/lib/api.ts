/**
 * Browser client for the TicketCricket FastAPI backend (seller side only — admin calls
 * stay in the old app). Ported from sport-spectacle-hub/src/lib/api.ts with the same
 * request, refresh and session-expiry behaviour.
 *
 * Calls go to same-origin `/api/*` (proxied by next.config.ts) with cookies included.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

// ---------------------------------------------------------------------------
// Response types (mirrors backend/src/schemas)
// ---------------------------------------------------------------------------

export type AuthUser = {
  user_id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  phone_verified?: boolean;
  provider?: string | null;
  is_admin?: boolean;
  is_super_admin?: boolean;
};

export type TicketGroupStatus =
  | "in_review"
  | "offered"
  | "cancelled"
  | "awaiting_transfer"
  | "awaiting_payout"
  | "paid";

export type TicketGroup = {
  id: number;
  ticket_group_id: number;
  user_id: string;
  event_name: string;
  event_date: string; // YYYY-MM-DD
  event_time?: string | null; // HH:MM:SS
  primary_site?: string | null;
  venue?: string | null;
  state?: string | null;
  section?: string | null;
  row?: string | null;
  findticker_event_id?: string | null;
  seat_numbers?: unknown;
  quantity: number;
  is_restricted_view: boolean;
  created_by: string;
  status: TicketGroupStatus;
  payout_method_id?: number | null;
  created_at: string;
  updated_at: string;
  latest_quote_total_price?: string | number | null;
  cancellation_reason?: string | null;
  latest_quote_reason?: string | null;
  team?: string | null;
  face_value?: string | number | null;
  is_season_ticket?: boolean;
};

export type Quote = {
  id: number;
  ticket_group_id: number;
  unit_price: string;
  total_price: string;
  status: string;
  reason?: string | null;
  created_at: string;
  updated_at: string;
  valid_until?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  expired_at?: string | null;
};

export type QuoteWithTicketGroup = {
  quote: Quote;
  ticket_group: TicketGroup;
};

export type PayoutMethod = {
  id: number;
  user_id: string;
  company: string;
  account: string;
  is_default: boolean;
};

// ---- Sell-flow event search (findticker) ----
export type SellEvent = {
  event_id: string;
  name: string;
  local_date: string | null; // e.g. "2026-10-30T19:00:00-04:00[America/New_York]"
  utc_date: string | null;
  venue: string | null;
  city: string | null;
};
export type SellSection = { section: string; ga: boolean };

// ---------------------------------------------------------------------------
// Errors & session expiry
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** The access token is gone and refreshing it failed — the user has to sign in again. */
export class SessionExpiredError extends ApiError {
  constructor() {
    super("Your session has expired. Please sign in again.", 401);
    this.name = "SessionExpiredError";
  }
}

export const isSessionExpired = (error: unknown): error is SessionExpiredError =>
  error instanceof SessionExpiredError;

type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

/**
 * Called when a request finds the session unrecoverable, so the app can clear
 * whatever it still believes about the signed-in user. Returns an unsubscribe fn.
 */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

function notifySessionExpired() {
  sessionExpiredListeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Session expiry listener failed", err);
    }
  });
}

// Concurrent 401s share one refresh instead of firing a burst of them.
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((resp) => resp.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/**
 * A 401 from most auth endpoints means bad credentials, not a stale session. The
 * exceptions are /auth/me and /auth/logout: both need a live access token, and
 * logout in particular must go through so the server revokes the refresh token
 * instead of leaving it valid for another 30 days.
 */
const RECOVERABLE_AUTH_PATHS = new Set(["/auth/me", "/auth/logout"]);
const canRecoverFrom401 = (path: string) =>
  !path.startsWith("/auth/") || RECOVERABLE_AUTH_PATHS.has(path);

async function request<T = unknown>(path: string, options: RequestInit = {}, isReplay = false): Promise<T> {
  const resp = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const contentType = resp.headers.get("content-type");
  const data = contentType?.includes("application/json") ? await resp.json() : await resp.text();

  if (!resp.ok) {
    // Access tokens only last an hour. Trade the refresh cookie for a new one and
    // replay the call once, so a tab left open overnight keeps working.
    if (resp.status === 401 && canRecoverFrom401(path)) {
      if (!isReplay && (await refreshSession())) {
        return request<T>(path, options, true);
      }
      notifySessionExpired();
      throw new SessionExpiredError();
    }
    const detail = (data as { detail?: unknown } | null)?.detail || resp.statusText;
    throw new ApiError(typeof detail === "string" ? detail : JSON.stringify(detail), resp.status);
  }
  return data as T;
}

const json = (body: unknown) => JSON.stringify(body);

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const api = {
  // ---- Auth ----
  checkEmail: (email: string) =>
    request<{ exists: boolean }>("/auth/check-email", { method: "POST", body: json({ email }) }),

  authConfig: () => request<{ phone_verification_enabled: boolean }>("/auth/config", { method: "GET" }),

  requestSignupOtp: (payload: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  }) => request<{ success: boolean }>("/auth/signup/request-otp", { method: "POST", body: json(payload) }),

  resendSignupOtp: (email: string) =>
    request<{ success: boolean }>("/auth/signup/resend-otp", { method: "POST", body: json({ email }) }),

  // Phone verification (Twilio Verify). send returns the normalized E.164 number;
  // verify returns a short-lived proof token to pass to signup/exchange.
  phoneSendOtp: (phone: string) =>
    request<{ success: boolean; phone: string }>("/auth/phone/send-otp", { method: "POST", body: json({ phone }) }),

  phoneVerifyOtp: (phone: string, code: string) =>
    request<{ success: boolean; phone_verification_token: string }>("/auth/phone/verify-otp", {
      method: "POST",
      body: json({ phone, code }),
    }),

  verifySignup: (payload: { email: string; token: string; phone_verification_token: string }) =>
    request<AuthUser>("/auth/signup/verify", { method: "POST", body: json(payload) }),

  login: (payload: { email: string; password: string }) =>
    request<AuthUser>("/auth/login/email", { method: "POST", body: json(payload) }),

  exchange: (payload: {
    access_token: string;
    refresh_token: string;
    provider: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    phone_number?: string | null;
    phone_verification_token?: string | null;
  }) => request<AuthUser>("/auth/exchange", { method: "POST", body: json(payload) }),

  refresh: () => request<AuthUser>("/auth/refresh", { method: "POST" }),

  me: () => request<AuthUser>("/auth/me", { method: "GET" }),

  logout: () => request("/auth/logout", { method: "POST" }),

  forgotPassword: (email: string) =>
    request("/auth/forgot-password", { method: "POST", body: json({ email }) }),

  updatePassword: (new_password: string) =>
    request("/auth/password", { method: "POST", body: json({ new_password }) }),

  updatePasswordWithToken: (new_password: string, accessToken: string) =>
    request("/auth/password/reset-link", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: json({ new_password }),
    }),

  // ---- Ticket groups ----
  createTicketGroup: (payload: {
    event_name: string;
    event_date: string;
    event_time?: string | null;
    venue: string;
    state: string;
    section: string;
    row: string;
    seat_numbers?: string | null;
    quantity: number;
    is_restricted_view: boolean;
    primary_site?: string | null;
    team?: string | null;
    face_value?: number | null;
    is_season_ticket?: boolean;
    gclid?: string | null;
    findticker_event_id?: string | null;
  }) =>
    request<{ id: number; ticket_group_id: number }>("/ticket-groups", { method: "POST", body: json(payload) }),

  createSeasonTicketGroups: (payload: {
    team: string;
    section: string;
    row: string;
    seat_numbers?: string | null;
    quantity: number;
    face_value: number;
    games: Array<{ name: string; date: string; time: string; venue: string; state: string }>;
    gclid?: string | null;
  }) =>
    request<{ ticket_group_ids: number[] }>("/ticket-groups/season", { method: "POST", body: json(payload) }),

  listTicketGroups: (statuses?: TicketGroupStatus[]) => {
    const params =
      statuses && statuses.length
        ? `?${statuses.map((s) => `statuses=${encodeURIComponent(s)}`).join("&")}`
        : "";
    return request<TicketGroup[]>(`/ticket-groups${params}`, { method: "GET" });
  },

  // ---- Payout methods ----
  listPayoutMethods: () => request<PayoutMethod[]>("/payout-methods", { method: "GET" }),
  createPayoutMethod: (payload: { company: string; account: string; is_default?: boolean }) =>
    request<PayoutMethod>("/payout-methods", { method: "POST", body: json(payload) }),
  updatePayoutMethod: (id: number, payload: { company?: string; account?: string; is_default?: boolean }) =>
    request<PayoutMethod>(`/payout-methods/${id}`, { method: "PATCH", body: json(payload) }),
  deletePayoutMethod: (id: number) => request(`/payout-methods/${id}`, { method: "DELETE" }),
  setDefaultPayoutMethod: (id: number) =>
    request<PayoutMethod>(`/payout-methods/${id}/default`, { method: "POST" }),

  // ---- Quotes (offers) ----
  getQuoteForTicketGroup: (ticket_group_id: number) =>
    request<QuoteWithTicketGroup>(`/quotes/${ticket_group_id}`, { method: "GET" }),
  acceptQuote: (quote_id: number) =>
    request<QuoteWithTicketGroup>(`/quotes/${quote_id}/accept`, { method: "POST" }),
  rejectQuote: (quote_id: number) =>
    request<QuoteWithTicketGroup>(`/quotes/${quote_id}/reject`, { method: "POST" }),

  // ---- Contact form (old app called fetch directly; same endpoint and body) ----
  submitContact: (payload: {
    first_name: string;
    last_name: string;
    email: string;
    subject: string;
    message: string;
  }) => request("/contact", { method: "POST", body: json(payload) }),

  // ---- Sell-flow event search (findticker, PUBLIC, price-free) ----
  ticketPricingSearch: (q: string) =>
    request<SellEvent[]>(`/ticket-pricing/search?q=${encodeURIComponent(q)}`, { method: "GET" }),
  ticketPricingSections: (eventId: string) =>
    request<SellSection[]>(`/ticket-pricing/sections?event_id=${encodeURIComponent(eventId)}`, { method: "GET" }),
  ticketPricingRows: (eventId: string, section: string) =>
    request<string[]>(
      `/ticket-pricing/rows?event_id=${encodeURIComponent(eventId)}&section=${encodeURIComponent(section)}`,
      { method: "GET" }
    ),
};
