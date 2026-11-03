# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary audience: recruiters and engineers looking at the author's portfolio. NotionCraft AI is a portfolio piece first, and a working app second. Anyone can still sign up and use the workspace.

Inside the app, the user is someone writing and organizing notes who wants an AI assistant that works in the document itself.

## Product Purpose
A Notion-style note-taking workspace with an AI writing assistant. Users write in a block editor, organize pages in a tree, and ask the assistant to draft or rework content. Success means a visitor understands within seconds that the AI works inside the editor, and sees evidence that the app is real and well built.

## Positioning
AI inside the block editor: select text and the assistant rewrites it in place (improve, shorter, longer, grammar, professional tone). The result stays marked until the writer accepts or rejects it, and rejecting restores the original. A chat panel for questions also exists. (Confirmed by the author; the landing page should show this, not claim more than the app does.)

## Operating Context
Public site at notioncraft-ai.vercel.app. Visitors arrive on the landing page, sign in or sign up (Supabase auth), then work in /workspace: a collapsible sidebar with search, favourites and a page tree, a centred editor column, an outline panel and an AI chat sidebar. Light and dark themes.

## Capabilities and Constraints
- Next.js 16 (App Router), TypeScript, Tailwind CSS, Radix UI / shadcn components, Tiptap editor (tables, task lists, code blocks with highlighting, KaTeX math, character count), GSAP, Supabase (auth, Postgres via Drizzle, storage), Google AI SDK, React Query.
- Features: rich text editing, nested pages, favourites, trash and restore, page icons, tags, table of contents/outline, AI chat sidebar, profile with avatar upload.
- Must respect `prefers-reduced-motion`, keep text contrast at WCAG AA, and work on phones.
- Open decision: the visual direction of the redesign (decided in the next step, not here).

## Brand Commitments
Keep the name "NotionCraft AI". The logo mark (the black/white N) may be redrawn.

## Evidence on Hand
Live demo and source are public. No customer, usage or testimonial claims exist, so none may be shown on the page.
