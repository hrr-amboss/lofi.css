# lofi.css icons

Two icon sources, both in the same wobbly scribble style, both used the same way:

1. **Core sprite** — 19 hand-made icons, small enough to paste inline (below).
   Covers most mockups; prefer it when it has what you need.
2. **Full set** — 1745 icons covering the complete [Lucide](https://lucide.dev)
   set, machine-redrawn in the scribble style. Lives in the sprite file
   `lofi-icons.svg` (in the skill package: `assets/lofi-icons.svg`).
   Browse it visually via `lofi-icons.html`.

Licensing: the full set derives from Lucide (ISC). The required copyright and
permission notice is embedded as a comment at the top of the sprite file —
keep that comment when redistributing the sprite (copying individual
`<symbol>`s into a mockup is fine without it).

## Usage

Paste a sprite (or just the `<symbol>`s you need) ONCE, directly after
`<body class="lofi">`, then reference icons by id anywhere in the document:

```html
<svg class="lf-icon"><use href="#lf-i-search"/></svg> Search
```

Icons inherit `currentColor` and scale with the surrounding font size.
Use `lf-icon-lg` for a larger variant.

Core sprite ids: lf-i-search, lf-i-menu, lf-i-home, lf-i-user, lf-i-sliders,
lf-i-bell, lf-i-calendar, lf-i-mail, lf-i-trash, lf-i-edit, lf-i-plus,
lf-i-close, lf-i-check, lf-i-arrow-right, lf-i-star, lf-i-heart, lf-i-image,
lf-i-chat, lf-i-download.

## Using the full set

Full-set ids are `lf-i-` + the Lucide icon name (`lf-i-rocket`,
`lf-i-credit-card`, `lf-i-chart-bar`, ...). Keep mockups single-file: copy the
`<symbol>` lines you need out of the sprite file into your inline sprite block
instead of linking the whole 700 KB file.

Find an icon by name:

```sh
grep -o 'id="lf-i-[a-z0-9-]*"' assets/lofi-icons.svg | grep -i <term>
```

Copy its definition (one symbol per line):

```sh
grep 'id="lf-i-rocket"' assets/lofi-icons.svg
```

Naming notes when switching between the two sets: core `lf-i-close` = Lucide
`x`, `lf-i-chat` = `message-square`, `lf-i-edit` = `pencil`, `lf-i-sliders` =
`sliders-horizontal`, `lf-i-home` = `house`, `lf-i-trash` = `trash-2`,
`lf-i-user`/`lf-i-search`/etc. share names. Where names collide the drawings
are near-identical — just don't paste two `<symbol>`s with the same id.

Only include icons the mockup actually uses. If an icon is missing from both
sets, draw it as a new inline `<symbol>` in the same style: viewBox 0 0 24 24,
single `<path>`, no fill, gentle Q-curve wobble instead of straight lines.
NO emojis as icon substitutes.

## The core sprite

```html
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
      <symbol id="lf-i-search" viewBox="0 0 24 24"><path d="M10.5 5 Q15.5 5.4 15.8 10.4 Q15.5 15.5 10.4 15.8 Q5.4 15.5 5.2 10.5 Q5.5 5.5 10.5 5 Z M15 15 Q17.4 17.1 19.3 19.3"/></symbol>
      <symbol id="lf-i-menu" viewBox="0 0 24 24"><path d="M4 7 Q12 6.5 20 7.1 M4.3 12 Q12 11.6 19.7 12.2 M4 17 Q12 16.6 20.2 17"/></symbol>
      <symbol id="lf-i-home" viewBox="0 0 24 24"><path d="M4 11.5 Q11.8 4.3 12.2 4.5 L20 11.3 M6 10.5 L6.2 19.5 Q12 20 17.9 19.4 L18 10.6 M10 19.4 L10.1 14.5 Q12 14.2 13.9 14.6 L14 19.4"/></symbol>
      <symbol id="lf-i-user" viewBox="0 0 24 24"><path d="M12 5 Q15 5.2 15.1 8 Q15 11 12 11.1 Q9 11 9 8.1 Q9.2 5.3 12 5 Z M5 19.5 Q5.6 13.9 12 14 Q18.4 13.9 19 19.3"/></symbol>
      <symbol id="lf-i-sliders" viewBox="0 0 24 24"><path d="M4 7 Q12 6.6 20 7 M4 12 Q12 11.7 20 12.2 M4 17 Q12 16.6 20 17 M9 5.2 Q10.7 5.4 10.7 7 Q10.6 8.7 9 8.8 Q7.3 8.7 7.3 7 Q7.4 5.4 9 5.2 Z M15 10.2 Q16.7 10.4 16.7 12 Q16.6 13.7 15 13.8 Q13.3 13.7 13.3 12 Q13.4 10.4 15 10.2 Z M8 15.2 Q9.7 15.4 9.7 17 Q9.6 18.7 8 18.8 Q6.3 18.7 6.3 17 Q6.4 15.4 8 15.2 Z"/></symbol>
      <symbol id="lf-i-bell" viewBox="0 0 24 24"><path d="M12 4.5 Q16.9 5 17.1 10 Q17.2 14 18.8 16.4 Q12 17.4 5.3 16.6 Q6.9 14 6.9 9.9 Q7.1 5.2 12 4.5 Z M10.4 19 Q12 20.3 13.6 19"/></symbol>
      <symbol id="lf-i-calendar" viewBox="0 0 24 24"><path d="M5 6.5 Q12 6 19 6.4 L19.2 19 Q12 19.6 4.9 19.1 Z M8 4.5 L8 8 M16 4.5 L16.1 8 M5.2 10.5 Q12 10.1 18.9 10.6"/></symbol>
      <symbol id="lf-i-mail" viewBox="0 0 24 24"><path d="M4.5 7 Q12 6.5 19.5 7 L19.7 17.5 Q12 18.1 4.4 17.4 Z M5 7.5 Q11.8 13.5 12.2 13.4 L19 7.4"/></symbol>
      <symbol id="lf-i-trash" viewBox="0 0 24 24"><path d="M6 7.5 L7 19 Q12 19.7 17 19.1 L17.9 7.4 M4.5 7 Q12 6.4 19.5 7.1 M9.5 6.8 Q9.7 4.4 12 4.5 Q14.4 4.5 14.4 6.7 M10 10.5 L10.2 16 M14 10.5 L13.9 16"/></symbol>
      <symbol id="lf-i-edit" viewBox="0 0 24 24"><path d="M5 19 Q5.2 16.9 6 15.9 L16 5.6 Q17 4.8 18.3 6.1 Q19.4 7.4 18.4 8.3 L8.4 18.4 Q7.3 19.2 5 19 Z M14.5 7.2 L17 9.7"/></symbol>
      <symbol id="lf-i-plus" viewBox="0 0 24 24"><path d="M12 5 Q11.8 12 12.2 19 M5 12 Q12 11.7 19 12.3"/></symbol>
      <symbol id="lf-i-close" viewBox="0 0 24 24"><path d="M6 6 Q12 11.8 18.2 18.1 M18 6.2 Q12.2 12 5.9 18"/></symbol>
      <symbol id="lf-i-check" viewBox="0 0 24 24"><path d="M5 13 Q8 15.5 9.8 17.5 Q13.4 10.5 19 6.5"/></symbol>
      <symbol id="lf-i-arrow-right" viewBox="0 0 24 24"><path d="M4.5 12 Q12 11.7 19 12.1 M14 6.5 Q17.4 9.5 19.4 11.9 Q17 14.6 14.2 17.6"/></symbol>
      <symbol id="lf-i-star" viewBox="0 0 24 24"><path d="M12 4.5 L14.3 9.4 L19.6 10 L15.7 13.6 L16.8 18.9 L12.1 16.2 L7.3 18.9 L8.4 13.5 L4.5 9.9 L9.8 9.3 Z"/></symbol>
      <symbol id="lf-i-heart" viewBox="0 0 24 24"><path d="M12 19 Q5 14 4.6 9.5 Q4.8 5.6 8.3 5.5 Q11 5.6 12 8 Q13.1 5.5 15.8 5.5 Q19.3 5.7 19.4 9.4 Q19 14.1 12 19 Z"/></symbol>
      <symbol id="lf-i-image" viewBox="0 0 24 24"><path d="M4.5 6 Q12 5.5 19.5 6.1 L19.6 18 Q12 18.6 4.4 18 Z M9 8.7 Q10.5 8.8 10.5 10.1 Q10.4 11.4 9 11.5 Q7.6 11.4 7.6 10.1 Q7.7 8.8 9 8.7 Z M5.5 16.5 Q9 12.6 11 14.5 Q14 10.2 18.6 16.2"/></symbol>
      <symbol id="lf-i-chat" viewBox="0 0 24 24"><path d="M4.5 6.5 Q12 6 19.5 6.5 L19.4 14.5 Q13.9 15.2 9.5 14.9 L6 18.2 L6.2 14.7 Q4.7 14.5 4.5 14.4 Z"/></symbol>
      <symbol id="lf-i-download" viewBox="0 0 24 24"><path d="M12 4.5 Q11.9 10 12.1 14.5 M8 11.5 Q10.3 13.7 12 15.6 Q14 13.4 16.1 11.4 M5 19 Q12 19.5 19 19"/></symbol>
    </svg>
```
