# Mostafa Gomaa — BIM Coordinator MEP · Portfolio

Bilingual (German / English) static portfolio website.
BIM coordination, model QA/QC, clash management, Autodesk Construction Cloud, BIM standards and Revit automation.
Berlin, Germany.

Built as plain HTML, CSS and vanilla JavaScript — no framework, no build step, no backend.
Designed to be linked directly from a CV and to load fast on first visit.

---

## Contents

| Path | Purpose |
|---|---|
| `index.html` | The complete portfolio — 17 sheets, one shared layout |
| `css/style.css` | Design system + web layer (navigation, responsive, print) |
| `js/translations.js` | All German and English strings, plus per-language metadata |
| `js/app.js` | Language switching, sheet scaling, navigation, scroll progress |
| `assets/` | Images and self-hosted fonts |
| `404.html` | Styled not-found page |
| `sitemap.xml`, `robots.txt` | Basic SEO |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |

---

## Language handling

The site picks a language in this order:

1. **URL parameter** — `?lang=de` or `?lang=en` (shareable links)
2. **Saved preference** — `localStorage`, written when the visitor clicks DE or EN
3. **Browser language** — `navigator.languages`, German if any entry starts with `de`
4. **Fallback** — English

No IP or geolocation lookup is used.

Switching language updates the text, the `alt` attributes, `<html lang>`, `document.title`,
the meta description and the Open Graph / Twitter tags, and rewrites the URL to `?lang=…`
so the current view can be copied and shared.

### Editing text

All strings live in `js/translations.js`:

```js
window.I18N = {
  de: { t001: "Profil", ... },
  en: { t001: "Profile", ... }
};
```

Each key matches a `data-i18n="t001"` attribute in `index.html`.
Image alt texts use `data-i18n-alt`. Page titles and descriptions live in `window.META`.

Numbers, discipline codes and contact details are **not** translated — they appear once
as literal text in `index.html`.

---

## Layout behaviour

The portfolio was designed as A4 landscape drawing sheets. That character is preserved:

- **Desktop** — each section stays a 297 × 210 mm sheet and is scaled to the viewport
  by `app.js`, which sets a `--s` CSS variable. The composition is identical to the PDF.
- **Tablet** — the top navigation collapses into a menu button; sheets keep scaling.
- **Mobile (below 900 px)** — absolute positioning is switched off and content stacks.
  During the build, each sheet's elements were sorted by their `top` / `left` position,
  so the stacked reading order matches the original visual order.
- **Between sheets** — a band in the deeper paper tone with a short graphite mark at the
  left edge, the way two sheets of a drawing set sit next to each other. Adjust its height
  with the `--sep` variable in `css/style.css`.
- **Title block** — on screen the Schriftfeld leaves the sheet and becomes a fixed bar at the
  bottom of the viewport. It appears from sheet 02 onward, its sheet number follows the sheet
  you are reading, and it fades out after 2.5 seconds without scrolling. Change that delay with
  `IDLE_MS` in `js/app.js`. In print the bar is hidden and each sheet carries its own title
  block again, exactly as in the PDF.
- **Print** — `Ctrl/Cmd + P` produces the original 17-page A4 landscape set.
  Navigation, language switcher, progress bar and the sheet separators are hidden.

---

## Local preview

The site must be served over HTTP (fonts and `localStorage` behave oddly on `file://`).

```bash
python -m http.server 8000
```

Then open:

```
http://localhost:8000
```

Test the language logic:

```
http://localhost:8000/?lang=de
http://localhost:8000/?lang=en
```

Any other static server works too, for example `npx serve` or the VS Code Live Server extension.

---

## Deploy to GitHub Pages

1. Create a new repository on GitHub (for example `portfolio`). Leave it empty — no README, no `.gitignore`.
2. Push these files (commands below).
3. Open the repository on GitHub → **Settings**.
4. In the left sidebar choose **Pages**.
5. Under **Source** select **Deploy from a branch**.
6. Choose branch **`main`**.
7. Choose folder **`/ (root)`**.
8. Click **Save**.

The first build takes a minute or two. The resulting address is:

```
https://USERNAME.github.io/REPOSITORY/
```

If you name the repository `USERNAME.github.io`, the address is instead:

```
https://USERNAME.github.io/
```

Both work — every path in this project is relative, so the site runs correctly
at a domain root and inside a repository subpath without any change.

### Git commands

Replace `USERNAME` and `REPOSITORY` with your own values.

```bash
git init
git add .
git commit -m "Initial portfolio website"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

To publish later changes:

```bash
git add .
git commit -m "Update portfolio"
git push
```

### Custom domain (optional)

1. Buy a domain and add these DNS records at your registrar:
   - Four `A` records for the apex domain pointing to
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - or one `CNAME` record for `www` pointing to `USERNAME.github.io`
2. In the repository: **Settings → Pages → Custom domain**, enter the domain, save.
3. Tick **Enforce HTTPS** once the certificate has been issued.

GitHub creates a `CNAME` file in the repository. Do not delete it.

After switching to a custom domain, update the absolute URLs in `sitemap.xml`.

---

## Before you publish

- [ ] Replace the contact placeholders on the final sheet in `js/translations.js` if anything is missing
- [ ] Update `sitemap.xml` — replace `USERNAME` and `REPOSITORY` with your real values
- [ ] Optionally add `apple-touch-icon.png` (180 × 180 px) next to `index.html`

### Optional: remove spare images

`assets/` also contains nine alternate crops that the current 17 sheets do not use.
They are kept in case you want to swap an image later. To remove them:

```bash
cd assets
rm -f 01_titel_tga-gesamtmodell.png 04_schachtdetail.png 13_planerstellung.png \
      14_bank_baustelle.jpg 14_bank_hero.png 14_bank_pumpenraum.png \
      14_bank_sprinkler.png 14_mall_hero.png 14_mall_pumpenraum.png
```

That reduces the repository by roughly 2 MB.

---

## Technical notes

- **Fonts** are self-hosted in `assets/fonts/` (Archivo, Inter, IBM Plex Mono — all SIL OFL)
  with `font-display: swap`. Nothing is requested from Google Fonts, so the site works offline.
- **Images** below the fold use `loading="lazy"` and `decoding="async"`.
- **Accessibility** — semantic landmarks, a skip link, descriptive `alt` text in both languages,
  keyboard-operable language switcher with `aria-pressed`, visible focus rings,
  and `prefers-reduced-motion` support.
- **No cookies, no analytics, no third-party requests.**

---

## Confidentiality

All project references in this portfolio are anonymised. Client names, architects,
consultant firms, colleague names, internal file paths and project identifiers have been
removed or cropped out of every screenshot. Please keep it that way when editing content.

---

© Mostafa Gomaa · Berlin
