// build-site.mjs — assemble the static site into dist/ for hosting
// (e.g. drag the dist/ folder onto https://app.netlify.com/drop).
// Usage (from tools/): node build-site.mjs

import { cpSync, rmSync, mkdirSync } from 'node:fs';

const REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const DIST = REPO + '/dist';

const FILES = [
  'index.html',
  'example.html',
  'lofi-library.html',
  'lofi-icons.html',
  'lofi.css',
  'lofi-icons.svg',
  'lofi-mockups.skill',
  'lofi-mockups', // unpacked skill source (SKILL.md is linked from the library page)
  'LICENSE',
];

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST);
for (const f of FILES) cpSync(`${REPO}/${f}`, `${DIST}/${f}`, { recursive: true });
console.log(`dist/ ready (${FILES.length} entries) — drag it onto https://app.netlify.com/drop`);
