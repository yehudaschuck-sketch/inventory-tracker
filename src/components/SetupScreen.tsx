export default function SetupScreen() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">📦 Inventory Tracker</h1>
        <p className="mt-1 text-sm text-zinc-500">Almost ready — one setup step left.</p>
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
        <p className="font-semibold">Supabase isn&apos;t connected yet.</p>
        <p className="mt-1">
          This app stores your team&apos;s items and photos in a free Supabase
          project. To finish setup:
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>
            Create a free account at{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline"
            >
              supabase.com
            </a>{" "}
            and make a new project.
          </li>
          <li>
            In the project, open <span className="font-mono">Settings → API</span>{" "}
            and copy the <span className="font-mono">Project URL</span> and{" "}
            <span className="font-mono">anon public</span> key.
          </li>
          <li>
            Paste them into the <span className="font-mono">.env.local</span> file
            (your developer/Claude will do this), then restart the app.
          </li>
        </ol>
      </div>

      <p className="text-xs text-zinc-400">
        Tip: hand the URL and anon key back to Claude and it will wire everything
        up — including the database table and photo storage.
      </p>
    </div>
  );
}
