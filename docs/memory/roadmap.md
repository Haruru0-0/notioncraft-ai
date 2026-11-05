# Roadmap

Open or unverified items only. What exists is in [[features-built]].

- **Turn on the Supabase keep-alive:** add the repo secrets `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, run the "Keep Supabase awake" workflow once by hand from the Actions tab and check it shows HTTP 200.
- **Run the `ai_keys` migration and set `KEY_ENCRYPTION_SECRET`** on the Supabase project and in Vercel, then save a real Gemini key and check chat and in-page rewrites end to end (see [[gotchas]]).
- **Verify with real services:** sign in and sign up, the workspace, and the assistant against the real model with a new Supabase project and the Google AI key. The assistant was only tested with a stubbed reply.
- **Move the live site to the new Supabase project** (update environment variables in Vercel). The live site still uses the old project and its data.
- **Restyle the workspace** to share more with the landing page, or leave it neutral. Decided only for the empty state, icons and assistant ink so far (see [[decisions]]).
- **Draw a real logo mark.** The N tile is a placeholder.
- **Review the reset-password and new-password screens** in a browser; only sign in and create account were looked at.
- **Lint debt** in the older editor, sidebar and hook files.
- **Refresh the code map** with `python -m graphify update .` after larger changes (see [[gotchas]]).
