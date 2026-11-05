# Architecture

See [[features-built]] for behaviour and [[gotchas]] for setup traps.

## Stack
Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4, shadcn/Radix UI, Tiptap editor, GSAP, TanStack Query, Supabase (auth, Postgres, storage), Drizzle ORM, Vercel AI SDK with Google Gemini (`gemini-2.5-flash`).

## Layout (`src/`)
- `app/`: routes. `page.tsx` landing, `auth/` sign in/up/reset, `workspace/` editor app, `workspace/profile/`, `api/ai/chat` and `api/ai/writer` (AI routes, edge runtime for writer).
- `app/forme.css`, `app/forme-fonts.ts`: the landing/auth world ("The Forme"), scoped to `.forme`. The workspace keeps the shadcn neutral theme in `globals.css`.
- `components/editor/`: `NotionEditor` (Tiptap setup), `BubbleToolbar`, `SlashCommands`, `extensions/` (callout, toggle, math, data table, resizable image, font size, `AiSuggestionExtension`), `AiSuggestionBar`.
- `components/landing/`: `Forme` (sample editor demo), `Mark` (the N logo).
- `components/sidebar/`, `ai/AIChatSidebar`, `tags/`, `profile/`, `PageHeader`, `PageIcon`, `ui/` (shadcn).
- `hooks/`: `useAuth`, `usePages` (pages, trash, restore), `useProfile`, `useTags`, `useMediaQuery`.
- `lib/ai-edit.ts`: request/accept/reject the assistant's rewrite. `lib/supabase/{client,server,proxy,types}.ts`, `lib/db/{schema,index}.ts`.

## Data
Tables: `ai_keys` (one encrypted Gemini key per user), `profiles`, `pages` (soft delete via `is_archived`, `parent_id` tree, `icon`, `content` as saved editor HTML), `tags`, `page_tags`. Row-level security limits every row to its owner. A trigger (`handle_new_user`) creates the profile on sign-up. The full schema is `supabase/migrations/20260121101459_remote_schema.sql`.

## AI flow
- Every AI call uses the signed-in person's own Gemini key: `lib/ai-key.ts` (`resolveGeminiKey`) reads the session cookie, loads that person's row from `ai_keys` (row security), decrypts it with `lib/ai-key-crypto.ts` (AES-256-GCM via Web Crypto, secret `KEY_ENCRYPTION_SECRET`), and falls back to `GOOGLE_GENERATIVE_AI_API_KEY` only if the site owner set it. Signed-out requests get 401 and a missing key gets 400 `API_KEY_MISSING`. `api/ai/key` (GET, PUT, DELETE) manages the key: it is checked with Google before saving and only its last four characters are ever returned.
- Chat panel: `AIChatSidebar` posts to `/api/ai/chat`, streams the reply, Insert puts it in the page as a pending suggestion.
- In-page edit: `BubbleToolbar` Assistant menu, then `requestAiEdit` posts `{prompt, type}` to `/api/ai/writer` (types: improve, shorter, longer, grammar, professional). The reply replaces the selection as an `aiSuggestion` mark (`data-ai-id`, `data-ai-original`) until accepted or rejected.

## Deployment
Vercel (live demo notioncraft-ai.vercel.app). GitHub Actions mirrors every push and nightly to a private GitLab copy (`mirror-to-gitlab.yml`), and `keep-supabase-awake.yml` reads one row from Supabase every three days so the free project is not paused for inactivity (needs the repo secrets `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`).
