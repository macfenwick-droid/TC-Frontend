import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase is used only for Google OAuth (and the password-recovery link session).
 * Sessions are exchanged with the FastAPI backend, which owns the real auth cookies.
 *
 * Created lazily in the browser so server rendering and builds never need the keys.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  client = createClient(url, anonKey);
  return client;
}
