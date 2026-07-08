# lofi.css

A tiny hand-drawn wireframe kit in a single CSS file — plus 1,745 scribble icons and a Claude skill.

<img src="docs/preview.svg" alt="Sample of the scribble icon set" width="368">

lofi.css gives plain HTML the paper-scribble look of Excalidraw or tldraw: wobbly borders, marker highlights, squiggly underlines, handwritten fonts. It exists so that lo-fi mockups stay lo-fi — stakeholders discuss **structure and flow**, not visual polish. Grayscale only, no JavaScript, no dependencies, no external requests (the fonts are embedded in the CSS), deliberately imperfect.

This is a private side project, built in personal time — not affiliated with, or endorsed by, any employer or organization.

**Live demo:** coming soon — until then, clone the repo and open `lofi-library.html` in a browser.

## Quick start

1. Copy `lofi.css` next to your HTML file.
2. Add the stylesheet to your `<head>`, and the `lofi` class to `<body>`. The handwriting fonts (Patrick Hand + Caveat) are embedded in the CSS as data URIs — no Google Fonts request, GDPR-friendly by default:

```html
<link rel="stylesheet" href="lofi.css">

<body class="lofi"> ... </body>
```

3. Write plain semantic HTML. Headings, lists, tables, quotes, code, all form elements, `details`, `dialog`, `progress` — everything gets the sketchy treatment with zero classes. The `.lf-*` classes add components on top:

| Purpose | Classes |
|---|---|
| Buttons | `.lf-btn` + `-primary` / `-danger` / `-ghost` |
| Forms | `.lf-input`, `.lf-select`, `.lf-textarea`, `.lf-check`, `.lf-radio`, `.lf-toggle` |
| Containers | `.lf-card`, `.lf-note` (sticky note), `.lf-zone` (dashed region), `.lf-double` |
| Placeholders | `.lf-placeholder` (+`.lf-x`), `.lf-avatar` |
| Status | `.lf-badge`, `.lf-alert`, `.lf-progress` |
| Navigation | `.lf-nav`, `.lf-tabs` + `.lf-tab` |
| Annotation | `.lf-circled`, `.lf-comment`, `.lf-arrow`, `.lf-hl`, `.lf-strike`, `.lf-underline` |
| Layout | `.lf-row`, `.lf-col`, `.lf-stack`, `.lf-border`, `.lf-tilt-l` / `.lf-tilt-r` |

The full component reference with live examples is in `lofi-library.html`.

## Icons

Two sources, one style, one way to use them:

- **Core sprite** — 19 hand-made scribble icons as an inline SVG sprite (see [icons.md](icons.md)). Small enough to paste into any mockup.
- **Full set** — the complete [Lucide](https://lucide.dev) icon catalog (1,745 icons), machine-redrawn in the same wobbly style: jittered anchor points, straight lines bowed into gentle curves, circles redrawn freehand. Ships as [`lofi-icons.svg`](lofi-icons.svg); browse and copy from the searchable gallery in `lofi-icons.html`.

```html
<!-- paste the sprite (or just the <symbol>s you need) once after <body>, then: -->
<svg class="lf-icon"><use href="#lf-i-rocket"/></svg> Launch
```

Icons inherit `currentColor` and scale with the surrounding text. Ids are `lf-i-` + the Lucide name.

### Regenerating the icon set

The conversion is scripted and deterministic (same input → same wobble):

```sh
cd tools
npm install
npm run build-icons   # rewrites lofi-icons.svg, lofi-icons.html, and the skill asset
```

## Claude skill

`lofi-mockups.skill` packages the CSS, both icon sets, and house rules (strictly HTML + lofi.css, grayscale only, no emojis, no JS) so Claude produces consistent mockups from prompts like *"sketch the onboarding flow"*. Install the `.skill` file in Claude, or read the plain source at [lofi-mockups/SKILL.md](lofi-mockups/SKILL.md).

## Repo layout

```
lofi.css               the framework — this is all you need
lofi-library.html      component library / documentation
lofi-icons.svg         full icon sprite (1,745 symbols)
lofi-icons.html        searchable icon gallery (click to copy)
icons.md               icon usage reference
lofi-mockups/          Claude skill source (SKILL.md + assets + references)
lofi-mockups.skill     packaged skill (zip)
tools/                 icon-set generator (Lucide → scribble)
```

## License & credits

- Code and styles: [MIT](LICENSE)
- Icon shapes derived from [Lucide](https://lucide.dev) (ISC license) — scribblified, same grid, same names
- Fonts: [Patrick Hand](https://fonts.google.com/specimen/Patrick+Hand) (© Patrick Wagesreiter) and [Caveat](https://fonts.google.com/specimen/Caveat) (© The Caveat Project Authors), both embedded under the [SIL Open Font License 1.1](https://openfontlicense.org) — no external font loading

Built with help from Claude Fable 5.
