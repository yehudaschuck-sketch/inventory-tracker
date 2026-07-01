// Chooses the data backend at runtime: the cloud (Supabase) one if keys are
// configured, otherwise the local IndexedDB demo backend. Both expose the same
// functions, so the rest of the app doesn't care which is active.
import { isSupabaseConfigured } from "./supabase";
import * as cloud from "./items";
import * as local from "./local";

export const db = isSupabaseConfigured ? cloud : local;
export const isLocalMode = !isSupabaseConfigured;
