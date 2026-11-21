# Roadmap

Open or unverified items only. What exists is in [[features-built]].

- **Turn on the Supabase keep-alive query:** add the repo secret `SUPABASE_DB_URL` (the session pooler connection string; keep `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for the REST step), run the "Keep Supabase awake" workflow once by hand from the Actions tab and check both steps pass, then confirm the project is not paused after two weeks.
- **Test the assistant key end to end on the live site:** the `ai_keys` migration was run (reported by the author) and `KEY_ENCRYPTION_SECRET` is set in Vercel Production (checked 2026-11-05), but nobody has saved a key and had the assistant answer yet. Also confirm the migration ran in the Supabase project the Vercel variables point to.
- **Verify with real services:** sign in and sign up, the workspace, and the assistant against the real model with a new Supabase project and the Google AI key. The assistant was only tested with a stubbed reply.
- **Move the live site to the new Supabase project** (update environment variables in Vercel). The live site still uses the old project and its data.
- **Restyle the workspace** to share more with the landing page, or leave it neutral. Decided only for the empty state, icons and assistant ink so far (see [[decisions]]).
- **Draw a real logo mark.** The N tile is a placeholder.
- **Review the reset-password and new-password screens** in a browser; only sign in and create account were looked at.
- **Lint debt** in the older editor, sidebar and hook files.
- **Refresh the code map** with `python -m graphify update .` after larger changes (see [[gotchas]]).
