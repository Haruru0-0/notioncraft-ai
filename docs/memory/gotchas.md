# Gotchas

See [[architecture]] for the pieces involved.

- **No env, no app.** `src/lib/supabase/client.ts` throws on load without Supabase keys, so every route fails. Copy `.env.example` to `.env.local`. The publishable key is read under two names (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` in `client.ts`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `proxy.ts`): set both.
- **README env names are stale** (`..._ANON_KEY`, `GOOGLE_API_KEY`). The code reads the publishable key names above and the Google SDK default `GOOGLE_GENERATIVE_AI_API_KEY` (not tested here).
- **A new Supabase project is empty.** Run `supabase/migrations/20260121101459_remote_schema.sql` in the SQL editor (tables, security rules, profile trigger), then `SUPABASE_STORAGE_SETUP.sql`. Do not use `yarn db:push` for that: it skips the security rules and the trigger. An account made before the trigger existed has no profile row; backfill with an insert from `auth.users`.
- **`drizzle.config.ts` reads `.env`, not `.env.local`.** Put `DATABASE_URL` in `.env` for `db:*` commands.
- **A dev server may serve stale CSS** after edits to `globals.css` (seen with an already-running `next dev`). Restart it. Only one `next dev` per folder can run (lock file).
- **Do not set up a throwaway copy with a junction `node_modules` under Turbopack:** it fails ("symlink points out of the filesystem root"). `next dev --webpack` works.
- **Application Control blocks some tools on this machine** (`graphify.exe`, Flutter's `gen_snapshot`). Graphify works as `python -m graphify update .` (run with the author's approval, 2026-11-03). The memory-sync hook calls the blocked `graphify.exe` and hides its output, so it can say "map refreshed" when nothing ran: check that `graphify-out/` exists and its commit matches `git rev-parse HEAD`.
- **Graphify skips `.sql` files** until `pip install "graphifyy[sql]"` (tree_sitter_sql), and does not read the CSS files.
- **Dummy values are enough to render the landing and auth screens,** but the workspace needs a real login.
- **Old editor files carry many lint errors** (`any`, effects that set state). New code is lint-clean; the old ones were left alone.
- **The assistant needs `KEY_ENCRYPTION_SECRET` and the `ai_keys` table.** Without the secret, saving a key answers 503 and the Profile card says so. Run `supabase/migrations/20261105000000_ai_keys.sql` in the Supabase SQL editor of every project (not yet run on the live one). Changing the secret makes saved keys unreadable (`KEY_UNREADABLE`); people add them again.
- **Set `KEY_ENCRYPTION_SECRET` in Vercel and remove `GOOGLE_GENERATIVE_AI_API_KEY` there** if you want everyone to use their own key; while that variable exists it is a shared fallback and its owner pays for it.
- **The AI routes read the session from the request cookie** (`supabaseForRequest`) and never refresh it; the proxy does that on page loads. A very old tab can get 401 until the page is reloaded.
- **Tested here without a real Supabase** (`.env.local` holds dummy values): the encryption round trip, tamper and wrong-secret refusal, the Google check against a fake key, signed-out 401 on all AI routes, and a production build. The signed-in paths (saving, decrypting, a real answer) are untested.
