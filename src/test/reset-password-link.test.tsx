import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

// Ported from the current site's test suite (same cases, Next.js router and lazy Supabase client).
const getSession = vi.fn();
const setSession = vi.fn();
const exchangeCodeForSession = vi.fn();
const forgotPassword = vi.fn();
const exchangeFromSupabase = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    auth: {
      getSession: (...args: unknown[]) => getSession(...args),
      setSession: (...args: unknown[]) => setSession(...args),
      exchangeCodeForSession: (...args: unknown[]) => exchangeCodeForSession(...args),
    },
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    exchangeFromSupabase,
    updatePassword: vi.fn(),
    forgotPassword,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

const SESSION = { access_token: "at", refresh_token: "rt", user: { id: "u1" } };

const visit = (url: string) => {
  window.history.replaceState({}, "", url);
  render(<ResetPasswordForm />);
};

beforeEach(() => {
  vi.clearAllMocks();
  getSession.mockResolvedValue({ data: { session: null } });
  exchangeCodeForSession.mockResolvedValue({ data: { session: null }, error: null });
});

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("password reset link", () => {
  it("explains an expired link instead of leaking Supabase's PKCE error", async () => {
    visit(
      "/reset-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired"
    );

    expect(await screen.findByText(/expired or has already been used/i)).toBeInTheDocument();
    expect(screen.queryByText(/code verifier/i)).not.toBeInTheDocument();
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("does not attempt an exchange when the URL carries no code at all", async () => {
    visit("/reset-password");

    expect(await screen.findByText(/expired or has already been used/i)).toBeInTheDocument();
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("offers a way to get a new link, and sends it", async () => {
    forgotPassword.mockResolvedValue(undefined);
    visit("/reset-password");
    await screen.findByText(/expired or has already been used/i);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "seller@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /send a new reset link/i }));

    await waitFor(() => expect(forgotPassword).toHaveBeenCalledWith("seller@example.com"));
    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument();
  });

  it("accepts a working link whose tokens arrive in the hash", async () => {
    setSession.mockResolvedValue({ data: { session: SESSION }, error: null });

    visit("/reset-password#access_token=at&refresh_token=rt&type=recovery");

    expect(await screen.findByRole("heading", { name: /set a new password/i })).toBeInTheDocument();
    expect(setSession).toHaveBeenCalledWith({ access_token: "at", refresh_token: "rt" });
    expect(exchangeFromSupabase).toHaveBeenCalled();
  });

  it("exchanges a real code, passing the code and not the whole URL", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { session: SESSION }, error: null });

    visit("/reset-password?code=abc123");

    expect(await screen.findByRole("heading", { name: /set a new password/i })).toBeInTheDocument();
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc123");
  });

  it("keeps a failed exchange readable", async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: { message: "invalid request: both auth code and code verifier should be non-empty" },
    });

    visit("/reset-password?code=abc123");

    expect(await screen.findByText(/expired or has already been used/i)).toBeInTheDocument();
    expect(screen.queryByText(/code verifier/i)).not.toBeInTheDocument();
  });

  it("goes straight to the form when a session already exists", async () => {
    getSession.mockResolvedValue({ data: { session: SESSION } });

    visit("/reset-password");

    expect(await screen.findByRole("heading", { name: /set a new password/i })).toBeInTheDocument();
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });
});
