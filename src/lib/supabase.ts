import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// True once the team has pasted their Supabase project URL + anon key into
// .env.local. Until then the app shows a setup screen instead of crashing.
export const isSupabaseConfigured = Boolean(url && anonKey);

// A single shared browser client. Created lazily so the app can still render
// the setup screen when the keys are missing.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
    );
  }
  if (!client) {
    client = createClient(url as string, anonKey as string);
  }
  return client;
}

// Storage bucket that holds the uploaded item photos.
export const PHOTO_BUCKET = "item-photos";
