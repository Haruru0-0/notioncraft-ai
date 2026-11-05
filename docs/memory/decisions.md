# Decisions

Newest first. Reasons marked (inferred) were not stated by the author.

- **2026-11-05: the assistant uses each person's own Gemini key.** The author asked that users add their own key (same idea as Nebula). Keys are stored encrypted per user in `ai_keys` and never sent back; there is no shared key in production. The AI routes also now require a login, because before this anyone could call them with the owner's key.

- **2026-11-03: sign-in screens centred.** The left-aligned layout copied the landing page but left a one-form screen mostly empty. See [[features-built]].
- **2026-11-03: assistant edits in place, not only in chat.** The landing page promised in-page writing but the app only had a chat sidebar, so the feature was built to match instead of softening the copy. Pending text uses one ink (`--ai-ink`, rubine #d6244a) with white text for contrast. See [[architecture]].
- **2026-11-03: landing page look = "The Forme"** (reflex blue sheet, iron chase, wood-type headline, rubine only for assistant text). Chosen by the author from a dealt hand; recorded in `DESIGN.md`. The workspace stays neutral on purpose: long writing is easier on a calm screen (inferred).
- **2026-11-03: audience is recruiters and engineers** (portfolio piece first). In `PRODUCT.md`.
- **2026-11-03: logo mark may be redrawn;** the name "NotionCraft AI" stays. The current N is a placeholder tile.
- **2026-11-03: page icons are line icons** saved as `lucide:<key>`. Existing emoji icons are left as they are.
- **Repo and mirrors:** GitHub `Haruru0-0/notioncraft-ai` (moved from the old `AhmadKanaan0` account), mirrored to GitLab by `mirror-to-gitlab.yml`. The mirror script now lives in the `dev-tools` repo.
- **Work lands on `master`** (default branch is `master`, not `main`).
