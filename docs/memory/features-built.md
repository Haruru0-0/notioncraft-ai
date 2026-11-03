# Features built

How it is put together: [[architecture]].

- **Landing page** (`/`): "The Forme" look, wood-type headline, interactive sample editor where a canned rewrite is accepted or rejected. Signed-in visitors redirect to `/workspace`.
- **Auth** (`/auth`): centred form in an iron frame. Sign in / create account (with confirm password), forgot password, set new password (recovery link).
- **Workspace** (`/workspace`): collapsible sidebar with search, favourites, nested page tree, trash with restore, tags; centred editor column; outline (table of contents) panel; character and word count.
- **Editor**: Tiptap with slash menu, bubble toolbar (fonts, colours, highlight, alignment, links), block drag handle, tables, task lists, code blocks with highlighting, KaTeX maths, callouts, toggles, images, data tables.
- **Assistant, in page**: select text, Assistant menu rewrites it in rubine until Accept or Reject. Reject restores the original. Unresolved suggestions are saved with the page.
- **Assistant, chat**: side panel (drawer on phones); Insert adds the reply as a pending suggestion.
- **Pages**: line-icon page icons (legacy emoji still render), Undo toast after moving a page to trash, first-run empty state.
- **Profile**: display name, avatar upload (storage bucket from `SUPABASE_STORAGE_SETUP.sql`).
- **Theme**: light and dark in the workspace.
