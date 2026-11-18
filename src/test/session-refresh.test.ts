import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, SessionExpiredError, api, isSessionExpired, onSessionExpired } from "@/lib/api";

type Call = { url: string; method: string };

/** Queue of responses keyed by "METHOD /path", so each test scripts its own backend. */
function mockBackend(script: Record<string, Array<{ status: number; body?: unknown }>>) {
  const calls: Call[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = (init?.method || "GET").toUpperCase();
    calls.push({ url, method });
    const pathOnly = url.split("?")[0];
    const key = Object.keys(script).find((k) => {
      const [m, p] = k.split(" ");
      return m === method && pathOnly.endsWith(p);
    });
    const queued = key ? script[key].shift() : undefined;
    const status = queued?.status ?? 404;
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: `status ${status}`,
      headers: { get: () => "application/json" },
      json: async () => queued?.body ?? {},
      text: async () => JSON.stringify(queued?.body ?? {}),
    } as unknown as Response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return { calls, fetchMock };
}

const refreshCalls = (calls: Call[]) => calls.filter((c) => c.url.endsWith("/auth/refresh")).length;

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("expired access token", () => {
  it("refreshes once and replays the original request", async () => {
    const { calls } = mockBackend({
      "GET /ticket-groups": [{ status: 401, body: { detail: "Not authenticated" } }, { status: 200, body: [{ id: 1 }] }],
      "POST /auth/refresh": [{ status: 200, body: {} }],
    });

    const result = await api.listTicketGroups();

    expect(result).toEqual([{ id: 1 }]);
    expect(refreshCalls(calls)).toBe(1);
    expect(calls.map((c) => c.url.replace(/^.*\/api/, ""))).toEqual([
      "/ticket-groups",
      "/auth/refresh",
      "/ticket-groups",
    ]);
  });

  it("replays a POST with its body intact", async () => {
    const { calls, fetchMock } = mockBackend({
      "POST /ticket-groups": [{ status: 401 }, { status: 200, body: { ticket_group_id: 7 } }],
      "POST /auth/refresh": [{ status: 200, body: {} }],
    });

    const payload = { event_name: "Test", event_date: "2026-09-01", venue: "V", state: "CA", section: "1", row: "A", quantity: 2, is_restricted_view: false };
    const result = await api.createTicketGroup(payload as Parameters<typeof api.createTicketGroup>[0]);

    expect(result).toEqual({ ticket_group_id: 7 });
    expect(refreshCalls(calls)).toBe(1);
    const replay = fetchMock.mock.calls.at(-1)?.[1] as RequestInit;
    expect(JSON.parse(String(replay.body))).toMatchObject({ event_name: "Test", quantity: 2 });
  });

  it("throws SessionExpiredError and notifies listeners when the refresh fails", async () => {
    mockBackend({
      "GET /ticket-groups": [{ status: 401 }],
      "POST /auth/refresh": [{ status: 401 }],
    });
    const listener = vi.fn();
    const unsubscribe = onSessionExpired(listener);

    const error = await api.listTicketGroups().catch((e) => e);

    expect(error).toBeInstanceOf(SessionExpiredError);
    expect(isSessionExpired(error)).toBe(true);
    expect(error.message).toMatch(/session has expired/i);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("stops after one replay instead of looping", async () => {
    const { calls } = mockBackend({
      "GET /ticket-groups": [{ status: 401 }, { status: 401 }],
      "POST /auth/refresh": [{ status: 200, body: {} }],
    });

    const error = await api.listTicketGroups().catch((e) => e);

    expect(error).toBeInstanceOf(SessionExpiredError);
    expect(refreshCalls(calls)).toBe(1);
    expect(calls).toHaveLength(3); // call, refresh, replay — and stop
  });

  it("shares a single refresh across concurrent 401s", async () => {
    const { calls } = mockBackend({
      "GET /ticket-groups": [{ status: 401 }, { status: 200, body: [] }],
      "GET /payout-methods": [{ status: 401 }, { status: 200, body: [] }],
      "GET /auth/me": [{ status: 401 }, { status: 200, body: { user_id: "u1" } }],
      "POST /auth/refresh": [{ status: 200, body: {} }],
    });

    await Promise.all([api.listTicketGroups(), api.listPayoutMethods(), api.me()]);

    expect(refreshCalls(calls)).toBe(1);
  });

  it("unsubscribed listeners stop being called", async () => {
    mockBackend({
      "GET /ticket-groups": [{ status: 401 }],
      "POST /auth/refresh": [{ status: 401 }],
    });
    const listener = vi.fn();
    onSessionExpired(listener)();

    await api.listTicketGroups().catch(() => undefined);

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("logging out on a lapsed session", () => {
  it("refreshes so the server can actually revoke the refresh token", async () => {
    const { calls } = mockBackend({
      "POST /auth/logout": [{ status: 401 }, { status: 200, body: { success: true } }],
      "POST /auth/refresh": [{ status: 200, body: {} }],
    });

    await api.logout();

    expect(refreshCalls(calls)).toBe(1);
    expect(calls.filter((c) => c.url.endsWith("/auth/logout"))).toHaveLength(2);
  });
});

describe("401s that are not an expired session", () => {
  it("does not refresh on a failed login, and keeps the server's message", async () => {
    const { calls } = mockBackend({
      "POST /auth/login/email": [{ status: 401, body: { detail: "Invalid email or password" } }],
    });

    const error = await api.login({ email: "a@b.co", password: "wrong" }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(isSessionExpired(error)).toBe(false);
    expect(error.message).toBe("Invalid email or password");
    expect(refreshCalls(calls)).toBe(0);
  });

  it("leaves non-401 failures alone", async () => {
    const { calls } = mockBackend({
      "POST /ticket-groups": [{ status: 400, body: { detail: "Quantity must be positive" } }],
    });

    const error = await api
      .createTicketGroup({ quantity: 0 } as Parameters<typeof api.createTicketGroup>[0])
      .catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe("Quantity must be positive");
    expect(refreshCalls(calls)).toBe(0);
  });

  it("passes a 403 through untouched, so a blocked seller sees the server's message", async () => {
    const { calls } = mockBackend({
      "POST /ticket-groups": [
        { status: 403, body: { detail: "Your account has been restricted from creating listings." } },
      ],
    });

    const error = await api
      .createTicketGroup({
        event_name: "Game",
        event_date: "2026-12-01",
        venue: "Stadium",
        state: "WA",
        section: "101",
        row: "A",
        quantity: 2,
        is_restricted_view: false,
      })
      .catch((e) => e);

    expect(error.status).toBe(403);
    expect(error.message).toBe("Your account has been restricted from creating listings.");
    expect(refreshCalls(calls)).toBe(0);
  });
});
