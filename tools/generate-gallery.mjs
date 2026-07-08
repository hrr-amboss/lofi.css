// generate-gallery.mjs — build lofi-icons.html (searchable icon gallery) for the lofi repo.
import { readFileSync, writeFileSync } from 'node:fs';

const REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const sprite = readFileSync(REPO + '/lofi-icons.svg', 'utf8').trim();
const tags = JSON.parse(readFileSync(new URL('./node_modules/lucide-static/tags.json', import.meta.url), 'utf8'));
const version = JSON.parse(readFileSync(new URL('./node_modules/lucide-static/package.json', import.meta.url), 'utf8')).version;

const names = [...sprite.matchAll(/id="lf-i-([a-z0-9-]+)"/g)].map(m => m[1]);

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const cells = names.map(n => {
  const t = (tags[n] || []).join(' ');
  return `<button class="cell" data-name="${n}"${t ? ` data-tags="${esc(t)}"` : ''} title="lf-i-${n}"><svg class="lf-icon"><use href="#lf-i-${n}"/></svg><span>${n}</span></button>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>lofi icons — full scribble icon set</title>
<link rel="stylesheet" href="lofi.css?v=0.2">
<style>
  body { margin: 0; }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 2rem 1.5rem 5rem; }
  .icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(108px, 1fr)); gap: .35rem; margin-top: 1.2rem; }
  .cell { display: flex; flex-direction: column; align-items: center; gap: .15em;
          background: none; border: none; padding: .55em .2em .4em; cursor: pointer;
          font-family: 'Patrick Hand', cursive; font-size: .72rem; color: var(--lf-ink-soft);
          border-radius: 12px 14px 13px 15px / 14px 12px 15px 13px; }
  .cell:hover { background: var(--lf-fill); color: var(--lf-ink); }
  .cell .lf-icon { width: 30px; height: 30px; color: var(--lf-ink); }
  .cell span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cell.copied { background: var(--lf-highlight); }
  #count { min-width: 5.5em; display: inline-block; }
</style>
</head>
<body class="lofi">
${sprite}
<div class="wrap">
  <header>
    <h1>lofi icons <span class="lf-badge lf-badge-accent">${names.length} icons</span></h1>
    <p>The complete <a href="https://lucide.dev">Lucide</a> icon set (v${version}), machine-redrawn in the lofi.css hand-scribble style — wobbly strokes, jittered corners, nothing pixel-perfect. Same ids, same grid, works anywhere lofi.css works. <a href="lofi-library.html">← back to the component library</a></p>
    <div class="lf-note">Click an icon to copy its <code>&lt;use&gt;</code> snippet. <strong>Shift-click</strong> to copy the full <code>&lt;symbol&gt;</code> definition for inlining into a single-file mockup. Or grab the whole sprite: <a href="lofi-icons.svg" download>lofi-icons.svg</a></p></div>
  </header>

  <section class="lf-card" style="margin-top:1.4rem">
    <h3 style="margin-top:0">How to use</h3>
    <p style="margin-bottom:.4em">Inline the symbols you need (single-file mockups — copy them from the sprite or shift-click below), then:</p>
    <pre style="margin:0"><code>&lt;svg class="lf-icon"&gt;&lt;use href="#lf-i-rocket"/&gt;&lt;/svg&gt; Launch</code></pre>
    <p style="margin:.6em 0 0">Or reference the sprite file externally (needs a web server, same origin):</p>
    <pre style="margin:.3em 0 0"><code>&lt;svg class="lf-icon"&gt;&lt;use href="lofi-icons.svg#lf-i-rocket"/&gt;&lt;/svg&gt;</code></pre>
  </section>

  <div class="lf-row" style="margin-top:1.6rem; align-items:center">
    <input class="lf-input" id="q" type="search" placeholder="Search ${names.length} icons by name or tag..." style="max-width:340px" autofocus>
    <span class="lf-muted" id="count">${names.length} shown</span>
  </div>

  <div class="icon-grid" id="grid">
${cells}
  </div>

  <footer style="margin-top:3rem">
    <hr class="lf-hr lf-hr-wavy">
    <p class="lf-muted">Icon shapes derived from <a href="https://lucide.dev">Lucide</a> v${version} (ISC license) — scribblified for lofi.css. This gallery page uses a little JavaScript for search and copy; mockups built with these icons need none.</p>
  </footer>
</div>

<script>
const q = document.getElementById('q');
const count = document.getElementById('count');
const cells = [...document.querySelectorAll('.cell')];
const data = cells.map(c => ({ c, hay: (c.dataset.name + ' ' + (c.dataset.tags || '')).toLowerCase() }));
q.addEventListener('input', () => {
  const terms = q.value.toLowerCase().split(/\\s+/).filter(Boolean);
  let shown = 0;
  for (const { c, hay } of data) {
    const hit = terms.every(t => hay.includes(t));
    c.style.display = hit ? '' : 'none';
    if (hit) shown++;
  }
  count.textContent = shown + ' shown';
});
document.getElementById('grid').addEventListener('click', e => {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  const id = 'lf-i-' + cell.dataset.name;
  const text = e.shiftKey
    ? document.getElementById(id).outerHTML
    : '<svg class="lf-icon"><use href="#' + id + '"/></svg>';
  navigator.clipboard.writeText(text).then(() => {
    cell.classList.add('copied');
    setTimeout(() => cell.classList.remove('copied'), 600);
  });
});
</script>
</body>
</html>
`;

writeFileSync(REPO + '/lofi-icons.html', html);
console.log('wrote lofi-icons.html:', (html.length / 1024).toFixed(0) + 'KB,', names.length, 'icons');
