# Design

Landing page only (`src/app/page.tsx`, `src/app/forme.css`, `src/components/landing/Forme.tsx`). The workspace keeps the shadcn neutral theme in `globals.css`.

## World: The Forme
A letterpress forme: notes are blocks of type locked in an iron chase, and the assistant is the compositor who sets new lines.

## Colour
- Reflex blue `#1d36c9`: the sheet (ground), about 90% of the page.
- Forme bed `#142a9e`: the editor bed inside the chase.
- Type `#f7f7f2`: all human-written text and primary buttons. Dim type `#c9d0f5` for secondary copy (about 5.4:1 on the sheet).
- Iron `#1c1d20`: the chase and button text.
- Rubine `#d6244a`: the only ink for what the assistant wrote. Always a filled slug with white text (about 5:1), never text on blue.

## Type
- Display: Alfa Slab One, one weight, `clamp` 2.75rem to 5.5rem, balanced, leading about 1.02.
- Body and UI: Schibsted Grotesk.
- Headlines never take a second colour or italic. Emphasis comes from size.

## Components
- No cards. The chase is the only enclosure on the page.
- Buttons: off-white fill with iron text (primary) or a 1px dim-type outline (secondary); square 2px corners.
- Assistant states are marks, not hues: `[ ]` brackets while pending and a lock icon once accepted. Rejecting puts the original text back, as the editor does. In the app, pending assistant text is a rubine highlight (`--ai-ink`) with an Accept/Reject bar.
- Focus: 2px off-white outline, 3px offset.

## Motion
One authored moment: the assistant types a line into the forme (18ms per character, blinking caret). Reduced motion shows the finished line at once and removes the blink. No entrance animations elsewhere.

## Content rules
The demo is sample text, labelled as such. No testimonials, customer counts or benchmarks.
