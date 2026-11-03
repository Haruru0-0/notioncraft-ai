# NotionCraft AI

Notion-style notes app with an AI writing assistant. Next.js 16, TypeScript, Tailwind 4, Tiptap, Supabase, Drizzle, Vercel AI SDK (Gemini).

## Commands
- `yarn dev`: dev server (needs `.env.local`; copy `.env.example`).
- `npx tsc --noEmit`: type-check. `yarn lint`: ESLint (old editor files have known errors; keep new code clean).
- `yarn build`: production build.
- `yarn db:generate` / `db:push` / `db:studio`: Drizzle (reads `DATABASE_URL` from `.env`, not `.env.local`).
- A new Supabase project is set up with `supabase/migrations/20260121101459_remote_schema.sql`, not `db:push`.

## Conventions
- Default branch is `master`. Commit messages are plain, with no `Co-Authored-By` trailer.
- Landing and auth use "The Forme" (`src/app/forme.css`, `DESIGN.md`); the workspace keeps the shadcn neutral theme. Product truth is in `PRODUCT.md`.
- Assistant-written text is marked with `--ai-ink` until accepted or rejected (`src/lib/ai-edit.ts`).
- Respect `prefers-reduced-motion`; keep text contrast at WCAG AA.

## Memory and code map
- At session start read `docs/memory/index.md`. Save durable decisions there as Markdown (`decisions.md`, `gotchas.md`, and so on).
- `graphify-out/GRAPH_REPORT.md` summarizes code structure when present; refresh with `python -m graphify update .` (on this machine `graphify.exe` is blocked by Application Control, so use the module form; check the report's "Built from commit" against `git rev-parse HEAD`).
