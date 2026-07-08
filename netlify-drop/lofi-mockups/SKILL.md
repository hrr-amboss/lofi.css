---
name: lofi-mockups
description: Create hand-drawn, paper-scribble style lo-fi mockups and wireframes as pure HTML + CSS, in the visual style of Excalidraw or tldraw. Use this skill whenever the user asks for a mockup, wireframe, lo-fi prototype, paper prototype, sketch of a screen or UI, "scribble style" design, or wants to visualize a product idea, user flow, or screen layout at low fidelity — even if they don't say "sketch" explicitly. Also use it when the user references lofi.css or asks for something "in the wireframe style we use".
---

# Lofi Mockups

Produce lo-fi, hand-drawn-looking screen mockups as a single HTML file that links the bundled stylesheet `assets/lofi.css`. The point of this style is to make stakeholders discuss **structure and flow, not visual design**. Everything that could distract from that — color, photography, polish, decoration — is deliberately absent.

## Hard rules (never violate these)

1. **NO EMOJIS. Anywhere.** Not in headings, buttons, labels, notes, placeholder text, or comments. This is a strict rule with no exceptions. Plain typographic glyphs are the only permitted symbols: `✓ ✗ → ← ↑ ↓ ↖ ↗ ↘ ↙ ○ ● – ×`. If you feel the urge to add an emoji, use a word instead ("Note:", "Warning:", "Idea:"). For pictorial icons, use the built-in inline SVG sprite (read `references/icons.md` when a mockup needs icons) — never emojis.
2. **Strictly HTML + lofi.css + text.** No JavaScript. No external images, fonts, icon libraries, or CDN frameworks — the handwriting fonts are embedded inside lofi.css, so a finished mockup makes zero network requests. No Tailwind, no Bootstrap, no Rough.js. Icons come from the bundled scribble sprites only: the 19-icon core sprite in `references/icons.md`, plus the full 1745-icon set (the complete Lucide catalog redrawn in scribble style) in `assets/lofi-icons.svg` — grep it by name and copy the needed `<symbol>` lines inline (lookup instructions in `references/icons.md`). Only if an icon exists in neither, draw a new inline `<symbol>` in the same wobbly-stroke style rather than importing anything.
3. **Grayscale only.** Never introduce a color. All colors come from the CSS custom properties in lofi.css (`--lf-*`). If you need emphasis, use lightness (darker = more important), border style (solid / dashed / double), or texture (stripes, dots) — never hue.
4. **No custom CSS beyond trivial layout.** Inline `style` attributes are allowed only for widths, heights, spacing, and grayscale values already in the palette. Do not write new component styles; if a component seems missing, compose it from existing classes and bare elements.
5. **Images are placeholders.** Use `.lf-placeholder` (optionally `.lf-x` for the crossed-out box) or inline grayscale SVG. Never embed real photos or logos.

## Boilerplate

Every mockup starts from this shell:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mockup — [screen name]</title>
<link rel="stylesheet" href="lofi.css">
</head>
<body class="lofi">
  <div style="max-width: 920px; margin: 0 auto; padding: 2rem 1.5rem;">
    <!-- mockup content -->
  </div>
</body>
</html>
```

The `class="lofi"` on `<body>` is required — every style is scoped under it. Copy `assets/lofi.css` next to the HTML file in the output.

## How the style works (so you don't fight it)

- **Bare HTML is already styled.** Headings, paragraphs, lists (`ul`/`ol`/`dl`), tables (incl. `caption`/`tfoot`), blockquotes, `code`/`kbd`/`pre`, all input types, `fieldset`/`legend`, `details`/`summary`, `dialog`, `progress`, `meter`, and media elements all get the sketchy treatment with zero classes. Write semantic HTML first; reach for classes second.
- **Wobble is automatic.** Sibling cards, buttons, and bordered elements cycle through four border-radius shapes via `nth-child`, so identical elements look individually hand-drawn. Don't add manual rotations unless composition demands it (`.lf-tilt-l` / `.lf-tilt-r` exist for that).
- **Semantics are lightness.** `--lf-danger` (near black) = strongest emphasis, `--lf-accent` (dark gray) = primary, `--lf-ok` (mid gray) = done/de-emphasized.

## Class reference

| Purpose | Classes |
|---|---|
| Buttons | `.lf-btn`, modifiers `.lf-btn-primary`, `.lf-btn-danger`, `.lf-btn-ghost` |
| Form components (fancy) | `.lf-input`, `.lf-select`, `.lf-textarea`, `.lf-label`, `.lf-check`, `.lf-radio`, `.lf-toggle` (see markup patterns below) |
| Containers | `.lf-card`, `.lf-note` (sticky note), `.lf-zone` (dashed region), `.lf-double` (double pen stroke) |
| Placeholders | `.lf-placeholder`, add `.lf-x` for crossed box; `.lf-avatar` for initials circles |
| Status | `.lf-badge` (+`-accent`/`-ok`/`-danger`), `.lf-alert` (+`-info`/`-ok`/`-danger`), `.lf-progress` |
| Navigation | `.lf-nav` (with `.brand`), `.lf-tabs` + `.lf-tab` (+`.active`) |
| Annotation | `.lf-circled` (circle around element), `.lf-comment` (handwritten margin note), `.lf-arrow`, `.lf-hl`/`mark` (marker highlight), `.lf-strike`, `.lf-underline` |
| Dividers | `.lf-hr`, `.lf-hr-wavy` (bare `<hr>` also works) |
| Icons | `.lf-icon` (+`.lf-icon-lg`) on an `<svg><use href="#lf-i-...">` — requires inlined `<symbol>`s from `references/icons.md` (core 19) or `assets/lofi-icons.svg` (full 1745-icon set) |
| Layout | `.lf-row` (flex, wrapping), `.lf-col` (flex child), `.lf-stack` (vertical rhythm), `.lf-border` (generic wobbly border), `.lf-tilt-l`/`.lf-tilt-r` |

### Component markup patterns

```html
<!-- checkbox / radio / toggle: input first, then the shape span -->
<label class="lf-check"><input type="checkbox" checked><span class="box"></span> Label text</label>
<label class="lf-radio"><input type="radio" name="g"><span class="dot"></span> Label text</label>
<label class="lf-toggle"><input type="checkbox"><span class="track"></span> Label text</label>

<!-- progress bar: width on the inner span -->
<div class="lf-progress"><span style="width: 60%"></span></div>

<!-- annotation: circle a UI element and comment on it -->
<span class="lf-circled">Sign up</span>
<span class="lf-arrow">↖</span>
<span class="lf-comment">make this the primary CTA</span>
```

## Composition guidance

- One screen per HTML file unless the user asks for a flow; for flows, stack screens vertically as `.lf-card.lf-double` frames with `.lf-comment` labels between them.
- Use `.lf-note` and `.lf-comment` generously — annotations are the whole point of a paper prototype. Phrase them as a designer's margin scribbles ("TODO: confirm with legal", "does this need pagination?").
- Real-ish content beats lorem ipsum. Short, plausible domain text makes the mockup discussable.
- Keep it sparse. If a section isn't the subject of discussion, reduce it to a `.lf-zone` with a one-line description.
- End the file with nothing extra — no footers, credits, or watermarks unless asked.

## Coverage notes

Non-rendering elements (`script`, `template`, `meta`, ...), pure wrappers (`div`, `section`, `main`, ...), and `br`/`wbr` are intentionally unstyled. Obsolete HTML elements are out of scope. `meter` pseudo-element styling is best-effort (Safari partially ignores it).
