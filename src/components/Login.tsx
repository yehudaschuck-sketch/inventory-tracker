"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    const supabase = getSupabase();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      // On success, the auth listener in page.tsx swaps to the app.
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (!data.session) {
        // Email confirmation is still on — no session yet.
        setNotice(
          "Account created. If email confirmation is on, check your inbox to confirm before signing in."
        );
        setMode("signin");
      }
      // If a session came back, the auth listener logs us straight in.
    }
    setLoading(false);
  }

  const field =
    "rounded-lg border border-zinc-300 bg-transparent px-4 py-3 text-base outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100";

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">📦 Inventory Tracker</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {mode === "signin"
            ? "Sign in to your team inventory"
            : "Create your account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={field}
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (at least 6 characters)"
          className={field}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-green-700">{notice}</p>}
      </form>

      <button
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setNotice(null);
        }}
        className="text-center text-sm text-zinc-500 underline"
      >
        {mode === "signin"
          ? "Need an account? Create one"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
