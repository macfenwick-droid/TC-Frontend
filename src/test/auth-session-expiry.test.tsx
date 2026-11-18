import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const toastSpy = vi.fn();

vi.mock("@/lib/toast", () => ({
  toast: (...args: unknown[]) => toastSpy(...args),
}));

// The provider only needs the Supabase client to exist; nothing here signs in through it.
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({ auth: { setSession: vi.fn(), signInWithOAuth: vi.fn(), signOut: vi.fn() } }),
}));

const SESSION_USER = { user_id: "u1", email: "seller@example.com", first_name: "Sam" };

/** Scripts the backend: /auth/me first, then whatever the test queues. */
function mockBackend(meStatus: number, afterMe: Record<string, Array<{ status: number; body?: unknown }>> = {}) {
  const script: Record<string, Array<{ status: number; body?: unknown }>> = {
    "GET /auth/me": [{ status: meStatus, body: meStatus === 200 ? SESSION_USER : { detail: "Not authenticated" } }],
    ...afterMe,
  };
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input).split("?")[0];
    const method = (init?.method || "GET").toUpperCase();
    const key = Object.keys(script).find((k) => {
      const [m, p] = k.split(" ");
      return m === method && url.endsWith(p);
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
  }));
}

const Probe = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>loading</div>;
  return <div>{user ? `signed in as ${user.email}` : "signed out"}</div>;
};

beforeEach(() => {
  toastSpy.mockClear();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("session expiry reaches the UI", () => {
  it("signs the user out and tells them when the session dies mid-visit", async () => {
    mockBackend(200, {
      "GET /ticket-groups": [{ status: 401 }],
      "POST /auth/refresh": [{ status: 401 }],
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await screen.findByText("signed in as seller@example.com");

    // a call made an hour later, once the access token has lapsed
    await act(async () => {
      await api.listTicketGroups().catch(() => undefined);
    });

    await waitFor(() => expect(screen.getByText("signed out")).toBeInTheDocument());
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy.mock.calls[0][0]).toMatchObject({ title: "Session expired" });
  });

  it("keeps the user signed in when the token refreshes successfully", async () => {
    mockBackend(200, {
      "GET /ticket-groups": [{ status: 401 }, { status: 200, body: [] }],
      "POST /auth/refresh": [{ status: 200, body: {} }],
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await screen.findByText("signed in as seller@example.com");

    await act(async () => {
      await api.listTicketGroups();
    });

    expect(screen.getByText("signed in as seller@example.com")).toBeInTheDocument();
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it("recovers the session on page load when only the access token has lapsed", async () => {
    // /auth/me 401s, the refresh works, and the replayed /auth/me returns the user
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method || "GET").toUpperCase();
      let status = 404;
      let body: unknown = {};
      if (url.endsWith("/auth/refresh") && method === "POST") status = 200;
      else if (url.endsWith("/auth/me")) {
        const first = !(globalThis as Record<string, unknown>).__meCalled;
        (globalThis as Record<string, unknown>).__meCalled = true;
        status = first ? 401 : 200;
        body = first ? { detail: "Not authenticated" } : SESSION_USER;
      }
      return {
        ok: status >= 200 && status < 300,
        status,
        statusText: "",
        headers: { get: () => "application/json" },
        json: async () => body,
        text: async () => JSON.stringify(body),
      } as unknown as Response;
    }));
    delete (globalThis as Record<string, unknown>).__meCalled;

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await screen.findByText("signed in as seller@example.com");
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it("stays quiet for a visitor who was never signed in", async () => {
    mockBackend(401, { "POST /auth/refresh": [{ status: 401 }, { status: 401 }] });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await screen.findByText("signed out");
    expect(toastSpy).not.toHaveBeenCalled();
  });
});
