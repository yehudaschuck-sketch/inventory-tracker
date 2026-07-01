"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import Login from "@/components/Login";
import InventoryApp from "@/components/InventoryApp";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Local demo mode: no account needed, jump straight into the app.
  if (!isSupabaseConfigured) return <InventoryApp addedBy={null} />;
  if (!ready)
    return <p className="py-20 text-center text-sm text-zinc-400">Loading…</p>;
  if (!session) return <Login />;
  return <InventoryApp addedBy={session.user.email ?? null} />;
}
