# Wade Gonzales — Portfolio 2026

Static site, no build step. Open `index.html`, or deploy this folder as-is (Vercel, Netlify, GitHub Pages).

```
index.html     content + markup
css/style.css  all styling (palette + fonts live in :root at the top)
js/main.js     animations & interactions (each feature is isolated, so one failure can't break the page)
assets/        images + self-hosted fonts (no external requests)
```

## Quick edits
- **Skill bars** — change `--fill` on each `.soft-badge` in the Softwares grid.
- **Video Editing** — each `.video-card` is a placeholder; the HTML comment above them shows the swap-in snippet.
- **Facebook / LinkedIn** — replace `href="#"` in the footer (search for `TODO`).
- **Marquee text** — edit `LISTS` at the top of the `marquee` block in `js/main.js`.
- **More project images** — add an `<img>` inside a `.gallery-masonry`; the layout balances itself and the lightbox picks it up automatically.
- **Palette** — `--blue: #1a3daa`, `--cream: #fff1be`.
